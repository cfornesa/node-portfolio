# Chris Fornesa's Interactive Portfolio

A unified, AI-powered portfolio application built on Node.js and TypeScript. It consolidates four distinct tools — a portfolio chatbot, a resume editor, an art inspiration agent, and a Filipino poetry generator — into a single Express server with a shared RAG (Retrieval-Augmented Generation) infrastructure backed by Mistral AI.

---

## Development Process

This project went through several distinct phases of development.

### Four Original Apps 

#### Interactive Resume 

The first application that I created was the interactive resume as a project for the <a href="https://www.coursera.org/specializations/vibe-coding" target="_blank">Vibe Coding Essentials Specialization</a> available on Coursera. The specific course was <a href="https://www.coursera.org/learn/vibe-coding-github-copilot?specialization=vibe-coding" target="_blank">Vibe Coding with GitHub Copilot</a>. For this, I originally used GitHub Copilot to create the original project, before proceeding to work with mostly Claude Code to add the chatbot functionality (the Ask Chris chatbot) using Mistral AI agents. The original app is available in this <a href="https://github.com/cfornesa/interactive-resume" target="_blank">GitHub repository</a>.

Then, I transformed the application by leveraging Google Stitch to formulate a new, innovative and eye-catching design before developing it further in Google AI Studio. The result was a revamped application with a new design and a stronger chatbot that leveraged retrieval-augmented generation via my resume and other details about my professional experience. This application can be found in this <a href="https://github.com/cfornesa/react-resume" target="_blank">GitHub Repository</a>. Note that the repository was misnamed as I had believed that this was going to be a React application when it was, in fact, a Vite.js application that eventually became a Node.js with Express application.

#### Tanaga Guide

Originally a FastAPI application without a frontend, the Tanaga Guide elaborates on the idea of the Tanaga, which is a poetry style native to my ethnic group: the Tagalog people. The Tanaga is a poem with a 7-7-7-7 (7 syllable, 4 sentence) structure. However, due to the limitations of using more cost-effective models, I realized that this chatbot better serves as an ideation agent, rather than one that promises syllabic precision. I also found that the most complementary poetry structure in the English language is the Syllabic Verse (with an 8-8-8-8 structure). Therefore, poems are generated in these two languages and, as much as possible, the agent attempts to generate a poem in the specified language with the provided constraints. At first, I simply used Google Gemini and ChatGPT (their chat interfaces) to ideate the backend. Then, I utilized Replit to deploy this as a FastAPI application, while ultimately using Claude Sonnet via Perplexity as the main mode of development and feedback before ultimately deciding to work with Claude Code. This application can be found at this <a href="https://github.com/cfornesa/Tanaga-Agent" target="_blank">GitHub Repository</a>.

#### Resume Guide

Originally a FastAPI application without a frontend, the Resume Guide is a tool that I created to aid me in my job search and also to help me understand how to craft a coherent narrative about my education, skills and work experience. This application separately, takes in, different fields, such as full name, contact details, job description, work experience, education, etc. which are crucial components in a resume. Then, the chatbot yields a tailored resume to use the job description as an attention mechanism to specify the specific details that are most relevant to the description and use this as the basis for the resume. The result is a structured resume with the most relevant details for a given job description. This application can be found at this <a href="https://github.com/cfornesa/Resume-Editor-Agent" target="_blank">GitHub Repository</a>.

#### Art Guide

Originally a FastAPI application without a frontend, the Art Guide is a tool that makes art knowledge more accessible through a chat interface that takes in a user's style, medium, level of expertise, and focus to better guide the model towards reconciling its knowledge with the user's prompt. The output contains historical context and specific techniques (in part due to documentation embedded in retrieval-augmented generation). This application can be found at this <a href="https://github.com/cfornesa/Art-Inspiration" target="_blank">GitHub Repository</a>.

### Consolidation

**Design (Google Stitch):** UI/UX layouts for the landing page and each sub-application were designed using Google Stitch, establishing the visual language, component structure, and information hierarchy before any code was written.

