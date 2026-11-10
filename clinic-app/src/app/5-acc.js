
/* ================= الحسابات ================= */
const clinicPath=()=>S.mode==='local'?'clinics/local':'clinics/'+S.cid;
function addTx(o){const id=D.add(C('tx'),{at:Date.now(),by:S.name||S.email,...o});if(o.patientId)setTimeout(()=>recomputeBalance(o.patientId),300);return id}
async function balanceOf(pid){const t=await D.list(C('tx'),[['patientId','==',pid]]);return t.reduce((s,x)=>s+(x.kind==='charge'?+x.amount:x.kind==='pay'?-x.amount:0),0)}
async function recomputeBalance(pid){const b=await balanceOf(pid);D.update(C('patients/'+pid),{balance:Math.round(b*100)/100})}
async function tAcc(p){const t=(await D.list(C('tx'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.at||0)-(a.at||0));
  const ch=t.filter(x=>x.kind==='charge').reduce((s,x)=>s+ +x.amount,0),pd=t.filter(x=>x.kind==='pay').reduce((s,x)=>s+ +x.amount,0);
  $('#tab').innerHTML=`<div class="stats"><div class="stat"><div class="k">المطلوب</div><div class="v sm money">${money(ch)}</div></div><div class="stat"><div class="k">المدفوع</div><div class="v sm money pos">${money(pd)}</div></div><div class="stat"><div class="k">المتبقي</div><div class="v sm money ${ch-pd>0?'neg':''}">${money(ch-pd)}</div></div></div>
   <div class="row" style="margin-top:10px"><button class="btn primary" id="ap">دفعة</button><button class="btn" id="ac">مطلوب جديد (عملية / خدمة)</button>${ch-pd>0&&p.phone?`<button class="btn wa" id="aw">${I.wa}تذكير بالمتبقي</button>`:''}</div>
   <div class="list" style="margin-top:10px">${t.map(x=>`<div class="item"><span class="m"><span class="t">${x.kind==='pay'?'دفعة'+(x.method?' – '+(PMN[x.method]||''):''):esc(x.note||VTN[x.cat]||'مطلوب')}</span><span class="s">${fmt(x.date)}${x.by?' · '+esc(x.by):''}</span></span><span class="money ${x.kind==='pay'?'pos':''}">${x.kind==='pay'?'−':'+'}${money(x.amount)}</span>${isDoc()?`<button class="btn sm danger" data-del="${x.id}">✕</button>`:''}</div>`).join('')||'<div class="empty">لا توجد حسابات</div>'}</div>`;
  $('#ap').onclick=()=>txSheet({kind:'pay',p,suggest:Math.max(0,ch-pd)});$('#ac').onclick=()=>txSheet({kind:'charge',p});
  const aw=$('#aw');if(aw)aw.onclick=()=>wa(p.phone,fillTpl(waTpl('dues'),tplVars(p,{'المبلغ':money(ch-pd)})));
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{D.del(C('tx/'+b.dataset.del));setTimeout(()=>{recomputeBalance(p.id);render()},300)},'حذف؟'))}
function txSheet({kind,p=null,suggest=''}){const T={pay:'تسجيل دفعة',charge:'مطلوب جديد',exp:'مصروف جديد',inc:'إيراد آخر'}[kind];
  sheet(`<b>${T}${p?' – '+esc(p.name):''}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">المبلغ<input class="in num" type="number" inputmode="decimal" id="xa" value="${suggest||''}"></label><label class="f">التاريخ<input class="in num" type="date" id="xd" value="${today()}"></label></div>
   ${kind==='exp'?`<label class="f">البند<select class="in" id="xc">${opts(EXPC,'supply')}</select></label>`:''}
   ${kind==='charge'?`<label class="f">النوع<select class="in" id="xc">${opts([['surgery','عملية'],...VT],'surgery')}</select></label>`:''}
   ${kind==='pay'||kind==='inc'||kind==='exp'?`<div class="chips" id="xm">${PM.map(([k,l],i)=>`<button class="chip ${i===0?'on':''}" data-v="${k}">${l}</button>`).join('')}</div>`:''}
   <label class="f">البيان<input class="in" id="xn" placeholder="${kind==='exp'?'مثلاً: إيجار شهر نوفمبر':kind==='charge'?'مثلاً: عملية رباط صليبي':''}"></label>
   <div class="row"><button class="btn primary" id="xs">حفظ</button><button class="btn" data-close>إلغاء</button></div></div>`);
  let pm='cash';$$('#xm .chip').forEach(b=>b.onclick=()=>{pm=b.dataset.v;$$('#xm .chip').forEach(x=>x.classList.toggle('on',x===b))});
  $('#xs').onclick=()=>{const a=+val('xa');if(!(a>0))return toast('اكتب المبلغ');const o={kind:kind==='inc'?'pay':kind,amount:a,date:$('#xd').value,note:val('xn'),method:kind==='charge'?null:pm,cat:$('#xc')?$('#xc').value:(kind==='inc'?'other':null)};
    if(p){o.patientId=p.id;o.name=p.name}addTx(o);closeSheet();toast('اتسجل');setTimeout(render,350)}}
