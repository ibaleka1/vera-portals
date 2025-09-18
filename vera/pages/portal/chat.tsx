import { useEffect, useRef, useState } from "react";

export default function PortalChat(){
  const [messages, setMessages] = useState<{who:"me"|"vera"; text:string}[]>([]);
  const [latestReply, setLatestReply] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ const raw = localStorage.getItem("vera_portal_chat"); if(raw) setMessages(JSON.parse(raw)); },[]);
  useEffect(()=>{ localStorage.setItem("vera_portal_chat", JSON.stringify(messages)); },[messages]);

  function addMsg(text:string, who:"me"|"vera"){ setMessages(m=>[...m,{who,text}]); setTimeout(()=> logRef.current?.scrollTo({top: 999999, behavior:'smooth'}), 0); }

  async function send(){
    const content = (inputRef.current?.value||"").trim(); if(!content) return;
    addMsg(content,'me'); if(inputRef.current) inputRef.current.value='';
    try{
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({messages:[{role:'system',content:'You are VERA inside the private Portal. Be kind, regulated, never provide medical advice.'},{role:'user',content}]})});
      const data = await r.json(); const reply = data.reply || '…'; addMsg(reply,'vera'); setLatestReply(reply);
    }catch{ addMsg('Connection issue.','vera'); }
  }

  function startMic(){
    if (typeof window === 'undefined') return;
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert('Speech recognition not supported on this browser.'); return; }
    const rec = new SR(); rec.lang = 'en-US'; rec.onresult = (e:any)=>{ const t = e.results[0][0].transcript; if(inputRef.current) inputRef.current.value = t; }; rec.start();
  }

  async function speak(){
    try{ const text = latestReply || 'Breathe with me.'; const r = await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({ text })}); if(!r.ok) return; const blob = await r.blob(); const url = URL.createObjectURL(blob); const audio = new Audio(url); await audio.play(); }catch{}
  }

  return (
    <main style={page}>
      <div style={card}>
        <h2 style={{marginTop:0}}>Portal Chat</h2>
        <div ref={logRef} style={log}>
          {messages.map((m,i)=> <div key={i} style={{margin:"8px 0"}}><b style={{opacity:.8}}>{m.who==='me'?'You':'VERA'}:</b> <span>{m.text}</span></div>)}
        </div>
        <div style={{display:'flex', gap:10}}>
          <input ref={inputRef} placeholder="Share your thought…" style={input}/>
          <button onClick={send} style={btn}>Send</button>
          <button onClick={startMic} style={ghost}>🎙️</button>
          <button onClick={speak} style={ghost}>🔊</button>
        </div>
      </div>
    </main>
  );
}
const page: React.CSSProperties = {minHeight:"100vh",padding:"30px 18px",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter"};
const card: React.CSSProperties = {maxWidth:900, margin:"0 auto", background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:18};
const log: React.CSSProperties = {height:480, overflow:"auto", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", padding:12, marginBottom:12, background:"rgba(255,255,255,0.04)"};
const input: React.CSSProperties = {flex:1, background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:12,padding:"12px 14px",color:"#EAEAF7"};
const btn: React.CSSProperties = {padding:"10px 14px",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#8B5CF6,#C084FC)",color:"#0A0E27"};
const ghost: React.CSSProperties = {padding:"10px 14px",borderRadius:12,background:"transparent",color:"#EAEAF7",border:"1px solid rgba(255,255,255,0.18)",cursor:"pointer"};