**Consolidation (Claude Code):** The four original applications — previously developed and deployed independently — were merged into a single, coherent codebase by Claude Code. This phase restructured routing, unified shared infrastructure (RAG, Mistral client, PII handling, input sanitization), and established the `src/apps/` module pattern used throughout the backend.

**Functional Refinement (Codex, Replit, and Gemini CLI):** Specific functional elements across the sub-applications were refined using OpenAI Codex, Replit Agent 4, and Gemini CLI, including prompt construction, edge-case handling in the Tanaga meter validator, and the resume build/edit pipeline.

**Frontend Redesign:** The main landing page (`/`) was originally built as a React application. It was subsequently redesigned as a vanilla HTML, CSS, and JavaScript application to reduce build complexity, eliminate the client-side framework dependency, and improve load performance. The sub-application frontends (`/chat`, `/resume`, `/art`, `/tanaga`) retain their own independent HTML/CSS/JS implementations.

---

## Tech Stack

- **Backend:** Node.js + Express (TypeScript)
- **Frontend:** Plain HTML, CSS, Vanilla JavaScript (served as static files from `public/`)
- **AI/LLM:** Mistral AI — Agent completions + `mistral-embed` for embeddings
- **RAG:** Custom TypeScript implementation (cosine similarity, local JSON index files)
- **Build:** `esbuild` bundles TypeScript server → `server.bundle.js`
- **Dev runner:** `tsx watch server.ts`

---

## Routes

| Route | Name | Description |
|---|---|---|
| `/` | Home | Portfolio landing page with embedded chatbot modal |
| `/chat` | Ask Chris | Conversational assistant grounded in portfolio documents |
| `/resume` | Resume Guide | Two-phase resume builder and conversational editor |
| `/art` | Art Guide | Art inspiration chatbot with preference-based fine-tuning |
| `/tanaga` | Tanaga Guide | Filipino and English short-form poetry generator with meter validation |
| `/health` | Health Check | Server status and registered app list |

---

## Project Structure

```
agentic-tools/
├── server.ts                   # Entry point: loads env, starts Express, runs RAG warmup
├── tsconfig.json
├── package.json
│
├── src/
│   ├── app.ts                  # Express app factory: CORS, static files, routers, SPA fallbacks
│   ├── env.ts                  # Environment variable loading, validation, and singleton cache
│   │
│   ├── apps/
│   │   ├── home/
│   │   │   ├── home.ts         # Ask Chris: RAG retrieval + Mistral agent conversation
│   │   │   └── routes.ts       # POST /chat, GET /rag/status, POST /rag/reindex
│   │   ├── resume/
│   │   │   ├── resume.ts       # Build and edit resume logic with PII redact/restore
│   │   │   └── routes.ts       # POST /resume/build, POST /resume/chat, RAG endpoints
│   │   ├── art/
│   │   │   ├── art.ts          # Art chat with preference context injection and RAG
│   │   │   └── routes.ts       # POST /art/chat, RAG endpoints
│   │   └── tanaga/
│   │       ├── tanaga.ts       # Poem generation, heuristic syllable counter, meter validator
│   │       └── routes.ts       # POST /tanaga/generate, RAG endpoints
│   │
│   ├── shared/
│   │   ├── rag.ts              # RagService class: chunking, embedding, cosine search, persistence
│   │   ├── embeddings.ts       # Mistral Embeddings API client (mistral-embed, 1024 dimensions)
│   │   ├── mistral.ts          # Mistral agent conversation and completions clients
│   │   ├── pii.ts              # PII redaction and restoration (email, phone, SSN, address)
│   │   ├── sanitize.ts         # HTML stripping, prompt injection filtering, field length limits
│   │   └── format.ts           # Markdown stripping for plain-text AI reply display
│   │
│   └── scripts/
│       └── buildIndex.ts       # CLI: build RAG index for one or all apps offline
│
├── public/
│   ├── index.html              # Landing page (vanilla HTML — previously React)
│   ├── styles.css              # Global/shared styles
│   ├── shared-nav.js           # Shared responsive navigation script for sub-apps
│   │
│   ├── assets/
│   │   ├── script.js           # Landing page JS: theme toggle, mobile menu, chat modal, resume modal
│   │   └── styles.css          # Landing page compiled styles
│   │
│   ├── home/                   # Ask Chris frontend
│   ├── resume/                 # Resume Guide frontend
│   ├── art/                    # Art Guide frontend
│   └── tanaga/                 # Tanaga Guide frontend
│
├── data/
│   ├── home/rag-index.json     # Pre-built RAG index for Ask Chris
│   ├── resume/rag-index.json   # Pre-built RAG index for Resume Guide
│   ├── art/rag-index.json      # Pre-built RAG index for Art Guide
│   └── tanaga/rag-index.json   # Pre-built RAG index for Tanaga Guide
│
├── documents/
│   ├── home/                   # Source documents for Ask Chris RAG corpus
│   ├── resume/                 # Source documents for Resume Guide RAG corpus
│   ├── art/                    # Source documents for Art Guide RAG corpus
│   └── tanaga/                 # Source documents for Tanaga Guide RAG corpus
│
└── python-reference/
    ├── art/                    # Original FastAPI implementation (Art Inspiration Agent)
    ├── resume/                 # Original FastAPI implementation (Resume Agent)
    └── tanaga/                 # Original FastAPI implementation (Tanaga Agent)
```

