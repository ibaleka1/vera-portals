import { useEffect, useMemo, useState } from "react";

// Journal entry shape we already save in localStorage:
type Entry = { id:string; date:string; mood?:string };

export default function Progress() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("vera_journal");
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  // Normalize to a set of YYYY-MM-DD strings
  const daySet = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) {
      const d = (e.date || new Date(e.id ? +e.id : Date.now())).toString();
      // ensure YYYY-MM-DD
      const iso = new Date(d).toISOString().slice(0,10);
      s.add(iso);
    }
    return s;
  }, [entries]);

  // Streaks
  const { currentStreak, longestStreak } = useMemo(() => {
    let cur = 0, best = 0;
    let day = new Date(); // today
    // count backwards until a gap
    while (daySet.has(day.toISOString().slice(0,10))) {
      cur++; day.setDate(day.getDate() - 1);
    }
    // compute longest over last 365 days
    let run = 0;
    const scan = new Date();
    for (let i = 0; i < 365; i++) {
      const key = scan.toISOString().slice(0,10);
      if (daySet.has(key)) { run++; best = Math.max(best, run); }
      else run = 0;
      scan.setDate(scan.getDate() - 1);
    }
    return { currentStreak: cur, longestStreak: best };
  }, [daySet]);

  // Last 30 days mini heat strip (right → today)
  const last30 = useMemo(() => {
    const cells: { date:string; has:boolean }[] = [];
    const d = new Date();
    for (let i=0;i<30;i++){
      const key = d.toISOString().slice(0,10);
      cells.unshift({ date:key, has: daySet.has(key) });
      d.setDate(d.getDate()-1);
    }
    return cells;
  }, [daySet]);

  return (
    <main style={page}>
      <div style={wrap}>
        <h1 style={{marginTop:0}}>Progress</h1>
        <p style={{opacity:.9, marginTop:-6}}>Your journaling streaks and recent activity.</p>

        <section style={card}>
          <div style={statsRow}>
            <div style={statBox}>
              <div style={statNum}>{entries.length}</div>
              <div style={statLabel}>Total Entries</div>
            </div>
            <div style={statBox}>
              <div style={statNum}>{currentStreak}</div>
              <div style={statLabel}>Current Streak (days)</div>
            </div>
            <div style={statBox}>
              <div style={statNum}>{longestStreak}</div>
              <div style={statLabel}>Longest Streak</div>
            </div>
          </div>
        </section>

        <section style={card}>
          <h3 style={{marginTop:0}}>Last 30 days</h3>
          <div style={strip}>
            {last30.map((c, i) => (
              <div key={i} title={c.date}
                   style={{
                     ...cell,
                     opacity: c.has ? 1 : .35,
                     background: c.has
                       ? "linear-gradient(135deg,#8B5CF6,#C084FC)"
                       : "rgba(255,255,255,0.10)"
                   }}/>
            ))}
          </div>
          <small style={{opacity:.7}}>Left is 30 days ago • Right is today</small>
        </section>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#0A0E27",color:"#EAEAF7",fontFamily:"system-ui,-apple-system,Segoe UI,Roboto,Inter", padding:"24px 16px"};
const wrap: React.CSSProperties = {maxWidth:900, margin:"0 auto", display:"grid", gap:16};
const card: React.CSSProperties = {background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, padding:16};

const statsRow: React.CSSProperties = {display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12};
const statBox: React.CSSProperties = {background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:14, padding:"14px 16px"};
const statNum: React.CSSProperties = {fontSize:28, fontWeight:800, lineHeight:1};
const statLabel: React.CSSProperties = {opacity:.85, marginTop:6};

const strip: React.CSSProperties = {display:"grid", gridTemplateColumns:"repeat(30, 1fr)", gap:6, marginTop:8};
const cell: React.CSSProperties  = {height:14, borderRadius:6};
