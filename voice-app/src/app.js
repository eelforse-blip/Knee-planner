(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- models ---------- */
const ASR={
 tiny:{id:'onnx-community/whisper-tiny',label:'Fast',size:'≈ 40 MB',note:'quick drafts; weak for Arabic'},
 base:{id:'onnx-community/whisper-base',label:'Balanced',size:'≈ 80 MB',note:'good for English, fair for Arabic'},
 small:{id:'onnx-community/whisper-small',label:'Accurate',size:'≈ 250 MB',note:'needed for Arabic; slower on phones (a few minutes per 10 minutes of audio)'}};
const MT={ar_en:{id:'Xenova/opus-mt-ar-en',opts:{},size:'≈ 110 MB'},en_ar:{id:'Xenova/opus-mt-en-ar',opts:{},size:'≈ 110 MB'}};
const LANGS=[['ar','Arabic','ar-EG'],['en','English','en-US']];
const DIALECTS=[['ar-EG','Arabic – Egypt'],['ar-SA','Arabic – Saudi'],['ar-AE','Arabic – Gulf'],['en-US','English – US'],['en-GB','English – UK']];

/* ---------- settings ---------- */
const SET={lang:'ar',model:'small',ts:false,auto:true,autoEnh:false,fx:'clean',useEnh:false,dialect:'ar-EG',mode:'rec',...(()=>{try{return JSON.parse(localStorage.getItem('vn_set')||'{}')}catch{return{}}})()};
if(SET.lang==='auto')SET.lang='ar';
const saveSet=()=>{try{localStorage.setItem('vn_set',JSON.stringify(SET))}catch{}};

/* ---------- storage ---------- */
const DB=(()=>{let p=null;const open=()=>p||(p=new Promise((res,rej)=>{const r=indexedDB.open('voice-notes',1);r.onupgradeneeded=()=>r.result.createObjectStore('items',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  const tx=async(mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction('items',mode);const out=fn(t.objectStore('items'));t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)})};
  return{put:v=>tx('readwrite',s=>s.put(v)),get:id=>tx('readonly',s=>s.get(id)),del:id=>tx('readwrite',s=>s.delete(id)),all:()=>tx('readonly',s=>s.getAll())}})();
let items=[],curId=null,tab='rec';
const curItem=()=>items.find(x=>x.id===curId)||null;
async function loadItems(){try{items=(await DB.all()).sort((a,b)=>b.date-a.date)}catch{items=[]}}
async function saveItem(it){it.upd=Date.now();try{await DB.put(it)}catch(e){toast('Could not save on this device')}const i=items.findIndex(x=>x.id===it.id);if(i<0)items.unshift(it);else items[i]=it}

/* ---------- worker ---------- */
let worker=null,jobId=0;const jobs={};
function getWorker(){if(!worker){worker=new Worker('asr-worker.js',{type:'module'});worker.onmessage=e=>{const m=e.data;const j=jobs[m.id];if(!j)return;
  if(m.type==='progress')j.onProgress&&j.onProgress(m.p);else if(m.type==='stage'||m.type==='part')j.onStage&&j.onStage(m);else if(m.type==='done'){delete jobs[m.id];j.res(m.out)}else if(m.type==='error'){delete jobs[m.id];j.rej(new Error(m.error))}};
  worker.onerror=e=>{Object.values(jobs).forEach(j=>j.rej(new Error(e.message||'Worker failed')));for(const k in jobs)delete jobs[k];worker=null}}return worker}
function run(msg,onProgress,onStage,transfer){const id=++jobId;return new Promise((res,rej)=>{jobs[id]={res,rej,onProgress,onStage};getWorker().postMessage({...msg,id},transfer||[])})}

let fxW=null;function runFx(pcm,level){return new Promise((res,rej)=>{if(!fxW)fxW=new Worker('fx-worker.js',{type:'module'});const id=++jobId;
  fxW.onmessage=e=>{const m=e.data;if(m.id!==id)return;if(m.type==='part'){BUSY.part={i:Math.round(m.p*100),n:100};updProg()}else if(m.type==='done')res(m.out);else if(m.type==='error')rej(new Error(m.error))};
  fxW.onerror=e=>{fxW=null;rej(new Error(e.message||'Enhancer failed'))};fxW.postMessage({id,pcm,level},[pcm.buffer])})}
/* ---------- audio helpers ---------- */
async function toPCM16k(blob,rate=16000){const ab=await blob.arrayBuffer();const AC=window.AudioContext||window.webkitAudioContext;const ac=new AC();
  let buf;try{buf=await new Promise((res,rej)=>{const p=ac.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)})}finally{try{ac.close()}catch{}}
  const len=Math.max(1,Math.ceil(buf.duration*rate));const off=new OfflineAudioContext(1,len,rate);const src=off.createBufferSource();src.buffer=buf;src.connect(off.destination);src.start();
  const r=await off.startRendering();return{pcm:r.getChannelData(0),dur:buf.duration}}
const fmtT=s=>{s=Math.max(0,Math.round(s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0')};
const isAr=t=>{const a=(t.match(/[؀-ۿ]/g)||[]).length,l=(t.match(/[A-Za-z]/g)||[]).length;return a>l};
const newId=()=>'n'+Date.now()+Math.random().toString(36).slice(2,6);
const autoTitle=d=>new Date(d).toLocaleString([],{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});

/* ---------- recording ---------- */
const R={state:'idle',stream:null,mr:null,chunks:[],t0:0,acc:0,timer:0,ac:null,an:null,raf:0,mime:''};
function pickMime(){if(!window.MediaRecorder)return'';for(const m of ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus','audio/webm'])if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m))return m;return''}
async function startRec(){if(!navigator.mediaDevices||!window.MediaRecorder){toast('Recording is not supported in this browser');return}
  try{R.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){toast('Microphone permission is needed');return}
  R.mime=pickMime();R.mr=new MediaRecorder(R.stream,R.mime?{mimeType:R.mime,audioBitsPerSecond:64000}:{});R.chunks=[];R.mr.ondataavailable=e=>{if(e.data&&e.data.size)R.chunks.push(e.data)};
  R.mr.start(1000);R.state='rec';R.t0=Date.now();R.acc=0;wakeLock(true);
  try{const AC=window.AudioContext||window.webkitAudioContext;R.ac=new AC();const src=R.ac.createMediaStreamSource(R.stream);R.an=R.ac.createAnalyser();R.an.fftSize=1024;src.connect(R.an);drawWave()}catch{}
  R.timer=setInterval(tick,250);renderRec()}
function elapsed(){return R.acc+(R.state==='rec'?(Date.now()-R.t0)/1000:0)}
function tick(){const t=$('#timer');if(t)t.textContent=fmtT(elapsed())}
function pauseRec(){if(R.state==='rec'){R.mr.pause();R.acc+=(Date.now()-R.t0)/1000;R.state='pause'}else if(R.state==='pause'){R.mr.resume();R.t0=Date.now();R.state='rec'}renderRec()}
async function stopRec(save=true){if(R.state==='idle')return;const dur=elapsed();clearInterval(R.timer);cancelAnimationFrame(R.raf);
  const done=new Promise(r=>{R.mr.onstop=r});try{R.mr.stop()}catch{}await done;R.stream.getTracks().forEach(t=>t.stop());try{R.ac&&R.ac.close()}catch{}
  const blob=new Blob(R.chunks,{type:R.mr.mimeType||R.mime||'audio/webm'});R.state='idle';wakeLock(false);renderRec();
  if(!save||!blob.size)return;const d=Date.now();const it={id:newId(),date:d,title:'Recording '+autoTitle(d),dur,lang:SET.lang,mime:blob.type,blob,src:'rec',text:'',trans:''};
  await saveItem(it);curId=it.id;selectTab('note');if(SET.autoEnh)await enhance();if(SET.auto)transcribe()}
function drawWave(){const c=$('#wave');if(!c||!R.an){R.raf=requestAnimationFrame(drawWave);return}const dpr=window.devicePixelRatio||1;const w=c.clientWidth*dpr,h=c.clientHeight*dpr;if(c.width!==w)c.width=w;if(c.height!==h)c.height=h;
  const g=c.getContext('2d');const d=new Uint8Array(R.an.fftSize);R.an.getByteTimeDomainData(d);g.clearRect(0,0,w,h);g.lineWidth=2*dpr;g.strokeStyle=R.state==='rec'?getComputedStyle(document.body).getPropertyValue('--bad')||'#e5534b':'#888';g.beginPath();
  for(let i=0;i<d.length;i++){const x=i/(d.length-1)*w,y=d[i]/255*h;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();R.raf=requestAnimationFrame(drawWave)}
let wl=null;async function wakeLock(on){try{if(on&&navigator.wakeLock)wl=await navigator.wakeLock.request('screen');else if(!on&&wl){await wl.release();wl=null}}catch{}}

/* ---------- live dictation ---------- */
const DS={active:false,final:'',interim:'',rec:null,native:null,listeners:[]};
const SRWeb=window.SpeechRecognition||window.webkitSpeechRecognition;
function nativeSR(){return isNative&&window.Capacitor.Plugins&&window.Capacitor.Plugins.SpeechRecognition}
function dictAvailable(){return !!(nativeSR()||SRWeb)}
async function startDict(){if(!dictAvailable()){toast('Live dictation is not available here – use Record and Transcribe');return}
  DS.active=true;DS.final='';DS.interim='';DS.t0=Date.now();wakeLock(true);renderRec();
  const N=nativeSR();
  if(N){try{const p=await N.requestPermissions();if(p&&p.speechRecognition&&p.speechRecognition!=='granted'){toast('Microphone permission is needed');DS.active=false;renderRec();return}}catch{}
    DS.listeners.push(await N.addListener('partialResults',d=>{DS.interim=(d.matches&&d.matches[0])||'';showLive()}));
    DS.listeners.push(await N.addListener('listeningState',d=>{if(d.status==='stopped'){commitInterim();if(DS.active)setTimeout(()=>{if(DS.active)N.start({language:SET.dialect,partialResults:true,popup:false,maxResults:1}).catch(()=>{})},250)}}));
    try{await N.start({language:SET.dialect,partialResults:true,popup:false,maxResults:1})}catch(e){toast('Speech recognition failed to start');stopDict(false)}return}
  const r=new SRWeb();DS.rec=r;r.lang=SET.dialect;r.continuous=true;r.interimResults=true;
  r.onresult=e=>{let it='';for(let i=e.resultIndex;i<e.results.length;i++){const x=e.results[i];if(x.isFinal)DS.final+=(DS.final&&!/\s$/.test(DS.final)?' ':'')+x[0].transcript.trim();else it+=x[0].transcript}DS.interim=it;showLive()};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){toast('Microphone / speech permission was refused');DS.active=false;renderRec()}};
  r.onend=()=>{commitInterim();if(DS.active)try{r.start()}catch{}};
  try{r.start()}catch{toast('Speech recognition failed to start');DS.active=false;renderRec()}}
function commitInterim(){if(DS.interim.trim()){DS.final+=(DS.final?' ':'')+DS.interim.trim();DS.interim='';showLive()}}
function showLive(){const el=$('#live');if(el)el.innerHTML=esc(DS.final)+(DS.interim?` <i>${esc(DS.interim)}</i>`:'')||'<i>Start speaking…</i>'}
async function stopDict(save=true){DS.active=false;wakeLock(false);const N=nativeSR();
  if(N){try{await N.stop()}catch{}for(const l of DS.listeners)try{await l.remove()}catch{}DS.listeners=[]}else if(DS.rec){try{DS.rec.stop()}catch{}DS.rec=null}
  await sleep(300);commitInterim();const text=DS.final.trim();renderRec();
  if(save&&text){const d=Date.now();const it={id:newId(),date:d,title:'Dictation '+autoTitle(d),dur:(Date.now()-DS.t0)/1000,lang:SET.dialect.slice(0,2),src:'dict',text,trans:''};await saveItem(it);curId=it.id;selectTab('note');toast('Saved')}
  else if(save)toast('Nothing was recognised')}

/* ---------- import ---------- */
$('#audioIn').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  let dur=null;try{dur=(await toPCM16k(f)).dur}catch{toast('This audio format cannot be opened on this device');return}
  const d=Date.now();const it={id:newId(),date:d,title:f.name.replace(/\.[^.]+$/,'')||'Imported audio',dur,lang:SET.lang,mime:f.type||'audio/*',blob:f,src:'import',text:'',trans:''};
  await saveItem(it);curId=it.id;selectTab('note');if(SET.auto)transcribe()});

/* ---------- transcription & translation ---------- */
const BUSY={on:false,label:'',files:{},stage:'',t0:0,part:null};
function progHTML(){if(!BUSY.on)return'';const fs=Object.values(BUSY.files).filter(f=>f.total);const tot=fs.reduce((a,f)=>a+f.total,0),got=fs.reduce((a,f)=>a+f.loaded,0);
  const dl=tot&&got<tot*0.999;const pct=BUSY.part?BUSY.part.i/BUSY.part.n*100:dl?got/tot*100:null;const secs=Math.round((Date.now()-BUSY.t0)/1000);
  return`<div class="prog" id="prog"><b>${esc(BUSY.label)}</b><span>${dl?`Downloading the model once: ${(got/1e6).toFixed(0)} / ${(tot/1e6).toFixed(0)} MB`:BUSY.stage==='run'?(BUSY.part?`Part ${BUSY.part.i} of ${BUSY.part.n}`:'Working… ')+` · ${secs} s`:'Loading the model…'}</span><i><em style="width:${pct==null?(BUSY.stage==='run'?100:5):pct}%;${pct==null&&BUSY.stage==='run'?'opacity:.5':''}"></em></i></div>`}
let progT=0;function startBusy(label){Object.assign(BUSY,{on:true,label,files:{},stage:'',t0:Date.now(),part:null});clearInterval(progT);progT=setInterval(updProg,1000);renderNote()}
function endBusy(){BUSY.on=false;clearInterval(progT);renderNote()}
function updProg(){const el=$('#prog');if(el)el.outerHTML=progHTML()}
const onProg=p=>{if(p.status==='progress'&&p.file){BUSY.files[p.file]={loaded:p.loaded||0,total:p.total||0}}updProg()};
const onStage=m=>{if(m.type==='stage')BUSY.stage=m.stage;if(m.type==='part')BUSY.part={i:m.i,n:m.n};updProg()};
async function transcribe(task='transcribe'){const it=curItem();if(!it||!it.blob||BUSY.on)return;const M=ASR[SET.model];
  startBusy(task==='translate'?'Translating the audio to English…':`Transcribing (${M.label.toLowerCase()} model)…`);
  try{const {pcm}=await toPCM16k(it.useEnh&&it.enh?it.enh:it.blob);const lang=it.lang==='en'?'english':'arabic';
    const out=await run({type:'asr',model:M.id,dtype:'q8',device:'wasm',audio:pcm,language:lang,task,ts:SET.ts},onProg,onStage,[pcm.buffer]);
    const text=SET.ts&&out.chunks?out.chunks.map(c=>`[${fmtT(c.timestamp[0])}] ${c.text.trim()}`).join('\n'):String(out.text||'').trim();
    if(task==='translate'){it.trans=text;it.transLang='en'}else{it.text=text;it.model=SET.model}
    await saveItem(it);endBusy();toast(text?'Done':'No speech found')}
  catch(e){endBusy();console.error(e);toast(/fetch|network|Failed to fetch/i.test(e.message)?'Needs internet the first time to download the model':'Could not transcribe: '+e.message.slice(0,90))}}
async function enhance(){const it=curItem();if(!it||!it.blob||BUSY.on)return;startBusy('Enhancing the voice…');BUSY.stage='run';
  try{const {pcm}=await toPCM16k(it.blob,48000);const out=await runFx(pcm,SET.fx);it.enh=new Blob([out.wav],{type:'audio/wav'});it.enhStats={...out.stats,level:SET.fx};it.play='enh';await saveItem(it);endBusy();
    toast(`Enhanced: background noise ${Math.min(60,Math.max(0,Math.round(out.stats.floorBefore-out.stats.floorAfter)))} dB lower`)}
  catch(e){endBusy();console.error(e);toast('Could not enhance: '+e.message.slice(0,90))}}
async function translate(dir){const it=curItem();if(!it||BUSY.on)return;const src=($('#txt')&&$('#txt').value||it.text||'').trim();if(!src){toast('No text to translate yet');return}
  if(dir==='auto')dir=isAr(src)?'ar_en':'en_ar';const M=MT[dir];
  startBusy(dir==='ar_en'?'Translating to English…':'Translating to Arabic…');
  try{const out=await run({type:'mt',model:M.id,dtype:'q8',text:src,opts:M.opts},onProg,onStage);it.trans=out.text.trim();it.transLang=dir==='ar_en'?'en':'ar';await saveItem(it);endBusy();toast('Translated')}
  catch(e){endBusy();console.error(e);toast(/fetch|network/i.test(e.message)?'Needs internet the first time to download the model':'Could not translate: '+e.message.slice(0,90))}}

/* ---------- UI: record tab ---------- */
function selectTab(t){tab=t;$$('.tab').forEach(x=>x.setAttribute('aria-selected',x.dataset.t===t));['rec','lib','note'].forEach(n=>$('#p-'+n).hidden=n!==t);render()}
$$('.tab').forEach(t=>t.onclick=()=>selectTab(t.dataset.t));
function render(){if(tab==='rec')renderRec();else if(tab==='lib')renderLib();else renderNote()}
function renderRec(){const el=$('#p-rec');if(tab!=='rec')return;const busyRec=R.state!=='idle',busyD=DS.active;const mode=SET.mode;
  let h=`<div class="seg">${[['rec','Record audio'],['dict','Live dictation']].map(([k,l])=>`<button data-mode="${k}" class="${mode===k?'on':''}" ${busyRec||busyD?'disabled':''}>${l}</button>`).join('')}</div>`;
  if(mode==='rec'){
    h+=`<div class="selrow"><label for="langS">Spoken language</label><select id="langS" ${busyRec?'disabled':''}>${LANGS.map(([k,l])=>`<option value="${k}" ${SET.lang===k?'selected':''}>${l}</option>`).join('')}</select></div>
     <div class="recbox"><canvas id="wave"></canvas><div class="timer" id="timer">${fmtT(elapsed())}</div>
     <button class="recbtn ${R.state==='rec'?'on':''}" id="recBtn">${busyRec?'Stop &amp; save':'Record'}</button>
     ${busyRec?`<div class="row"><button class="btn" id="pauseBtn">${R.state==='pause'?'Resume':'Pause'}</button><button class="btn danger" id="discBtn">Discard</button></div>`:''}</div>
     ${busyRec?'':`<div class="row" style="justify-content:center"><label class="btn" for="audioIn">Import audio (WhatsApp voice note, m4a, mp3…)</label></div>`}
     <p class="fine">The audio is saved on this device. Speech-to-text and translation run on the device too (the model downloads once, then works offline).${SET.auto?' Transcription starts automatically after you stop.':''}</p>`}
  else{const ok=dictAvailable();
    h+=`<div class="selrow"><label for="dialS">Language</label><select id="dialS" ${busyD?'disabled':''}>${DIALECTS.map(([k,l])=>`<option value="${k}" ${SET.dialect===k?'selected':''}>${l}</option>`).join('')}</select></div>
     <div class="live" id="live" dir="auto"><i>${ok?'Press Start and speak; the text appears as you talk.':'Live dictation needs Chrome, Edge, Safari or the Android app.'}</i></div>
     <div class="recbox"><button class="recbtn dict ${busyD?'on':''}" id="dictBtn" ${ok?'':'disabled'}>${busyD?'Stop &amp; save':'Start'}</button>${busyD?'<button class="btn danger" id="dictDisc">Discard</button>':''}</div>
     <div class="hint">Live dictation is instant but uses the phone's speech service (Google / Apple), so the voice goes to that service and is not saved as audio. For private or long recordings use “Record audio”.</div>`}
  el.innerHTML=h;if(busyD)showLive();
  $$('[data-mode]').forEach(b=>b.onclick=()=>{SET.mode=b.dataset.mode;saveSet();renderRec()});
  const ls=$('#langS');if(ls)ls.onchange=e=>{SET.lang=e.target.value;saveSet()};const ds=$('#dialS');if(ds)ds.onchange=e=>{SET.dialect=e.target.value;saveSet()};
  const rb=$('#recBtn');if(rb)rb.onclick=()=>R.state==='idle'?startRec():stopRec(true);
  const pb=$('#pauseBtn');if(pb)pb.onclick=pauseRec;const db=$('#discBtn');if(db)db.onclick=()=>{stopRec(false);toast('Discarded')};
  const dd=$('#dictBtn');if(dd)dd.onclick=()=>DS.active?stopDict(true):startDict();const dx=$('#dictDisc');if(dx)dx.onclick=()=>{stopDict(false);toast('Discarded')}}

/* ---------- UI: notes list ---------- */
let q='';
function renderLib(){const el=$('#p-lib');const s=q.trim().toLowerCase();const list=s?items.filter(x=>[x.title,x.text,x.trans].join(' ').toLowerCase().includes(s)):items;
  el.innerHTML=`<input class="inp" id="qIn" type="search" placeholder="Search titles and text" value="${esc(q)}">
   ${list.length?list.map(x=>`<button class="item" data-id="${x.id}"><span style="min-width:0"><b>${esc(x.title)}</b><span>${new Date(x.date).toLocaleDateString()} · ${x.src==='dict'?'dictation':fmtT(x.dur)}${x.text?' · text':''}${x.trans?' · translated':''}</span>${x.text?`<span class="snip" dir="auto">${esc(x.text.slice(0,90))}</span>`:''}</span><span class="pill ${x.text?'ok':'mut'}">${x.text?'✓':'audio'}</span></button>`).join(''):`<div class="empty">${s?'No match.':'No notes yet. Record or dictate on the Record tab.'}</div>`}`;
  $('#qIn').oninput=e=>{q=e.target.value;const pos=e.target.selectionStart;renderLib();const n=$('#qIn');n.focus();n.setSelectionRange(pos,pos)};
  $$('#p-lib [data-id]').forEach(b=>b.onclick=()=>{curId=b.dataset.id;selectTab('note')})}

/* ---------- UI: note ---------- */
let audioURL=null;
function renderNote(){const el=$('#p-note');if(tab!=='note')return;const it=curItem();
  if(!it){el.innerHTML='<div class="empty">Open a note from the Notes tab, or record a new one.</div>';return}
  const keepTxt=$('#txt')&&document.activeElement===$('#txt');
  if(audioURL){URL.revokeObjectURL(audioURL);audioURL=null}const playEnh=it.enh&&it.play!=='orig';if(it.blob)audioURL=URL.createObjectURL(playEnh?it.enh:it.blob);const st=it.enhStats;const M=ASR[SET.model];
  el.innerHTML=`<input class="inp" id="title" value="${esc(it.title)}" aria-label="Title">
   <span class="fine">${new Date(it.date).toLocaleString()} · ${it.src==='dict'?'live dictation':fmtT(it.dur)}${it.model?' · '+ASR[it.model].label.toLowerCase()+' model':''}</span>
   ${it.blob?`${it.enh?`<div class="seg">${[['orig','Original'],['enh','Enhanced']].map(([k,l])=>`<button data-ab="${k}" class="${(k==='enh')===!!playEnh?'on':''}">${l}</button>`).join('')}</div>`:''}<audio controls src="${audioURL}" preload="metadata"></audio>
   <div class="group"><h3>Voice enhancer</h3><div class="seg">${[['light','Light'],['clean','Clean'],['strong','Strong']].map(([k,l])=>`<button data-fx="${k}" class="${SET.fx===k?'on':''}">${l}</button>`).join('')}</div>
    <p class="fine">${{light:'Rumble cut, clearer speech tone and even loudness – no noise removal (for already clean audio).',clean:'Removes background noise (AI noise suppression), clearer speech tone, quiet and loud voices evened out.',strong:'As Clean, plus extra silence between words – for noisy clinics, cars or fans.'}[SET.fx]}</p>
    <div class="row"><button class="btn primary" id="fxBtn" ${BUSY.on?'disabled':''}>${it.enh?'Enhance again':'Enhance voice'}</button>${it.enh?'<button class="btn" id="shareEnh">Share enhanced audio</button><button class="btn danger" id="rmEnh">Remove</button>':''}</div>
    ${st?`<p class="fine">${{light:'Light',clean:'Clean',strong:'Strong'}[st.level]}: background noise ${f0(Math.max(-90,st.floorBefore))} → ${st.floorAfter<-80?'silent':f0(st.floorAfter)+' dBFS'} · speech-to-noise ${f0(st.snrBefore)} → ${st.snrAfter>60?'> 60':f0(st.snrAfter)} dB · ${(st.ms/1000).toFixed(1)} s</p><label class="tog"><input type="checkbox" id="useEnh" ${it.useEnh?'checked':''}> Use the enhanced audio for speech-to-text</label><p class="fine">Best for listening and sharing. Speech-to-text is usually more accurate from the original audio, so this is off by default.</p>`:''}</div>
   <div class="selrow"><label for="nLang">Spoken language</label><select id="nLang">${LANGS.map(([k,l])=>`<option value="${k}" ${it.lang===k?'selected':''}>${l}</option>`).join('')}</select>
    <label for="nModel">Accuracy</label><select id="nModel">${Object.entries(ASR).map(([k,m])=>`<option value="${k}" ${SET.model===k?'selected':''}>${m.label} · ${m.size}</option>`).join('')}</select></div>
   <p class="fine">${esc(M.note)}.</p>
   <div class="row"><button class="btn primary" id="trBtn" ${BUSY.on?'disabled':''}>${it.text?'Transcribe again':'Transcribe'}</button><label class="tog"><input type="checkbox" id="tsT" ${SET.ts?'checked':''}> Timestamps</label></div>`:''}
   ${progHTML()}
   <div class="group"><h3>Text</h3><textarea class="ta" id="txt" dir="auto" placeholder="${it.blob?'Press Transcribe, or type here':'Text'}">${esc(it.text||'')}</textarea>
    <div class="row"><button class="btn" data-copy="txt">Copy</button><button class="btn" data-share="txt">Share</button><button class="btn" data-save="txt">Save .txt</button></div></div>
   <div class="group"><h3>Translation</h3><div class="row"><button class="btn" id="toEn" ${BUSY.on?'disabled':''}>→ English</button><button class="btn" id="toAr" ${BUSY.on?'disabled':''}>→ العربية</button></div>
    <textarea class="ta" id="trn" dir="auto" placeholder="Translation appears here">${esc(it.trans||'')}</textarea>
    <div class="row"><button class="btn" data-copy="trn">Copy</button><button class="btn" data-share="trn">Share</button><button class="btn" data-save="trn">Save .txt</button></div>
    <p class="fine">Machine translation: check medical terms before sending it to anyone.</p></div>
   <div class="row">${it.blob?'<button class="btn" id="shareAud">Share audio</button>':''}<button class="btn danger" id="delBtn">Delete note</button></div>`;
  $('#title').onchange=e=>{it.title=e.target.value.trim()||it.title;saveItem(it)};
  const nl=$('#nLang');if(nl)nl.onchange=e=>{it.lang=e.target.value;saveItem(it)};
  const nm=$('#nModel');if(nm)nm.onchange=e=>{SET.model=e.target.value;saveSet();renderNote()};
  const ts=$('#tsT');if(ts)ts.onchange=e=>{SET.ts=e.target.checked;saveSet()};
  const tb=$('#trBtn');if(tb)tb.onclick=()=>transcribe('transcribe');
  $$('[data-ab]').forEach(b=>b.onclick=()=>{it.play=b.dataset.ab;saveItem(it);renderNote();const a=$('#p-note audio');if(a)a.play().catch(()=>{})});
  $$('[data-fx]').forEach(b=>b.onclick=()=>{SET.fx=b.dataset.fx;saveSet();renderNote()});
  const fb=$('#fxBtn');if(fb)fb.onclick=enhance;const se=$('#shareEnh');if(se)se.onclick=()=>saveFile(it.enh,safe(it.title)+'_enhanced.wav');
  const re=$('#rmEnh');if(re)re.onclick=()=>{delete it.enh;delete it.enhStats;it.useEnh=false;it.play='orig';saveItem(it);renderNote()};
  const ue=$('#useEnh');if(ue)ue.onchange=e=>{it.useEnh=e.target.checked;saveItem(it)};
  $('#toEn').onclick=()=>translate('ar_en');$('#toAr').onclick=()=>translate('en_ar');
  let tT=0;$('#txt').oninput=e=>{clearTimeout(tT);tT=setTimeout(()=>{it.text=e.target.value;saveItem(it)},500)};
  let tR=0;$('#trn').oninput=e=>{clearTimeout(tR);tR=setTimeout(()=>{it.trans=e.target.value;saveItem(it)},500)};
  $$('[data-copy]').forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText($('#'+b.dataset.copy).value);toast('Copied')}catch{toast('Copy not available')}});
  $$('[data-share]').forEach(b=>b.onclick=()=>shareText(it.title,$('#'+b.dataset.share).value));
  $$('[data-save]').forEach(b=>b.onclick=()=>saveFile(new Blob(['﻿'+$('#'+b.dataset.save).value],{type:'text/plain'}),safe(it.title)+(b.dataset.save==='trn'?'_translation':'')+'.txt'));
  const sa=$('#shareAud');if(sa)sa.onclick=()=>saveFile(it.blob,safe(it.title)+extOf(it.mime));
  $('#delBtn').onclick=async e=>{const b=e.target;if(!b.dataset.armed){b.dataset.armed=1;b.textContent='Tap again to delete';return}await DB.del(it.id);items=items.filter(x=>x.id!==it.id);curId=null;selectTab('lib');toast('Deleted')};
  if(keepTxt)$('#txt').focus()}
