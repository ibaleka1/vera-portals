import { useEffect, useState } from "react";
// If you want the docked chat in Step 2, keep this import and render <PortalChatDock /> below.
// import PortalChatDock from "../../component/PortalChatDock";

type U = { id:string; name:string; dataUrl:string };

export default function Uploads(){
  const [files,setFiles] = useState<U[]>([]);
  const [decodingId, setDecodingId] = useState<string | null>(null);
  const [decodeTextById, setDecodeTextById] = useState<Record<string,string>>({});

  useEffect(()=>{ const raw = localStorage.getItem('vera_uploads'); if(raw) setFiles(JSON.parse(raw)); },[]);
  function save(list:U[]){ setFiles(list); localStorage.setItem('vera_uploads', JSON.stringify(list)); }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{ const item:U = { id: crypto.randomUUID(), name: f.name, dataUrl: String(reader.result) }; save([item,...files]); };
    reader.readAsDataURL(f);
  }
  function remove(id:string){ save(files.filter(x=>x.id!==id)); }

  async function decode(id:string, dataUrl:string){
    try{
      setDecodingId(id);
      setDecodeTextById(prev=>({...prev, [id]: ""}));
      const r = await fetch("/api/vision", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          question: "Gently interpret the image’s colors, shapes, textures, symbols, and possible nervous-system themes (no medical advice)."
        })
      });
      const data = await r.json();
      setDecodeTextById(prev=>({...prev, [id]: data?.text || "No interpretation available."}));
    }catch{
      setDecodeTextById(prev=>({...prev, [id]: "Could not decode the image."}));
    }finally{
      setDecodingId(null);
    }
  }

  return (
    <main style={page}>
      {/* <PortalChatDock />  // <-- enable in Step 2 if you want the always-on chat */}
      <div style={card}>
        <h2 style={{marginTop:0}}>Uploads</h2>
        <input type="file" onChange={onPick} />
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12, marginTop:12}}>
          {files.map(f=>(
            <div key={f.id} style={{border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, overflow:'hidden', background:"rgba(255,255,255,0.04)"}}>
              {f.dataUrl.startsWith('data:image') && (
                <img src={f.dataUrl} alt={f.name} style={{width:'100%',height:180,objectFit:'cover'}}/>
              )}
              {!f.dataUrl.startsWith('data:image') && (
                <div style={{padding:12}}><small>File stored locally.</small></div>
              )}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:10, borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                <small style={{opacity:.9, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:180}}>{f.name}</small>
                <div style={{display:"flex", gap:8}}>
                  {f.dataUrl.startsWith('data:image') && (
                    <button
                      onClick={()=>decode(f.id, f.dataUrl)}
                      disabled={decodingId===f.id}
                      style={ghost}
                      title="Ask VERA to interpret the image"
                    >
                      {decodingId===f.id ? "Decoding…" : "Decode with VERA"}
                    </button>
                  )}
                  <button onClick={()=>remove(f.id)} style={ghost}>Delete</button>
                </div>
              </div>

              {decodeTextById[f.id] && (
                <div style={{padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <strong>Interpretation</strong>
                  <p style={{whiteSpace:"pre-wrap", marginTop:6}}>{decodeTextById[f.id]}</p>
                </div>
              )}
            </div>
          ))}
          {files.length===0 && <p style={{opacity:.8}}>No files yet. Upload an image or PDF.</p>}
        </div>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",padding:"30px 18px",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter"};
const card: React.CSSProperties = {maxWidth:1100, margin:"0 auto", background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:18,padding:18};
const ghost: React.CSSProperties = {padding:"8px 12px",borderRadius:10,background:"transparent",color:"#EAEAF7",border:"1px solid rgba(255,255,255,0.18)",cursor:"pointer"};
