
/* ================= التشغيل وتسجيل الدخول ================= */
function getConfig(){if(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)return window.FIREBASE_CONFIG;try{const c=localStorage.getItem('fbconfig');return c?JSON.parse(c):null}catch{return null}}
async function boot(){let mode=null;try{mode=localStorage.getItem('mode')}catch{}
  if(mode==='local')return startLocal();
  const cfg=getConfig();if(!cfg)return screenWelcome();
  try{const app=FB.initializeApp(cfg);auth=FB.initializeAuth(app,{persistence:[FB.indexedDBLocalPersistence,FB.browserLocalPersistence]});
    db=FB.initializeFirestore(app,{localCache:FB.persistentLocalCache({tabManager:FB.persistentSingleTabManager()})});}
  catch(e){err(e);return screenWelcome()}
  D=CloudDB;S.mode='cloud';
  FB.onAuthStateChanged(auth,async u=>{if(!u)return screenLogin();if(!u.emailVerified)return screenVerify(u);
    S.email=u.email.toLowerCase();
    try{const m=await CloudDB.get('memberships/'+S.email);if(!m)return screenNoClinic();
      S.cid=m.clinicId;const me=await CloudDB.get(C('members/'+S.email));if(!me)return screenNoClinic();S.role=me.role;S.name=me.name||'';
      S.clinic=await CloudDB.get('clinics/'+S.cid)||{};startWatch()}catch(e){err(e);screenNoClinic()}})}
async function startLocal(){D=LocalDB;S.mode='local';S.cid='local';S.role='doctor';S.email='local';S.name='الطبيب';
  S.clinic=await D.get('clinics/local');if(!S.clinic){S.clinic={name:'عيادة العظام',doctor:'د. ',createdAt:Date.now()};await D.set('clinics/local',S.clinic)}startWatch()}
function startWatch(){
  D.watch(C('patients'),null,l=>{S.patients=l.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));if(S.ready)softRefresh()});
  D.watch(C('appointments'),[['date','>=',addDays(today(),-1)]],l=>{S.appts=l;if(S.ready)softRefresh()});
  D.watch(C('cases'),[['status','==','open']],l=>{S.cases=l;if(S.ready)softRefresh()});
  if(S.mode==='cloud')FB.onSnapshot(FB.doc(db,'clinics/'+S.cid),s=>{if(s.exists())S.clinic=s.data()});
  S.ready=true;if(!location.hash||location.hash==='#/login')location.hash='#/today';else render()}
let refreshT;function softRefresh(){clearTimeout(refreshT);refreshT=setTimeout(()=>{if($('.sheet')||document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const r=route()[0];if(['today','schedule','patients','fu'].includes(r))render()},300)}

function screen(html){$('#app').innerHTML=`<div class="login">${html}</div>`}
function screenWelcome(){screen(`<div class="logo">العيادة</div><div class="sub">الحجز بالواتساب، ملف المريض، الروشتات، الأشعة والتحاليل، الملاحظات الصوتية، متابعة العمليات والكسور، والحسابات.</div>
  <div class="card form"><b>ابدأ على هذا الجهاز</b><p class="fine">البيانات تتحفظ على هذا الجهاز فقط. تقدر تربط قاعدة بيانات العيادة بعدين عشان المساعدين يشتغلوا معاك من أجهزتهم.</p><button class="btn primary" id="localGo">ابدأ الآن</button><button class="btn" id="demoGo">جرّب ببيانات تجريبية</button></div>
  <div class="card form"><b>ربط قاعدة بيانات العيادة (Firebase)</b><p class="fine">الصق كود إعداد العيادة (من جهاز الطبيب: المزيد ← كود الإعداد) أو إعدادات Firebase.</p>
  <textarea class="in ltr" id="cfg" placeholder="كود الإعداد أو { &quot;apiKey&quot;: … }"></textarea><button class="btn" id="cfgGo">ربط</button></div>`);
  $('#cfgGo').onclick=()=>{const c=parseCfg($('#cfg').value);if(!c)return toast('الكود غير صحيح');try{localStorage.setItem('fbconfig',JSON.stringify(c));localStorage.removeItem('mode')}catch{}location.reload()};
  $('#localGo').onclick=()=>{try{localStorage.setItem('mode','local')}catch{}location.hash='#/more/clinic';location.reload()};
  $('#demoGo').onclick=async()=>{try{localStorage.setItem('mode','local')}catch{}await seedDemoLocal();location.hash='#/today';location.reload()}}
function parseCfg(t){t=String(t||'').trim();let c=null;try{c=JSON.parse(t)}catch{try{c=JSON.parse(decodeURIComponent(escape(atob(t))))}catch{}}
  if(!c){const m=t.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\})/);if(m){try{c=Function('return '+m[1])()}catch{}}}
  return c&&c.apiKey&&c.projectId?c:null}