const f0=v=>v==null||isNaN(v)?'—':Math.round(v)+'';
const safe=s=>String(s).replace(/[^\w؀-ۿ -]+/g,'_').trim().slice(0,50)||'note';
const extOf=m=>/mp4|aac|m4a/.test(m||'')?'.m4a':/ogg|opus/.test(m||'')?'.ogg':/mpeg|mp3/.test(m||'')?'.mp3':/wav/.test(m||'')?'.wav':'.webm';

/* ---------- sharing / files ---------- */
async function shareText(title,text){if(!text.trim()){toast('Nothing to share');return}
  try{if(isNative&&window.Capacitor.Plugins.Share){await window.Capacitor.Plugins.Share.share({title,text});return}if(navigator.share){await navigator.share({title,text});return}await navigator.clipboard.writeText(text);toast('Copied – paste it in WhatsApp')}catch{}}
const blobToB64=b=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(b)});
async function saveFile(blob,name){
  if(isNative&&window.Capacitor.Plugins.Filesystem){try{const {Filesystem,Share}=window.Capacitor.Plugins;const w=await Filesystem.writeFile({path:name,data:await blobToB64(blob),directory:'CACHE'});await Share.share({title:name,files:[w.uri]});return}catch(e){if(String(e).includes('cancel'))return}}
  const file=new File([blob],name,{type:blob.type});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('Saved '+name)}

