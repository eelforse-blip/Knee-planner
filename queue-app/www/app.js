/* دوري في العيادة — المريض يسجّل اسمه في الاستقبال (QR) ويمشي، ويتابع دوره من موبايله لحد ما يتنادى.
   الاستقبال ينادي الدور التالي، وشاشة الانتظار (TV) تعرض الرقم وتنطقه.
   البيانات على Firebase (نفس مشروع تطبيق العيادة). */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dayKey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const ar=n=>Number(n).toLocaleString('ar-EG');
const hm=ms=>new Date(ms).toLocaleTimeString('ar-EG',{hour:'numeric',minute:'2-digit'});
const mins=m=>m<1?'أقل من دقيقة':m<60?`${ar(Math.round(m))} دقيقة`:`${ar(Math.floor(m/60))} ساعة و${ar(Math.round(m%60))} دقيقة`;
let toastT;function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3000)}
const LS={get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}},del:k=>{try{localStorage.removeItem(k)}catch{}}};
const b64e=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>{try{s=s.replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}};
const Q=new URLSearchParams(location.search);
const hashQ=()=>Object.fromEntries(new URLSearchParams(location.hash.split('?')[1]||''));
const route=()=>(location.hash.replace(/^#\/?/,'').split('?')[0]||'');

/* ---------- الإعداد: من config.js أو من الرابط (f) أو المحفوظ على الجهاز ---------- */
function getCfg(){if(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)return window.FIREBASE_CONFIG;const f=Q.get('f');if(f){const c=b64d(f);if(c&&c.apiKey){LS.set('fbcfg',c);return c}}return LS.get('fbcfg')}
function parseCfg(t){t=String(t||'').trim();let c=null;try{c=JSON.parse(t)}catch{c=b64d(t);if(!c){try{c=JSON.parse(decodeURIComponent(escape(atob(t))))}catch{}}}
  if(!c){const m=t.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\})/)||t.match(/(\{[\s\S]*apiKey[\s\S]*\})/);if(m){try{c=Function('return '+m[1])()}catch{}}}return c&&c.apiKey&&c.projectId?c:null}
let app,auth,db,cfg;
const withTimeout=(p,ms,tag)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(Object.assign(new Error('timeout'),{code:'timeout',tag})),ms))]);
function errMsg(e){const c=(e&&e.code)||'';return c==='timeout'?'الاتصال بطيء أو مقطوع – جرّب تفتح الواي فاي أو بيانات الموبايل وحاول تاني':c.includes('permission')?'الكود قديم – امسح الكود اللي في الاستقبال تاني':c.includes('admin-restricted')||c.includes('operation-not-allowed')?'التسجيل مقفول من إعدادات العيادة':(c||e.message||'خطأ غير معروف')}const cid0=Q.get('c')||LS.get('cid');
const P=(...a)=>a.join('/');
const dayRef=(cid,d=dayKey())=>FB.doc(db,P('clinics',cid,'qday',d));
const tRef=(cid,id,d=dayKey())=>FB.doc(db,P('clinics',cid,'qday',d,'t',id));
const pRef=(cid,id,d=dayKey())=>FB.doc(db,P('clinics',cid,'qday',d,'p',id));
const pCol=(cid,d=dayKey())=>FB.collection(db,P('clinics',cid,'qday',d,'p'));
const tCol=(cid,d=dayKey())=>FB.collection(db,P('clinics',cid,'qday',d,'t'));
const cfgRef=cid=>FB.doc(db,P('clinics',cid,'qcfg','main'));
function rid(){const a=new Uint8Array(10);crypto.getRandomValues(a);return [...a].map(x=>x.toString(36).padStart(2,'0')).join('').slice(0,16)}
function shell(html){$('#app').innerHTML=`<div class="login" style="max-width:520px">${html}</div>`;window.scrollTo(0,0)}
function err(e){console.error(e);toast(e&&e.code==='permission-denied'?'غير مسموح – تأكد من الرابط أو اسأل الاستقبال':(e&&e.message)||'حدث خطأ')}

