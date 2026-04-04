const DEFAULT_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    const { pipeline } = await import('@xenova/transformers');
    const model = process.env.EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;
    extractorPromise = pipeline('feature-extraction', model);
  }
  return extractorPromise;
}

/**
 * Embed text using the shared @xenova/transformers pipeline.
 * The pipeline is loaded once and reused across all apps.
 */
export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}
