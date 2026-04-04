import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { embedText } from './embeddings';

type DocumentChunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
};

type DocumentIndex = {
  generatedAt: string;
  documentCount: number;
  chunkCount: number;
  corpusSignature: string;
  chunks: DocumentChunk[];
};

export type CorpusStatus = {
  documentCount: number;
  indexedDocumentCount: number;
  indexedChunkCount: number;
  generatedAt: string | null;
  corpusSignature: string;
  indexedCorpusSignature: string | null;
  stale: boolean;
};

export type RagServiceConfig = {
  /** Path to the JSON index file, relative to process.cwd() */
  indexPath: string;
  /** Directory containing source documents, relative to process.cwd() */
  documentsDir: string;
  topK?: number;
  chunkSize?: number;
  chunkOverlap?: number;
};

const supportedExtensions = new Set(['.pdf', '.docx', '.txt', '.md']);

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (!normalizedText) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalizedText.length) {
    const end = Math.min(start + chunkSize, normalizedText.length);
    const chunk = normalizedText.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === normalizedText.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

async function listDocumentFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const filePaths: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        filePaths.push(...await listDocumentFiles(fullPath));
        continue;
      }
      if (supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
        filePaths.push(fullPath);
      }
    }

    return filePaths.sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function extractDocumentText(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (extension === '.pdf') {
    const parsed = await pdfParse(buffer);
    return parsed.text || '';
  }

  if (extension === '.docx') {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value || '';
  }

  if (extension === '.txt' || extension === '.md') {
    return buffer.toString('utf8');
  }

  return '';
}

async function createCorpusSignature(documentFiles: string[]): Promise<string> {
  if (documentFiles.length === 0) return 'empty-corpus';

  const hasher = crypto.createHash('sha256');
  for (const filePath of documentFiles) {
    const content = await fs.readFile(filePath);
    const relativeSource = path.relative(process.cwd(), filePath);
    hasher.update(`${relativeSource}\n`);
    hasher.update(content);
  }

  return hasher.digest('hex');
}