function boot(){cfg=getCfg();const r=route();
  if(!cfg){if(r.startsWith('admin')||r==='tv'||r==='')return screenSetup();return shell('<div class="logo">دوري</div><div class="sub">الرابط ناقص. امسح الكود اللي في العيادة تاني.</div>')}
  app=FB.initializeApp(cfg);auth=FB.getAuth(app);db=FB.initializeFirestore(app,{experimentalForceLongPolling:true});
  addEventListener('hashchange',()=>route1());route1()}
let stopFns=[];const clearSubs=()=>{stopFns.forEach(f=>{try{f()}catch{}});stopFns=[]};
function route1(){clearSubs();const r=route();if(r==='admin')return adminGate(adminView);if(r==='tv')return adminGate(tvView);if(r==='poster')return adminGate(posterView);
  if(cid0)return patientFlow(cid0);return screenHome()}
function screenHome(){shell(`<div class="logo">دوري</div><div class="sub">لو إنت مريض: امسح الكود (QR) اللي في استقبال العيادة.</div><a class="btn" href="#/admin">دخول الاستقبال</a>`)}
function screenSetup(){shell(`<div class="logo">دوري في العيادة</div><div class="sub">إعداد أول مرة على جهاز الاستقبال: الصق إعدادات Firebase (نفس اللي في تطبيق العيادة).</div>
  <div class="card form"><textarea class="in" id="cfg" dir="ltr" style="min-height:120px" placeholder="const firebaseConfig = { apiKey: … }"></textarea><button class="btn primary" id="go">حفظ</button></div>`);
  $('#go').onclick=()=>{const c=parseCfg($('#cfg').value);if(!c)return toast('الإعدادات غير صحيحة');LS.set('fbcfg',c);location.hash='#/admin';location.reload()}}

/* ================= شاشة المريض ================= */
let myT=null;
async function patientFlow(cid){shell('<div class="sub">جاري التحميل…</div>');
  try{await withTimeout(auth.authStateReady(),8000,'auth');if(!auth.currentUser)await withTimeout(FB.signInAnonymously(auth),15000,'anon')}catch(e){console.error(e);return shell(`<div class="logo">دوري</div><div class="sub">تعذّر الاتصال.<br><small>${esc(errMsg(e))}</small></div><button class="btn primary" onclick="location.reload()">إعادة المحاولة</button>`)}
  const saved=LS.get('ticket');if(saved&&saved.cid===cid&&saved.day===dayKey()){myT=saved;return track(cid)}
  const k=Q.get('k');
  const stop=FB.onSnapshot(dayRef(cid),s=>{const d=s.exists()?s.data():null;if($('#jn'))return;
    if(!d||!d.open)return shell(`<div class="logo">${esc(d&&d.name||'العيادة')}</div><div class="sub">الحجز بالدور مقفول دلوقتي.${d&&d.msg?'<br>'+esc(d.msg):''}</div><p class="fine">هيتفتح تلقائياً أول ما الاستقبال يفتحه.</p>`);
    if(!k)return shell(`<div class="logo">${esc(d.name||'العيادة')}</div><div class="sub">امسح الكود اللي في الاستقبال عشان تسجّل دورك.</div>`);
    const waiting=d.waiting||0;
    shell(`<div class="logo">${esc(d.name||'العيادة')}</div><div class="sub">${esc(d.doctor||'')}</div>
     <div class="card" style="text-align:center"><div class="fine">في الانتظار دلوقتي</div><div class="big ahead">${ar(waiting)}</div><div class="fine">الوقت المتوقع للدور الجديد حوالي ${mins(waiting*(d.avgMin||10))}</div></div>
     <div class="card form"><label class="f">الاسم<input class="in" id="nm" autocomplete="name"></label><label class="f">رقم الموبايل (عشان نكلمك لو احتجنا)<input class="in" id="ph" type="tel" inputmode="tel" dir="ltr" autocomplete="tel"></label>
     <button class="btn primary" id="jn" style="font-size:18px;padding:14px">سجّل دوري</button></div>${d.msg?`<p class="fine">${esc(d.msg)}</p>`:''}`);
    $('#jn').onclick=()=>join(cid,k)},err);stopFns.push(stop)}
