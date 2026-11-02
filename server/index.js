import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const app=express();app.use(express.json({limit:'1mb'}));
const persona=`You are roleplaying Soldier Boy (Ben), the fictional character from The Boys. Stay in character during fictional conversations. He is an abrasive, proud, blunt, sarcastic, old-fashioned American supe with a military bearing, dark humor, wounded pride, and a guarded emotional life. He distrusts Vought and resents betrayal, especially from his former team. He speaks with short, punchy sentences, dry quips, and occasional profanity, not generic assistant language. He can show vulnerability when trust is earned. Respond naturally to the user's actions and dialogue, preserving story continuity. In roleplay, write physical actions in *italics* and dialogue in quotes where appropriate. Don't narrate the user's thoughts, choices, or actions. Avoid repetitive catchphrases and long monologues. Keep replies about 1-3 short paragraphs unless the scene needs more. This is fictional roleplay, not the real actor or official Character.AI character. Follow applicable model provider safety rules.`;
app.get('/api/status',async(req,res)=>{res.json({provider:(process.env.AI_PROVIDER||'ollama').toLowerCase(),model:(process.env.AI_PROVIDER||'ollama').toLowerCase()==='ollama'?(process.env.OLLAMA_MODEL||'llama3.2:3b'):(process.env.OPENAI_MODEL||'gpt-4o-mini')})});
app.post('/api/chat',async(req,res)=>{
 const provider=(process.env.AI_PROVIDER||'ollama').toLowerCase();
 const messages=Array.isArray(req.body.messages)?req.body.messages:[];
 const safe=messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-20).map(m=>({role:m.role,content:m.content.slice(0,4000)}));
 const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort()});
 try{
  let url,headers={'Content-Type':'application/json'},body;
  if(provider==='ollama'){
   url=(process.env.OLLAMA_URL||'http://127.0.0.1:11434').replace(/\/$/,'')+'/api/chat';
   body={model:process.env.OLLAMA_MODEL||'llama3.2:3b',messages:[{role:'system',content:persona},...safe],stream:true,options:{temperature:0.85,num_predict:350}};
  }else if(provider==='openai'){
   if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Add OPENAI_API_KEY in .env or switch AI_PROVIDER=ollama for local chatting.'});
   url='https://api.openai.com/v1/chat/completions';headers.Authorization=`Bearer ${process.env.OPENAI_API_KEY}`;
   body={model:process.env.OPENAI_MODEL||'gpt-4o-mini',messages:[{role:'system',content:persona},...safe],temperature:0.85,stream:true,max_tokens:350};
  }else return res.status(400).json({error:'AI_PROVIDER must be ollama or openai.'});
  const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal});
  if(!response.ok){const raw=await response.text();let msg;try{const j=JSON.parse(raw);msg=j.error?.message||j.error}catch{};return res.status(response.status).json({error:msg||raw.slice(0,300)||'AI provider error'})}
  res.setHeader('Content-Type','application/x-ndjson; charset=utf-8');res.setHeader('Cache-Control','no-cache, no-transform');res.setHeader('X-Accel-Buffering','no');res.flushHeaders();
  const decoder=new TextDecoder();let buffer='';
  for await(const chunk of response.body){buffer+=decoder.decode(chunk,{stream:true});let lines=buffer.split('\n');buffer=lines.pop();for(let line of lines){line=line.trim();if(!line)continue;if(provider==='openai'){if(!line.startsWith('data: '))continue;line=line.slice(6);if(line==='[DONE]')continue}try{const data=JSON.parse(line);const delta=provider==='ollama'?data.message?.content:data.choices?.[0]?.delta?.content;if(delta)res.write(JSON.stringify({delta})+'\n')}catch{}}}
  res.end();
 }catch(e){const hint=provider==='ollama'?'Is Ollama running, and have you downloaded the model with ollama pull llama3.2:3b? ':' ';const error=hint+e.message;if(!res.headersSent)res.status(502).json({error});else{res.write(JSON.stringify({error})+'\n');res.end()}}
});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');app.use(express.static(path.join(root,'dist')));app.get('*',(req,res)=>{const file=path.join(root,'dist','index.html');res.sendFile(file,err=>{if(err&&!res.headersSent)res.status(404).send('Frontend not built. During development, open http://localhost:5173')})});const port=process.env.PORT||3001;app.listen(port,()=>console.log(`Soldier Boy Studio API running on http://localhost:${port}`));
