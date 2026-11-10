
/* ================= المرضى ================= */
function vPatients(){const q0=qs().q||'';
  shell('المرضى',`<div class="search">${I.search}<input class="in" id="q" placeholder="ابحث بالاسم أو التليفون أو رقم الملف" value="${esc(q0)}" autocomplete="off"></div>
   <div class="fine" style="margin:8px 0">${S.patients.length} مريض</div><div class="list" id="res"></div>`,{fab:`<a class="fab" href="#/np" aria-label="مريض جديد">${I.plus}</a>`});
  const draw=()=>{const q=nrm($('#q').value);const r=(q?S.patients.filter(p=>nrm([p.name,p.phone,p.phone2,p.fileNo,p.dx].join(' ')).includes(q)):S.patients).slice(0,80);
    $('#res').innerHTML=r.map(p=>pItem(p,p.balance>0?`<span class="tag warn">عليه <span class="money">${money(p.balance)}</span></span>`:'')).join('')||'<div class="empty">مفيش مرضى بالاسم ده</div>'};
  $('#q').oninput=draw;draw()}
async function vPatientForm(id){const p=id?await getPatient(id):{};
  shell(id?'تعديل بيانات المريض':'مريض جديد',`<div class="form">
   <label class="f">الاسم<input class="in" id="name" value="${esc(p.name||'')}"></label>
   <div class="grid2"><label class="f">التليفون (واتساب)<input class="in num" id="phone" type="tel" inputmode="tel" value="${esc(p.phone||'')}"></label><label class="f">تليفون آخر<input class="in num" id="phone2" type="tel" value="${esc(p.phone2||'')}"></label></div>
   <div class="grid2"><label class="f">سنة الميلاد<input class="in num" id="birthYear" type="number" inputmode="numeric" value="${esc(p.birthYear||'')}"></label><label class="f">النوع<select class="in" id="sex">${opts([['','—'],['m','ذكر'],['f','أنثى']],p.sex)}</select></label></div>
   <div class="grid2"><label class="f">رقم الملف<input class="in num" id="fileNo" value="${esc(p.fileNo||String(Math.max(0,...S.patients.map(x=>+x.fileNo||0))+1))}"></label><label class="f">الوظيفة<input class="in" id="job" value="${esc(p.job||'')}"></label></div>
   <label class="f">العنوان<input class="in" id="address" value="${esc(p.address||'')}"></label>
   <label class="f">أمراض مزمنة / حساسية من أدوية<input class="in" id="history" value="${esc(p.history||'')}"></label>
   <label class="f">جاي عن طريق<select class="in" id="ref">${opts([['','—'],['fb','فيسبوك'],['ig','إنستجرام'],['tt','تيك توك'],['friend','صديق / مريض'],['doctor','تحويل من طبيب'],['google','جوجل'],['other','أخرى']],p.ref)}</select></label>
   <label class="f">ملاحظات<textarea class="in" id="notes">${esc(p.notes||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="save">حفظ</button>${id&&isDoc()?'<button class="btn danger" id="del">حذف المريض</button>':''}</div></div>`,{back:true});
  $('#save').onclick=()=>{const o={};['name','phone','phone2','birthYear','sex','fileNo','job','address','history','ref','notes'].forEach(k=>o[k]=val(k));if(!o.name)return toast('اكتب الاسم');o.updatedAt=Date.now();
    if(id){D.update(C('patients/'+id),o);location.hash='#/p/'+id}else{const n=newPatient(o);location.replace('#/p/'+n.id)}toast('اتحفظ')};
  const del=$('#del');if(del)confirmBtn(del,()=>{D.del(C('patients/'+id));location.hash='#/patients';toast('اتحذف')},'اضغط تاني للتأكيد')}