async function vAccounts(){if(!isDoc()){shell('الحسابات','<div class="empty">الحسابات متاحة للطبيب فقط</div>');return}
  const q=qs();const per=q.per||'month';const t=today();let from,to=t;
  if(per==='day'){from=q.d||t;to=from}else if(per==='month'){const m=q.m||t.slice(0,7);from=m+'-01';const d=new Date(from+'T12:00:00');d.setMonth(d.getMonth()+1);d.setDate(0);to=iso(d)}else if(per==='year'){const y=q.y||t.slice(0,4);from=y+'-01-01';to=y+'-12-31'}else{from=q.from||addDays(t,-30);to=q.to||t}
  const tx=await D.list(C('tx'),[['date','>=',from],['date','<=',to]]);
  const pays=tx.filter(x=>x.kind==='pay'),exps=tx.filter(x=>x.kind==='exp');const inc=pays.reduce((s,x)=>s+ +x.amount,0),out=exps.reduce((s,x)=>s+ +x.amount,0);
  const byCat={};pays.forEach(x=>{const k=x.cat==='surgery'?'عمليات':VTN[x.cat]||(x.cat==='other'?'إيرادات أخرى':'دفعات');byCat[k]=(byCat[k]||0)+ +x.amount});
  const byM={};pays.forEach(x=>{const k=PMN[x.method]||'غير محدد';byM[k]=(byM[k]||0)+ +x.amount});
  const byE={};exps.forEach(x=>{const k=EXPN[x.cat]||'أخرى';byE[k]=(byE[k]||0)+ +x.amount});
  const bars=o=>{const mx=Math.max(1,...Object.values(o));return`<div class="bars">${Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="b"><span>${esc(k)}</span><span class="bar"><i style="width:${v/mx*100}%"></i></span><span class="money" style="text-align:end">${money(v)}</span></div>`).join('')||'<span class="fine">لا يوجد</span>'}</div>`};
  const owing=S.patients.filter(p=>p.balance>0).sort((a,b)=>b.balance-a.balance);
  const visits=S.appts.length;
  const ml=q.m||t.slice(0,7);const mPrev=(()=>{const d=new Date(ml+'-15T12:00:00');d.setMonth(d.getMonth()-1);return iso(d).slice(0,7)})(),mNext=(()=>{const d=new Date(ml+'-15T12:00:00');d.setMonth(d.getMonth()+1);return iso(d).slice(0,7)})();
  shell('الحسابات',`<div class="seg">${[['day','اليوم'],['month','الشهر'],['year','السنة'],['range','فترة']].map(([k,l])=>`<button data-per="${k}" class="${per===k?'on':''}">${l}</button>`).join('')}</div>
   <div class="row" style="margin:10px 0;justify-content:space-between">${per==='month'?`<a class="btn sm" href="#/acc?per=month&m=${mPrev}">‹</a><b>${new Date(from+'T12:00:00').toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</b><a class="btn sm" href="#/acc?per=month&m=${mNext}">›</a>`:
     per==='day'?`<input type="date" class="in num" id="pd" value="${from}" style="max-width:200px">`:per==='year'?`<a class="btn sm" href="#/acc?per=year&y=${+from.slice(0,4)-1}">‹</a><b class="num">${from.slice(0,4)}</b><a class="btn sm" href="#/acc?per=year&y=${+from.slice(0,4)+1}">›</a>`:
     `<input type="date" class="in num" id="pf" value="${from}" style="max-width:160px"> إلى <input type="date" class="in num" id="pt" value="${to}" style="max-width:160px">`}</div>
   <div class="stats"><div class="stat"><div class="k">الإيرادات</div><div class="v sm money pos">${money(inc)}</div></div><div class="stat"><div class="k">المصروفات</div><div class="v sm money neg">${money(out)}</div></div><div class="stat"><div class="k">الصافي</div><div class="v sm money">${money(inc-out)}</div></div><div class="stat"><div class="k">عدد الدفعات</div><div class="v sm">${pays.length}</div></div></div>
   <div class="row" style="margin-top:10px"><button class="btn primary" id="ne">مصروف</button><button class="btn" id="ni">إيراد آخر</button><button class="btn" id="csv">تصدير Excel</button></div>
   <h3>الإيرادات حسب النوع</h3>${bars(byCat)}<h3>طريقة الدفع</h3>${bars(byM)}<h3>المصروفات</h3>${bars(byE)}
   <h3>مستحقات على المرضى (${owing.length}) – <span class="money">${money(owing.reduce((s,p)=>s+p.balance,0))}</span></h3><div class="list">${owing.slice(0,30).map(p=>pItem(p,`<span class="money neg">${money(p.balance)}</span>`,'#/p/'+p.id+'/acc')).join('')||'<div class="empty">لا توجد مستحقات</div>'}</div>
   <h3>الحركات</h3><div class="list">${[...tx].filter(x=>x.kind!=='charge').sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.at||0)-(a.at||0)).slice(0,100).map(x=>`<div class="item"><span class="m"><span class="t">${x.kind==='exp'?esc(EXPN[x.cat]||'مصروف'):esc(x.name||'إيراد')}</span><span class="s">${fmt(x.date)} · ${esc(x.note||VTN[x.cat]||'')}${x.method?' · '+(PMN[x.method]||''):''}</span></span><span class="money ${x.kind==='exp'?'neg':'pos'}">${x.kind==='exp'?'−':'+'}${money(x.amount)}</span><button class="btn sm danger" data-del="${x.id}" data-p="${x.patientId||''}">✕</button></div>`).join('')||'<div class="empty">لا توجد حركات</div>'}</div>`);
  $$('[data-per]').forEach(b=>b.onclick=()=>location.hash='#/acc?per='+b.dataset.per);
  const pdI=$('#pd');if(pdI)pdI.onchange=e=>location.hash='#/acc?per=day&d='+e.target.value;
  const pf=$('#pf');if(pf){const go=()=>location.hash=`#/acc?per=range&from=${$('#pf').value}&to=${$('#pt').value}`;pf.onchange=go;$('#pt').onchange=go}
  $('#ne').onclick=()=>txSheet({kind:'exp'});$('#ni').onclick=()=>txSheet({kind:'inc'});
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{D.del(C('tx/'+b.dataset.del));if(b.dataset.p)setTimeout(()=>recomputeBalance(b.dataset.p),300);setTimeout(render,350)},'حذف؟'));
  $('#csv').onclick=()=>{const rows=[['التاريخ','النوع','المريض','البند','البيان','طريقة الدفع','المبلغ']];
    [...tx].sort((a,b)=>(a.date||'').localeCompare(b.date||'')).forEach(x=>rows.push([x.date,{pay:'إيراد',exp:'مصروف',charge:'مطلوب'}[x.kind],x.name||'',x.kind==='exp'?EXPN[x.cat]||'':x.cat==='surgery'?'عملية':VTN[x.cat]||'',x.note||'',PMN[x.method]||'',x.amount]));
    const csv='﻿'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');shareBlob(new Blob([csv],{type:'text/csv'}),`clinic-accounts-${from}-${to}.csv`,'text/csv')}}

/* ================= المزيد والإعدادات ================= */
function vMore(){const c=CL();shell('المزيد',`<div class="card"><b>${esc(c.name||'العيادة')}</b><div class="fine">${esc(c.doctor||'')} · ${S.mode==='local'?'البيانات على هذا الجهاز فقط':'متصل بقاعدة بيانات العيادة – '+esc(S.email)+' ('+(isDoc()?'طبيب':'مساعد')+')'}</div></div>
  <div class="list" style="margin-top:12px">
   ${isDoc()?`<a class="item" href="#/more/clinic"><span class="m"><span class="t">بيانات العيادة ومواعيد العمل</span><span class="s">الاسم، العنوان، الأيام والساعات، مدة الكشف</span></span></a>
   <a class="item" href="#/more/fees"><span class="m"><span class="t">الأسعار</span><span class="s">الكشف، الاستشارة، الغيار…</span></span></a>
   <a class="item" href="#/more/wa"><span class="m"><span class="t">رسائل الواتساب</span><span class="s">التأكيد، التذكير، المتابعة</span></span></a>
   <a class="item" href="#/more/drugs"><span class="m"><span class="t">الأدوية المفضلة</span><span class="s">${drugs().length} دواء</span></span></a>`:''}
   ${S.mode==='cloud'&&isDoc()?`<a class="item" href="#/more/team"><span class="m"><span class="t">الفريق</span><span class="s">إضافة السكرتارية والمساعدين</span></span></a><a class="item" href="#/more/code"><span class="m"><span class="t">كود إعداد العيادة</span><span class="s">لتشغيل التطبيق على جهاز المساعد</span></span></a>`:''}
   ${S.mode==='local'?`<a class="item" href="#/more/connect"><span class="m"><span class="t">ربط قاعدة بيانات العيادة</span><span class="s">عشان الطبيب والسكرتارية يشتغلوا على نفس البيانات من أكتر من جهاز</span></span></a>`:''}
   <a class="item" href="#/more/backup"><span class="m"><span class="t">نسخة احتياطية</span><span class="s">حفظ واسترجاع كل البيانات</span></span></a>
   <a class="item" href="#/more/booklink"><span class="m"><span class="t">رابط حجز للمرضى على الواتساب</span><span class="s">حطه على فيسبوك وإنستجرام</span></span></a>
   ${S.mode==='cloud'?'<button class="item" id="out"><span class="m"><span class="t" style="color:var(--bad)">تسجيل خروج</span></span></button>':''}
  </div><p class="fine" style="margin-top:14px">العيادة – الإصدار ٢٫٠</p>`);
  const o=$('#out');if(o)o.onclick=()=>FB.signOut(auth)}
function saveClinic(o){Object.assign(S.clinic,o);D.update(clinicPath(),o);toast('اتحفظ')}
function vMoreSub(k){const c=CL();
  if(k==='clinic'){const days=c.days||[6,0,1,2,3,4];const DN=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    shell('بيانات العيادة',`<div class="form"><label class="f">اسم العيادة<input class="in" id="name" value="${esc(c.name||'')}"></label><label class="f">اسم الطبيب (يظهر في الروشتة والرسائل)<input class="in" id="doctor" value="${esc(c.doctor||'')}"></label>
     <label class="f">التخصص / اللقب<input class="in" id="title" value="${esc(c.title||'استشاري جراحة العظام والمناظير')}"></label>
     <label class="f">العنوان<input class="in" id="address" value="${esc(c.address||'')}"></label><div class="grid2"><label class="f">تليفون العيادة<input class="in num" id="phone" value="${esc(c.phone||'')}"></label><label class="f">رقم واتساب العيادة<input class="in num" id="waNo" value="${esc(c.waNo||'')}"></label></div>
     <b>أيام العمل</b><div class="chips" id="days">${[6,0,1,2,3,4,5].map(d=>`<button class="chip ${days.includes(d)?'on':''}" data-d="${d}">${DN[d]}</button>`).join('')}</div>
     <div class="grid2"><label class="f">من الساعة<input class="in num" type="time" id="from" value="${c.from||'15:00'}"></label><label class="f">إلى الساعة<input class="in num" type="time" id="to" value="${c.to||'22:00'}"></label></div>
     <label class="f">مدة الموعد (دقيقة)<select class="in" id="slot">${opts([['10','١٠'],['15','١٥'],['20','٢٠'],['30','٣٠']],String(c.slot||15))}</select></label>
     <button class="btn primary" id="sv">حفظ</button></div>`,{back:true});
    $$('#days .chip').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
    $('#sv').onclick=()=>{const o={};['name','doctor','title','address','phone','waNo','from','to'].forEach(x=>o[x]=val(x));o.slot=+val('slot');o.days=$$('#days .chip.on').map(b=>+b.dataset.d);saveClinic(o);history.back()};return}
  if(k==='fees'){const f=fees();shell('الأسعار',`<div class="form">${VT.map(([k2,l])=>`<label class="f">${l}<input class="in num" type="number" inputmode="decimal" data-fee="${k2}" value="${f[k2]||0}"></label>`).join('')}<button class="btn primary" id="sv">حفظ</button></div>`,{back:true});
    $('#sv').onclick=()=>{const o={};$$('[data-fee]').forEach(i=>o[i.dataset.fee]=+i.value||0);saveClinic({fees:o});history.back()};return}
  if(k==='wa'){const L={confirm:'تأكيد الحجز',remind:'تذكير قبل الموعد',follow:'تذكير بالمتابعة (عمليات وكسور)',after:'متابعة بعد الكشف',dues:'تذكير بالمتبقي'};
    shell('رسائل الواتساب',`<p class="fine">الكلمات بين { } بتتغير تلقائياً: {الاسم} {التاريخ} {الوقت} {الطبيب} {العنوان} {المتابعة} {الحالة} {المبلغ}</p><div class="form">${Object.keys(WA_DEF).map(x=>`<label class="f">${L[x]}<textarea class="in" data-wa="${x}" style="min-height:110px">${esc(waTpl(x))}</textarea></label>`).join('')}
     <div class="row"><button class="btn primary" id="sv">حفظ</button><button class="btn" id="rs">استرجاع الرسائل الأصلية</button></div></div>`,{back:true});
    $('#sv').onclick=()=>{const o={};$$('[data-wa]').forEach(t=>o[t.dataset.wa]=t.value);saveClinic({wa:o});history.back()};$('#rs').onclick=()=>{saveClinic({wa:{}});render()};return}
  if(k==='drugs'){const list=drugs();shell('الأدوية المفضلة',`<p class="fine">بتظهر كاقتراحات وأنت بتكتب الروشتة. أي دواء جديد بتكتبه بيتضاف هنا تلقائياً.</p>
     <div class="list">${list.map((d,i)=>`<div class="drug"><span class="dn">${esc(d.n)}</span><button class="btn sm danger" data-rm="${i}">✕</button><span class="dd">${esc([d.f,d.u].filter(Boolean).join(' – '))}</span></div>`).join('')}</div>
     <div class="card form" style="margin-top:10px"><label class="f">الدواء<input class="in ltr" id="dn"></label><label class="f">الجرعة<input class="in" id="df"></label><label class="f">المدة<input class="in" id="du"></label><button class="btn primary" id="add">إضافة</button></div>`,{back:true});
    $$('[data-rm]').forEach(b=>b.onclick=()=>{list.splice(+b.dataset.rm,1);saveClinic({drugs:[...list]});render()});
    $('#add').onclick=()=>{if(!val('dn'))return;saveClinic({drugs:[...list,{n:val('dn'),f:val('df'),u:val('du')}]});render()};return}
  if(k==='team')return vTeam();if(k==='code')return vSetupCode();if(k==='backup')return vBackup();
  if(k==='connect'){shell('ربط قاعدة بيانات العيادة',`<p>عشان الطبيب والسكرتارية يشتغلوا على نفس المواعيد وملفات المرضى من أكتر من جهاز (موبايل، كمبيوتر الاستقبال)، محتاج قاعدة بيانات Firebase مجانية:</p>
     <ol style="line-height:2"><li>ادخل <span class="ltr">console.firebase.google.com</span> ← Add project.</li><li>Authentication ← Email/Password ← Enable.</li><li>Firestore Database ← Create database ← Production.</li><li>Firestore ← Rules: الصق القواعد من ملف <span class="ltr">firestore.rules</span>.</li><li>Project settings ← Your apps ← Web ← انسخ <span class="ltr">firebaseConfig</span> والصقه هنا.</li></ol>
     <textarea class="in ltr" id="cfg" placeholder="const firebaseConfig = { apiKey: … }"></textarea><button class="btn primary" id="go" style="margin-top:8px">ربط</button>
     <p class="fine">بعد الربط هتعمل حساب بالإيميل وتنشئ العيادة، وبعدها تقدر ترفع بياناتك الحالية من "نسخة احتياطية ← استرجاع".</p>`,{back:true});
    $('#go').onclick=()=>{const cf=parseCfg($('#cfg').value);if(!cf)return toast('الإعدادات غير صحيحة');try{localStorage.setItem('fbconfig',JSON.stringify(cf));localStorage.removeItem('mode')}catch{}location.reload()};return}
  if(k==='booklink'){const n=waPhone(c.waNo||c.phone);const link=n?`https://wa.me/${n}?text=${encodeURIComponent('السلام عليكم، أريد حجز موعد في عيادة '+(c.doctor||''))}`:'';
    shell('رابط الحجز',n?`<p>المريض يضغط على الرابط، يفتح الواتساب على رقم العيادة برسالة حجز جاهزة، والسكرتارية تحجزله من التطبيق وتبعتله التأكيد.</p><textarea class="in ltr" readonly id="lk" style="min-height:90px">${link}</textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cp">نسخ</button><button class="btn" id="sh">مشاركة</button></div>
      <p class="fine">الحجز الآلي الكامل من غير سكرتارية (بوت واتساب يرد ويحجز لوحده) يحتاج WhatsApp Business API وسيرفر، وده بيتكلف اشتراك شهري من Meta.</p>`:'<div class="empty">اكتب رقم واتساب العيادة الأول من بيانات العيادة</div>',{back:true});
    if(n){$('#cp').onclick=()=>navigator.clipboard.writeText(link).then(()=>toast('اتنسخ'));$('#sh').onclick=()=>shareText(link)}return}
  vMore()}
async function vTeam(){const mem=await D.list(C('members'));shell('الفريق',`<div class="list">${mem.map(m=>`<div class="item"><span class="m"><span class="t">${esc(m.name||m.id)}</span><span class="s ltr">${esc(m.id)}</span></span><span class="tag ${m.role==='doctor'?'ok':'mut'}">${m.role==='doctor'?'طبيب':'مساعد'}</span>${m.id!==S.email?`<button class="btn sm danger" data-rm="${esc(m.id)}">إزالة</button>`:''}</div>`).join('')}</div>
  <h3>إضافة عضو</h3><div class="form"><label class="f">الاسم<input class="in" id="nm"></label><label class="f">البريد الإلكتروني (هيعمل حساب بيه)<input class="in ltr" type="email" id="em"></label>
  <label class="f">الصلاحية<select class="in" id="rl"><option value="assistant">مساعد / سكرتارية: الحجز، تسجيل المرضى، التحصيل، السكان</option><option value="doctor">طبيب: كل شيء بما فيه الزيارات والروشتات والحسابات</option></select></label><button class="btn primary" id="add">إضافة</button></div>`,{back:true});
  $('#add').onclick=()=>{const e=val('em').toLowerCase();if(!e.includes('@'))return toast('اكتب البريد');D.set(C('members/'+e),{role:$('#rl').value,name:val('nm'),email:e});D.set('memberships/'+e,{clinicId:S.cid,role:$('#rl').value});toast('اتضاف. يقدر يعمل حساب بـ '+e);setTimeout(vTeam,400)};
  $$('[data-rm]').forEach(b=>confirmBtn(b,()=>{D.del(C('members/'+b.dataset.rm));D.del('memberships/'+b.dataset.rm);setTimeout(vTeam,300)}))}
function vSetupCode(){const code=btoa(unescape(encodeURIComponent(JSON.stringify(getConfig()))));shell('كود إعداد العيادة',`<p>على جهاز المساعد: نزّل التطبيق، الصق الكود ده في أول شاشة، وبعدين سجّل دخول.</p><textarea class="in ltr" readonly id="code" style="min-height:140px;font-family:var(--f-num);font-size:12px">${code}</textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cp">نسخ</button><button class="btn wa" id="sh">${I.wa}إرسال</button></div>`,{back:true});
  $('#cp').onclick=()=>navigator.clipboard.writeText(code).then(()=>toast('اتنسخ')).catch(()=>$('#code').select());$('#sh').onclick=()=>shareText(code)}
const COLS=['patients','appointments','visits','rx','files','voices','cases','tx','blobs'];
async function vBackup(){shell('نسخة احتياطية',`<p>بيحفظ كل البيانات (المرضى، المواعيد، الزيارات، الروشتات، الأشعة، الملاحظات الصوتية، المتابعات، الحسابات) في ملف واحد تحتفظ بيه على جوجل درايف أو الكمبيوتر.</p>
  <button class="btn primary" id="go">حفظ نسخة احتياطية</button><p class="fine" id="st"></p>
  <h3>استرجاع</h3><p class="fine">يضيف البيانات من ملف نسخة احتياطية (مفيد لنقل البيانات من جهاز لجهاز أو بعد ربط قاعدة البيانات).</p><button class="btn" id="rs">اختيار ملف واسترجاعه</button><p class="fine" id="st2"></p>`,{back:true});
  $('#go').onclick=async()=>{$('#st').textContent='جاري التجميع…';const out={app:'clinic-ar',exportedAt:new Date().toISOString(),clinic:S.clinic};for(const c of COLS)out[c]=await D.list(C(c));
    $('#st').textContent=`${out.patients.length} مريض، ${out.appointments.length} موعد، ${out.files.length} ملف.`;await shareBlob(new Blob([JSON.stringify(out)],{type:'application/json'}),`clinic-backup-${today()}.json`,'application/json')};
  $('#rs').onclick=async()=>{const [f]=await pickFile('application/json,.json');if(!f)return;try{const j=JSON.parse(await f.text());let n=0;
    if(j.clinic&&isDoc())saveClinic(Object.fromEntries(Object.entries(j.clinic).filter(([k])=>!['ownerUid','createdAt'].includes(k))));
    for(const c of COLS)for(const d of (j[c]||[])){const {id,...rest}=d;await D.set(C(c+'/'+id),rest);n++;if(n%50===0)$('#st2').textContent='جاري الاسترجاع… '+n}
    $('#st2').textContent=`تم استرجاع ${n} سجل`;toast('تم الاسترجاع')}catch(e){console.error(e);toast('الملف غير صالح')}}}

/* ================= الطباعة والمشاركة ================= */
function letterhead(){const c=CL();return`<div class="lh"><div><b style="font-size:20px">${esc(c.doctor||'')}</b><div>${esc(c.title||'')}</div></div><div style="text-align:left"><b>${esc(c.name||'')}</b><div>${esc(c.address||'')}</div><div class="num">${esc(c.phone||'')}</div></div></div>`}
function rxHtml(p,x){const age=ageOf(p);return`<div class="page">${letterhead()}
  <div class="pt"><span><b>الاسم:</b> ${esc(p.name)}</span>${age!=null?`<span><b>السن:</b> ${age}</span>`:''}<span><b>التاريخ:</b> ${fmt(x.date)}</span>${x.dx?`<span><b>التشخيص:</b> ${esc(x.dx)}</span>`:''}</div>
  <div class="rx" style="direction:ltr;text-align:left">℞</div>
  <ol class="rxl">${(x.items||[]).map((it,i)=>`<li><b>${i+1}.  ${esc(it.n)}</b><span class="s">${esc([it.f,it.u].filter(Boolean).join(' – '))}</span></li>`).join('')}</ol>
  ${x.note?`<h4>تعليمات</h4><div class="rtl">${esc(x.note).replace(/\n/g,'<br>')}</div>`:''}
  <div class="sig"><span>التوقيع: ____________</span><span>${esc(CL().doctor||'')}</span></div>
  <div class="foot">${esc(CL().name||'')} · ${esc(CL().phone||'')}</div></div>`}
async function htmlToPdf(html){const root=$('#printRoot');root.innerHTML=html;await document.fonts.ready;const el=root.firstElementChild;
  const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff',useCORS:true});root.innerHTML='';
  const pdf=new jsPDF({unit:'pt',format:'a4'});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
  const pxPerPage=Math.floor(canvas.width*ph/pw);let y=0,first=true;
  while(y<canvas.height){const h=Math.min(pxPerPage,canvas.height-y);const c=document.createElement('canvas');c.width=canvas.width;c.height=h;c.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
    if(!first)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,pw,h*pw/canvas.width);first=false;y+=h}
  return pdf.output('blob')}
