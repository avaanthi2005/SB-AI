# SB.AI — Soldier Boy roleplay

## Run for free locally (no per-message API fees)

1. Install Node.js LTS and Ollama from https://ollama.com/download.
2. In a terminal, run `ollama pull llama3.2:3b` (one-time model download, several GB).
3. Make sure Ollama is running. On Windows, launching the Ollama application normally starts its service.
4. In this project, run `npm install`.
5. Copy `.env.example` to `.env`; leave `AI_PROVIDER=ollama`.
6. Terminal 1: `npm run server`. Terminal 2: `npm run dev`.
7. Open http://localhost:5173.

Chat sessions have no application-imposed message count limit, but are stored in browser localStorage, which has limited space. Export important transcripts. Local model replies depend on hardware, and may be slower than cloud models. This project does not bypass any model's safety controls.

## Optional OpenAI cloud mode
Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...` in `.env`. OpenAI API usage is billed separately; no-credit errors mean the provider account requires billing. Never publish `.env`.

## Deployment
`npm run build` creates `dist/`; `npm start` serves it with the API. For a public site, Ollama must run on a reachable server with adequate resources (not just your personal PC), or configure a cloud provider. Add authentication, rate limiting, and durable storage before making it public. This fan project is not affiliated with The Boys, Vought, or Character.AI.