const PTABS=[['sum','الملخص'],['visits','الزيارات'],['rx','الروشتات'],['files','الأشعة والتحاليل'],['voice','ملاحظات صوتية'],['fu','المتابعة'],['acc','الحساب']];
async function vPatient(id,tab){const p=await getPatient(id);if(!p){shell('المريض','<div class="empty">المريض مش موجود</div>',{back:true});return}
  const age=ageOf(p);
  const head=`<div class="phead"><span class="av">${esc(initials(p))}</span><div style="flex:1;min-width:0"><div class="n">${esc(p.name)}</div><div class="meta">${[p.fileNo?'ملف '+esc(p.fileNo):'',age!=null?age+' سنة':'',p.sex==='m'?'ذكر':p.sex==='f'?'أنثى':''].filter(Boolean).join(' · ')}</div></div><a class="btn sm" href="#/pe/${id}">${I.edit}</a></div>
   <div class="row" style="margin-top:10px">${p.phone?`<button class="btn sm wa" id="pwa">${I.wa}واتساب</button><a class="btn sm" href="tel:${esc(p.phone)}">${I.phone}<span class="num">${esc(p.phone)}</span></a>`:''}<button class="btn sm primary" id="pbook">${I.cal}حجز</button></div>
   ${p.history?`<div class="bal" style="margin-top:10px;background:color-mix(in srgb,var(--bad) 10%,var(--surface))"><span>⚠️ ${esc(p.history)}</span></div>`:''}
   <nav class="tabs">${PTABS.filter(([k])=>k!=='acc'||isDoc()||S.mode==='local').map(([k,l])=>`<a href="#/p/${id}/${k}" class="${k===tab?'on':''}">${l}</a>`).join('')}</nav><div id="tab"></div>`;
  shell(p.name,head,{back:true});
  $('#pbook').onclick=()=>bookSheet({pid:id});const pw=$('#pwa');if(pw)pw.onclick=()=>waMenu(p);
  ({sum:tSum,visits:tVisits,rx:tRx,files:tFiles,voice:tVoice,fu:tFu,acc:tAcc}[tab]||tSum)(p)}
function waMenu(p){sheet(`<b>رسالة واتساب إلى ${esc(p.name)}</b><div class="list" style="margin-top:10px">
  <button class="item" data-w="free"><span class="m"><span class="t">رسالة فاضية</span></span></button>
  <button class="item" data-w="after"><span class="m"><span class="t">متابعة بعد الكشف</span><span class="s">${esc(waTpl('after').split('\n')[0])}</span></span></button>
  <button class="item" data-w="dues"><span class="m"><span class="t">تذكير بالمتبقي من الحساب</span></span></button></div>`);
  $$('[data-w]').forEach(b=>b.onclick=async()=>{const k=b.dataset.w;closeSheet();if(k==='free')return wa(p.phone,'');
    let extra={};if(k==='dues'){const bal=await balanceOf(p.id);extra['المبلغ']=money(bal)}wa(p.phone,fillTpl(waTpl(k),tplVars(p,extra)))})}

async function tSum(p){const [vis,cases,files]=await Promise.all([D.list(C('visits'),[['patientId','==',p.id]]),D.list(C('cases'),[['patientId','==',p.id]]),D.list(C('files'),[['patientId','==',p.id]])]);
  const appts=(await D.list(C('appointments'),[['patientId','==',p.id]])).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const next=appts.filter(a=>a.date>=today()&&a.status==='booked').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
  const last=vis.sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
  $('#tab').innerHTML=`${next?`<div class="bal"><span>الموعد القادم: <b>${fmtDay(next.date)} ${t12(next.time)}</b> · ${esc(VTN[next.type]||'')}</span></div>`:''}
   ${last?`<h3>آخر زيارة – ${fmt(last.date)}</h3><div class="card">${last.dx?`<b>${esc(last.dx)}</b><br>`:''}${esc(last.plan||last.complaint||'')}</div>`:''}
   ${cases.filter(c=>c.status==='open').map(c=>`<h3>${c.kind==='fracture'?'كسر':'عملية'} – ${esc(caseName(c))}</h3>${caseMsHtml(c)}`).join('')}
   <h3>الملفات</h3><div class="fine">${files.length} ملف (أشعة / تحاليل / روشتات)</div>
   <h3>المواعيد</h3><div class="list">${appts.slice(0,6).map(a=>`<div class="item"><span class="m"><span class="t">${fmtDay(a.date)} ${t12(a.time)}</span><span class="s">${esc(VTN[a.type]||'')}</span></span><span class="st ${a.status}">${ST[a.status]||''}</span></div>`).join('')||'<div class="empty">لا توجد مواعيد</div>'}</div>
   ${p.address||p.job||p.notes?`<h3>بيانات</h3><dl class="kv">${p.job?`<dt>الوظيفة</dt><dd>${esc(p.job)}</dd>`:''}${p.address?`<dt>العنوان</dt><dd>${esc(p.address)}</dd>`:''}${p.notes?`<dt>ملاحظات</dt><dd>${esc(p.notes)}</dd>`:''}</dl>`:''}`}