async function join(cid,k){const name=$('#nm').value.trim(),phone=$('#ph').value.trim();if(name.length<2)return toast('اكتب اسمك');
  const b=$('#jn');b.disabled=true;b.textContent='جاري التسجيل…';const id=rid();const uid=auth.currentUser.uid;
  try{const no=await withTimeout(FB.runTransaction(db,async tx=>{const ds=await tx.get(dayRef(cid));if(!ds.exists()||!ds.data().open)throw new Error('closed');
      const n=(ds.data().nextNo||0)+1;tx.update(dayRef(cid),{nextNo:n});
      tx.set(tRef(cid,id),{no:n,name,phone,uid,code:k,status:'waiting',at:Date.now()});
      tx.set(pRef(cid,id),{no:n,uid,status:'waiting',at:Date.now()});return n}),20000,'join');
    myT={cid,day:dayKey(),id,no,name};LS.set('ticket',myT);askNotify();clearSubs();track(cid)}
  catch(e){b.disabled=false;b.textContent='سجّل دوري';console.error(e);if(e.message==='closed')toast('الحجز مقفول دلوقتي');else toast(errMsg(e))}}
let alerted={near:false,called:false},beepT=null;
function track(cid){const me=myT;let day=null,list=[];
  const draw=()=>{const mine=list.find(x=>x.id===me.id);const st=mine?mine.status:'waiting';
    const ahead=list.filter(x=>x.status==='waiting'&&x.no<me.no).length;const avg=day&&day.avgMin||10;
    if(st==='called'){callAlert(me);}else stopBeep();
    if(st==='called'&&$('.callov'))return;
    if(['done','cancelled'].includes(st)){shell(`<div class="ticket"><div class="lbl">رقمك كان</div><div class="big no" style="color:var(--muted)">${ar(me.no)}</div><h2>${st==='done'?'ألف سلامة عليك 🌿':'اتلغى الدور'}</h2></div><button class="btn" id="again">تسجيل دور جديد</button>`);
      $('#again').onclick=()=>{LS.del('ticket');location.reload()};return}
    if(st==='skipped'){shell(`<div class="ticket"><div class="lbl">رقمك</div><div class="big no">${ar(me.no)}</div><h2 style="color:var(--bad)">اتنادى عليك وما كنتش موجود</h2><p>كلّم الاستقبال عشان يرجّعوك للدور.</p></div>`);return}
    const cur=day&&day.current;
    shell(`<div class="fine" style="text-align:center">${esc(day&&day.name||'')}</div>
     <div class="ticket"><div class="lbl">رقم دورك</div><div class="big no">${ar(me.no)}</div><div>${esc(me.name)}</div></div>
     <div class="stats" style="margin-top:12px"><div class="stat"><div class="k">قبلك</div><div class="v">${ar(ahead)}</div></div><div class="stat"><div class="k">الدور دلوقتي</div><div class="v">${cur?ar(cur):'—'}</div></div></div>
     <div class="card" style="text-align:center;margin-top:12px"><div class="fine">الوقت المتوقع</div><b style="font-size:20px">${ahead?'حوالي '+mins(ahead*avg):'إنت التالي – خليك قريب'}</b>${ahead?`<div class="fine">ارجع العيادة قبل دورك بـ ٣ أدوار تقريباً</div>`:''}</div>
     ${ahead<=2&&ahead>0?'<div class="card" style="background:color-mix(in srgb,var(--warn) 18%,var(--surface));text-align:center;margin-top:10px"><b>قرّب دورك – ياريت تكون في العيادة</b></div>':''}
     <div class="row" style="margin-top:12px">${'Notification' in window&&Notification.permission!=='granted'?'<button class="btn primary" id="ntf">🔔 فعّل التنبيه لما دورك ييجي</button>':'<span class="fine">🔔 التنبيهات شغالة – سيب الصفحة دي مفتوحة</span>'}<button class="btn sm" id="snd">تجربة الصوت</button></div>
     <p class="fine">ممكن تقفل الشاشة أو تفتح أي حاجة تانية، بس ما تقفلش الصفحة دي. لو اتقفلت افتح نفس الرابط تاني.</p>
     <button class="btn sm danger" id="cx" style="margin-top:14px">إلغاء دوري</button>`);
    if(ahead<=2&&!alerted.near){alerted.near=true;notify('قرّب دورك',`قبلك ${ahead} – ياريت ترجع العيادة`);vib([300,150,300])}
    const n=$('#ntf');if(n)n.onclick=()=>askNotify(true);$('#snd').onclick=()=>{beep();vib(200)};
    const cx=$('#cx');cx.onclick=async()=>{if(!cx.dataset.a){cx.dataset.a=1;cx.textContent='متأكد؟ اضغط تاني';return}
      try{await FB.updateDoc(pRef(cid,me.id),{status:'cancelled'});await FB.updateDoc(tRef(cid,me.id),{status:'cancelled'})}catch(e){err(e)}}};
  stopFns.push(FB.onSnapshot(dayRef(cid),s=>{day=s.data()||{};draw()},err));
  stopFns.push(FB.onSnapshot(pCol(cid),s=>{list=s.docs.map(d=>({id:d.id,...d.data()}));draw()},err))}
