import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Home, Images, Mail, Gift, Clock3, Sparkles, Settings, Plus,
  Search, LockKeyhole, Eye, EyeOff, Menu, X, ChevronRight, ChevronLeft,
  Music2, Send, Trash2, Pencil, Star, Download, LogOut, Camera, CalendarDays,
  Check, WandSparkles, BookHeart, Plane, ShieldCheck, Moon, Sun, Volume2,
  VolumeX, Copy, CircleHelp, KeyRound, HeartHandshake
} from 'lucide-react';
import { supabase, loadData, saveData, saveCloudData, loadCloudData, storeImage, getPrivateImageUrl, deletePrivateImage } from './lib';

type Wish = { id:string; category:string; text:string; favorite:boolean; created:string };
type Note = { id:string; title:string; body:string; type:string; date:string; favorite:boolean };
type Photo = { id:string; album:string; caption:string; date:string; src:string; favorite:boolean };
type EventItem = { id:string; title:string; date:string; description:string; image?:string };
type Dream = { id:string; text:string; done:boolean };
type Tab = 'home'|'wishes'|'gallery'|'letters'|'timeline'|'surprises'|'dreams'|'settings';

const uid = () => Math.random().toString(36).slice(2,10);
const today = () => new Date().toISOString().slice(0,10);
const starterWishes: Wish[] = [
  {id:uid(),category:'Forever promises',text:'In every universe, I would still find you and choose you.',favorite:true,created:today()},
  {id:uid(),category:'Appreciation',text:'Your smile makes even the hardest days feel softer.',favorite:false,created:today()},
  {id:uid(),category:'Romantic',text:'You are my favorite hello and my sweetest forever.',favorite:false,created:today()}
];
const starterNotes: Note[] = [
  {id:uid(),title:'Open when you miss me',body:'Close your eyes for a moment. Imagine my arms around you. No distance can change how much you mean to me. I am always cheering for you, My Queen.',type:'Secret letter',date:today(),favorite:true},
  {id:uid(),title:'A little reminder',body:'You do not have to be perfect to be loved. You are precious exactly as you are.',type:'Love note',date:today(),favorite:false}
];
const nav: {id:Tab;label:string;icon:any}[] = [
  {id:'home',label:'Home',icon:Home},{id:'wishes',label:'Wishes',icon:Heart},
  {id:'gallery',label:'Gallery',icon:Images},{id:'letters',label:'Letters & Notes',icon:Mail},
  {id:'timeline',label:'Our Story',icon:Clock3},{id:'surprises',label:'Surprise Room',icon:Gift},
  {id:'dreams',label:'Our Forever',icon:Sparkles},{id:'settings',label:'Settings',icon:Settings}
];

