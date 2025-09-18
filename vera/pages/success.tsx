import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const [portalReady, setPortalReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Just checks if we have a session_id in the URL
    if (router.query.session_id) setPortalReady(true);
  }, [router.query.session_id]);

  async function openPortal() {
    try {
      setLoading(true);
      const r = await fetch("/api/portal-from-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: router.query.session_id })
      });
      const data = await r.json();
      setLoading(false);
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Portal unavailable.");
    } catch {
      setLoading(false);
      alert("Portal error.");
    }
  }

  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter"}}>
      <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:26,maxWidth:540,textAlign:"center"}}>
        <h1>You're in 💜</h1>
        <p>Your subscription is active.</p>
        <div style={{display:"grid", gap:10, marginTop:12}}>
          <a href="/" style={{color:"#C084FC"}}>Go to VERA</a>
          <button
            onClick={openPortal}
            disabled={!portalReady || loading}
            style={{padding:"12px 16px",borderRadius:12,border:"none",fontWeight:700,
              background:"linear-gradient(135deg,#8B5CF6,#C084FC)",color:"#0A0E27",cursor:"pointer"}}
          >
            {loading ? "Opening…" : "Open my Billing Portal"}
          </button>
          {!portalReady && <small>Waiting for session… If button stays disabled, refresh this page.</small>}
        </div>
      </div>
    </main>
  );
}