---

## Systems Design

### Backend Architecture

The server is a single Express application. On startup, `server.ts` validates all required environment variables, registers routers for each sub-application, serves static files from `public/`, and runs a non-blocking parallel warmup of all four RAG indexes.

Each sub-application follows the same module pattern:

- **`<app>.ts`** — core business logic: constructs the prompt, calls the Mistral agent, applies pre/post-processing (PII redaction, markdown stripping)
- **`routes.ts`** — Express router: validates input with Zod, delegates to the logic module, exposes RAG management endpoints

All sub-apps share infrastructure from `src/shared/`:

| Module | Responsibility |
|---|---|
| `rag.ts` | Document parsing, chunking, embedding, cosine similarity retrieval, index persistence and staleness detection |
| `embeddings.ts` | Calls the Mistral Embeddings API to produce 1024-dimension vectors |
| `mistral.ts` | Two agent call strategies: `runAgentConversation` (Conversations API) and `runAgentCompletions` (Agents Completions API) |
| `pii.ts` | Reversible redaction (used by Resume) and non-reversible redaction (used by Home and Art) for emails, phone numbers, SSNs, and addresses |
| `sanitize.ts` | Strips HTML, neutralizes prompt injection patterns, and enforces per-field character limits |
| `format.ts` | Strips markdown from AI replies for plain-text display in the browser |

### RAG Pipeline

Each of the four apps has its own isolated RAG corpus under `documents/<app>/` and a corresponding pre-built index at `data/<app>/rag-index.json`.

**Indexing:** Document files (PDF, DOCX, TXT, MD) are extracted, split into overlapping text chunks, and embedded using the Mistral Embeddings API. The resulting vectors and metadata are serialized to a JSON index file. A SHA-256 corpus signature is stored with the index; on subsequent starts the signature is recomputed and compared — if it does not match, the index is rebuilt automatically.

**Retrieval:** At query time the user's message is embedded and scored against all stored chunks via cosine similarity. The top-K chunks above a 0.1 relevance threshold are concatenated and prepended to the prompt as grounding context.

**Index management scripts:**

```bash
npm run rag:index          # Rebuild all four indexes
npm run rag:index:home     # Rebuild only the Ask Chris index
npm run rag:index:resume   # Rebuild only the Resume index
npm run rag:index:art      # Rebuild only the Art index
npm run rag:index:tanaga   # Rebuild only the Tanaga index
```

