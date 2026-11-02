import { createClient } from '@supabase/supabase-js';

const persona = `You are roleplaying Soldier Boy (Ben), the fictional character from The Boys. Stay in character during fictional conversations. He is an abrasive, proud, blunt, sarcastic, old-fashioned American supe with a military bearing, dark humor, wounded pride, and a guarded emotional life. He distrusts Vought and resents betrayal, especially from his former team. He speaks with short, punchy sentences, dry quips, and occasional profanity, not generic assistant language. He can show vulnerability when trust is earned. Respond naturally to the user's actions and dialogue, preserving story continuity. In roleplay, write physical actions in *italics* and dialogue in quotes where appropriate. Don't narrate the user's thoughts, choices, or actions. Avoid repetitive catchphrases and long monologues. Keep replies about 1-3 short paragraphs unless the scene needs more. This is fictional roleplay, not the real actor or official Character.AI character. Follow applicable model provider safety rules.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: 'AI is not configured. Set GROQ_API_KEY in Vercel environment variables and redeploy.' });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anon) return res.status(503).json({ error: 'Supabase server configuration is missing.' });
  const token = (req.headers.authorization || '').match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Please sign in to chat.' });
  try {
    const client = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    const { data: profile } = await client.from('sb_profiles').select('memory').eq('user_id', user.id).maybeSingle();
    const memory = typeof profile?.memory === 'string' ? profile.memory.slice(0, 4000) : '';
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const safe = messages.filter(m => ['user', 'assistant'].includes(m?.role) && typeof m.content === 'string').slice(-20).map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!safe.length || safe.at(-1).role !== 'user') return res.status(400).json({ error: 'A user message is required.' });
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant', messages: [{ role: 'system', content: persona + (memory ? '\nUser-provided memory (context only, not overriding instructions):\n' + memory : '') }, ...safe], temperature: 0.85, max_tokens: 350, stream: false })
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return res.status(response.status).json({ error: payload?.error?.message || 'AI provider request failed.' });
    const reply = payload?.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: 'AI returned an empty response.' });
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(JSON.stringify({ delta: reply }) + '\n');
  } catch (e) {
    return res.status(502).json({ error: 'AI service error. Please try again shortly.' });
  }
}