async function blobToB64(b){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(b)})}
async function shareBlob(blob,name,type){
  if(isNative&&window.Capacitor.Plugins.Filesystem){try{const {Filesystem,Share}=window.Capacitor.Plugins;const w=await Filesystem.writeFile({path:name.replace(/[\\/:*?"<>|]/g,'-'),data:await blobToB64(blob),directory:'CACHE'});await Share.share({title:name,files:[w.uri]});return}catch(e){if(String(e).includes('cancel'))return;console.error(e)}}
  const file=new File([blob],name,{type});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('اتحفظ '+name)}
async function shareDataUrl(d,name,type){const b=await (await fetch(d)).blob();shareBlob(b,name,type)}
async function shareText(t){if(isNative&&window.Capacitor.Plugins.Share)return window.Capacitor.Plugins.Share.share({text:t});if(navigator.share)return navigator.share({text:t}).catch(()=>{});navigator.clipboard.writeText(t).then(()=>toast('اتنسخ'))}

/* ================= بيانات تجريبية ================= */
async function seedDemoLocal(){D=LocalDB;S.cid='local';const t=today();
  await D.set('clinics/local',{name:'عيادة الركبة والكتف',doctor:'د. السيد الفرس',title:'استشاري جراحة العظام والمناظير',address:'طنطا – شارع البحر',phone:'0100 000 0000',waNo:'01000000000',from:'15:00',to:'22:00',slot:15,days:[6,0,1,2,3,4],createdAt:Date.now()});
  const P=[['أحمد محمود السيد','01012345678',1988,'m','مهندس'],['منى عبد الله','01123456789',1965,'f','ربة منزل'],['محمد علي حسن','01234567890',2001,'m','طالب – لاعب كرة'],['سعاد إبراهيم','01098765432',1952,'f','على المعاش'],['يوسف خالد','01555555555',2014,'m','تلميذ']];
  const ids=[];for(let i=0;i<P.length;i++){const [name,phone,by,sex,job]=P[i];const id='p'+i;ids.push(id);await D.set(`clinics/local/patients/${id}`,{name,phone,birthYear:by,sex,job,fileNo:String(i+1),createdAt:Date.now()-i*1e8,updatedAt:Date.now()-i*1e6,history:i===3?'ضغط وسكر – حساسية من البنسلين':''})}
  const A=[[0,'15:00','kashf','arrived',1],[1,'15:15','reexam','booked'],[2,'15:30','fu','booked'],[3,'16:00','dress','booked']];
  for(const [pi,tm,ty,st,q] of A)await D.set(`clinics/local/appointments/a${pi}`,{patientId:ids[pi],name:P[pi][0],phone:P[pi][1],date:t,time:tm,type:ty,status:st,queue:q||null,createdAt:Date.now()});
  await D.set('clinics/local/appointments/a9',{patientId:ids[4],name:P[4][0],phone:P[4][1],date:addDays(t,1),time:'15:00',type:'fu',status:'booked',createdAt:Date.now()});
  const mk=(kind,proto,date)=>PROTO[kind][proto].m.map(([d,l])=>({d,l,due:addDays(date,d),done:addDays(date,d)<addDays(t,-2)}));
  await D.set('clinics/local/cases/c1',{patientId:ids[2],name:P[2][0],phone:P[2][1],kind:'surgery',proto:'acl',title:'ACL hamstring graft',date:addDays(t,-42),side:'يمين',fee:25000,ms:mk('surgery','acl',addDays(t,-42)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/cases/c2',{patientId:ids[4],name:P[4][0],phone:P[4][1],kind:'fracture',proto:'peds',title:'كسر فوق اللقمتين – جارتلاند ٣',date:addDays(t,-21),side:'يسار',ms:mk('fracture','peds',addDays(t,-21)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/cases/c3',{patientId:ids[3],name:P[3][0],phone:P[3][1],kind:'fracture',proto:'orif',title:'كسر أسفل الكعبرة يمين',date:addDays(t,-45),side:'يمين',ms:mk('fracture','orif',addDays(t,-45)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/tx/t1',{kind:'charge',amount:25000,date:addDays(t,-42),patientId:ids[2],name:P[2][0],cat:'surgery',note:'عملية رباط صليبي',at:Date.now()});
  await D.set('clinics/local/tx/t2',{kind:'pay',amount:15000,date:addDays(t,-42),patientId:ids[2],name:P[2][0],cat:'surgery',method:'instapay',at:Date.now()});
  await D.set('clinics/local/tx/t3',{kind:'exp',amount:6000,date:t.slice(0,8)+'01',cat:'rent',note:'إيجار الشهر',method:'cash',at:Date.now()});
  await D.set('clinics/local/tx/t4',{kind:'pay',amount:300,date:t,patientId:ids[0],name:P[0][0],cat:'kashf',method:'cash',at:Date.now()});
  await D.update(`clinics/local/patients/${ids[2]}`,{balance:10000});
  await D.set('clinics/local/visits/v1',{patientId:ids[1],date:addDays(t,-14),type:'kashf',complaint:'ألم بالركبة اليمنى منذ ٦ شهور يزيد مع السلم',exam:'Medial joint line tenderness, ROM 0-120',dx:'Knee OA – medial (KL II)',plan:'تمارين تقوية، إنقاص وزن، حقن هيالورونيك',createdAt:Date.now()})}

/* ================= بدء التشغيل ================= */
boot();
if('serviceWorker' in navigator&&!isNative&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
window.__clinic={S,render,D:()=>D};
