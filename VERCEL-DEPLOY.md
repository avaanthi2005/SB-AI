# SB.AI Vercel deployment — hosted AI

This update adds `api/chat.js`, a Vercel serverless API route that sends authenticated chats to GroqCloud. The original `server/index.js` remains for local Ollama development.

1. Create a GroqCloud account at https://console.groq.com/ and create an API key. Free-tier usage is subject to provider limits.
2. In Vercel > Project > Settings > Environment Variables add `GROQ_API_KEY` (secret, no VITE_ prefix). Optionally set `GROQ_MODEL=llama-3.1-8b-instant`.
3. Keep existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables. The serverless route can use these public credentials to verify user tokens; alternatively set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as server environment variables. NEVER use a Supabase service-role key here.
4. Push the modified project files to the existing GitHub repository and redeploy in Vercel.
5. In Supabase Authentication > URL Configuration set Site URL to your Vercel domain, and add `https://YOUR-DOMAIN.vercel.app/**` under Redirect URLs.
6. Sign in, send a message, and test with a second account to verify chat and memory isolation.

The online route sends one complete response in the same NDJSON format expected by the frontend (not token-by-token streaming). The local Ollama server still works when running locally via Vite's /api proxy.

Never commit `.env`, `node_modules`, or Groq keys. Before inviting users, consider abuse prevention and provider rate limits; public signup can consume free API quota.
