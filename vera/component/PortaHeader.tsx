import Link from "next/link";

export default function PortalHeader() {
  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      window.location.href = "/"; // back to homepage
    }
  }

  return (
    <header style={{
      padding: "12px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      background: "#0A0E27",
      color: "#EAEAF7",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div style={{display:"flex",gap:14}}>
        <Link href="/portal" style={{color:"#EAEAF7", textDecoration:"none", fontWeight:700}}>
          VERA Portal
        </Link>
        <Link href="/portal/memories" style={{color:"#EAEAF7"}}>Memories</Link>
        <Link href="/portal/research" style={{color:"#EAEAF7"}}>Research</Link>
        <Link href="/portal/chat" style={{color:"#EAEAF7"}}>Chat</Link>
        <Link href="/portal/uploads" style={{color:"#EAEAF7"}}>Uploads</Link>
      </div>
      <button onClick={logout} style={{
        padding:"8px 12px",
        borderRadius:8,
        border:"none",
        cursor:"pointer",
        background:"linear-gradient(135deg,#8B5CF6,#C084FC)",
        color:"#0A0E27",
        fontWeight:700
      }}>
        Logout
      </button>
    </header>
  );
}
