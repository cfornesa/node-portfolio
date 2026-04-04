# Agentic Tools

A unified AI-powered platform featuring four specialized agents built on Mistral AI with a RAG (Retrieval-Augmented Generation) architecture.

## Agents

- **Home / Portfolio Assistant** (`/`) — General assistant for the developer's portfolio and personal info
- **Resume Editor** (`/resume`) — Helps generate and edit resumes using RAG-backed document context
- **Art Inspiration Agent** (`/art`) — Creative guidance powered by art-related essays and documents
- **Tanaga Poetry Agent** (`/tanaga`) — Specialized in the Filipino Tanaga poetic form

## Tech Stack

- **Backend:** Node.js + Express (TypeScript)
- **Frontend:** Plain HTML, CSS, Vanilla JavaScript (served as static files from `public/`)
- **AI/LLM:** Mistral AI — Agent completions + `mistral-embed` for embeddings
- **RAG:** Custom TypeScript implementation (cosine similarity, local JSON index files)
- **Build:** `esbuild` bundles TypeScript server → `server.bundle.js`
- **Dev runner:** `tsx watch server.ts`

## Project Structure

```
public/          # Static frontend (HTML/CSS/JS) per agent
src/
  apps/          # Per-agent routes and RAG config
  shared/        # RAG engine, Mistral API client
  scripts/       # buildIndex.ts for rebuilding RAG indexes
  app.ts         # Express app setup
  env.ts         # Environment variable loading/validation
server.ts        # Entry point — loads env, starts server on port 5000
documents/       # Source documents for RAG (per agent)
data/            # Persisted RAG index JSON files (per agent)
```

## Environment Variables / Secrets

| Key | Description |
|-----|-------------|
| `MISTRAL_API_KEY` | Mistral AI API key (shared by all agents) |
| `HOME_AGENT_ID` | Mistral Agent ID for the Home assistant |
| `RESUME_AGENT_ID` | Mistral Agent ID for the Resume editor |
| `ART_AGENT_ID` | Mistral Agent ID for the Art agent |
| `TANAGA_AGENT_ID` | Mistral Agent ID for the Tanaga agent |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (`development` / `production`) |

Optional RAG tuning vars: `RAG_TOP_K`, `RAG_CHUNK_SIZE`, `RAG_CHUNK_OVERLAP`

## Development

```bash
npm run dev          # Start dev server with hot reload (tsx watch)
npm run build        # Bundle for production (esbuild → server.bundle.js)
npm run rag:index    # Rebuild all RAG indexes
npm run typecheck    # TypeScript type check
```

## Workflow

- **Start application** — runs `npm run dev` on port 5000

## Deployment

- Target: **autoscale**
- Build: `npm run build`
- Run: `node server.bundle.js`