/* ---------- settings sheet ---------- */
$('#menuBtn').onclick=()=>{renderSet();$('#menuSheet').hidden=false};
$$('.sheet').forEach(s=>s.addEventListener('click',e=>{if(e.target===s||e.target.hasAttribute('data-close'))s.hidden=true}));
async function renderSet(){let used='';try{const e=await navigator.storage.estimate();used=`${(e.usage/1e6).toFixed(0)} MB used on this device`}catch{}
  $('#setBody').innerHTML=`<label class="tog"><input type="checkbox" id="autoE" ${SET.autoEnh?'checked':''}> Enhance the voice automatically after recording</label><label class="tog"><input type="checkbox" id="autoT" ${SET.auto?'checked':''}> Transcribe automatically after recording</label>
   <div class="selrow"><label for="defM">Default accuracy</label><select id="defM">${Object.entries(ASR).map(([k,m])=>`<option value="${k}" ${SET.model===k?'selected':''}>${m.label} · ${m.size}</option>`).join('')}</select></div>
   <p class="fine">Models download once (internet needed the first time) and are kept for offline use. Arabic needs “Accurate”; English works well with “Balanced”.</p>
   <button class="btn" id="clrModels">Delete downloaded models</button><p class="fine">${used}</p>
   <button class="btn primary" id="shareApp">Share this app with colleagues</button><button class="btn" id="installMenu" ${installEvt?'':'hidden'}>Install on this device</button>
   <p class="fine">Recordings, text and translations stay on this device. Back up important notes by sharing them. Version 1.0</p>`;
  $('#autoT').onchange=e=>{SET.auto=e.target.checked;saveSet()};$('#autoE').onchange=e=>{SET.autoEnh=e.target.checked;saveSet()};$('#defM').onchange=e=>{SET.model=e.target.value;saveSet()};
  $('#clrModels').onclick=async()=>{try{for(const k of await caches.keys())if(/transformers/i.test(k))await caches.delete(k);toast('Models deleted');renderSet()}catch{toast('Nothing to delete')}};
  $('#shareApp').onclick=shareApp;$('#installMenu').onclick=doInstall}
