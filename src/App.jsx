import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const Scene3D=lazy(()=>import('./Scene3D.jsx'));
const WA='https://wa.me/2349138907913?text=Hello%2C%20I%20discovered%20Sanctum%20Chess%20Football%20and%20would%20like%20to%20contact%20the%20developer.';
const FEATURES=[
 {id:'movement',n:'01',k:'THE IDEA',title:'CHESS THINKING. FOOTBALL INSTINCT.',body:'A pitch where space is earned, not given. Position your players and build the move before the moment arrives.',metric:'TACTICS IN EVERY TURN'},
 {id:'pass',n:'02',k:'THE PASS',title:'PASS. CREATE. SCORE.',body:'Pass through the lines. See the opening. Turn a small decision into a match-changing moment.',metric:'EVERY PASS HAS A PURPOSE'},
 {id:'impact',n:'03',k:'THE MOMENT',title:'EVERY DECISION MATTERS.',body:'One movement. One perfect strike. The kind of goal that feels like the end of a master plan.',metric:'THE PITCH REMEMBERS'},
 {id:'identity',n:'04',k:'THE IDENTITY',title:'MAKE THE TEAM YOURS.',body:'Find your colours. Choose your kit. Set up the players that will carry your game forward.',metric:'YOUR COLOURS. YOUR LEGACY.'},
 {id:'modes',n:'05',k:'THE CHALLENGE',title:'NO TWO MATCHES ALIKE.',body:'Take on Standard or Pro CPU. Go head-to-head locally, or invite a friend with an online room code.',metric:'SOLO / LOCAL / ONLINE'},
 {id:'final',n:'06',k:'THE FINAL WHISTLE',title:'READY TO TAKE THE FIELD?',body:'The game is already waiting. The next brilliant move belongs to you.',metric:'THIS IS YOUR MATCH'}
];
const CARDS=[
 {number:'01',icon:'➜',name:'POSITION WITH PURPOSE',text:'Turn-based movement, passes and shots that reward foresight.'},
 {number:'02',icon:'◎',name:'CHALLENGE THE CPU',text:'Standard and Pro opponents bring different tactical pressure.'},
 {number:'03',icon:'⇄',name:'PLAY TOGETHER',text:'Challenge someone beside you or share an online room code.'},
 {number:'04',icon:'✦',name:'MAKE IT YOURS',text:'Kits, formations, career and tournament progression.'},
 {number:'05',icon:'◌',name:'KEEP PLAYING OFFLINE',text:'Install the web game; cached assets support offline matches.'},
 {number:'06',icon:'⌁',name:'OPEN ON ANDROID',text:'Download the Android app. Connect once to load game files; cached matches can then work offline.'}
];
function Arrow({diagonal=false}){return <span aria-hidden="true">{diagonal?'⟶':'→'}</span>}
function Button({href,children,kind='primary',external=false,download=false}){return <a className={'cta cta-'+kind} href={href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} download={download||undefined}>{children}<Arrow diagonal={external}/></a>}
export default function App(){
 const progressRef=useRef(0);
 const [chapter,setChapter]=useState(0);
 const [apk,setApk]=useState(null);
 const [stageAvailable,setStageAvailable]=useState(true);
 const [isReduced,setIsReduced]=useState(false);
 const [quality,setQuality]=useState('auto');
 useEffect(()=>{
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setIsReduced(mq.matches);update();mq.addEventListener?.('change',update);return()=>mq.removeEventListener?.('change',update);
 },[]);
 useEffect(()=>{
  let alive=true;
  fetch('/release.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(Error('No release'))).then(data=>{
    if(!alive)return;
    if(data.status==='ready'&&typeof data.apkUrl==='string'&&/^[a-z0-9._\/-]+$/i.test(data.apkUrl)&&/^[a-f0-9]{64}$/i.test(data.sha256||'')){
      const url=new URL(data.apkUrl,location.origin);
      if(url.origin===location.origin)setApk({...data,url:url.pathname});
    }
  }).catch(()=>{});
  return()=>{alive=false};
 },[]);
 useEffect(()=>{
  const journey=document.getElementById('journey');if(!journey)return;
  const trigger=ScrollTrigger.create({
   trigger:journey,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,
   onUpdate:self=>{
    let p=self.progress*6;
    progressRef.current=p;
    const c=Math.min(6,Math.max(0,Math.floor(p+.28)));
    setChapter(old=>old===c?old:c);
    journey.style.setProperty('--scroll-progress',self.progress.toFixed(4));
    journey.style.setProperty('--chapter-phase',(p%1).toFixed(4));
   }
  });
  ScrollTrigger.refresh();
  return()=>trigger.kill();
 },[]);
 const jump=(n)=>{
  let j=document.getElementById('journey');if(!j)return;
  const max=j.offsetHeight-window.innerHeight;const top=window.scrollY+j.getBoundingClientRect().top+Math.max(0,max)*(Math.min(6,n)/6);
  window.scrollTo({top,behavior:isReduced?'instant':'smooth'});
 };
 const title=chapter===0?null:FEATURES[Math.min(5,chapter-1)];
 return <>
  <header className="topbar">
    <a className="brand" href="#main" aria-label="Sanctum Chess Football home" onClick={e=>{e.preventDefault();jump(0)}}>
     <span className="brand-mark"><img src="/assets/game-logo.svg" alt="" width="42" height="42"/></span><span className="brand-words">SANCTUM<span>CHESS FOOTBALL</span></span>
    </a>
    <span className="nav-edition">THE TACTICAL FOOTBALL EXPERIENCE <i/></span>
    <div className="nav-actions"><a href="#features">EXPLORE <Arrow/></a><Button href="#download">GET THE APP</Button></div>
  </header>
  <main id="main">
    <section className="journey" id="journey" aria-label="Interactive game showcase">
      <div className="world">
        <div className="canvas-layer">
          <Suspense fallback={<div className="scene-fallback" role="img" aria-label="Illustrated pitch atmosphere"/>}>
           {stageAvailable&&<Scene3D progressRef={progressRef} reducedMotion={isReduced} onUnavailable={()=>setStageAvailable(false)}/>}
           {!stageAvailable&&<div className="scene-fallback" role="img" aria-label="Moody football field illustration"/>}
          </Suspense>
          <div className="canvas-vignette"/>
          <div className="noise"/>
          <div className="field-light field-light-left" aria-hidden="true"/>
          <div className="field-light field-light-right" aria-hidden="true"/>
        </div>
        <div className="side-rail" aria-label="Scene navigation">
          {Array.from({length:7},(_,i)=><button key={i} type="button" className={chapter===i?'rail-dot current':'rail-dot'} onClick={()=>jump(i)} aria-label={'Go to scene '+(i+1)} aria-current={chapter===i?'step':undefined}><span>{String(i+1).padStart(2,'0')}</span><i/></button>)}
        </div>
        <div className="frame-count"><span>{String(chapter+1).padStart(2,'0')}</span><span className="frame-line"/>07</div>
        <div className={'hero-copy '+(chapter===0?'visible':'hidden')} aria-hidden={chapter!==0}>
          <div className="section-label"><span className="label-line"/> A DIFFERENT KIND OF FOOTBALL</div>
          <h1>SANCTUM<br/><em>CHESS</em><br/>FOOTBALL<span className="fullstop">.</span></h1>
          <p>FOOTBALL. THINKING. GLORY.</p>
          <span className="hero-footnote">YOUR PITCH. YOUR RULES. EVERY MOVE MATTERS.</span>
          <a className="hero-play" href="#download">GET THE ANDROID APP <Arrow/></a>
        </div>
        <div className={'chapter-copy '+(chapter>0?'visible':'hidden')+(chapter===6?' ending-copy':'')} aria-live="polite">
          {title&&<><span className="section-label"><span className="label-line"/>{title.n} / {title.k}</span>
           <h2>{title.title}</h2><p>{title.body}</p><div className="chapter-metric">{title.metric}</div>
           {chapter===6&&<div className="end-actions">{apk&&<Button href={apk.url} download>DOWNLOAD APK</Button>}<a href="#download" className="text-link">INSTALL DETAILS <Arrow/></a></div>}
          </>}
        </div>
        <div className="chapter-index" aria-hidden="true"><div className="chapter-index-line"/><span>01—07 / THE GAME IN MOTION</span></div>
        <div className="world-bottom">
          <span className="system-tag"><span className="pulse"/> INTERACTIVE 3D EXPERIENCE</span>
          <span className="scroll-instruction"><span className="scroll-icon">↕</span>{chapter===6?'YOUR MATCH BEGINS BELOW':'SCROLL TO EXPLORE'}</span>
          <span className="system-tag hide-mobile">SCF / EXPERIENCE V2</span>
        </div>
        <div className="motion-note">{isReduced?'Reduced motion experience enabled':''}</div>
      </div>
    </section>
    <section className="feature-section" id="features" aria-label="Game features">
      <div className="feature-top"><div><span className="overline">BEYOND THE WHISTLE / 06 FEATURES</span><h2>THE GAME<br/><em>BEHIND THE GAME.</em></h2></div><p>Every match is a story of decisions. Choose your opponent, build a side and take the space they leave behind.</p></div>
      <div className="feature-grid">{CARDS.map(f=><article className="feature-tile" key={f.number}><div className="tile-top"><span>{f.number} / 06</span><span className="tile-symbol" aria-hidden="true">{f.icon}</span></div><h3>{f.name}</h3><p>{f.text}</p></article>)}</div>
    </section>
    <section className="conversion" id="download" aria-label="Download the Android app">
      <div className="conversion-halo" aria-hidden="true"/><span className="overline">THE NEXT MOVE IS YOURS</span>
      <h2>THE PITCH<br/>IS <em>WAITING.</em></h2>
      <p>No tutorials before the excitement. Step into the match and start making the calls.</p>
      <div className="conversion-actions">{apk?<Button href={apk.url} download>DOWNLOAD ANDROID APK</Button>:<span className="awaiting">Android installer coming soon</span>}</div>
      {apk&&<p className="apk-disclosure">App size: 195 KB. The first time you open the app, connect to the internet using mobile data or Wi-Fi so the game files can load. Once they are cached, you can play offline.</p>}
      <div className="conversion-line"/>
      <a className="text-link contact" href={WA} target="_blank" rel="noopener noreferrer">CONTACT THE DEVELOPER ON WHATSAPP <Arrow diagonal/></a>
    </section>
  </main>
  <footer className="footer"><span>© {new Date().getFullYear()} SANCTUM CHESS FOOTBALL</span><span>BUILT FOR THE BEAUTIFUL GAME. MADE FOR THINKERS.</span><div><a href="#download">DOWNLOAD APK <Arrow/></a><a href={WA} target="_blank" rel="noopener noreferrer">CONTACT <Arrow diagonal/></a></div></footer>
 </>;
}
