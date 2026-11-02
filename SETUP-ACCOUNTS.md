# SB.AI — Accounts, private chats and memory

This update preserves the original React interface, Ollama/OpenAI streaming endpoint, voices, chat controls and images.

## Setup

1. Create a Supabase project. Open **SQL Editor**, paste `supabase-schema.sql`, and run it **once**. It creates tables with per-user row-level security.
2. In Supabase **Project Settings → API**, copy your **Project URL** and **publishable/anon** key (NOT `service_role`).
3. In `.env` add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` with the same URL and public anon key respectively. Restart Vite and the Node server.
4. Run `npm install`, `npm run server` and (in a second terminal) `npm run dev`.
5. Sign up; if email confirmation is enabled in Supabase, confirm your email first. Sign in and test with two accounts. Each account should only see its own chat history and personal memory.

## Important behavior

- Without Supabase configuration, the original **local guest mode** still works, with chats in localStorage and Ollama as before. **Guest mode is not secure multi-user mode.**
- With Supabase configured, login is required, chat records are saved in Supabase and protected by database row-level security. The backend validates the access token and reads only that account's memory.
- Long-term memory is **user-edited** in the dossier panel; it is not automatically extracted from conversations. Chat history persists across devices once the user signs in.
- Existing anonymous browser chats are **not automatically imported** into new accounts; this prevents accidentally attaching one person's chats to another account.
- For production deployment on Vercel, the Express streaming server needs to be adapted to Vercel Functions or hosted separately; Vercel cannot run local Ollama. This ZIP is a local working project update, **not** a finished 24/7 deployment.
- Never upload `.env`, `.git`, or `node_modules` to GitHub. Do not expose `service_role` credentials.
- Free tiers have usage limits and can change.

The old `package-lock.json` is intentionally omitted because the new Supabase dependency requires `npm install` to regenerate it. Commit the newly generated lockfile afterward.
