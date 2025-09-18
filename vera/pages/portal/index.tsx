import Link from "next/link";
import PortalShell from "../../component/PortalShell";

export default function PortalHome() {
  return (
    <PortalShell>
      <main style={{ padding: 20 }}>
        <h1>VERA Portal</h1>
        <p>A private space for your life—memories, research, chats, uploads.</p>

        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 24,
            maxWidth: 400,
          }}
        >
          <Link href="/portal/journal">
            <div className="nav-btn">Journal</div>
          </Link>

          <Link href="/portal/memories">
            <div className="nav-btn">Memories Timeline</div>
          </Link>

          <Link href="/portal/research">
            <div className="nav-btn">Research Library</div>
          </Link>

          <Link href="/portal/chat">
            <div className="nav-btn">Chats</div>
          </Link>

          <Link href="/portal/uploads">
            <div className="nav-btn">Uploads</div>
          </Link>
        </div>
      </main>
    </PortalShell>
  );
}
