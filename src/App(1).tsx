import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";

/*
  MY QUEEN — THE SPIDER-VERSE | Birthday Surprise Edition
  Single-file React + TypeScript app.

  Required:
    npm install @supabase/supabase-js
  Vite .env:
    VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
    VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

  Supabase setup:
    - Create ONLY the two Auth users (Spider-Man + My Queen); disable public sign-ups.
    - Create a PRIVATE Storage bucket named: queen-private
    - Create the tables and RLS policies using the SQL setup supplied with this file.
    - Update BIRTHDAY_DATE below (YYYY-MM-DD).
*/

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const BIRTHDAY_DATE = "2026-12-01"; // CHANGE to her birthday: YYYY-MM-DD
const STORAGE_BUCKET = "queen-private";

type Message = {
  id: string; sender_id: string; sender_email?: string; body: string;
  attachment_path?: string | null; attachment_type?: string | null; created_at: string;
};
type Memory = {
  id: string; title: string; note?: string; file_path: string;
  media_type: string; created_at: string;
};
type Track = { id: string; title: string; file_path: string; created_at: string };

const letter = `My beautiful wife,

Today is your special day, and honestly, my heart wishes I could be right there beside you. I wish I could wake you up with a sweet kiss on your forehead, hold your hands, look into your eyes, and say “Happy Birthday, my princess” while hugging you tightly.

But unfortunately, miles separate us today. I might not be there to celebrate with you, but please remember that my heart is always with you. No distance, no matter how big, can ever change how much I love you.

Sometimes I wish I could magically disappear from here and appear right in front of you, just to see that beautiful smile of yours. I miss your little talks, your silly moments, your smile, and even the little things that make me fall in love with you every single day.

My love, I don't have a thousand expensive gifts to offer you, but I have a heart that belongs entirely to you. I have endless prayers for your happiness, a lifetime of promises, and a love that I want to give you until my very last breath.

On your birthday, I pray that Allah protects you from every sadness, gives you good health, fulfills every beautiful dream in your heart, and keeps that precious smile on your face forever. Ameen.

Don't ever think you're alone just because I'm far away. You're always in my thoughts, in my prayers, and in every little dream I have about our future.

I can't promise that every day will be perfect, but I promise I'll keep trying to make you feel loved, respected, protected, and special.

One day, I won't have to send you birthday wishes from miles away. I'll be right beside you, holding you close, celebrating your birthday together. And I hope that day comes very soon.

Happy Birthday, My Wife. My Best Friend. My Happiness. My Forever Home.

I love you more than these words could ever explain.

Forever yours,
Your Husband ❤️

P.S. If I could make one birthday wish for myself, it would be to celebrate every birthday of yours with you, for the rest of our lives.`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
:root{font-family:'DM Sans',sans-serif;color:#f8edf5;background:#080711;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;background:#080711}
button,input,textarea{font:inherit}button{cursor:pointer}
.mq{min-height:100vh;overflow:hidden;background:radial-gradient(ellipse at 15% 5%,#38132f 0,transparent 36%),radial-gradient(ellipse at 90% 35%,#171e4c 0,transparent 34%),#080711;color:#fff}
.mq:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.22;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:43px 43px}
.shell{position:relative;max-width:1180px;margin:auto;padding:24px}
.top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:24px}
.brand{font-family:'Playfair Display',serif;font-size:22px;letter-spacing:2px}.brand span{color:#ff80bd}
.pill{border:1px solid #ffffff24;background:#ffffff0d;border-radius:999px;padding:9px 14px;color:#f8dced;font-size:12px}
.hero{border:1px solid #ff9dcc35;border-radius:30px;padding:clamp(24px,5vw,58px);background:linear-gradient(125deg,#31132dce,#17172bdc 60%,#151b38d9);box-shadow:0 25px 90px #0008;position:relative;overflow:hidden}
.hero:after{content:"♥";position:absolute;right:6%;top:0;font-size:clamp(130px,25vw,290px);color:#ff7db51a;transform:rotate(18deg)}
.eyebrow{color:#ff9dcc;text-transform:uppercase;letter-spacing:3px;font-size:11px;font-weight:700}
h1,h2,h3{font-family:'Playfair Display',serif}h1{font-size:clamp(36px,7vw,72px);line-height:1.04;margin:14px 0}
.sub{max-width:620px;color:#e8d7e4;line-height:1.8}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:25px}
.btn{border:0;border-radius:14px;padding:12px 18px;font-weight:700;color:#1c1020;background:linear-gradient(120deg,#ff9bc8,#ffd2e8);box-shadow:0 8px 25px #ff7db533}
.btn.ghost{background:#ffffff10;color:#fff;border:1px solid #ffffff24;box-shadow:none}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px;margin-top:18px}
.card{grid-column:span 4;border:1px solid #ffffff18;background:#ffffff0b;border-radius:22px;padding:20px;backdrop-filter:blur(14px)}
.card.wide{grid-column:span 8}.card.full{grid-column:1/-1}
.card h3{font-size:21px;margin:0 0 10px}.muted{color:#c9b7c8;font-size:13px;line-height:1.7}
.count{display:flex;gap:9px;margin-top:15px}.count div{min-width:65px;text-align:center;padding:12px 8px;background:#ffffff0d;border:1px solid #ffffff15;border-radius:14px}
.count b{display:block;font-size:24px;color:#ffacd1}.count small{color:#c9b7c8;font-size:10px}
.nav{display:flex;gap:8px;overflow:auto;padding:14px 0;margin:4px 0}
.nav button{white-space:nowrap;border:1px solid #ffffff20;border-radius:999px;padding:10px 15px;background:#ffffff0a;color:#eadce8}
.nav button.active{background:#ff9bc8;color:#25101e;border-color:#ff9bc8;font-weight:700}
.panel{border:1px solid #ffffff1c;border-radius:24px;background:#ffffff0b;padding:22px;min-height:300px}
.panel h2{margin:0 0 8px;font-size:28px}
.letter{white-space:pre-wrap;line-height:2;color:#f3e4ef;font-size:15px;background:#ffffff08;border:1px solid #ffffff14;border-radius:18px;padding:24px;margin-top:18px}
.field{width:100%;background:#0e0b18;border:1px solid #ffffff24;color:#fff;border-radius:12px;padding:12px;outline:none;margin:6px 0}
textarea.field{min-height:85px;resize:vertical}
.row{display:flex;gap:10px;align-items:center}.row>*{min-width:0}
.chat{height:330px;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:12px;background:#08071166;border-radius:16px;margin:14px 0}
.bubble{max-width:82%;align-self:flex-start;background:#ffffff12;border:1px solid #ffffff12;border-radius:16px 16px 16px 4px;padding:11px 13px;white-space:pre-wrap;overflow-wrap:anywhere}
.bubble.mine{align-self:flex-end;background:#8c3b70;border-color:#d77cad55;border-radius:16px 16px 4px 16px}
.bubble small{display:block;color:#eac9df;font-size:10px;margin-top:6px}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:15px}
.tile{background:#ffffff0c;border:1px solid #ffffff17;border-radius:15px;overflow:hidden}
.tile img,.tile video{width:100%;height:150px;object-fit:cover;display:block}.tile p{padding:0 10px;font-size:12px;color:#f4ddea}
.track{padding:12px;border:1px solid #ffffff18;border-radius:14px;background:#ffffff09;margin:8px 0}
.center{text-align:center}.login{max-width:440px;margin:9vh auto}.error{color:#ff9ab2;font-size:13px}.foot{text-align:center;color:#a993a6;font-size:11px;padding:25px}
input[type=file]{max-width:100%;color:#cbb8c9;font-size:12px}
@media(max-width:760px){.shell{padding:14px}.card,.card.wide{grid-column:1/-1}.top{align-items:flex-start}.count div{flex:1;min-width:0}.hero{border-radius:23px}.panel{padding:16px}.letter{padding:17px;font-size:14px}.row.mobile{flex-direction:column;align-items:stretch}}
`;

function getCountdown() {
  const target = new Date(`${BIRTHDAY_DATE}T00:00:00`);
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    passed: diff === 0
  };
}
function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-70);
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("Home");
  const [countdown, setCountdown] = useState(getCountdown());
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState("");
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [playingUrl, setPlayingUrl] = useState("");
  const [toast, setToast] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const user = session?.user;
  const displayName = (user?.email || "").toLowerCase().includes("queen") ? "My Queen" : "Spider-Man";

  const notify = (s: string) => { setToast(s); window.setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = async () => {
    if (!supabase || !user) return;
    const [m, g, t] = await Promise.all([
      supabase.from("mq_messages").select("*").order("created_at", { ascending: true }).limit(250),
      supabase.from("mq_memories").select("*").order("created_at", { ascending: false }),
      supabase.from("mq_tracks").select("*").order("created_at", { ascending: true })
    ]);
    if (!m.error) setMessages(m.data || []);
    if (!g.error) setMemories(g.data || []);
    if (!t.error) setTracks(t.data || []);
  };

  useEffect(() => {
    if (!supabase || !user) return;
    refresh();
    const channel = supabase.channel("mq-live-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "mq_messages" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "mq_memories" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "mq_tracks" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setBusy(false);
  };

  const upload = async (file: File, folder: string) => {
    if (!supabase || !user) throw new Error("Please sign in first.");
    const path = `${folder}/${user.id}/${Date.now()}-${safeName(file.name)}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false, contentType: file.type || "application/octet-stream" });
    if (error) throw error;
    return path;
  };

  const signedUrl = async (path: string) => {
    if (!supabase) return "";
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 3600);
    if (error) throw error;
    return data.signedUrl;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!supabase || !user || (!message.trim() && !chatFile)) return;
    setBusy(true);
    try {
      let path: string | null = null, type: string | null = null;
      if (chatFile) { path = await upload(chatFile, "chat"); type = chatFile.type; }
      const { error } = await supabase.from("mq_messages").insert({
        sender_id: user.id, sender_email: user.email, body: message.trim(),
        attachment_path: path, attachment_type: type
      });
      if (error) throw error;
      setMessage(""); setChatFile(null); await refresh();
    } catch (e: any) { notify(e.message || "Could not send message."); }
    setBusy(false);
  };

  const addMemory = async (e: React.FormEvent) => {
    e.preventDefault(); if (!supabase || !memoryFile || !user) return;
    setBusy(true);
    try {
      const path = await upload(memoryFile, "memories");
      const { error } = await supabase.from("mq_memories").insert({
        title: memoryTitle.trim() || memoryFile.name, note: memoryNote.trim(),
        file_path: path, media_type: memoryFile.type, created_by: user.id
      });
      if (error) throw error;
      setMemoryTitle(""); setMemoryNote(""); setMemoryFile(null); await refresh(); notify("Memory added ❤️");
    } catch (e: any) { notify(e.message || "Upload failed."); }
    setBusy(false);
  };

  const addTrack = async (file: File) => {
    if (!supabase || !user) return;
    setBusy(true);
    try {
      const path = await upload(file, "music");
      const { error } = await supabase.from("mq_tracks").insert({ title: file.name, file_path: path, created_by: user.id });
      if (error) throw error;
      await refresh(); notify("Song added to your playlist 🎵");
    } catch (e: any) { notify(e.message || "Music upload failed."); }
    setBusy(false);
  };

  const playTrack = async (track: Track) => {
    try {
      const url = await signedUrl(track.file_path);
      setNowPlaying(track); setPlayingUrl(url);
      window.setTimeout(() => { void audioRef.current?.play(); }, 100);
    } catch (e: any) { notify(e.message || "Could not play this track."); }
  };

  const openAttachment = async (path: string) => {
    try { window.open(await signedUrl(path), "_blank", "noopener,noreferrer"); }
    catch (e: any) { notify(e.message || "Could not open attachment."); }
  };

  if (!supabase) return <div className="mq"><style>{css}</style><div className="shell login"><div className="hero"><div className="eyebrow">Setup needed</div><h1>MY QUEEN 💗</h1><p className="sub">Add your Supabase URL and publishable key to the Vite environment variables to connect your private surprise website.</p><p className="muted">VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY</p></div></div></div>;
  if (!authReady) return <div className="mq"><style>{css}</style><div className="shell center">Opening your love universe… ❤️</div></div>;

  if (!session) return <div className="mq"><style>{css}</style><div className="shell login">
    <div className="hero center"><div className="eyebrow">A little universe made for two</div><h1>MY QUEEN<span style={{color:"#ff9bc8"}}> ♥</span></h1>
      <p className="sub" style={{margin:"auto"}}>A secret place for our messages, music, memories and forever kind of love.</p>
      <form onSubmit={signIn} style={{marginTop:24,textAlign:"left"}}>
        <label className="muted">Your private email</label><input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="Email address"/>
        <label className="muted">Password</label><input className="field" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Password"/>
        {authError && <p className="error">{authError}</p>}
        <button className="btn" disabled={busy} style={{width:"100%",marginTop:10}}>{busy?"Unlocking…":"Unlock our universe ♥"}</button>
      </form><p className="muted" style={{marginTop:16}}>Two accounts. One little universe. Spider-Man × My Queen.</p>
    </div></div></div>;

  const nav = ["Home","Birthday Letter","Our Chat","Memories","Music"];
  return <div className="mq"><style>{css}</style><div className="shell">
    <header className="top"><div className="brand">MY QUEEN <span>♥</span> SPIDER-VERSE</div>
      <div className="row"><span className="pill">♡ {displayName}</span><button className="btn ghost" onClick={()=>supabase.auth.signOut()}>Log out</button></div>
    </header>
    <nav className="nav">{nav.map(n=><button key={n} className={tab===n?"active":""} onClick={()=>setTab(n)}>{n}</button>)}</nav>

    {tab==="Home" && <>
      <section className="hero"><div className="eyebrow">A birthday surprise from miles away</div>
        <h1>To My Queen,<br/><span style={{color:"#ff9bc8"}}>My Forever Home.</span></h1>
        <p className="sub">Even when miles keep us apart, my heart knows exactly where it belongs. This little universe is yours — every song, every memory, every word.</p>
        <div className="actions"><button className="btn" onClick={()=>setTab("Birthday Letter")}>Open your birthday letter 💌</button><button className="btn ghost" onClick={()=>setTab("Memories")}>Explore our memories ✨</button></div>
      </section>
      <div className="grid">
        <div className="card wide"><div className="eyebrow">The special day</div><h3>{countdown.passed?"It's your birthday, my Queen! 🎂":"Counting every second until you smile"}</h3><div className="count">{[["days",countdown.days],["hours",countdown.hours],["minutes",countdown.minutes],["seconds",countdown.seconds]].map(([k,v])=><div key={String(k)}><b>{String(v).padStart(2,"0")}</b><small>{k}</small></div>)}</div><p className="muted">Change the birthday date in BIRTHDAY_DATE at the top of App.tsx.</p></div>
        <div className="card"><div className="eyebrow">A little promise</div><h3>Always you. Always us. 💍</h3><p className="muted">Different places, same sky, one heart. I can't wait for the day we celebrate side by side.</p></div>
        <div className="card"><div className="eyebrow">Our universe</div><h3>{memories.length} memories saved</h3><p className="muted">{messages.length} messages in our private chat · {tracks.length} songs in our playlist.</p></div>
      </div>
    </>}

    {tab==="Birthday Letter" && <section className="panel"><div className="eyebrow">Open when you miss me</div><h2>💌 A Birthday Letter for My Queen</h2><p className="muted">From your husband, with all the love in his heart.</p><div className="letter">{letter}</div><p className="center" style={{color:"#ffabd0",fontFamily:"Playfair Display",fontSize:22}}>Forever & Always Yours ❤️</p></section>}

    {tab==="Our Chat" && <section className="panel"><div className="eyebrow">Just us two</div><h2>💬 Our Private Chat</h2><p className="muted">A little place to talk, send pictures and leave voice notes.</p>
      <div className="chat">{messages.map(m=><div key={m.id} className={`bubble ${m.sender_id===user?.id?"mine":""}`}>{m.body}{m.attachment_path&&<div><button className="btn ghost" style={{marginTop:8,padding:"7px 10px"}} onClick={()=>openAttachment(m.attachment_path!)}>Open attachment ↗</button></div>}<small>{m.sender_id===user?.id?"You":(m.sender_email?.split("@")[0]||"My love")} · {new Date(m.created_at).toLocaleString()}</small></div>)}</div>
      <form onSubmit={sendMessage}><textarea className="field" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write something sweet… ❤️"/><div className="row mobile"><input type="file" accept="image/*,audio/*,video/*" onChange={e=>setChatFile(e.target.files?.[0]||null)}/><button className="btn" disabled={busy}>{busy?"Sending…":"Send love ♥"}</button></div>{chatFile&&<p className="muted">Attached: {chatFile.name}</p>}</form>
    </section>}

    {tab==="Memories" && <section className="panel"><div className="eyebrow">Little moments, forever</div><h2>📸 Our Memories</h2><p className="muted">Upload your favourite photos and videos to keep them together in this private space.</p>
      <form onSubmit={addMemory} className="card full" style={{marginTop:16}}>
        <input className="field" value={memoryTitle} onChange={e=>setMemoryTitle(e.target.value)} placeholder="Memory title (e.g. My favourite smile)"/>
        <textarea className="field" value={memoryNote} onChange={e=>setMemoryNote(e.target.value)} placeholder="A little note about this moment…"/>
        <div className="row mobile"><input type="file" accept="image/*,video/*" onChange={e=>setMemoryFile(e.target.files?.[0]||null)}/><button className="btn" disabled={busy||!memoryFile}>{busy?"Uploading…":"Add memory +"}</button></div>
      </form>
      <div className="gallery">{memories.map(m=><MemoryTile key={m.id} item={m} getUrl={signedUrl}/>)}</div>
      {!memories.length&&<p className="muted center">Your memory wall is waiting for its first little moment. 💗</p>}
    </section>}

    {tab==="Music" && <section className="panel"><div className="eyebrow">Songs that remind me of you</div><h2>🎵 Our Love Playlist</h2><p className="muted">Upload your own audio files. Music is stored privately in your Supabase bucket.</p>
      <div className="card full"><input type="file" accept="audio/*" onChange={e=>{const f=e.target.files?.[0];if(f)void addTrack(f);e.currentTarget.value="";}}/><p className="muted">MP3, M4A, WAV and other browser-supported audio formats.</p></div>
      <div style={{marginTop:15}}>{tracks.map((t,i)=><div className="track row" key={t.id}><div style={{flex:1}}><b>{i+1}. {t.title}</b><div className="muted">A song in our little universe</div></div><button className="btn ghost" onClick={()=>playTrack(t)}>▶ Play</button></div>)}</div>
      {nowPlaying&&<div className="card full" style={{marginTop:16}}><div className="eyebrow">Now playing</div><h3>{nowPlaying.title}</h3><audio ref={audioRef} src={playingUrl} controls style={{width:"100%"}}/></div>}
      {!tracks.length&&<p className="muted center">Add the first song that feels like the two of you. 🎶</p>}
    </section>}
    <footer className="foot">Made with endless love · Spider-Man × My Queen · Forever ♡</footer>
    {toast&&<div className="pill" style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",zIndex:5,background:"#31132d",padding:"12px 18px"}}>{toast}</div>}
  </div></div>;
}

function MemoryTile({item,getUrl}:{item:Memory;getUrl:(p:string)=>Promise<string>}) {
  const [url,setUrl]=useState("");
  useEffect(()=>{let live=true;getUrl(item.file_path).then(u=>{if(live)setUrl(u)}).catch(()=>{});return()=>{live=false}},[item.file_path]);
  const isVideo=item.media_type?.startsWith("video/");
  return <div className="tile">{url?(isVideo?<video src={url} controls/>:<img src={url} alt={item.title}/>):<div style={{height:150,display:"grid",placeItems:"center",color:"#cbaac2"}}>Loading memory…</div>}<p><b>{item.title}</b>{item.note&&<><br/><span className="muted">{item.note}</span></>}</p></div>;
}