function callAlert(me){if($('.callov'))return;const o=document.createElement('div');o.className='callov';o.innerHTML=`<h2>دورك جه! 🎉</h2><div class="big">${ar(me.no)}</div><h2>اتفضل للدكتور</h2><button class="btn" id="okc" style="background:#fff;color:var(--ok)">تمام</button>`;document.body.appendChild(o);
  $('#okc').onclick=()=>{stopBeep();o.remove()};if(!alerted.called){alerted.called=true;notify('دورك جه!',`رقم ${me.no} – اتفضل للدكتور`,true)}
  vib([600,200,600,200,600]);beep();beepT=setInterval(()=>{beep();vib([400,200,400])},4000)}
function stopBeep(){clearInterval(beepT);beepT=null}
let actx=null;function beep(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
  [0,.35,.7].forEach(t=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=t===.7?1046:880;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.0001,actx.currentTime+t);g.gain.exponentialRampToValueAtTime(.5,actx.currentTime+t+.02);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t+.3);o.start(actx.currentTime+t);o.stop(actx.currentTime+t+.32)})}catch{}}
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch{}};
async function askNotify(manual){try{if(!('Notification' in window))return manual&&toast('المتصفح ده مش بيدعم التنبيهات – سيب الصفحة مفتوحة');const r=await Notification.requestPermission();if(r==='granted'){toast('التنبيهات اتفعلت');beep()}else if(manual)toast('التنبيهات مقفولة من إعدادات المتصفح')}catch{}if(myT)setTimeout(()=>{const n=$('#ntf');if(n&&Notification.permission==='granted')n.replaceWith(Object.assign(document.createElement('span'),{className:'fine',textContent:'🔔 التنبيهات شغالة'}))},300)}
async function notify(title,body,urgent){try{if(!('Notification' in window)||Notification.permission!=='granted')return;const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();
  const o={body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'q',renotify:true,requireInteraction:!!urgent,vibrate:urgent?[600,200,600,200,600]:[300,150,300],data:{url:location.href}};
  if(reg)reg.showNotification(title,o);else new Notification(title,o)}catch(e){console.error(e)}}