async function shareApp(){const url='https://eelforse-blip.github.io/Knee-planner/voice/';const text='Voice Notes – record voice, convert speech to text and translate Arabic ⇄ English on your own phone or PC. Free, private (runs on the device), works offline after the first download.\n\n';
  try{if(isNative&&window.Capacitor.Plugins.Share){await window.Capacitor.Plugins.Share.share({title:'Voice Notes',text:text+url});return}if(navigator.share){await navigator.share({title:'Voice Notes',text,url});return}await navigator.clipboard.writeText(text+url);toast('Link copied')}catch{}}
let installEvt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$('#installBtn').hidden=false});
async function doInstall(){if(!installEvt){toast('Use the browser menu → Install app');return}installEvt.prompt();try{await installEvt.userChoice}catch{}installEvt=null;$('#installBtn').hidden=true}
$('#installBtn').onclick=doInstall;
let toastT=0;function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
addEventListener('beforeunload',e=>{if(R.state!=='idle'||DS.active||BUSY.on){e.preventDefault();e.returnValue=''}});

/* ---------- boot ---------- */
(async()=>{await loadItems();selectTab('rec')})();
window.__vn={enhance,runFx,items:()=>items,open:id=>{curId=id;selectTab('note')},transcribe,translate,toPCM16k,set:SET,saveItem:async it=>{await saveItem(it);return it.id},newId,selectTab};
if('serviceWorker' in navigator&&!isNative&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