function screenLogin(){let mode='in';const draw=()=>{screen(`<div class="logo">العيادة</div><div class="sub">${mode==='in'?'تسجيل الدخول':'إنشاء حساب جديد'}</div>
  <div class="card form"><label class="f">البريد الإلكتروني<input class="in ltr" id="em" type="email" autocomplete="email"></label><label class="f">كلمة المرور<input class="in ltr" id="pw" type="password" autocomplete="${mode==='in'?'current-password':'new-password'}"></label>
  <button class="btn primary" id="go">${mode==='in'?'دخول':'إنشاء الحساب'}</button>
  <div class="row"><button class="btn sm" id="sw">${mode==='in'?'حساب جديد':'عندي حساب'}</button>${mode==='in'?'<button class="btn sm" id="fp">نسيت كلمة المرور</button>':''}</div></div>
  <p class="fine">المساعدين: اطلبوا من الطبيب يضيف بريدكم من المزيد ← الفريق، وبعدين اعملوا حساب بنفس البريد.</p>
  <div class="row"><button class="btn sm" id="chdb">تغيير قاعدة البيانات</button></div>`);
  $('#chdb').onclick=()=>{try{localStorage.removeItem('fbconfig')}catch{}location.reload()};
  $('#sw').onclick=()=>{mode=mode==='in'?'up':'in';draw()};
  $('#go').onclick=async()=>{const e=$('#em').value.trim(),p=$('#pw').value;if(!e||!p)return toast('اكتب البريد وكلمة المرور');
    try{if(mode==='in')await FB.signInWithEmailAndPassword(auth,e,p);else{const c=await FB.createUserWithEmailAndPassword(auth,e,p);await FB.sendEmailVerification(c.user)}}catch(x){toast(x.code==='auth/invalid-credential'?'البريد أو كلمة المرور غير صحيحة':x.code==='auth/email-already-in-use'?'البريد ده عليه حساب بالفعل، سجّل دخول':x.code==='auth/weak-password'?'كلمة المرور ٦ حروف على الأقل':x.message)}};
  const fp=$('#fp');if(fp)fp.onclick=async()=>{const e=$('#em').value.trim();if(!e)return toast('اكتب بريدك الأول');try{await FB.sendPasswordResetEmail(auth,e);toast('اتبعت رابط تغيير كلمة المرور')}catch(x){toast(x.message)}}};draw()}
function screenVerify(u){screen(`<div class="logo">تأكيد البريد</div><div class="sub">بعتنا رابط على <b class="ltr">${esc(u.email)}</b>. افتحه وارجع اضغط متابعة.</div>
  <button class="btn primary" id="cont">متابعة</button><button class="btn" id="resend">ابعت الرابط تاني</button><button class="btn" id="out">خروج</button>`);
  $('#cont').onclick=async()=>{await u.reload();if(auth.currentUser.emailVerified){await auth.currentUser.getIdToken(true);location.reload()}else toast('لسه ما اتأكدش')};
  $('#resend').onclick=()=>FB.sendEmailVerification(u).then(()=>toast('اتبعت')).catch(e=>toast(e.message));$('#out').onclick=()=>FB.signOut(auth)}
