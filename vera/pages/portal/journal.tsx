import { useEffect, useRef, useState } from "react";
// If you already added PortalHeader earlier, keep this import.
// If not, delete the next line.
// import PortalHeader from "../../components/PortalHeader";

const PROMPTS = [
  "What felt nourishing today?",
  "Where did I feel tension in my body—and what might it be asking?",
  "One tiny thing I can do for myself tomorrow is…",
  "If I could speak to my future self, what advice would they give me today?",
  "What emotion is loudest right now? Where is it in my body?"
];

type Entry = {
  id: string;
  date: string; // yyyy-mm-dd
  mood?: "🌤️"|"🌧️"|"⛅"|"🌪️"|"🌞";
  prompt?: string;
  text?: string;
  imageDataUrl?: string;
};

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [mood, setMood] = useState<Entry["mood"]>("🌤️");
  const [prompt, setPrompt] = useState<string>(PROMPTS[0]);
  const [text, setText] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const raw = localStorage.getItem("vera_journal"); if (raw) setEntries(JSON.parse(raw)); }, []);
  useEffect(() => { localStorage.setItem("vera_journal", JSON.stringify(entries)); }, [entries]);

  function save() {
    const id = crypto.randomUUID();
    const next: Entry = { id, date, mood, prompt, text, imageDataUrl: imagePreview || undefined };
    setEntries(prev => [next, ...prev]);
    setText(""); setImagePreview(null); if (fileRef.current) fileRef.current.value = "";
  }
  function remove(id: string) { setEntries(prev => prev.filter(e => e.id !== id)); }
  function shufflePrompt() { setPrompt(PROMPTS[Math.floor(Math.random()*PROMPTS.length)]); }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(f);
  }

  // Simple breathing timer (Box 4-4-4-4 or 4-7-8)
  const [breathMode, setBreathMode] = useState<"box"|"478">("box");
  const [breathStep, setBreathStep] = useState<string>("Ready");
  const [running, setRunning] = useState(false);
  async function runBreath() {
    if (running) return; setRunning(true);
    const wait = (ms:number)=>new Promise(r=>setTimeout(r,ms));
    if (breathMode==="box") {
      for (let i=0;i<4;i++){ setBreathStep("Inhale 4"); await wait(4000); setBreathStep("Hold 4"); await wait(4000); setBreathStep("Exhale 4"); await wait(4000); setBreathStep("Hold 4"); await wait(4000); }
    } else {
      for (let i=0;i<4;i++){ setBreathStep("Inhale 4"); await wait(4000); setBreathStep("Hold 7"); await wait(7000); setBreathStep("Exhale 8"); await wait(8000); }
    }
    setBreathStep("Done"); setRunning(false);
  }

  return (
    <>
      {/* PortalHeader removed because component is missing */}
      <main style={page}>
        <div style={wrap}>
          <h1 style={{marginTop:0}}>Journal</h1>
          <p style={{opacity:.9, marginTop:-6}}>Daily prompts, mood, optional image, and a quick breathing timer.</p>

          {/* Form */}
          <section style={card}>
            <div style={row}>
              <label style={label}>Date</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={input}/>
            </div>

            <div style={row}>
              <label style={label}>Mood</label>
              <div style={{display:"flex", gap:8}}>
                {["🌤️","⛅","🌞","🌧️","🌪️"].map(m => (
                  <button key={m} onClick={()=>setMood(m as Entry["mood"])}
                          style={{...chip, ...(m===mood?chipActive:{} )}}>{m}</button>
                ))}
              </div>
            </div>

            <div style={row}>
              <label style={label}>Prompt</label>
              <div style={{display:"flex", gap:8, alignItems:"center", width:"100%"}}>
                <input value={prompt} onChange={e=>setPrompt(e.target.value)} style={{...input, flex:1}}/>
                <button onClick={shufflePrompt} style={ghost}>Shuffle</button>
              </div>
            </div>

            <div style={row}>
              <label style={label}>Entry</label>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} placeholder="Write freely…"
                        style={{...input as any, resize:"vertical"}}/>
            </div>

            <div style={row}>
              <label style={label}>Image (optional)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} />
              {imagePreview && (
                <div style={{marginTop:10}}>
                  <img src={imagePreview} style={{maxWidth:"100%", borderRadius:12}} alt="preview"/>
                </div>
              )}
            </div>

            <button onClick={save} style={btn}>Save Entry</button>
          </section>

          {/* Breathing Widget */}
          <section style={card}>
            <h3 style={{marginTop:0}}>Breathing</h3>
            <div style={{display:"flex", gap:8, alignItems:"center", marginBottom:8}}>
              <span>Mode:</span>
              <button onClick={()=>setBreathMode("box")} style={{...chip, ...(breathMode==="box"?chipActive:{})}}>Box 4-4-4-4</button>
              <button onClick={()=>setBreathMode("478")} style={{...chip, ...(breathMode==="478"?chipActive:{})}}>4-7-8</button>
              <button onClick={runBreath} disabled={running} style={ghost}>{running? "Running…" : "Start"}</button>
              <span style={{opacity:.9}}>{breathStep}</span>
            </div>
            <div style={{height:6, background:"rgba(255,255,255,0.08)", borderRadius:6}}>
              <div style={{
                height:"100%",
                width: running ? "100%" : "0%",
                transition: running ? "width 16s linear" : "none",
                background:"linear-gradient(90deg,#8B5CF6,#C084FC)",
                borderRadius:6
              }}/>
            </div>
          </section>

          {/* Entries */}
          <section style={card}>
            <h3 style={{marginTop:0}}>Your Entries</h3>
            {entries.length === 0 && <p style={{opacity:.8}}>No entries yet.</p>}
            <div style={{display:"grid", gap:12}}>
              {entries.map(e => (
                <div key={e.id} style={{border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:12}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                    <strong>{new Date(e.date).toLocaleDateString()} {e.mood ?? ""}</strong>
                    <button onClick={()=>remove(e.id)} style={ghost}>Delete</button>
                  </div>
                  {e.prompt && <div style={{opacity:.85, marginTop:6}}><em>{e.prompt}</em></div>}
                  {e.text && <p style={{whiteSpace:"pre-wrap", marginTop:8}}>{e.text}</p>}
                  {e.imageDataUrl && <img src={e.imageDataUrl} alt="attached" style={{maxWidth:"100%", borderRadius:12, marginTop:8}}/>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter", padding:"24px 16px"};
const wrap: React.CSSProperties = {maxWidth:900, margin:"0 auto", display:"grid", gap:16};
const card: React.CSSProperties = {background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:16};
const row:  React.CSSProperties = {display:"grid", gap:8, marginBottom:12};
const label:React.CSSProperties = {fontSize:13, opacity:.9};
const input: React.CSSProperties = {background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:12, padding:"10px 12px", color:"#EAEAF7", width:"100%"};
const btn:   React.CSSProperties = {padding:"10px 14px", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", background:"linear-gradient(135deg,#8B5CF6,#C084FC)", color:"#0A0E27"};
const ghost: React.CSSProperties = {padding:"8px 12px", borderRadius:10, background:"transparent", color:"#EAEAF7", border:"1px solid rgba(255,255,255,0.18)", cursor:"pointer"};
const chip:  React.CSSProperties = {padding:"6px 10px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer", color:"#EAEAF7"};
const chipActive: React.CSSProperties = {background:"linear-gradient(135deg,#8B5CF6,#C084FC)", color:"#0A0E27", border:"none"};
