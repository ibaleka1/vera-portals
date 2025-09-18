import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function PortalShell({ children } : { children: React.ReactNode }) {
  const [breathPhase, setBreathPhase] = useState(0);
  const breathRef = useRef<number | null>(null);

  // breathing loop: gentle cycle 0..1..2..3 repeating (visual phases)
  useEffect(() => {
    let i = 0;
    breathRef.current = window.setInterval(() => {
      i = (i + 1) % 60; // 60 ticks => flexible speed
      setBreathPhase(i);
    }, 200);
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, []);

  // Voice/play / quick welcome (non-blocking)
  useEffect(() => {
    // greet once per mount softly (text, not real TTS here)
    // you can wire TTS to ElevenLabs in a later step
    // console.log("VERA: I'm here with you.");
  }, []);

  return (
    <div style={shell}>
      {/* left: VERA space (large, alive) */}
      <aside style={veraArea}>
        <div style={{...breathCircle, transform: `scale(${1 + Math.sin(breathPhase/10)/8})`}}/>
        <div style={veraInner}>
          <div style={title}>VERA</div>
          <div style={subtitle}>I’m here — breathe, speak, be seen.</div>

          <div style={chatBox}>
            <div style={{padding:12, color:"#EAEAF7"}}>
              <strong style={{display:"block", marginBottom:8}}>VERA</strong>
              <div style={{opacity:.9, marginBottom:12}}>Say something — I’m listening.</div>
              {/* Lightweight input — we'll wire to your /api/chat */}
              <VeraInput/>
            </div>
          </div>

          <div style={veraActions}>
            <button style={actionBtn} onClick={() => {
              // small breathing audio cue can be added later
              (async ()=> {
                // trigger a little visual nudge
                setBreathPhase(p => (p+10)%60);
              })();
            }}>Breathe with VERA</button>

            <Link href="/portal/journal" style={ghost}>Open Journal</Link>
            <Link href="/portal/progress" style={ghost}>Progress</Link>
          </div>
        </div>
      </aside>

      {/* right: content column */}
      <main style={content}>
        {children}
      </main>

      {/* persistent chat dock could still live here, but VERA is the large left area */}
      {/* <PortalChatDock /> */}
    </div>
  );
}

/* lightweight text input component used by VERA area */
function VeraInput() {
  const [text, setText] = useState("");
  const [log, setLog] = useState<{who:"me"|"vera"; text:string}[]>(() => {
    try { return JSON.parse(localStorage.getItem("vera_live_log")||"[]"); } catch { return []; }
  });
  useEffect(()=> localStorage.setItem("vera_live_log", JSON.stringify(log)), [log]);

  async function send() {
    if (!text.trim()) return;
    setLog(l => [...l, {who:"me", text}]);
    setText("");
    // optimistic local reply while server responds
    setLog(l => [...l, {who:"vera", text: "Thinking..." }]);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ messages: [{role:"user", content:text}] })
      });
      const data = await r.json();
      // replace last 'Thinking...' message
      setLog(prev => {
        const copy = prev.slice(0, -1);
        copy.push({who:"vera", text: data.reply || "I'm here with you."});
        return copy;
      });
    } catch {
      setLog(prev => {
        const copy = prev.slice(0, -1);
        copy.push({who:"vera", text: "Connection issue."});
        return copy;
      });
    }
  }

  return (
    <div>
      <div style={{height:140, overflow:"auto", padding:8, marginBottom:8, background:"rgba(0,0,0,0.12)", borderRadius:10}}>
        {log.map((m,i) => (
          <div key={i} style={{marginBottom:8}}>
            <b style={{opacity:.8}}>{m.who==="me" ? "You" : "VERA"}:</b>
            <div style={{marginLeft:6}}>{m.text}</div>
          </div>
        ))}
        {log.length===0 && <div style={{opacity:.7}}>VERA: Hello love — I'm listening.</div>}
      </div>

      <div style={{display:"flex", gap:8}}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Speak to VERA…" style={input}/>
        <button onClick={send} style={actionBtn}>Send</button>
      </div>
    </div>
  );
}

/* STYLES */
const shell:React.CSSProperties = {
  display:"grid",
  gridTemplateColumns:"minmax(360px,44%) 1fr",
  minHeight:"100vh",
  background:"#07102a",
  color:"#EAEAF7",
  gap:20,
  padding:20
};

const veraArea:React.CSSProperties = {
  position:"relative",
  borderRadius:18,
  overflow:"hidden",
  boxShadow:"0 20px 60px rgba(8,10,20,0.6)",
  background:"linear-gradient(180deg, rgba(15,18,35,0.95), rgba(10,12,25,0.9))",
  display:"flex",
  alignItems:"center",
  justifyContent:"center",
  padding:22
};

const veraInner:React.CSSProperties = { width:"100%", maxWidth:520, textAlign:"center", position:"relative", zIndex:2 };
const title:React.CSSProperties = { fontSize:34, letterSpacing:2, marginBottom:6 };
const subtitle:React.CSSProperties = { opacity:0.8, marginBottom:16 };

const breathCircle:React.CSSProperties = {
  position:"absolute", left:-80, top:-40, width:420, height:420,
  borderRadius:240, filter:"blur(42px)", opacity:0.12, background:"radial-gradient(circle at 30% 30%, rgba(135,58,255,0.85), rgba(192,132,252,0.6), transparent)"
};

const chatBox:React.CSSProperties = {
  marginTop:12, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:6, border:"1px solid rgba(255,255,255,0.04)"
};

const veraActions:React.CSSProperties = {display:"flex", gap:10, justifyContent:"center", marginTop:12};
const actionBtn:React.CSSProperties = {padding:"10px 14px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, color:"#0A0E27", background:"linear-gradient(135deg,#8B5CF6,#C084FC)"};
const ghost:React.CSSProperties = {padding:"8px 12px", borderRadius:10, background:"transparent", color:"#EAEAF7", border:"1px solid rgba(255,255,255,0.18)", textDecoration:"none"};

const content:React.CSSProperties = { padding:12, overflow:"auto" };
const input:React.CSSProperties = {flex:1, padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)", color:"#EAEAF7"};