/* ---------- الزيارات ---------- */
async function tVisits(p){const vis=(await D.list(C('visits'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  $('#tab').innerHTML=`${isDoc()?`<button class="btn primary" id="nv">${I.plus}زيارة جديدة</button>`:''}<div class="tl" style="margin-top:10px">${vis.map(v=>`<button class="item" data-v="${v.id}"><span class="when">${fmt(v.date)}</span><span class="m" style="white-space:normal"><span class="t">${esc(v.dx||VTN[v.type]||'زيارة')}</span><span class="s" style="white-space:normal">${esc([v.complaint,v.plan].filter(Boolean).join(' – ')).slice(0,160)}</span></span></button>`).join('')||'<div class="empty">لا توجد زيارات</div>'}</div>`;
  const nv=$('#nv');if(nv)nv.onclick=()=>visitSheet(p,null);$$('[data-v]').forEach(b=>b.onclick=()=>visitSheet(p,vis.find(v=>v.id===b.dataset.v)))}
function visitSheet(p,v){const x=v||{date:today(),type:'kashf'};const ro=!isDoc();
  sheet(`<b>${v?'زيارة '+fmt(x.date):'زيارة جديدة'}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="vd" value="${x.date}" ${ro?'disabled':''}></label><label class="f">النوع<select class="in" id="vt" ${ro?'disabled':''}>${opts(VT,x.type)}</select></label></div>
   <label class="f">الشكوى<textarea class="in" id="vc" ${ro?'readonly':''}>${esc(x.complaint||'')}</textarea></label>
   <label class="f">الفحص<textarea class="in" id="ve" ${ro?'readonly':''}>${esc(x.exam||'')}</textarea></label>
   <label class="f">التشخيص<input class="in" id="vx" value="${esc(x.dx||'')}" ${ro?'readonly':''}></label>
   <label class="f">الخطة / العلاج<textarea class="in" id="vp" ${ro?'readonly':''}>${esc(x.plan||'')}</textarea></label>
   ${ro?'':`<button class="btn sm" id="dict">${I.mic}إملاء صوتي في الخانة المحددة</button>
   <label class="f">ميعاد المتابعة<select class="in" id="vn"><option value="">بدون</option><option value="7">بعد أسبوع</option><option value="14">بعد أسبوعين</option><option value="30">بعد شهر</option><option value="42">بعد ٦ أسابيع</option><option value="90">بعد ٣ شهور</option></select></label>
   <div class="row"><button class="btn primary" id="vs">حفظ</button><button class="btn" id="vrx">${I.rx}روشتة</button>${v?'<button class="btn danger" id="vdel">حذف</button>':''}</div>`}</div>`);
  if(ro)return;let lastF=$('#vc');['vc','ve','vx','vp'].forEach(k=>$('#'+k).addEventListener('focus',e=>lastF=e.target));
  $('#dict').onclick=()=>dictate(lastF,$('#dict'));
  const save=()=>{const o={patientId:p.id,date:$('#vd').value,type:$('#vt').value,complaint:val('vc'),exam:val('ve'),dx:val('vx'),plan:val('vp'),updatedAt:Date.now()};
    if(v)D.update(C('visits/'+v.id),o);else{o.createdAt=Date.now();D.add(C('visits'),o)}
    D.update(C('patients/'+p.id),{updatedAt:Date.now(),dx:o.dx||p.dx||''});const n=+val('vn');closeSheet();toast('اتحفظت الزيارة');
    if(n)bookSheet({pid:p.id,date:addDays(o.date,n),type:'reexam'});else render()};
  $('#vs').onclick=save;$('#vrx').onclick=()=>{rxSheet(p,null,{dx:val('vx')})};const dl=$('#vdel');if(dl)confirmBtn(dl,()=>{D.del(C('visits/'+v.id));closeSheet();render()})}

/* ---------- إملاء صوتي (Web Speech أو إضافة أندرويد) ---------- */
let dictOn=null;
async function dictate(target,btn){if(!target)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const plug=isNative&&window.Capacitor.Plugins.SpeechRecognition;
  if(dictOn){dictOn();return}
  const add=t=>{if(!t)return;target.value=(target.value?target.value.trim()+' ':'')+t;target.dispatchEvent(new Event('input'))};
  if(plug){try{const perm=await plug.requestPermissions();if(perm&&perm.speechRecognition==='denied')return toast('اسمح بالميكروفون');btn.classList.add('wa');btn.textContent='جاري الاستماع… اضغط للإيقاف';
      const r=await plug.start({language:'ar-EG',maxResults:1,partialResults:false,popup:true});add(r&&r.matches&&r.matches[0])}catch(e){toast('الإملاء غير متاح')}btn.classList.remove('wa');btn.innerHTML=I.mic+'إملاء صوتي';return}
  if(!SR)return toast('الإملاء الصوتي يحتاج Chrome أو Edge');
  const r=new SR();r.lang='ar-EG';r.continuous=true;r.interimResults=false;
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)add(e.results[i][0].transcript)};
  const stop=()=>{try{r.stop()}catch{}dictOn=null;btn.classList.remove('wa');btn.innerHTML=I.mic+'إملاء صوتي'};
  r.onend=()=>{if(dictOn)stop()};r.onerror=e=>{toast(e.error==='not-allowed'?'اسمح بالميكروفون':'توقف الإملاء');stop()};
  r.start();dictOn=stop;btn.classList.add('wa');btn.textContent='جاري الاستماع… اضغط للإيقاف'}

/* ---------- الروشتات ---------- */
async function tRx(p){const rx=(await D.list(C('rx'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt||0)-(a.createdAt||0));
  $('#tab').innerHTML=`<div class="row">${isDoc()?`<button class="btn primary" id="nrx">${I.rx}كتابة روشتة</button>`:''}<button class="btn" id="srx">${I.cam}سكان روشتة</button></div>
   <div class="list" style="margin-top:10px">${rx.map(r=>`<button class="item" data-r="${r.id}">${r.thumb?`<img src="${r.thumb}" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:`<span class="av">${I.rx}</span>`}<span class="m"><span class="t">${fmt(r.date)}${r.scanned?' · سكان':''}</span><span class="s ltr" style="text-align:end">${esc((r.items||[]).map(i=>i.n).join('، ')||(r.ocr||'').slice(0,80)||r.note||'')}</span></span></button>`).join('')||'<div class="empty">لا توجد روشتات</div>'}</div>`;
  const n=$('#nrx');if(n)n.onclick=()=>rxSheet(p,null);$('#srx').onclick=()=>scanFlow(p,{cat:'rx'});
  $$('[data-r]').forEach(b=>b.onclick=()=>{const r=rx.find(x=>x.id===b.dataset.r);r.scanned?viewRxScan(p,r):rxSheet(p,r)})}
function rxSheet(p,r,{dx=''}={}){const x=r?JSON.parse(JSON.stringify(r)):{date:today(),items:[],note:'',dx};
  const draw=()=>{sheet(`<b>${r?'روشتة '+fmt(x.date):'روشتة جديدة'}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="rd" value="${x.date}"></label><label class="f">التشخيص<input class="in" id="rdx" value="${esc(x.dx||'')}"></label></div>
   <div class="list" id="its">${x.items.map((it,i)=>`<div class="drug"><span class="dn">${esc(it.n)}</span><button class="btn sm danger" data-rm="${i}">✕</button><span class="dd">${esc([it.f,it.u].filter(Boolean).join(' – '))}</span></div>`).join('')||'<span class="fine">لسه مفيش أدوية</span>'}</div>
   <div class="card form"><label class="f">الدواء<input class="in ltr" id="dn" placeholder="اكتب اسم الدواء" autocomplete="off"></label><div class="sug" id="dsug"></div>
    <label class="f">الجرعة وطريقة الاستخدام<input class="in" id="df" list="fl"></label><datalist id="fl">${FREQ.map(f=>`<option value="${f}">`).join('')}</datalist>
    <label class="f">المدة<input class="in" id="du" list="ul"></label><datalist id="ul">${DUR.map(f=>`<option value="${f}">`).join('')}</datalist>
    <button class="btn" id="addd">${I.plus}إضافة للروشتة</button></div>
   <label class="f">تعليمات للمريض<textarea class="in" id="rn">${esc(x.note||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="rs">حفظ</button><button class="btn" id="rp">${I.print}طباعة / PDF</button><button class="btn wa" id="rw">${I.wa}إرسال للمريض</button>${r?'<button class="btn danger" id="rdel">حذف</button>':''}</div></div>`);
   const sug=()=>{const q=nrm(val('dn'));const l=drugs().filter(d=>!q||nrm(d.n).includes(q)).slice(0,q?8:14);
     $('#dsug').innerHTML=l.map(d=>`<button data-d="${esc(d.n)}">${esc(d.n)}</button>`).join('');
     $$('#dsug [data-d]').forEach(b=>b.onclick=()=>{const d=drugs().find(z=>z.n===b.dataset.d);$('#dn').value=d.n;$('#df').value=d.f||'';$('#du').value=d.u||''})};
   $('#dn').oninput=sug;sug();
   const keep=()=>{x.date=$('#rd').value;x.dx=val('rdx');x.note=val('rn')};
   $('#addd').onclick=()=>{const n=val('dn');if(!n)return toast('اكتب اسم الدواء');keep();x.items.push({n,f:val('df'),u:val('du')});
     if(!drugs().some(d=>d.n===n)&&isDoc()){const list=[...drugs(),{n,f:val('df'),u:val('du')}];S.clinic.drugs=list;D.update(clinicPath(),{drugs:list})}draw()};
   $$('[data-rm]').forEach(b=>b.onclick=()=>{keep();x.items.splice(+b.dataset.rm,1);draw()});
   const save=()=>{keep();const o={patientId:p.id,date:x.date,dx:x.dx,items:x.items,note:x.note,updatedAt:Date.now()};if(r){D.update(C('rx/'+r.id),o);return r.id}o.createdAt=Date.now();const id=D.add(C('rx'),o);r={id,...o};return id};
   $('#rs').onclick=()=>{if(!x.items.length&&!val('rn'))return toast('الروشتة فاضية');save();closeSheet();toast('اتحفظت');render()};
   $('#rp').onclick=async()=>{save();const b=await htmlToPdf(rxHtml(p,x));shareBlob(b,`Rx-${p.fileNo||''}-${x.date}.pdf`,'application/pdf')};
   $('#rw').onclick=async()=>{save();toast('جاري تجهيز الروشتة…');const b=await htmlToPdf(rxHtml(p,x));await shareBlob(b,`Rx-${p.fileNo||''}-${x.date}.pdf`,'application/pdf');};
   const dl=$('#rdel');if(dl)confirmBtn(dl,()=>{D.del(C('rx/'+r.id));closeSheet();render()})};draw()}
async function viewRxScan(p,r){const img=await getBlob(r.blob);sheet(`<b>روشتة سكان – ${fmt(r.date)}</b>
  ${img?`<img src="${img}" style="width:100%;border-radius:10px;margin-top:8px" id="rimg">`:'<div class="empty">الصورة مش متاحة</div>'}
  <label class="f" style="margin-top:10px">النص المستخرج / الأدوية<textarea class="in ltr" id="ro" style="min-height:120px">${esc(r.ocr||'')}</textarea></label>
  <div class="row" style="margin-top:8px"><button class="btn primary" id="rsv">حفظ النص</button><button class="btn" id="rocr">قراءة النص تلقائياً</button>${img?'<button class="btn" id="rsh">مشاركة</button>':''}<button class="btn danger" id="rdel">حذف</button></div><p class="fine" id="rst"></p>`);
  $('#rsv').onclick=()=>{D.update(C('rx/'+r.id),{ocr:val('ro')});closeSheet();toast('اتحفظ')};
  $('#rocr').onclick=async()=>{if(!img)return;const t=await runOCR(img,$('#rst'));if(t)$('#ro').value=t};
  const sh=$('#rsh');if(sh)sh.onclick=()=>shareDataUrl(img,`Rx-${p.fileNo||''}-${r.date}.jpg`,'image/jpeg');
  const im=$('#rimg');if(im)im.onclick=()=>viewer(img,'روشتة');
  confirmBtn($('#rdel'),()=>{delBlob(r.blob);D.del(C('rx/'+r.id));closeSheet();render()})}
/* قراءة النص من الصورة على الجهاز (Tesseract) — مناسبة للروشتات المطبوعة، الخط اليدوي غالباً لن يُقرأ */
let tessP=null;
function loadTess(){return tessP||(tessP=new Promise((res,rej)=>{if(window.Tesseract)return res();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=res;s.onerror=()=>{tessP=null;rej(new Error('net'))};document.head.appendChild(s)}))}
async function runOCR(img,stEl){const st=m=>{if(stEl)stEl.textContent=m};
  try{st('جاري تحميل قارئ النصوص (مرة واحدة)…');await loadTess();
    const w=await Tesseract.createWorker(['eng','ara'],1,{logger:m=>{if(m.status==='recognizing text')st('جاري القراءة… '+Math.round(m.progress*100)+'%');else if(/load/.test(m.status))st('جاري تحميل اللغة… '+Math.round((m.progress||0)*100)+'%')}});
    const r=await w.recognize(img);await w.terminate();st('تمت القراءة – راجع النص وعدّله');return (r.data.text||'').replace(/\n{3,}/g,'\n\n').trim()}
  catch(e){console.error(e);st('القراءة التلقائية تحتاج إنترنت في أول مرة. تقدر تكتب الأدوية يدوياً.');return''}}