function screenNoClinic(){screen(`<div class="logo">لا توجد عيادة بعد</div><div class="sub">مسجّل باسم <b class="ltr">${esc(auth.currentUser.email)}</b></div>
  <div class="card form"><b>أنا الطبيب: إنشاء العيادة</b><label class="f">اسم العيادة<input class="in" id="cn" value="عيادة العظام"></label><label class="f">اسم الطبيب<input class="in" id="dn" value="د. "></label><button class="btn primary" id="mk">إنشاء العيادة</button></div>
  <div class="card"><b>أنا مساعد</b><p class="fine">اطلب من الطبيب يضيف <b class="ltr">${esc(auth.currentUser.email)}</b> من المزيد ← الفريق، وبعدين اضغط تحقق.</p><button class="btn" id="chk">تحقق</button></div>
  <button class="btn" id="out">خروج</button>`);
  $('#mk').onclick=async()=>{const u=auth.currentUser,email=u.email.toLowerCase();try{
    const ref=FB.doc(FB.collection(db,'clinics'));const cid=ref.id;
    await FB.setDoc(ref,{ownerUid:u.uid,name:$('#cn').value,doctor:$('#dn').value,createdAt:Date.now()});
    await FB.setDoc(FB.doc(db,`clinics/${cid}/members/${email}`),{role:'doctor',name:$('#dn').value,email});
    await FB.setDoc(FB.doc(db,'memberships/'+email),{clinicId:cid,role:'doctor'});location.reload()}catch(e){err(e)}};
  $('#chk').onclick=()=>location.reload();$('#out').onclick=()=>FB.signOut(auth)}

