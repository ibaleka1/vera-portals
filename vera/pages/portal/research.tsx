import { useEffect, useState } from "react";
type Item = { id: string; kind: "link"|"pdf"|"image"|"note"; title: string; url?: string; note?: string };

export default function Research(){
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<Item["kind"]>("link");
  const [note, setNote] = useState("");

  useEffect(()=>{ const raw = localStorage.getItem("vera_research"); if(raw) setItems(JSON.parse(raw)); },[]);
  function save(list: Item[]){ setItems(list); localStorage.setItem("vera_research", JSON.stringify(list)); }
  function add(){ if(!title) return; save([{ id: crypto.randomUUID(), kind, title, url: url||undefined, note: note||undefined }, ...items]); setTitle(""); setUrl(""); setNote(""); }
  function remove(id: string){ save(items.filter(i=>i.id!==id)); }

  return (
    <main style={page}>
      <div style={grid}>
        <section style={card}>
          <h2 style={{marginTop:0}}>Add Research</h2>
          <div style={{display:"grid", gap:10}}>
            <select value={kind} onChange={e=>setKind(e.target.value as any)} style={input as any}>
              <option value="link">Link</option><option value="pdf">PDF</option>
              <option value="image">Image</option><option value="note">Note</option>
            </select>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={input}/>
            {kind!=="note" && <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL (https://…)" style={input}/>}
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Notes (optional)" rows={3} style={input as any}/>
            <button onClick={add} style={btn}>Save</button>
          </div>
        </section>
        <section style={card}>
          <h2 style={{marginTop:0}}>Library</h2>
          <div style={{display:"grid", gap:12}}>
            {items.map(i=>(
              <div key={i.id} style={{border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <strong>{i.title}</strong>
                  <button onClick={()=>remove(i.id)} style={ghost}>Delete</button>
                </div>
                <small style={{opacity:.8}}>{i.kind.toUpperCase()}</small>
                {i.url && <p style={{marginTop:6}}><a href={i.url} target="_blank" rel="noreferrer" style={{color:"#C084FC"}}>{i.url}</a></p>}
                {i.note && <p style={{marginTop:6, whiteSpace:"pre-wrap"}}>{i.note}</p>}
              </div>
            ))}
            {items.length===0 && <p style={{opacity:.8}}>No items yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
const page: React.CSSProperties = {minHeight:"100vh",padding:"30px 18px",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"1fr 2fr",gap:18,maxWidth:1100,margin:"0 auto"};
const card: React.CSSProperties = {background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:18};
const input: React.CSSProperties = {background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:12,padding:"12px 14px",color:"#EAEAF7",width:"100%"};
const btn: React.CSSProperties = {padding:"10px 14px",border:"none",borderRadius:12,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#8B5CF6,#C084FC)",color:"#0A0E27"};
const ghost: React.CSSProperties = {padding:"8px 12px",borderRadius:10,background:"transparent",color:"#EAEAF7",border:"1px solid rgba(255,255,255,0.18)",cursor:"pointer"};