/* ================= الاستقبال ================= */
let ST={cid:null,email:'',role:null};
function adminGate(next){FB.onAuthStateChanged(auth,async u=>{
  if(!u||u.isAnonymous){return shell(`<div class="logo">الاستقبال</div><div class="sub">سجّل دخول بنفس حساب تطبيق العيادة</div>
    <div class="card form"><label class="f">البريد الإلكتروني<input class="in" id="em" type="email" dir="ltr"></label><label class="f">كلمة المرور<input class="in" id="pw" type="password" dir="ltr"></label><button class="btn primary" id="go">دخول</button></div>
    <button class="btn sm" id="chg">تغيير إعدادات Firebase</button>`),$('#go').onclick=async()=>{try{if(auth.currentUser&&auth.currentUser.isAnonymous)await FB.signOut(auth);await FB.signInWithEmailAndPassword(auth,$('#em').value.trim(),$('#pw').value)}catch(e){toast(e.code==='auth/invalid-credential'?'البريد أو كلمة المرور غير صحيحة':e.message)}},$('#chg').onclick=()=>{LS.del('fbcfg');location.reload()}}
  ST.email=u.email.toLowerCase();
  try{const m=await FB.getDoc(FB.doc(db,'memberships/'+ST.email));if(!m.exists())return shell(`<div class="sub">الحساب ده مش مضاف لعيادة. ضيفه من تطبيق العيادة ← المزيد ← الفريق.</div><button class="btn" id="out">خروج</button>`),$('#out').onclick=()=>FB.signOut(auth);
    ST.cid=m.data().clinicId;ST.role=m.data().role;LS.set('cid',ST.cid);const c=await FB.getDoc(FB.doc(db,'clinics/'+ST.cid));ST.clinic=c.exists()?c.data():{};
    let q=await FB.getDoc(cfgRef(ST.cid));if(!q.exists()){await FB.setDoc(cfgRef(ST.cid),{code:rid().slice(0,8),avgMin:10,msg:''});q=await FB.getDoc(cfgRef(ST.cid))}ST.q=q.data();
    next()}catch(e){err(e)}})}