/* ================= الهيكل والتنقل ================= */
function route(){return (location.hash.replace(/^#\/?/,'')||'today').split('?')[0].split('/')}
function qs(){const q=location.hash.split('?')[1]||'';return Object.fromEntries(new URLSearchParams(q))}
function shell(title,body,{back=false,action='',fab=''}={}){
  const r=route()[0];const on=(...k)=>k.includes(r)?'on':'';
  $('#app').innerHTML=`<header class="top">${back?`<button class="ib" id="backBtn" aria-label="رجوع">${I.back}</button>`:''}<h1>${esc(title)}</h1>${action}</header>
  <main id="main">${body}</main>${fab}
  <nav class="nav"><a href="#/today" class="${on('today')}">${I.today}اليوم</a><a href="#/schedule" class="${on('schedule')}">${I.cal}المواعيد</a><a href="#/patients" class="${on('patients','p','pe','np')}">${I.pts}المرضى</a><a href="#/fu" class="${on('fu','case')}">${I.fu}المتابعة</a>${isDoc()?`<a href="#/acc" class="${on('acc')}">${I.acc}الحسابات</a>`:''}<a href="#/more" class="${on('more')}">${I.more}المزيد</a></nav>`;
  const b=$('#backBtn');if(b)b.onclick=()=>history.length>1?history.back():(location.hash='#/today');window.scrollTo(0,0)}
function render(){closeSheet();if(!S.ready)return;const [r,a,b]=route();
  const map={today:vToday,schedule:vSchedule,patients:vPatients,np:()=>vPatientForm(null),pe:()=>vPatientForm(a),p:()=>vPatient(a,b||'sum'),fu:vFollow,case:()=>vCase(a),acc:vAccounts,more:()=>a?vMoreSub(a):vMore()};
  (map[r]||vToday)()}
addEventListener('hashchange',render);

/* ================= اليوم ================= */
function dueMilestones(withinDays=0){const t=today(),lim=addDays(t,withinDays);const out=[];
  for(const c of S.cases)(c.ms||[]).forEach((m,i)=>{if(!m.done&&m.due<=lim)out.push({c,m,i,late:m.due<t})});
  return out.sort((x,y)=>x.m.due.localeCompare(y.m.due))}
function apptRow(a,{showDate=false}={}){const p=patient(a.patientId)||{name:a.name,phone:a.phone};const paid=a.paid!=null;
  return`<div class="item" style="flex-direction:column;align-items:stretch;gap:4px" data-aid="${a.id}">
   <div style="display:flex;gap:10px;align-items:center"><span class="av">${a.queue?`<b class="num">${a.queue}</b>`:esc(initials(p))}</span>
    <a class="m" href="${a.patientId?'#/p/'+a.patientId:'#'}" style="text-decoration:none;color:inherit"><span class="t">${esc(p.name||'—')}</span><span class="s">${esc(VTN[a.type]||'')}${a.note?' · '+esc(a.note):''}</span></a>
    <span style="text-align:end"><span class="num" style="font-size:13px;color:var(--muted)">${showDate?fmtShort(a.date)+' ':''}${t12(a.time)}</span><br><span class="st ${a.status}">${ST[a.status]||''}</span></span></div>
   <div class="acts">${a.status==='booked'?`<button class="btn sm" data-act="arrived">وصل</button>`:''}${a.status==='arrived'?`<button class="btn sm primary" data-act="in">دخول للطبيب</button>`:''}${['arrived','in'].includes(a.status)?`<button class="btn sm primary" data-act="done">انتهى${paid?'':' + تحصيل'}</button>`:''}
    ${a.status==='done'&&!paid?`<button class="btn sm" data-act="pay">تحصيل</button>`:''}${paid?`<span class="tag ok">مدفوع <span class="money">${money(a.paid)}</span></span>`:''}
    <button class="btn sm wa" data-act="${a.date===today()?'confirm':'remind'}">${I.wa}${a.confirmedAt||a.remindedAt?'✓ ':''}${a.date>today()?'تذكير':'تأكيد'}</button>
    <button class="btn sm" data-act="menu">⋯</button></div></div>`}
function bindAppts(){$$('[data-aid]').forEach(el=>{const a=S.appts.find(x=>x.id===el.dataset.aid);if(!a)return;
  el.querySelectorAll('[data-act]').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.act;
   if(k==='arrived'){const q=Math.max(0,...S.appts.filter(x=>x.date===a.date&&x.queue).map(x=>x.queue))+1;D.update(C('appointments/'+a.id),{status:'arrived',queue:q,arrivedAt:Date.now()})}
   else if(k==='in')D.update(C('appointments/'+a.id),{status:'in',inAt:Date.now()});
   else if(k==='done'){D.update(C('appointments/'+a.id),{status:'done',doneAt:Date.now()});if(a.paid==null)paySheet(a)}
   else if(k==='pay')paySheet(a);
   else if(k==='confirm'||k==='remind')waAppt(a,a.date>today()?'remind':'confirm');
   else if(k==='menu')apptMenu(a)})})}
function apptMenu(a){const p=patient(a.patientId)||{};sheet(`<b>${esc(p.name||a.name)}</b> <span class="fine">${fmtDay(a.date)} ${t12(a.time)}</span><div class="list" style="margin-top:10px">
  <button class="item" data-m="edit"><span class="m"><span class="t">تعديل الموعد</span></span></button>
  <button class="item" data-m="confirm"><span class="m"><span class="t">رسالة تأكيد واتساب</span></span></button>
  <button class="item" data-m="remind"><span class="m"><span class="t">رسالة تذكير واتساب</span></span></button>
  ${p.phone?`<a class="item" href="tel:${esc(p.phone)}"><span class="m"><span class="t">اتصال</span><span class="s num">${esc(p.phone)}</span></span></a>`:''}
  <button class="item" data-m="booked"><span class="m"><span class="t">إرجاع إلى محجوز</span></span></button>
  <button class="item" data-m="noshow"><span class="m"><span class="t">لم يحضر</span></span></button>
  <button class="item" data-m="cancelled"><span class="m"><span class="t" style="color:var(--bad)">إلغاء الموعد</span></span></button></div>`);
  $$('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;closeSheet();if(k==='edit')bookSheet({appt:a});else if(k==='confirm'||k==='remind')waAppt(a,k);else D.update(C('appointments/'+a.id),{status:k,...(k==='booked'?{queue:null}:{})})})}
function paySheet(a){const p=patient(a.patientId)||{name:a.name};const fee=a.fee!=null&&a.fee!==''?+a.fee:(fees()[a.type]||0);
  sheet(`<b>تحصيل – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">المطلوب<input class="in num" id="fee" type="number" inputmode="decimal" value="${fee}"></label><label class="f">خصم<input class="in num" id="disc" type="number" inputmode="decimal" value="0"></label></div>
   <label class="f">المدفوع<input class="in num" id="paid" type="number" inputmode="decimal" value="${fee}"></label>
   <div class="chips" id="pm">${PM.map(([k,l],i)=>`<button class="chip ${i===0?'on':''}" data-v="${k}">${l}</button>`).join('')}</div>
   <p class="fine" id="rem"></p>
   <div class="row"><button class="btn primary" id="ok">حفظ</button><button class="btn" data-close>لاحقاً</button></div></div>`);
  let pm='cash';$$('#pm .chip').forEach(b=>b.onclick=()=>{pm=b.dataset.v;$$('#pm .chip').forEach(x=>x.classList.toggle('on',x===b))});
  const upd=()=>{const due=(+val('fee')||0)-(+val('disc')||0),pd=+val('paid')||0;$('#rem').textContent=due-pd>0?`المتبقي على المريض: ${money(due-pd)}`:''};
  $('#fee').oninput=()=>{$('#paid').value=(+val('fee')||0)-(+val('disc')||0);upd()};$('#disc').oninput=$('#fee').oninput;$('#paid').oninput=upd;upd();
  $('#ok').onclick=()=>{const due=(+val('fee')||0)-(+val('disc')||0),pd=+val('paid')||0;const base={date:today(),patientId:a.patientId||null,name:p.name||'',apptId:a.id,cat:a.type,at:Date.now(),by:S.name||S.email};
    if(due>0)addTx({...base,kind:'charge',amount:due,note:VTN[a.type]||''});
    if(pd>0)addTx({...base,kind:'pay',amount:pd,method:pm});
    D.update(C('appointments/'+a.id),{paid:pd,fee:+val('fee')||0,disc:+val('disc')||0,method:pm});closeSheet();toast('اتسجل');if(a.patientId)D.update(C('patients/'+a.patientId),{updatedAt:Date.now()})}}

function vToday(){const t=today();const list=S.appts.filter(a=>a.date===t&&a.status!=='cancelled').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const waiting=list.filter(a=>a.status==='arrived').sort((a,b)=>(a.queue||0)-(b.queue||0)),inside=list.filter(a=>a.status==='in'),booked=list.filter(a=>a.status==='booked'),done=list.filter(a=>['done','noshow'].includes(a.status));
  const income=list.reduce((s,a)=>s+(+a.paid||0),0);const due=dueMilestones(0);const tmr=S.appts.filter(a=>a.date===addDays(t,1)&&a.status==='booked');
  const sec=(title,arr)=>arr.length?`<h3>${title} (${arr.length})</h3><div class="list queue">${arr.map(a=>apptRow(a)).join('')}</div>`:'';
  shell(CL().name||'العيادة',`<div class="fine" style="margin-bottom:8px">${fmtLong(t)}</div>
   <div class="stats"><a class="stat cl" href="#/schedule"><div class="k">مواعيد اليوم</div><div class="v">${list.length}</div></a><div class="stat"><div class="k">في الانتظار</div><div class="v">${waiting.length}</div></div><div class="stat"><div class="k">انتهى</div><div class="v">${done.length}</div></div>${isDoc()?`<a class="stat cl" href="#/acc?per=day"><div class="k">دخل اليوم</div><div class="v sm money" id="tinc">${money(income)}</div></a>`:''}</div>
   <div class="row" style="margin-top:12px"><button class="btn primary" id="book">${I.plus}حجز جديد</button><button class="btn" id="walk">مريض بدون حجز</button>${tmr.length?`<button class="btn wa" id="tmr">${I.wa}تذكيرات الغد (${tmr.length})</button>`:''}</div>
   ${sec('بالداخل',inside)}${sec('في الانتظار',waiting)}${sec('محجوز',booked)}
   ${due.length?`<h3>متابعات مستحقة (${due.length})</h3><div class="list">${due.slice(0,8).map(fuRow).join('')}</div>${due.length>8?'<a class="btn sm" href="#/fu">عرض الكل</a>':''}`:''}
   ${sec('انتهى',done)}
   ${!list.length&&!due.length?'<div class="empty" style="margin-top:14px">مفيش مواعيد النهارده. اضغط "حجز جديد".</div>':''}`);
  bindAppts();bindFu();if(isDoc())D.list(C('tx'),[['date','==',t]]).then(l=>{const e=$('#tinc');if(e)e.textContent=money(l.filter(x=>x.kind==='pay').reduce((s,x)=>s+ +x.amount,0))});$('#book').onclick=()=>bookSheet({});$('#walk').onclick=()=>bookSheet({walkin:true});const tb=$('#tmr');if(tb)tb.onclick=()=>remindersSheet(addDays(t,1))}
function remindersSheet(d){const arr=S.appts.filter(a=>a.date===d&&a.status==='booked').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const draw=()=>sheet(`<b>تذكيرات ${fmtDay(d)}</b><p class="fine">اضغط على كل مريض يفتح الواتساب برسالة التذكير جاهزة، ابعتها وارجع للتطبيق.</p><div class="list">${arr.map(a=>{const p=patient(a.patientId)||{name:a.name};return`<button class="item" data-r="${a.id}"><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${t12(a.time)} · ${esc(VTN[a.type]||'')}</span></span>${a.remindedAt?'<span class="tag ok">اتبعت</span>':`<span class="tag mut">لم يُرسل</span>`}</button>`}).join('')}</div>`);
  draw();const bind=()=>$$('[data-r]').forEach(b=>b.onclick=()=>{const a=arr.find(x=>x.id===b.dataset.r);waAppt(a,'remind');a.remindedAt=Date.now();draw();bind()});bind()}

/* ================= المواعيد ================= */
function slotsFor(d){const c=CL();const wd=new Date(d+'T12:00:00').getDay();const days=c.days||[6,0,1,2,3,4];if(!days.includes(wd))return[];
  const [fh,fm]=(c.from||'15:00').split(':').map(Number),[th,tm]=(c.to||'22:00').split(':').map(Number);const step=+c.slot||15;const out=[];
  for(let m=fh*60+fm;m<th*60+tm;m+=step)out.push(`${pad(Math.floor(m/60))}:${pad(m%60)}`);return out}
async function vSchedule(){const q=qs();const d=q.d||today();
  let list=S.appts.filter(a=>a.date===d);if(d<addDays(today(),-1))list=await D.list(C('appointments'),[['date','==',d]]);
  list=list.filter(a=>a.status!=='cancelled').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const slots=slotsFor(d);const used=new Set(list.map(a=>a.time));
  const rows=[];const all=[...new Set([...slots,...list.map(a=>a.time).filter(Boolean)])].sort();
  for(const t of all){const here=list.filter(a=>a.time===t);rows.push(`<div class="slot"><div class="tm">${t12(t)}</div><div class="list">${here.length?here.map(a=>apptRow(a)).join(''):`<button class="free" data-t="${t}">متاح – احجز</button>`}</div></div>`)}
  const noTime=list.filter(a=>!a.time);
  const days=[...Array(7)].map((_,i)=>addDays(d,i-3));
  shell('المواعيد',`<div class="row" style="justify-content:space-between"><button class="btn sm" id="prev">‹ السابق</button><input type="date" class="in num" id="dpick" value="${d}" style="max-width:180px"><button class="btn sm" id="next">التالي ›</button></div>
   <div class="chips" style="margin:10px 0;flex-wrap:nowrap;overflow-x:auto">${days.map(x=>`<a class="chip ${x===d?'on':''}" href="#/schedule?d=${x}" style="text-decoration:none;white-space:nowrap">${fmtShort(x)}${x===today()?' (اليوم)':''}</a>`).join('')}</div>
   <div class="row" style="justify-content:space-between"><b>${fmtDay(d)}</b><span class="fine">${list.length} موعد</span></div>
   ${d>today()&&list.some(a=>a.status==='booked')?`<button class="btn wa sm" id="rem" style="margin-top:8px">${I.wa}إرسال التذكيرات</button>`:''}
   <div class="list" style="margin-top:10px">${rows.join('')||'<div class="empty">العيادة مقفولة اليوم ده (غيّر أيام العمل من المزيد ← بيانات العيادة).</div>'}${noTime.map(a=>apptRow(a)).join('')}</div>`,
   {fab:`<button class="fab" id="fab" aria-label="حجز">${I.plus}</button>`});
  bindAppts();$('#prev').onclick=()=>location.hash='#/schedule?d='+addDays(d,-1);$('#next').onclick=()=>location.hash='#/schedule?d='+addDays(d,1);$('#dpick').onchange=e=>location.hash='#/schedule?d='+e.target.value;
  $('#fab').onclick=()=>bookSheet({date:d});$$('[data-t]').forEach(b=>b.onclick=()=>bookSheet({date:d,time:b.dataset.t}));const r=$('#rem');if(r)r.onclick=()=>remindersSheet(d)}

function bookSheet({appt=null,date=null,time=null,pid=null,walkin=false,type=null,note=''}){
  const a=appt||{};let selP=a.patientId?patient(a.patientId):pid?patient(pid):null;const d=a.date||date||today();
  const draw=()=>{sheet(`<b>${appt?'تعديل الموعد':walkin?'مريض بدون حجز':'حجز جديد'}</b><div class="form" style="margin-top:10px">
   <div id="pbox">${selP?`<div class="bal"><span><b>${esc(selP.name)}</b> <span class="num fine">${esc(selP.phone||'')}</span></span><button class="btn sm" id="chg">تغيير</button></div>`:
    `<div class="search">${I.search}<input class="in" id="ps" placeholder="ابحث بالاسم أو التليفون أو رقم الملف" autocomplete="off"></div><div class="list" id="pres" style="margin-top:6px"></div>
     <div class="grid2" style="margin-top:6px"><label class="f">اسم مريض جديد<input class="in" id="nn"></label><label class="f">التليفون<input class="in num" id="np" type="tel" inputmode="tel"></label></div>`}</div>
   <div class="grid2"><label class="f">اليوم<input class="in num" type="date" id="bd" value="${d}"></label><label class="f">الساعة<select class="in num" id="bt"></select></label></div>
   <label class="f">نوع الزيارة<select class="in" id="bty">${opts(VT,a.type||type||'kashf')}</select></label>
   <div class="grid2"><label class="f">السعر<input class="in num" type="number" inputmode="decimal" id="bf" value="${a.fee??''}" placeholder="${fees()[a.type||type||'kashf']||0}"></label><label class="f">ملاحظة<input class="in" id="bn" value="${esc(a.note||note)}"></label></div>
   <label class="tog" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="bwa" ${appt?'':'checked'}> ابعت رسالة تأكيد على الواتساب بعد الحفظ</label>
   <div class="row"><button class="btn primary" id="bok">${appt?'حفظ':'حجز'}</button><button class="btn" data-close>إلغاء</button></div></div>`);
   const fillT=()=>{const dd=$('#bd').value;const sl=slotsFor(dd);const taken=new Set(S.appts.filter(x=>x.date===dd&&x.status!=='cancelled'&&x.id!==a.id).map(x=>x.time));
     const now=new Date();const cur=`${pad(now.getHours())}:${pad(now.getMinutes())}`;let want=a.time||time||(walkin?cur:'');
     const list=[...new Set([...sl,...(want?[want]:[])])].sort();
     if(!want){want=list.find(t=>!taken.has(t)&&(dd>today()||t>=cur))||list[0]||''}
     $('#bt').innerHTML=list.map(t=>`<option value="${t}" ${t===want?'selected':''}>${t12(t)}${taken.has(t)?' (محجوز)':''}</option>`).join('')||`<option value="${cur}">${t12(cur)}</option>`};
   fillT();$('#bd').onchange=fillT;$('#bty').onchange=()=>$('#bf').placeholder=fees()[$('#bty').value]||0;
   const chg=$('#chg');if(chg)chg.onclick=()=>{selP=null;draw()};
   const ps=$('#ps');if(ps){ps.oninput=()=>{const q=nrm(ps.value);if(!q){$('#pres').innerHTML='';return}const r=S.patients.filter(p=>nrm([p.name,p.phone,p.fileNo].join(' ')).includes(q)).slice(0,6);
     $('#pres').innerHTML=r.map(p=>`<button class="item" data-sp="${p.id}"><span class="m"><span class="t">${esc(p.name)}</span><span class="s num">${esc(p.phone||'')}</span></span></button>`).join('')||'<span class="fine">مفيش نتيجة – اكتب بيانات مريض جديد تحت</span>';
     $$('[data-sp]').forEach(b=>b.onclick=()=>{selP=patient(b.dataset.sp);draw()});if(/^[\d٠-٩+ ]+$/.test(ps.value))$('#np').value=ps.value;else $('#nn').value=ps.value};setTimeout(()=>ps.focus(),50)}
   $('#bok').onclick=async()=>{let p=selP;if(!p){const n=val('nn');if(!n)return toast('اختار مريض أو اكتب اسم مريض جديد');p=newPatient({name:n,phone:val('np')})}
     const doc={patientId:p.id,name:p.name,phone:p.phone||'',date:$('#bd').value,time:$('#bt').value,type:$('#bty').value,fee:val('bf')===''?null:+val('bf'),note:val('bn'),status:a.status||(walkin?'arrived':'booked'),updatedAt:Date.now()};
     if(walkin&&!appt)doc.queue=Math.max(0,...S.appts.filter(x=>x.date===doc.date&&x.queue).map(x=>x.queue))+1;
     let id=a.id;if(appt)await D.update(C('appointments/'+id),doc);else{doc.createdAt=Date.now();doc.by=S.name||S.email;id=D.add(C('appointments'),doc)}
     D.update(C('patients/'+p.id),{updatedAt:Date.now(),nextAppt:doc.date});closeSheet();toast(appt?'اتعدّل':'اتحجز');
     if($('#bwa')&&$('#bwa').checked)waAppt({id,...doc},'confirm')}};draw()}
function newPatient(o){const max=Math.max(0,...S.patients.map(p=>+p.fileNo||0));const p={name:o.name,phone:o.phone||'',fileNo:String(max+1),createdAt:Date.now(),updatedAt:Date.now(),...o};const id=D.add(C('patients'),p);const full={id,...p};S.patients.unshift(full);return full}
