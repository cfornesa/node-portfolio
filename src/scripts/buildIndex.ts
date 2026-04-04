import 'dotenv/config';
import { RagService } from '../shared/rag';

const APPS = {
  home: new RagService({
    indexPath: 'data/home/rag-index.json',
    documentsDir: 'documents/home',
  }),
  resume: new RagService({
    indexPath: 'data/resume/rag-index.json',
    documentsDir: 'documents/resume',
  }),
  art: new RagService({
    indexPath: 'data/art/rag-index.json',
    documentsDir: 'documents/art',
  }),
  tanaga: new RagService({
    indexPath: 'data/tanaga/rag-index.json',
    documentsDir: 'documents/tanaga',
  }),
} as const;

type AppName = keyof typeof APPS;

async function buildOne(name: AppName): Promise<void> {
  console.log(`\n[${name}] Building RAG index from documents/${name}/...`);
  const result = await APPS[name].rebuild();
  console.log(
    `[${name}] Done — ${result.chunkCount} chunks from ${result.documentCount} documents.`,
  );
}

async function main(): Promise<void> {
  const target = process.argv[2];

  if (!target || target === 'all') {
    console.log('Building RAG indexes for all apps...');
    for (const name of Object.keys(APPS) as AppName[]) {
      await buildOne(name);
    }
    console.log('\nAll indexes built successfully.');
    return;
  }

  if (!(target in APPS)) {
    console.error(
      `Unknown app "${target}". Valid options: ${Object.keys(APPS).join(', ')}, all`,
    );
    process.exit(1);
  }

  await buildOne(target as AppName);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