function joinLink(){const base=location.origin+location.pathname;const p=new URLSearchParams({c:ST.cid,k:ST.q.code});if(!(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey))p.set('f',b64e(cfg));return base+'?'+p.toString()}
function qrImg(text,cell=6){const q=qrcode(0,'M');q.addData(text);q.make();return q.createDataURL(cell,2)}
async function ensureDay(){const ref=dayRef(ST.cid);const s=await FB.getDoc(ref);if(!s.exists())await FB.setDoc(ref,{open:true,nextNo:0,current:null,waiting:0,avgMin:ST.q.avgMin||10,name:ST.clinic.name||'العيادة',doctor:ST.clinic.doctor||'',msg:ST.q.msg||'',lastCall:null});return ref}
async function adminView(){await ensureDay();let day={},tk=[];
  const draw=()=>{const w=tk.filter(t=>t.status==='waiting').sort((a,b)=>a.no-b.no),called=tk.filter(t=>t.status==='called').sort((a,b)=>b.calledAt-a.calledAt),sk=tk.filter(t=>t.status==='skipped'),done=tk.filter(t=>t.status==='done');
    const keep=document.activeElement&&document.activeElement.id;if(keep&&['wn','wp','avg','msg'].includes(keep))return;const openS=$('#more')&&$('#more').open,openA=$('#addBox')&&$('#addBox').open;
    const cur=called[0];
    $('#app').innerHTML=`<header class="top"><h1>${esc(day.name||'الدور')}</h1></header><main id="main">
     ${day.open?'':`<div class="card" style="background:color-mix(in srgb,var(--bad) 14%,var(--surface));text-align:center"><b>التسجيل مقفول – المرضى مش هيقدروا يسجلوا</b><br><button class="btn primary" id="openB" style="margin-top:8px">افتح التسجيل</button></div>`}
     <div class="ticket" style="margin-top:6px"><div class="lbl">الدور الحالي</div><div class="big no" style="font-size:80px">${cur?ar(cur.no):'—'}</div><div style="font-size:18px">${cur?esc(cur.name):'لسه ما اتنادىش على حد'}</div>
      ${cur?`<div class="row" style="justify-content:center;margin-top:10px"><button class="btn" data-id="${cur.id}" data-a="recall">📢 نادِ تاني</button><button class="btn" data-id="${cur.id}" data-a="skip">ما حضرش</button></div>`:''}</div>
     <button class="btn primary" id="next" style="width:100%;font-size:22px;padding:18px;margin-top:12px" ${w.length||cur?'':'disabled'}>${w.length?`📢 نادِ التالي<br><span style="font-size:16px;font-weight:400">رقم ${ar(w[0].no)} – ${esc(w[0].name)}</span>`:cur?'✓ خلص الكشف':'مفيش حد مستني'}</button>
     <h3>مستنيين (${ar(w.length)})</h3><div class="list tq">${w.map((t,i)=>row(t,'waiting',i)).join('')||'<div class="empty">مفيش حد مستني</div>'}</div>
     <details id="addBox" ${openA?'open':''} style="margin-top:10px"><summary class="btn" style="list-style:none;text-align:center">➕ إضافة مريض معهوش موبايل</summary><div class="card form" style="margin-top:8px"><input class="in" id="wn" placeholder="الاسم"><input class="in" id="wp" placeholder="رقم الموبايل (اختياري)" dir="ltr" type="tel"><button class="btn primary" id="wadd">إضافة للدور</button></div></details>
     ${sk.length?`<h3>ما حضروش (${ar(sk.length)})</h3><div class="list tq">${sk.map(t=>row(t,'skipped')).join('')}</div>`:''}
     <p class="fine" style="text-align:center;margin-top:12px">خلص النهارده: ${ar(done.length)} مريض · متوسط الكشف ${ar(Math.round(day.avgMin||10))} دقيقة</p>
     <details id="more" ${openS?'open':''} style="margin-top:6px"><summary class="btn" style="list-style:none;text-align:center">⚙️ الكود وشاشة الانتظار والإعدادات</summary>
      <div class="card" style="text-align:center;margin-top:8px"><div class="qrbox"><img src="${qrImg(joinLink(),5)}" alt="QR"></div><p class="fine">المريض يصوّر الكود ده بكاميرا الموبايل، يكتب اسمه، ويمشي.</p>
       <div class="row" style="justify-content:center"><a class="btn" href="#/poster">🖨️ طباعة الكود</a><a class="btn" href="#/tv">📺 شاشة الانتظار</a><button class="btn" id="cp">نسخ الرابط</button></div></div>
      <div class="card form" style="margin-top:8px">${day.open?'<button class="btn" id="closeB">قفل التسجيل (آخر اليوم)</button>':''}
       <label class="f">متوسط الكشف بالدقايق (بيتظبط لوحده)<input class="in" type="number" id="avg" value="${Math.round(day.avgMin||10)}" dir="ltr"></label>
       <label class="f">رسالة للمرضى<input class="in" id="msg" value="${esc(day.msg||'')}" placeholder="مثلاً: الدكتور هيوصل الساعة ٦"></label><button class="btn" id="sv">حفظ</button>
       ${done.length?`<details><summary class="fine">اللي خلصوا (${ar(done.length)})</summary><div class="list tq">${done.sort((a,b)=>b.no-a.no).map(t=>row(t,'done')).join('')}</div></details>`:''}
       <button class="btn danger" id="rot">تغيير الكود (لو اتسرّب)</button><button class="btn" id="out">تسجيل خروج</button></div></details></main>`;
    bind(w)};
  const row=(t,kind,i)=>`<div class="item" data-t="${t.id}"><span class="num0">${ar(t.no)}</span><span class="m"><span class="t">${esc(t.name)}</span><span class="s">${kind==='waiting'?`مستني ${mins((Date.now()-t.at)/6e4)}`:hm(t.at)}${t.phone?` · <span dir="ltr">${esc(t.phone)}</span>`:''}</span></span><span class="acts" style="margin:0">
     ${kind==='waiting'?`${t.phone&&i<3?`<button class="btn sm wa" data-a="wa">واتساب</button>`:''}<button class="btn sm" data-a="x" title="إلغاء">✕</button>`:''}
     ${kind==='skipped'?`<button class="btn sm" data-a="back">رجّعه</button>`:''}</span></div>`;
  const setSt=async(t,status,extra={})=>{try{await FB.updateDoc(tRef(ST.cid,t.id),{status,...extra});await FB.updateDoc(pRef(ST.cid,t.id),{status,...extra})}catch(e){err(e)}};
  const syncWaiting=()=>{const n=tk.filter(t=>t.status==='waiting').length;if(n!==day.waiting)FB.updateDoc(dayRef(ST.cid),{waiting:n}).catch(()=>{})};
  const call=async t=>{const now=Date.now();let avg=day.avgMin||10;if(day.lastCall&&now-day.lastCall<90*6e4&&now-day.lastCall>6e4)avg=avg*.7+((now-day.lastCall)/6e4)*.3;
    await setSt(t,'called',{calledAt:now});await FB.updateDoc(dayRef(ST.cid),{current:t.no,lastCall:now,avgMin:Math.round(avg*10)/10,callSeq:(day.callSeq||0)+1})};
  const bind=w=>{const ob=$('#openB');if(ob)ob.onclick=()=>FB.updateDoc(dayRef(ST.cid),{open:true});const cb=$('#closeB');if(cb)cb.onclick=()=>{if(!cb.dataset.arm){cb.dataset.arm=1;cb.textContent='متأكد؟ اضغط تاني';return}FB.updateDoc(dayRef(ST.cid),{open:false})};
    $$('[data-id]').forEach(b=>b.onclick=()=>{const t=tk.find(x=>x.id===b.dataset.id);if(b.dataset.a==='skip')setSt(t,'skipped');else{FB.updateDoc(dayRef(ST.cid),{current:t.no,callSeq:(day.callSeq||0)+1});toast('اتنادى تاني')}});
    $('#next').onclick=async()=>{for(const t of tk.filter(x=>x.status==='called'))await setSt(t,'done',{doneAt:Date.now()});if(w[0])await call(w[0])};
    $$('[data-t]').forEach(el=>{const t=tk.find(x=>x.id===el.dataset.t);el.querySelectorAll('[data-a]').forEach(b=>b.onclick=async()=>{const a=b.dataset.a;
      if(a==='call')call(t);else if(a==='done')setSt(t,'done',{doneAt:Date.now()});else if(a==='skip')setSt(t,'skipped');else if(a==='back')setSt(t,'waiting');
      else if(a==='recall')FB.updateDoc(dayRef(ST.cid),{current:t.no,callSeq:(day.callSeq||0)+1});
      else if(a==='x'){if(!b.dataset.arm){b.dataset.arm=1;b.textContent='إلغاء؟';return}setSt(t,'cancelled')}
      else if(a==='wa'){const ahead=w.findIndex(x=>x.id===t.id);const msg=`مرحباً ${t.name.split(' ')[0]}، دورك في ${day.name||'العيادة'} قرّب (رقم ${t.no}${ahead>0?` – قبلك ${ahead}`:''}). ياريت تكون في العيادة خلال ${Math.max(5,Math.round(ahead*(day.avgMin||10)))} دقيقة.`;
        let n=t.phone.replace(/\D/g,'');if(n.startsWith('0')&&n.length===11)n='20'+n.slice(1);window.open(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`,'_blank')}})});
    $('#wadd').onclick=async()=>{const name=$('#wn').value.trim();if(!name)return toast('اكتب الاسم');const id=rid();
      try{await FB.runTransaction(db,async tx=>{const ds=await tx.get(dayRef(ST.cid));const n=(ds.data().nextNo||0)+1;tx.update(dayRef(ST.cid),{nextNo:n});tx.set(tRef(ST.cid,id),{no:n,name,phone:$('#wp').value.trim(),uid:'staff',code:ST.q.code,status:'waiting',at:Date.now(),byStaff:true});tx.set(pRef(ST.cid,id),{no:n,uid:'staff',status:'waiting',at:Date.now()})});toast('اتضاف')}catch(e){err(e)}};
    $('#cp').onclick=()=>navigator.clipboard.writeText(joinLink()).then(()=>toast('اتنسخ'));
    $('#sv').onclick=async()=>{const avg=+$('#avg').value||10,msg=$('#msg').value.trim();await FB.updateDoc(dayRef(ST.cid),{avgMin:avg,msg});await FB.setDoc(cfgRef(ST.cid),{...ST.q,avgMin:avg,msg});ST.q.avgMin=avg;ST.q.msg=msg;toast('اتحفظ')};
    $('#rot').onclick=async()=>{const b=$('#rot');if(!b.dataset.arm){b.dataset.arm=1;b.textContent='متأكد؟ لازم تطبع الكود الجديد';return}ST.q.code=rid().slice(0,8);await FB.setDoc(cfgRef(ST.cid),ST.q);toast('اتغير الكود – اطبع الجديد');draw()};
    $('#out').onclick=()=>FB.signOut(auth)};
  stopFns.push(FB.onSnapshot(dayRef(ST.cid),s=>{day=s.data()||{};draw()},err));
  stopFns.push(FB.onSnapshot(tCol(ST.cid),s=>{tk=s.docs.map(d=>({id:d.id,...d.data()}));draw();syncWaiting()},err));
  const iv=setInterval(()=>{if(route()==='admin'&&!document.activeElement.matches('input'))draw()},60000);stopFns.push(()=>clearInterval(iv))}

/* ---------- شاشة الانتظار (TV) ---------- */
function tvView(){let day={},pub=[],lastSeq=null,sound=false;
  $('#app').innerHTML=`<div class="tv"><div class="now"><div class="t">الدور الآن</div><div class="big" id="cur">—</div><div class="t" id="cn"></div></div>
   <div class="side"><div><div class="cn" id="name"></div><div class="nx" id="nx"></div></div><div style="text-align:center"><div class="qrbox"><img src="${qrImg(joinLink(),6)}" alt=""></div><div style="font-size:1.8vw;margin-top:1vw">امسح الكود وسجّل دورك من موبايلك</div></div></div></div>
   <div class="tvon" id="tvon"><button class="btn primary" style="font-size:22px;padding:18px 30px">اضغط لتشغيل الشاشة بالصوت</button></div>`;
  $('#tvon').onclick=()=>{sound=true;$('#tvon').remove();try{document.documentElement.requestFullscreen()}catch{}beep();speak('تم تشغيل الصوت')};
  const draw=()=>{$('#cur').textContent=day.current?ar(day.current):'—';$('#name').textContent=day.name||'';const nx=pub.filter(x=>x.status==='waiting').sort((a,b)=>a.no-b.no).slice(0,6);
    $('#nx').innerHTML=nx.length?'التالي:'+nx.map(x=>`<b>${ar(x.no)}</b>`).join(''):'لا يوجد انتظار';$('#cn').textContent=day.open?'':'التسجيل مقفول'};
  stopFns.push(FB.onSnapshot(dayRef(ST.cid),s=>{day=s.data()||{};if(lastSeq!==null&&day.callSeq!==lastSeq&&day.current){const el=$('#cur');el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),6000);if(sound){beep();setTimeout(()=>speak(`رقم ${day.current}، اتفضل للكشف`),1200)}}lastSeq=day.callSeq||0;draw()},err));
  stopFns.push(FB.onSnapshot(pCol(ST.cid),s=>{pub=s.docs.map(d=>d.data());draw()},err));
  addEventListener('keydown',e=>{if(e.key==='Escape')location.hash='#/admin'},{once:true})}
function speak(t){try{const u=new SpeechSynthesisUtterance(t);u.lang='ar-EG';const v=speechSynthesis.getVoices().find(v=>/^ar/.test(v.lang));if(v)u.voice=v;u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch{}}
function posterView(){$('#app').innerHTML=`<div style="background:#fff;color:#000;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:30px;text-align:center;font-family:var(--f-ui)">
  <div style="font-size:30px;font-weight:700">${esc(ST.clinic.name||'العيادة')}</div><div style="font-size:20px">${esc(ST.clinic.doctor||'')}</div>
  <div style="font-size:34px;font-weight:700;margin-top:10px">سجّل دورك من موبايلك 📱</div><img src="${qrImg(joinLink(),10)}" style="width:340px;height:340px;image-rendering:pixelated">
  <ol style="font-size:20px;text-align:right;line-height:1.9"><li>افتح كاميرا الموبايل ووجّهها على الكود</li><li>اكتب اسمك ورقم موبايلك</li><li>اتفرّج على دورك من موبايلك – وهننبهك لما دورك يقرّب</li></ol>
  <div class="row noprint"><button class="btn primary" onclick="print()">طباعة</button><a class="btn" href="#/admin">رجوع</a></div></div><style>@media print{.noprint{display:none!important}}</style>`}

boot();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