function cosineSimilarity(a: number[], b: number[]): number {
  const limit = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < limit; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class RagService {
  private readonly indexPath: string;
  private readonly documentsDir: string;
  private readonly topK: number;
  private inMemoryIndex: DocumentIndex | null = null;
  private indexLoaded = false;
  private rebuildPromise: Promise<DocumentIndex> | null = null;

  private readonly chunkSize: number;
  private readonly chunkOverlap: number;

  constructor(config: RagServiceConfig) {
    const root = process.cwd();
    this.indexPath = path.resolve(root, config.indexPath);
    this.documentsDir = path.resolve(root, config.documentsDir);
    this.topK = config.topK ?? 4;
    this.chunkSize = config.chunkSize ?? 1000;
    this.chunkOverlap = config.chunkOverlap ?? 150;
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(path.dirname(this.indexPath), { recursive: true });
    await fs.mkdir(this.documentsDir, { recursive: true });
  }

  private async loadPersistedIndex(): Promise<DocumentIndex | null> {
    if (this.indexLoaded) return this.inMemoryIndex;

    try {
      const rawIndex = await fs.readFile(this.indexPath, 'utf8');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = JSON.parse(rawIndex) as any;

      // Normalize legacy Art-Inspiration index format (uses `items` + `metadata`)
      const parsed: DocumentIndex = raw.chunks
        ? (raw as DocumentIndex)
        : {
            generatedAt: raw.metadata?.createdAt || new Date().toISOString(),
            documentCount: raw.metadata?.documentsCount || 0,
            chunkCount: raw.metadata?.chunksCount || (raw.items?.length ?? 0),
            corpusSignature: 'legacy-migrated',
            chunks: (raw.items ?? []).map((item: { id: string; source: string; text: string; embedding: number[] }) => ({
              id: item.id,
              source: item.source,
              text: item.text,
              embedding: item.embedding,
            })),
          };

      this.inMemoryIndex = parsed;
      this.indexLoaded = true;
      return parsed;
    } catch {
      this.inMemoryIndex = null;
      this.indexLoaded = true;
      return null;
    }
  }

  private async persistIndex(index: DocumentIndex): Promise<void> {
    await this.ensureDirectories();
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2), 'utf8');
    this.inMemoryIndex = index;
    this.indexLoaded = true;
  }

  async rebuild(): Promise<DocumentIndex> {
    if (this.rebuildPromise) return this.rebuildPromise;

    this.rebuildPromise = (async () => {
      await this.ensureDirectories();
      const documentFiles = await listDocumentFiles(this.documentsDir);
      const corpusSignature = await createCorpusSignature(documentFiles);
      const chunks: DocumentChunk[] = [];

      for (const filePath of documentFiles) {
        const extractedText = await extractDocumentText(filePath);
        const chunkTexts = chunkText(extractedText, this.chunkSize, this.chunkOverlap);
        const relativeSource = path.relative(process.cwd(), filePath);

        for (let chunkIndex = 0; chunkIndex < chunkTexts.length; chunkIndex += 1) {
          const chunkTextValue = chunkTexts[chunkIndex];
          const embedding = await embedText(chunkTextValue);
          chunks.push({
            id: `${relativeSource}:${chunkIndex}`,
            source: relativeSource,
            text: chunkTextValue,
            embedding,
          });
        }
      }

      const index: DocumentIndex = {
        generatedAt: new Date().toISOString(),
        documentCount: documentFiles.length,
        chunkCount: chunks.length,
        corpusSignature,
        chunks,
      };

      await this.persistIndex(index);
      return index;
    })();

    try {
      return await this.rebuildPromise;
    } finally {
      this.rebuildPromise = null;
    }
  }

  async ensure(): Promise<DocumentIndex | null> {
    await this.ensureDirectories();
    const documentFiles = await listDocumentFiles(this.documentsDir);
    const currentSignature = await createCorpusSignature(documentFiles);
    const persistedIndex = await this.loadPersistedIndex();
    const label = path.basename(this.documentsDir);

    if (
      persistedIndex
      && persistedIndex.chunkCount > 0
      && persistedIndex.corpusSignature === currentSignature
    ) {
      console.log(`[RAG:${label}] Loaded from cache (${persistedIndex.chunkCount} chunks, ${persistedIndex.documentCount} docs).`);
      return persistedIndex;
    }

    if (documentFiles.length === 0) return persistedIndex;

    console.log(`[RAG:${label}] Index stale or missing — rebuilding from ${documentFiles.length} document(s)...`);
    return this.rebuild();
  }

  async getContext(query: string): Promise<string> {
    const documentIndex = await this.ensure();
    if (!documentIndex || documentIndex.chunks.length === 0) return '';

    const queryEmbedding = await embedText(query);
    const scoredChunks = documentIndex.chunks
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.topK)
      .filter((entry) => entry.score > 0.1);

    if (scoredChunks.length === 0) return '';

    return scoredChunks
      .map(({ chunk, score }) => `Source: ${chunk.source}\nRelevance: ${score.toFixed(3)}\n${chunk.text}`)
      .join('\n\n---\n\n');
  }

  async warmup(): Promise<void> {
    const label = path.basename(this.documentsDir);
    console.log(`[RAG:${label}] Warming up...`);
    await this.ensure();
  }

  async status(): Promise<CorpusStatus> {
    await this.ensureDirectories();
    const documentFiles = await listDocumentFiles(this.documentsDir);
    const currentSignature = await createCorpusSignature(documentFiles);
    const persistedIndex = await this.loadPersistedIndex();

    return {
      documentCount: documentFiles.length,
      indexedDocumentCount: persistedIndex?.documentCount || 0,
      indexedChunkCount: persistedIndex?.chunkCount || 0,
      generatedAt: persistedIndex?.generatedAt || null,
      corpusSignature: currentSignature,
      indexedCorpusSignature: persistedIndex?.corpusSignature || null,
      stale: !persistedIndex || persistedIndex.corpusSignature !== currentSignature,
    };
  }
}