export default function App() {
  const [tab,setTab] = useState<Tab>('home');
  const [logged,setLogged] = useState(false);
  const [cloudReady,setCloudReady] = useState(false);
  const [photoUrls,setPhotoUrls] = useState<Record<string,string>>({});
  const [pass,setPass] = useState('');
  const [showPass,setShowPass] = useState(false);
  const [error,setError] = useState('');
  const [intro,setIntro] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [dark,setDark] = useState(true);
  const [wife,setWife] = useState(loadData('wife','My Queen'));
  const [since,setSince] = useState(loadData('since','2024-01-01'));
  const [wishes,setWishes] = useState<Wish[]>(loadData('wishes',starterWishes));
  const [notes,setNotes] = useState<Note[]>(loadData('notes',starterNotes));
  const [photos,setPhotos] = useState<Photo[]>(loadData('photos',[]));
  const [events,setEvents] = useState<EventItem[]>(loadData('events',[
    {id:uid(),title:'The beginning of our story',date:'2024-01-01',description:'Every beautiful story has a beginning. This is ours.'}
  ]));
  const [dreams,setDreams] = useState<Dream[]>(loadData('dreams',[
    {id:uid(),text:'Watch a beautiful sunset together',done:false},
    {id:uid(),text:'Take a trip somewhere we have never been',done:false},
    {id:uid(),text:'Make a lifetime of little memories',done:true}
  ]));
  const [daily,setDaily] = useState(loadData('daily','You are my favorite part of every day. ❤️'));
  const [finalMessage,setFinalMessage] = useState(loadData('finalMessage','You are not just a part of my life. You are my favorite part of every day. If I could choose again, in every universe, I would still choose you.'));
  const [wishText,setWishText] = useState('');
  const [wishCat,setWishCat] = useState('Romantic');
  const [noteTitle,setNoteTitle] = useState('');
  const [noteBody,setNoteBody] = useState('');
  const [noteType,setNoteType] = useState('Love note');
  const [album,setAlbum] = useState('My Queen ❤️');
  const [caption,setCaption] = useState('');
  const [query,setQuery] = useState('');
  const [eventTitle,setEventTitle] = useState('');
  const [eventDate,setEventDate] = useState(today());
  const [eventDesc,setEventDesc] = useState('');
  const [dreamText,setDreamText] = useState('');
  const [surprise,setSurprise] = useState('');
  const [musicOn,setMusicOn] = useState(false);
  const [editingNote,setEditingNote] = useState<string|null>(null);
  const [selectedPhoto,setSelectedPhoto] = useState<Photo|null>(null);
  const [showFinal,setShowFinal] = useState(false);
  const [toast,setToast] = useState('');

  useEffect(()=>{saveData('wife',wife); if(cloudReady&&logged) void saveCloudData('wife',wife).catch(()=>notify('Cloud save failed. Check your connection.'))},[wife,cloudReady,logged]);
  useEffect(()=>{saveData('since',since); if(cloudReady&&logged) void saveCloudData('since',since).catch(()=>notify('Cloud save failed. Check your connection.'))},[since,cloudReady,logged]);
  useEffect(()=>{saveData('wishes',wishes); if(cloudReady&&logged) void saveCloudData('wishes',wishes).catch(()=>notify('Cloud save failed. Check your connection.'))},[wishes,cloudReady,logged]);
  useEffect(()=>{saveData('notes',notes); if(cloudReady&&logged) void saveCloudData('notes',notes).catch(()=>notify('Cloud save failed. Check your connection.'))},[notes,cloudReady,logged]);
  useEffect(()=>{saveData('photos',photos); if(cloudReady&&logged) void saveCloudData('photos',photos).catch(()=>notify('Cloud save failed. Check your connection.'))},[photos,cloudReady,logged]);
  useEffect(()=>{saveData('events',events); if(cloudReady&&logged) void saveCloudData('events',events).catch(()=>notify('Cloud save failed. Check your connection.'))},[events,cloudReady,logged]);
  useEffect(()=>{saveData('dreams',dreams); if(cloudReady&&logged) void saveCloudData('dreams',dreams).catch(()=>notify('Cloud save failed. Check your connection.'))},[dreams,cloudReady,logged]);
  useEffect(()=>{saveData('daily',daily); if(cloudReady&&logged) void saveCloudData('daily',daily).catch(()=>notify('Cloud save failed. Check your connection.'))},[daily,cloudReady,logged]);
  useEffect(()=>{saveData('finalMessage',finalMessage); if(cloudReady&&logged) void saveCloudData('finalMessage',finalMessage).catch(()=>notify('Cloud save failed. Check your connection.'))},[finalMessage,cloudReady,logged]);
  useEffect(()=>{let active=true;if(!cloudReady||!supabase){setPhotoUrls({});return;}const refresh=()=>Promise.all(photos.filter(p=>p.src&&!p.src.startsWith('data:')).map(async p=>[p.id,await getPrivateImageUrl(p.src)] as const)).then(entries=>{if(active)setPhotoUrls(Object.fromEntries(entries));}).catch(()=>{if(active)notify('A private photo could not be loaded.');});void refresh();const timer=window.setInterval(()=>void refresh(),45*60*1000);return()=>{active=false;window.clearInterval(timer);};},[photos,cloudReady]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)}},[toast]);

  const [now,setNow] = useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
  const elapsed = useMemo(()=>{
    const start = new Date(since+'T00:00:00').getTime();
    const diff = Math.max(0,now-start);
    return {days:Math.floor(diff/86400000),hours:Math.floor(diff%86400000/3600000),minutes:Math.floor(diff%3600000/60000),seconds:Math.floor(diff%60000/1000)};
  },[since,now]);

  async function login(e:FormEvent) {
    e.preventDefault(); setError('');
    if (!supabase) {setError('Cloud security is not configured yet. Please finish the Supabase setup first.');return;}
    const email = import.meta.env.VITE_OWNER_EMAIL as string | undefined;
    if (!email) {setError('The owner email is missing from the hosting settings.');return;}
    const {error: authError} = await supabase.auth.signInWithPassword({email,password:pass});
    if(authError){setError('That key did not unlock this universe. Try again.');return;}
    try {
      const cloud = await loadCloudData();
      if(cloud.wife !== undefined) setWife(cloud.wife);
      if(cloud.since !== undefined) setSince(cloud.since);
      if(cloud.wishes !== undefined) setWishes(cloud.wishes);
      if(cloud.notes !== undefined) setNotes(cloud.notes);
      let cloudPhotos: Photo[] = cloud.photos !== undefined ? cloud.photos : photos;
      // Migrate photos saved by the old browser-only preview into private Storage.
      cloudPhotos = await Promise.all(cloudPhotos.map(async photo => {
        if(!photo.src.startsWith('data:')) return photo;
        const response = await fetch(photo.src);
        const blob = await response.blob();
        const file = new File([blob], `legacy-${photo.id}.${blob.type.includes('png')?'png':'jpg'}`, {type:blob.type||'image/jpeg'});
        return {...photo,src:await storeImage(file)};
      }));
      setPhotos(cloudPhotos);
      if(cloud.events !== undefined) setEvents(cloud.events);
      if(cloud.dreams !== undefined) setDreams(cloud.dreams);
      if(cloud.daily !== undefined) setDaily(cloud.daily);
      if(cloud.finalMessage !== undefined) setFinalMessage(cloud.finalMessage);
      setCloudReady(true); setLogged(true); setIntro(true);
    } catch {
      await supabase.auth.signOut();
      setError('Could not load your private cloud data. Check that the database setup has been completed.');
    }
  }
  async function logout(){if(supabase) await supabase.auth.signOut();setCloudReady(false);setLogged(false);setIntro(false);setPass('');setTab('home')}
  function notify(s:string){setToast(s)}
  function addWish(){if(!wishText.trim())return;setWishes([{id:uid(),category:wishCat,text:wishText.trim(),favorite:false,created:today()},...wishes]);setWishText('');notify('A new wish has been saved ❤️')}
  function addNote(){if(!noteTitle.trim()||!noteBody.trim())return;const n={id:editingNote||uid(),title:noteTitle,body:noteBody,type:noteType,date:today(),favorite:false};setNotes(editingNote?[n,...notes.filter(x=>x.id!==editingNote)]:[n,...notes]);setNoteTitle('');setNoteBody('');setEditingNote(null);notify('Your words are safely saved')}
  async function addPhotos(files:FileList|null){if(!files)return;const added:Photo[]=[];for(const f of Array.from(files)){if(!f.type.startsWith('image/'))continue;try{added.push({id:uid(),album,caption:caption||f.name.replace(/\.[^.]+$/,''),date:today(),src:await storeImage(f),favorite:false})}catch{notify('Could not upload a photo. Check your cloud storage setup.')}}setPhotos([...added,...photos]);setCaption('');notify(`${added.length} photo(s) added`)}
  async function removePhoto(photo:Photo){try{if(photo.src&&!photo.src.startsWith('data:'))await deletePrivateImage(photo.src);}catch{notify('Photo metadata removed, but its stored file could not be deleted.')}setPhotos(current=>current.filter(x=>x.id!==photo.id));}
  function addEvent(){if(!eventTitle.trim())return;setEvents([...events,{id:uid(),title:eventTitle,date:eventDate,description:eventDesc},].sort((a,b)=>a.date.localeCompare(b.date)));setEventTitle('');setEventDesc('');notify('Memory added to your story')}
  function addDream(){if(!dreamText.trim())return;setDreams([...dreams,{id:uid(),text:dreamText,done:false}]);setDreamText('')}
  function go(t:Tab){setTab(t);setMobileNav(false);setShowFinal(false)}
  const randomWish = wishes[Math.floor(Math.random()*wishes.length)];
  const albums = ['My Queen ❤️','Our Beautiful Memories','Her Beautiful Smile','Our Special Moments','Forever Together','Secret Memories'];
  const filteredPhotos = photos.filter(p=>(p.caption+' '+p.album).toLowerCase().includes(query.toLowerCase()));
  const filteredNotes = notes.filter(n=>(n.title+' '+n.body).toLowerCase().includes(query.toLowerCase()));

  if(!logged) return <main className="login-screen">
    <div className="web-bg"><div className="web-lines"/></div><div className="login-glow"/>
    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="login-card">
      <div className="spider-mark"><Heart size={27} fill="currentColor"/></div>
      <div className="eyebrow">A PRIVATE UNIVERSE · EST. FOREVER</div>
      <h1>A Secret Universe<br/><em>Awaits You.</em></h1>
      <p>This little universe belongs to {wife}.</p>
      <form onSubmit={login}>
        <label className="input-label">YOUR SECRET KEY</label>
        <div className="password-wrap"><LockKeyhole size={17}/><input type={showPass?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/><button type="button" className="icon-btn" onClick={()=>setShowPass(!showPass)}>{showPass?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
        {error&&<div className="error">{error}</div>}
        <button className="primary-btn full" type="submit">UNLOCK OUR UNIVERSE <ChevronRight size={17}/></button>
      </form>
      <div className="login-foot"><ShieldCheck size={14}/> PRIVATE · PERSONAL · ONLY OURS</div>
      {!supabase&&<div className="demo-warning">Cloud setup required: connect Supabase before this private universe can be unlocked.</div>}
    </motion.div>
    <div className="login-bottom">MADE WITH ALL MY HEART <span>♥</span></div>
  </main>;

  return <div className={dark?'app dark':'app light'}>
    <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-icon"><Heart fill="currentColor" size={19}/></div><div><b>MY QUEEN</b><small>THE LOVE UNIVERSE</small></div><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X/></button></div>
      <div className="side-label">YOUR UNIVERSE</div>
      <nav>{nav.map(item=>{const I=item.icon;return <button key={item.id} className={`nav-item ${tab===item.id?'active':''}`} onClick={()=>go(item.id)}><I size={18}/><span>{item.label}</span>{tab===item.id&&<span className="nav-dot"/>}</button>})}</nav>
      <div className="sidebar-bottom"><div className="mini-love"><Heart size={15} fill="currentColor"/><span>Forever starts here.</span></div><button className="nav-item logout" onClick={logout}><LogOut size={17}/> <span>Lock universe</span></button><div className="side-version">A LITTLE UNIVERSE OF OUR OWN · 01</div></div>
    </aside>
    {mobileNav&&<div className="scrim" onClick={()=>setMobileNav(false)}/>}
    <main className="main">
      <header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setMobileNav(true)}><Menu/></button><div className="breadcrumb">MY QUEEN <span>/</span> {nav.find(n=>n.id===tab)?.label.toUpperCase()}</div><div className="top-actions"><span className="private-pill"><span/> PRIVATE SPACE</span><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button><div className="avatar">Q</div></div></header>
      <div className="content">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.22}}>
            {tab==='home'&&<HomePage wife={wife} elapsed={elapsed} daily={daily} photos={photos} wishes={wishes} go={go} onSurprise={()=>go('surprises')}/>}
            {tab==='wishes'&&<section><PageHeading eyebrow="WORDS FROM MY HEART" title="My wishes for you." desc="Little reminders of how deeply you are loved."/><div className="two-col"><div className="panel"><h3><Plus size={17}/> Create a wish</h3><textarea value={wishText} onChange={e=>setWishText(e.target.value)} placeholder="Write something beautiful for her..."/><select value={wishCat} onChange={e=>setWishCat(e.target.value)}>{['Romantic','Good morning','Good night','Birthday','Anniversary','Emotional','Apology','Appreciation','Forever promises'].map(x=><option>{x}</option>)}</select><button className="primary-btn" onClick={addWish}>SAVE THIS WISH <Heart size={16}/></button></div><div className="quote-panel"><Sparkles/><div className="eyebrow">A LITTLE REMINDER</div><p>{randomWish?.text||'You make my universe brighter.'}</p><button className="text-btn" onClick={()=>notify('A little love sent ❤️')}>SEND HER SOME LOVE <Send size={14}/></button></div></div><div className="section-head"><h2>All wishes <span className="count">{wishes.length}</span></h2><span className="muted">Your collection of forever</span></div><div className="wish-grid">{wishes.map(w=><article className="wish-card" key={w.id}><div className="wish-top"><span className="tag">{w.category}</span><button className="icon-btn" onClick={()=>setWishes(wishes.map(x=>x.id===w.id?{...x,favorite:!x.favorite}:x))}><Star size={16} fill={w.favorite?'currentColor':'none'} className={w.favorite?'gold':''}/></button></div><p>{w.text}</p><div className="wish-bottom"><span>{w.created}</span><button className="icon-btn danger" onClick={()=>setWishes(wishes.filter(x=>x.id!==w.id))}><Trash2 size={15}/></button></div></article>)}</div><div className="panel reasons"><div><div className="eyebrow">A SPECIAL COLLECTION</div><h2>100 reasons why I love you.</h2><p className="muted">Start collecting all the little and big reasons.</p></div><span className="big-heart">♥</span><button className="secondary-btn" onClick={()=>{setWishCat('Forever promises');setWishText('I love you because...');window.scrollTo({top:0,behavior:'smooth'})}}>ADD A REASON <Plus size={15}/></button></div></section>}
            {tab==='gallery'&&<section><PageHeading eyebrow="MOMENTS WORTH KEEPING" title="Our memories." desc="Every picture holds a little piece of forever."/><div className="gallery-tools"><select value={album} onChange={e=>setAlbum(e.target.value)}>{albums.map(a=><option>{a}</option>)}</select><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search memories..."/><label className="primary-btn upload-btn"><Camera size={16}/> ADD PHOTOS<input type="file" accept="image/*" multiple onChange={e=>addPhotos(e.target.files)}/></label></div><div className="caption-row"><input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Optional caption for new photos"/><span className="muted">Photos are stored in your private cloud album.</span></div>{filteredPhotos.length===0?<Empty icon={<Images/>} title="Your album is waiting." text="Add your first favorite memory to begin your gallery."/>:<div className="photo-grid">{filteredPhotos.map(p=><article className="photo-card" key={p.id}><button className="photo-open" onClick={()=>setSelectedPhoto(p)}><img src={photoUrls[p.id]||''} alt={p.caption}/><span className="photo-overlay"><Eye size={20}/> VIEW MEMORY</span></button><div className="photo-info"><div><b>{p.caption}</b><small>{p.album} · {p.date}</small></div><button className="icon-btn" onClick={()=>setPhotos(photos.map(x=>x.id===p.id?{...x,favorite:!x.favorite}:x))}><Star size={16} fill={p.favorite?'currentColor':'none'}/></button><button className="icon-btn danger" onClick={()=>removePhoto(p)}><Trash2 size={15}/></button></div></article>)}</div>}</section>}
            {tab==='letters'&&<section><PageHeading eyebrow="LETTERS FROM MY HEART" title="Words I keep for you." desc="Some feelings deserve a place of their own."/><div className="two-col letters-layout"><div className="panel"><h3><Mail size={17}/> {editingNote?'Edit your letter':'Write a letter'}</h3><input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Give your letter a title..."/><select value={noteType} onChange={e=>setNoteType(e.target.value)}>{['Love note','Secret letter','Open when you miss me','Open when you are sad','Open when you need a hug','Open when you cannot sleep','A promise'].map(x=><option>{x}</option>)}</select><textarea className="letter-input" value={noteBody} onChange={e=>setNoteBody(e.target.value)} placeholder="Dear My Queen, ..."/><button className="primary-btn" onClick={addNote}>{editingNote?'UPDATE LETTER':'SAVE LETTER'} <Heart size={15}/></button></div><div className="envelope-card"><div className="envelope"><Mail size={43}/></div><div className="eyebrow">A NOTE FOR EVERY MOMENT</div><h2>Open when you need a hug.</h2><p>Even when I cannot be right beside you, I hope these words make you feel held.</p><button className="secondary-btn" onClick={()=>{const n=notes.find(x=>x.type==='Open when you need a hug')||notes[0];if(n){setNoteTitle(n.title);setNoteBody(n.body);setNoteType(n.type);setEditingNote(n.id)}else notify('Write your first letter to unlock this envelope')}}>OPEN AN ENVELOPE <ChevronRight size={15}/></button></div></div><div className="section-head"><h2>Your letters <span className="count">{notes.length}</span></h2><input className="search compact" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search letters..."/></div><div className="notes-grid">{filteredNotes.map(n=><article className="note-card" key={n.id}><div className="note-top"><span className="tag">{n.type}</span><button className="icon-btn" onClick={()=>setNotes(notes.map(x=>x.id===n.id?{...x,favorite:!x.favorite}:x))}><Star size={15} fill={n.favorite?'currentColor':'none'}/></button></div><h3>{n.title}</h3><p>{n.body}</p><div className="note-actions"><span>{n.date}</span><button className="icon-btn" onClick={()=>{setNoteTitle(n.title);setNoteBody(n.body);setNoteType(n.type);setEditingNote(n.id);window.scrollTo({top:0,behavior:'smooth'})}}><Pencil size={15}/></button><button className="icon-btn danger" onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))}><Trash2 size={15}/></button></div></article>)}</div></section>}
            {tab==='timeline'&&<section><PageHeading eyebrow="THE STORY OF US" title="Our little timeline." desc="A thousand tiny moments, one beautiful story."/><div className="panel event-form"><h3><Plus size={17}/> Add a memory</h3><div className="form-row"><input value={eventTitle} onChange={e=>setEventTitle(e.target.value)} placeholder="Memory title"/><input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}/></div><textarea value={eventDesc} onChange={e=>setEventDesc(e.target.value)} placeholder="Tell the story behind this moment..."/><button className="primary-btn" onClick={addEvent}>ADD TO OUR STORY <Plus size={15}/></button></div><div className="timeline">{events.map((ev,i)=><article className="timeline-item" key={ev.id}><div className="timeline-node"><Heart size={13} fill="currentColor"/></div><div className="timeline-card"><div className="eyebrow">{ev.date}</div><h3>{ev.title}</h3><p>{ev.description}</p><button className="icon-btn danger" onClick={()=>setEvents(events.filter(x=>x.id!==ev.id))}><Trash2 size={15}/></button></div></article>)}</div></section>}
            {tab==='surprises'&&<section><PageHeading eyebrow="A LITTLE MAGIC, JUST FOR YOU" title="Only for my queen." desc="Some surprises are made to be discovered slowly."/><div className="surprise-hero"><div className="surprise-web"/><div className="eyebrow">CLASSIFIED · HEART MATTERS</div><h2>One universe.<br/><em>One favorite person.</em></h2><p>Pick a little mystery. I left these here for the moments you need a smile.</p><div className="gift-row">{['A little reminder','A virtual hug','A secret promise'].map((s,i)=><button className="gift-box" onClick={()=>setSurprise(s)}><span>{['🎁','💌','❤️'][i]}</span><b>{s}</b><small>Tap to reveal</small></button>)}</div>{surprise&&<motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} className="revealed"><Sparkles/><h3>{surprise}</h3><p>{surprise==='A virtual hug'?'Imagine the warmest hug, held for as long as you need. I am always with you in heart.':surprise==='A secret promise'?'I promise to keep choosing us, to listen, to grow, and to make room for joy in our every day.':'If today feels heavy, remember: you are loved, you are cherished, and you never have to earn it.'}</p><button className="icon-btn" onClick={()=>setSurprise('')}><X size={16}/></button></motion.div>}<button className="final-surprise" onClick={()=>setShowFinal(true)}><WandSparkles size={17}/> ONE LAST THING, MY QUEEN <ChevronRight size={17}/></button></div></section>}
            {tab==='dreams'&&<section><PageHeading eyebrow="A THOUSAND TOMORROWS" title="Our forever." desc="The beautiful things we still have ahead of us."/><div className="dream-summary"><div><div className="eyebrow">DREAMS IN THE MAKING</div><strong>{dreams.filter(d=>d.done).length}<small> / {dreams.length} completed</small></strong></div><div className="progress"><span style={{width:`${dreams.length?dreams.filter(d=>d.done).length/dreams.length*100:0}%`}}/></div><Plane size={34}/></div><div className="panel dream-add"><input value={dreamText} onChange={e=>setDreamText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addDream()} placeholder="Add a dream we should make real..."/><button className="primary-btn" onClick={addDream}><Plus size={16}/> ADD DREAM</button></div><div className="dream-list">{dreams.map(d=><div className={`dream-item ${d.done?'completed':''}`}><button className="check-circle" onClick={()=>setDreams(dreams.map(x=>x.id===d.id?{...x,done:!x.done}:x))}>{d.done&&<Check size={14}/>}</button><span>{d.text}</span><button className="icon-btn danger" onClick={()=>setDreams(dreams.filter(x=>x.id!==d.id))}><Trash2 size={15}/></button></div>)}</div></section>}
            {tab==='settings'&&<section><PageHeading eyebrow="MAKE IT OURS" title="Universe settings." desc="Personalize this little corner of forever."/><div className="settings-grid"><div className="panel"><h3><Heart size={17}/> Personal details</h3><label className="input-label">DISPLAY NAME</label><input value={wife} onChange={e=>setWife(e.target.value)} /><label className="input-label">OUR SPECIAL DATE</label><input type="date" value={since} onChange={e=>setSince(e.target.value)}/><label className="input-label">DAILY LOVE MESSAGE</label><textarea value={daily} onChange={e=>setDaily(e.target.value)}/><label className="input-label">FINAL SURPRISE MESSAGE</label><textarea value={finalMessage} onChange={e=>setFinalMessage(e.target.value)}/></div><div className="panel"><h3><KeyRound size={17}/> Security & access</h3><div className="secure-note"><ShieldCheck/> Sign-in is handled by Supabase. Your saved content is synced to your private account, and gallery images use private cloud storage with expiring viewing links.</div><h3 className="settings-sub"><Music2 size={17}/> Ambience</h3><button className="secondary-btn" onClick={()=>{setMusicOn(!musicOn);notify('Music player controls are ready for your own audio file')}}>{musicOn?<Volume2 size={16}/>:<VolumeX size={16}/>} {musicOn?'MUSIC ON':'MUSIC OFF'}</button><h3 className="settings-sub"><Download size={17}/> Your data</h3><button className="secondary-btn" onClick={()=>{const data={wife,since,wishes,notes,photos,events,dreams,daily,finalMessage};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='my-queen-backup.json';a.click();URL.revokeObjectURL(a.href)}}><Download size={15}/> EXPORT BACKUP</button><button className="secondary-btn" onClick={()=>notify('Backup exported using the button above')}><ShieldCheck size={15}/> BACKUP REMINDER</button></div></div><div className="panel danger-zone"><div><h3>Lock this universe</h3><p className="muted">End this session and return to the private entry screen.</p></div><button className="secondary-btn" onClick={logout}><LogOut size={15}/> LOCK NOW</button></div></section>}
          </motion.div>
        </AnimatePresence>
        <footer className="footer">BUILT WITH ALL MY HEART <span>♥</span> <small>IN EVERY UNIVERSE, I CHOOSE YOU.</small></footer>
      </div>
    </main>
    <AnimatePresence>{intro&&<motion.div className="intro-overlay" initial={{opacity:1}} animate={{opacity:1}} exit={{opacity:0}}><div className="intro-city"/><div className="intro-heart"><Heart fill="currentColor" size={50}/></div><div className="eyebrow">A MESSAGE FROM YOUR SPIDER-MAN</div><h1>Hey, {wife}...</h1><p>Do you know why I created this universe?</p><h2>Because you deserve<br/>a universe of your own.</h2><button className="primary-btn" onClick={()=>setIntro(false)}>ENTER OUR UNIVERSE <Heart size={16}/></button><button className="skip" onClick={()=>setIntro(false)}>SKIP INTRO</button></motion.div>}</AnimatePresence>
    <AnimatePresence>{showFinal&&<motion.div className="final-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><button className="modal-close icon-btn" onClick={()=>setShowFinal(false)}><X/></button><div className="final-heart"><Heart fill="currentColor" size={58}/></div><div className="eyebrow">ACROSS EVERY UNIVERSE</div><h1>My favorite<br/><em>person is you.</em></h1><p>{finalMessage}</p><div className="signature">Forever your Spider-Man <span>♥</span></div><button className="secondary-btn" onClick={()=>setShowFinal(false)}>KEEP THIS MOMENT <Heart size={15}/></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{selectedPhoto&&<motion.div className="lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelectedPhoto(null)}><button className="modal-close icon-btn"><X/></button><img src={photoUrls[selectedPhoto.id]||''} alt={selectedPhoto.caption}/><div className="lightbox-caption">{selectedPhoto.caption} · {selectedPhoto.date}</div></motion.div>}</AnimatePresence>
    {toast&&<motion.div className="toast" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}><Heart size={15} fill="currentColor"/> {toast}</motion.div>}
  </div>;
}

function PageHeading({eyebrow,title,desc}:{eyebrow:string;title:string;desc:string}){return <div className="page-heading"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>}
function Empty({icon,title,text}:{icon:any;title:string;text:string}){return <div className="empty-state">{icon}<h3>{title}</h3><p>{text}</p></div>}
function HomePage({wife,elapsed,daily,photos,wishes,go,onSurprise}:any){
 return <section><div className="hero"><div className="hero-web"/><div className="hero-content"><div className="eyebrow"><span className="live-dot"/> YOUR VERY OWN UNIVERSE</div><h1>Hello,<br/><em>{wife}.</em></h1><p>Every universe has a hero.<br/><b>Mine has you.</b></p><button className="primary-btn" onClick={onSurprise}>A SURPRISE FOR YOU <Heart size={16}/></button></div><div className="hero-stamp"><div className="stamp-ring">MY QUEEN · MY UNIVERSE · MY FOREVER ·</div><Heart size={30} fill="currentColor"/></div><div className="hero-bottom">ISSUE NO. 001 <span>THE STORY OF US</span></div></div>
 <div className="stats-row"><div className="stat-card"><div className="stat-icon"><Heart size={17}/></div><div className="eyebrow">DAYS OF US</div><strong>{elapsed.days.toLocaleString()}</strong><small>and counting...</small></div><div className="stat-card"><div className="stat-icon"><Clock3 size={17}/></div><div className="eyebrow">TIME RIGHT NOW</div><strong>{String(elapsed.hours).padStart(2,'0')}:{String(elapsed.minutes).padStart(2,'0')}:{String(elapsed.seconds).padStart(2,'0')}</strong><small>every second is precious</small></div><div className="stat-card message-stat"><div className="stat-icon"><Sparkles size={17}/></div><div className="eyebrow">TODAY'S LITTLE NOTE</div><p>{daily}</p></div></div>
 <div className="section-head"><h2>Explore our universe.</h2><span className="muted">A little something in every corner</span></div><div className="feature-grid">{[{id:'timeline',icon:BookHeart,title:'Our love story',desc:'Every chapter matters.',color:'red'},{id:'wishes',icon:Heart,title:'Wishes for you',desc:'Words from my heart.',color:'blue'},{id:'gallery',icon:Images,title:'Our memories',desc:`${photos.length} moments saved.`,color:'gold'},{id:'letters',icon:Mail,title:'Love letters',desc:'Things I want you to know.',color:'pink'},{id:'surprises',icon:Gift,title:'Secret surprises',desc:'A little magic awaits.',color:'red'},{id:'dreams',icon:Sparkles,title:'Our forever',desc:'All the tomorrows ahead.',color:'blue'}].map(f=>{const I=f.icon;return <button className="feature-card" onClick={()=>go(f.id)}><div className={`feature-icon ${f.color}`}><I size={20}/></div><div><b>{f.title}</b><small>{f.desc}</small></div><ChevronRight size={17}/></button>})}</div>
 <div className="bottom-quote"><span>“</span><p>Even across a thousand universes,<br/>I would always choose you.</p><small>YOUR SPIDER-MAN, FOREVER</small></div>
 </section>
}