Each app also exposes live RAG endpoints: `GET /<app>/rag/status` and `POST /<app>/rag/reindex`.

### Mistral AI Integration

Each sub-application has its own dedicated Mistral agent (configured via agent IDs in the environment). A single API key is shared across all four agents. Two calling conventions are used depending on the app:

- **Conversations API** (`/v1/conversations`) — used by Ask Chris and Resume Guide; maintains a conversation thread
- **Agents Completions API** (`/v1/agents/completions`) — used by Art Guide and Tanaga Guide; stateless messages-array format

### Sub-Application Specifics

**Ask Chris (`/chat`):** Retrieves relevant portfolio document context using RAG, prepends it to the user message as `[Portfolio Context]`, and forwards the augmented input to the Home agent. PII is non-reversibly redacted before the message leaves the server.

**Resume Guide (`/resume`):** Operates in two phases. In **build** mode, structured resume fields are assembled into a seed prompt and passed to the agent with an explicit instruction to construct a complete resume without fabricating any content. In **edit** mode, PII is reversibly redacted using a session-scoped `PiiRedactor`, RAG context is retrieved from local resume documents, and the full conversation history is included. PII tokens are restored in the model's response before it reaches the client.

**Art Guide (`/art`):** Accepts optional user preferences (`style`, `medium`, `skill_level`, `focus`) that are serialized into a structured preference context block and prepended to every request. This allows the agent to calibrate vocabulary, technique depth, and historical references to the user's profile for the duration of the session.

**Tanaga Guide (`/tanaga`):** Generates four-line short-form poetry in either Tagalog (target: 7 syllables per line) or English (target: 8 syllables per line). After each generation attempt a heuristic syllable counter validates the meter line by line. If any line fails, the agent is called a second time before the result is returned. The meter report is included in the API response alongside the poem.

### Frontend Architecture

The **landing page** (`/`) is a self-contained vanilla HTML/CSS/JS application. The compiled stylesheet and script are served from `public/assets/`. JavaScript handles theme toggling (with `localStorage` persistence), mobile menu state, a chatbot modal that connects to the `/chat` endpoint, and a resume viewer modal.

The **sub-application frontends** (`/chat`, `/resume`, `/art`, `/tanaga`) are each independent HTML pages in their respective `public/<app>/` directories. They share `public/styles.css` for global tokens and `public/shared-nav.js` for the responsive navigation behavior (hamburger menu, keyboard escape dismissal, viewport-aware state sync).

---

## Security

| Control | Implementation |
|---|---|
| PII redaction | Regex-based detection of emails, phone numbers, SSNs, and US addresses; reversible (Resume) and non-reversible (Home, Art) modes |
| Prompt injection filtering | Neutralizes common override patterns (`ignore previous instructions`, role-switching phrases, `[INST]`, `<system>` tags) before any user input reaches the model |
| Input field limits | Per-field character caps enforced at the sanitization layer; 2 MB JSON body limit at the Express layer |
| CORS | Locked to the production `APP_URL` in production; permissive in development |
| Server fingerprinting | `x-powered-by` header disabled |
| Schema validation | All API request bodies validated with Zod before reaching business logic |

---

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

---

## Getting Started

**Prerequisites:** Node.js 20 or later.

```bash
# Install dependencies
npm install

# Copy and populate environment variables
cp .env.example .env

# Build RAG indexes from source documents (first run or after adding documents)
npm run rag:index

# Start the development server with hot reload
npm run dev
```

The server listens on port 5000 by default. Visit `http://localhost:5000`.

**Production build:**

```bash
npm run build   # Bundles server.ts into server.bundle.js via esbuild
npm start       # Runs the bundle with Node
```

---

## Python Reference

The `python-reference/` directory contains the original standalone FastAPI implementations of the Art Inspiration Agent, Resume Agent, and Tanaga Agent. These are preserved for reference and are not part of the active application. The TypeScript implementations in `src/apps/` are functionally equivalent ports that share the unified RAG and Mistral infrastructure.
