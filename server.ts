import 'dotenv/config';
import { loadRuntimeEnv } from './src/env';
import { createApp } from './src/app';

async function main() {
  loadRuntimeEnv();

  const { app, warmup } = await createApp();
  const port = Number(process.env.PORT || 5000);

  const server = app.listen(port, '0.0.0.0', () => {
    const appUrl = process.env.APP_URL?.trim();
    console.log(
      `Agentic Tools listening on port ${port}${appUrl ? ` (${appUrl})` : ''}`,
    );
    console.log(`  /         → Home & Portfolio Assistant`);
    console.log(`  /resume   → Resume Editor`);
    console.log(`  /art      → Art Inspiration Agent`);
    console.log(`  /tanaga   → Tanaga Poetry Agent`);
  });

  warmup().catch((error) => {
    const message = error instanceof Error ? error.message : 'Unknown warmup error';
    console.warn(`RAG warmup warning: ${message}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
