export type RuntimeEnv = {
  nodeEnv: string;
  port: number;
  mistralApiKey: string;
  homeAgentId: string;
  resumeAgentId: string;
  artAgentId: string;
  tanagaAgentId: string;
  appUrl: string;
  ragTopK: number;
  ragChunkSize: number;
  ragChunkOverlap: number;
};

let cached: RuntimeEnv | null = null;

export function loadRuntimeEnv(): RuntimeEnv {
  if (cached) return cached;

  const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
  const port = Number(process.env.PORT || 5000);
  const mistralApiKey = process.env.MISTRAL_API_KEY?.trim();
  const homeAgentId = process.env.HOME_AGENT_ID?.trim();
  const resumeAgentId = process.env.RESUME_AGENT_ID?.trim();
  const artAgentId = process.env.ART_AGENT_ID?.trim();
  const tanagaAgentId = process.env.TANAGA_AGENT_ID?.trim();
  const appUrl = process.env.APP_URL?.trim() || `http://localhost:${port}`;

  if (!mistralApiKey) {
    throw new Error('MISTRAL_API_KEY missing from environment.');
  }
  if (!homeAgentId) {
    throw new Error('HOME_AGENT_ID missing from environment.');
  }
  if (!resumeAgentId) {
    throw new Error('RESUME_AGENT_ID missing from environment.');
  }
  if (!artAgentId) {
    throw new Error('ART_AGENT_ID missing from environment.');
  }
  if (!tanagaAgentId) {
    throw new Error('TANAGA_AGENT_ID missing from environment.');
  }

  process.env.NODE_ENV = nodeEnv;
  process.env.APP_URL = appUrl;

  cached = {
    nodeEnv,
    port,
    mistralApiKey,
    homeAgentId,
    resumeAgentId,
    artAgentId,
    tanagaAgentId,
    appUrl,
    ragTopK: Number(process.env.RAG_TOP_K || 4),
    ragChunkSize: Number(process.env.RAG_CHUNK_SIZE || 1000),
    ragChunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP || 150),
  };

  return cached;
}

export function getEnv(): RuntimeEnv {
  if (!cached) {
    throw new Error('Runtime environment not loaded. Call loadRuntimeEnv() first.');
  }
  return cached;
}
