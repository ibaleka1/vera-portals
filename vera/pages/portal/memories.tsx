import { useEffect, useState } from "react";
type Memory = { id: string; title: string; date: string; notes?: string };

export default function Memories(){
  const [items, setItems] = useState<Memory[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState("");

  useEffect(()=>{ const raw = localStorage.getItem("vera_memories"); if(raw) setItems(JSON.parse(raw)); },[]);
  function save(list: Memory[]){ setItems(list); localStorage.setItem("vera_memories", JSON.stringify(list)); }
  function add(){ if(!title) return; const m: Memory = { id: crypto.randomUUID(), title, date, notes }; save([m, ...items].sort((a,b)=>a.date<b.date?1:-1)); setTitle(""); setNotes(""); }
  function remove(id: string){ save(items.filter(i=>i.id!==id)); }

  return (
    <main style={page}>
      <div style={grid}>
        <section style={card}>
          <h2 style={{marginTop:0}}>Add Memory</h2>
          <div style={{display:"grid", gap:10}}>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={input}/>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={input}/>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes" rows={4} style={input as any}/>
            <button onClick={add} style={btn}>Save</button>
          </div>
        </section>
        <section style={card}>
          <h2 style={{marginTop:0}}>Timeline</h2>
          <ul style={{listStyle:"none", padding:0, margin:0}}>
            {items.map(m=>(
              <li key={m.id} style={row}>
                <div>
                  <div style={{fontWeight:700}}>{m.title}</div>
                  <small style={{opacity:.8}}>{new Date(m.date).toLocaleDateString()}</small>
                  {m.notes && <p style={{marginTop:6, whiteSpace:"pre-wrap"}}>{m.notes}</p>}
                </div>
                <button onClick={()=>remove(m.id)} style={ghost}>Delete</button>
              </li>
            ))}
            {items.length===0 && <p style={{opacity:.8}}>No memories yet. Add your first one.</p>}
          </ul>
        </section>
      </div>
    </main>
  );
}
const page: React.CSSProperties = {minHeight:"100vh",padding:"30px 18px",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"1fr 2fr",gap:18,maxWidth:1100,margin:"0 auto"};
const card: React.CSSProperties = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:18};
const row: React.CSSProperties = {display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"};
const input: React.CSSProperties = {background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:12,padding:"12px 14px",color:"#EAEAF7",width:"100%"};
const btn: React.CSSProperties = {padding:"10px 14px",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#8B5CF6,#C084FC)",color:"#0A0E27"};
const ghost: React.CSSProperties = {padding:"8px 12px",borderRadius:10,background:"transparent",color:"#EAEAF7",border:"1px solid rgba(255,255,255,0.18)",cursor:"pointer"};
