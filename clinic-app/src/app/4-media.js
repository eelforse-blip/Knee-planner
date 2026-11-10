
/* ================= السكان: الأشعة والتحاليل والروشتات ================= */
function pickFile(accept,capture){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept=accept;if(capture)i.setAttribute('capture','environment');i.multiple=!capture;i.onchange=()=>res([...i.files]);i.click()})}
function loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src})}
function fileToDataUrl(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}
/* تحسين الصورة: أصلي / مستند (خلفية بيضاء ونص أوضح) / أشعة (تباين أعلى) */
function enhance(im,mode,rot,max=1800){const s=Math.min(1,max/Math.max(im.width,im.height));const w=Math.round(im.width*s),h=Math.round(im.height*s);
  const c=document.createElement('canvas');const r90=rot%180!==0;c.width=r90?h:w;c.height=r90?w:h;const g=c.getContext('2d');
  g.translate(c.width/2,c.height/2);g.rotate(rot*Math.PI/180);g.drawImage(im,-w/2,-h/2,w,h);g.setTransform(1,0,0,1,0,0);
  if(mode!=='orig'){const d=g.getImageData(0,0,c.width,c.height),a=d.data;const hist=new Uint32Array(256);
    for(let i=0;i<a.length;i+=4){const y=(a[i]*.299+a[i+1]*.587+a[i+2]*.114)|0;a[i]=a[i+1]=a[i+2]=y;hist[y]++}
    const n=a.length/4;let lo=0,hi=255,acc=0;const cut=mode==='doc'?.02:.005;for(;lo<255;lo++){acc+=hist[lo];if(acc>n*cut)break}acc=0;for(;hi>0;hi--){acc+=hist[hi];if(acc>n*(mode==='doc'?.25:.005))break}
    const span=Math.max(1,hi-lo);for(let i=0;i<a.length;i+=4){let v=(a[i]-lo)*255/span;if(mode==='doc')v=v>235?255:v*v/255*1.05;v=v<0?0:v>255?255:v;a[i]=a[i+1]=a[i+2]=v}
    g.putImageData(d,0,0)}return c}
function thumbOf(canvas){const s=200/Math.max(canvas.width,canvas.height);const c=document.createElement('canvas');c.width=Math.round(canvas.width*s);c.height=Math.round(canvas.height*s);c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7)}
async function scanFlow(p,{cat='xray',caseId=null}={}){
  const pages=[];let mode=cat==='xray'||cat==='mri'||cat==='ct'?'xray':'doc',rot=0,cur=null;
  const add=async(src)=>{const files=await pickFile('image/*,application/pdf',src==='cam');for(const f of files){
      if(f.type==='application/pdf'){pages.push({pdf:await fileToDataUrl(f),name:f.name});continue}
      const url=URL.createObjectURL(f);try{pages.push({im:await loadImg(url)})}catch{toast('الصورة مش مدعومة')}}draw()};
  const draw=()=>{const last=pages.length-1;
   sheet(`<b>سكان – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
    <div class="row"><button class="btn primary" id="scam">${I.cam}تصوير</button><button class="btn" id="sgal">من الصور / ملف PDF</button></div>
    ${pages.length?`<div class="scanbox" id="sprev"></div>
     <div class="seg" id="smode"><button data-m="orig" class="${mode==='orig'?'on':''}">أصلي</button><button data-m="doc" class="${mode==='doc'?'on':''}">مستند</button><button data-m="xray" class="${mode==='xray'?'on':''}">أشعة</button></div>
     <div class="row"><button class="btn sm" id="srot">↻ تدوير</button>${pages.length>1?`<span class="fine">${pages.length} صفحات</span>`:''}<button class="btn sm danger" id="sdelp">حذف الصفحة</button></div>
     <label class="f">النوع<select class="in" id="scat">${opts(FCAT,cat)}</select></label>
     <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="sdate" value="${today()}"></label><label class="f">العنوان<input class="in" id="stitle" placeholder="مثلاً: أشعة ركبة يمين وقوف"></label></div>
     <label class="f">ملاحظة / النتيجة<textarea class="in" id="snote" style="min-height:60px"></textarea></label>
     <button class="btn primary" id="ssave">حفظ في ملف المريض</button>`:'<p class="fine">صوّر الأشعة على الشاشة أو اللوح الضوئي، أو صوّر ورقة التحليل أو الروشتة. تقدر تضيف أكتر من صفحة.</p>'}</div>`);
   $('#scam').onclick=()=>add('cam');$('#sgal').onclick=()=>add('gal');
   if(!pages.length)return;const pg=pages[last];
   if(pg.pdf){$('#sprev').innerHTML=`<div style="color:#fff;padding:30px;text-align:center">📄 ${esc(pg.name||'PDF')}</div>`;$('#smode').hidden=true;$('#srot').hidden=true}
   else{cur=enhance(pg.im,mode,rot);$('#sprev').appendChild(cur)}
   $$('#smode button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;const c=$('#scat').value;cat=c;draw()});
   $('#srot').onclick=()=>{rot=(rot+90)%360;cat=$('#scat').value;draw()};
   $('#sdelp').onclick=()=>{pages.pop();draw()};
   $('#scat').onchange=e=>{cat=e.target.value};
   $('#ssave').onclick=async()=>{const b=$('#ssave');b.disabled=true;b.textContent='جاري الحفظ…';
     const outs=[];let thumb=null;for(let i=0;i<pages.length;i++){const q=pages[i];if(q.pdf){outs.push({d:q.pdf,t:'pdf'});continue}
       const c=i===last?cur:enhance(q.im,mode,0);let d=c.toDataURL('image/jpeg',.82);if(d.length>2.5e6)d=c.toDataURL('image/jpeg',.6);if(!thumb)thumb=thumbOf(c);outs.push({d,t:'img'})}
     const ids=[];for(const o of outs)ids.push(await putBlob(o.d));
     const c2=$('#scat').value;const meta={patientId:p.id,cat:c2,date:val('sdate')||today(),title:val('stitle'),note:val('snote'),pages:ids,types:outs.map(o=>o.t),thumb,caseId,createdAt:Date.now(),by:S.name||S.email};
     if(c2==='rx'){const id=D.add(C('rx'),{patientId:p.id,date:meta.date,scanned:true,blob:ids[0],thumb,ocr:'',note:meta.note,createdAt:Date.now()});closeSheet();toast('اتحفظت الروشتة');
       const r={id,blob:ids[0],date:meta.date,scanned:true,ocr:''};viewRxScan(p,r);setTimeout(()=>{const o=$('#rocr');if(o)o.click()},300)}
     else{D.add(C('files'),meta);closeSheet();toast('اتحفظ');}
     D.update(C('patients/'+p.id),{updatedAt:Date.now()});if(c2!=='rx')render()}};
  draw()}
async function tFiles(p){const fl=(await D.list(C('files'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const f0=qs().c||'';const cats=[...new Set(fl.map(f=>f.cat))];const show=f0?fl.filter(f=>f.cat===f0):fl;
  $('#tab').innerHTML=`<div class="row"><button class="btn primary" id="sc">${I.cam}سكان أشعة / تحليل</button></div>
   ${cats.length>1?`<div class="chips" style="margin-top:10px"><a class="chip ${f0?'':'on'}" href="#/p/${p.id}/files">الكل</a>${cats.map(c=>`<a class="chip ${f0===c?'on':''}" href="#/p/${p.id}/files?c=${c}">${FCATN[c]||c}</a>`).join('')}</div>`:''}
   <div class="thumbs" style="margin-top:10px">${show.map(f=>`<figure data-f="${f.id}">${f.thumb?`<img src="${f.thumb}" alt="">`:`<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:30px">📄</div>`}<figcaption><b>${esc(FCATN[f.cat]||'')}</b> · ${fmtShort(f.date)}<br>${esc(f.title||'')}${(f.pages||[]).length>1?` (${f.pages.length} صفحات)`:''}</figcaption></figure>`).join('')||'<div class="empty" style="grid-column:1/-1">لا توجد أشعة أو تحاليل</div>'}</div>`;
  $('#sc').onclick=()=>scanFlow(p,{});$$('[data-f]').forEach(el=>el.onclick=()=>openFile(p,fl.find(f=>f.id===el.dataset.f)))}
async function openFile(p,f){sheet(`<b>${esc(FCATN[f.cat]||'')} – ${fmt(f.date)}</b>${f.title?`<div>${esc(f.title)}</div>`:''}<div id="fpg" class="list" style="margin-top:8px"><span class="fine">جاري التحميل…</span></div>
  <label class="f" style="margin-top:8px">ملاحظة / النتيجة<textarea class="in" id="fn">${esc(f.note||'')}</textarea></label>
  <div class="row" style="margin-top:8px"><button class="btn primary" id="fsv">حفظ</button><button class="btn" id="fsh">مشاركة</button><button class="btn danger" id="fdel">حذف</button></div>`);
  const data=[];for(let i=0;i<(f.pages||[]).length;i++)data.push(await getBlob(f.pages[i]));
  $('#fpg').innerHTML=data.map((d,i)=>!d?'<div class="empty">الصفحة مش متاحة</div>':(f.types||[])[i]==='pdf'?`<button class="btn" data-pdf="${i}">📄 فتح ملف PDF</button>`:`<img src="${d}" data-i="${i}" style="width:100%;border-radius:10px;cursor:zoom-in">`).join('');
  $$('#fpg img').forEach(im=>im.onclick=()=>viewer(data[+im.dataset.i],FCATN[f.cat]||''));
  $$('[data-pdf]').forEach(b=>b.onclick=()=>shareDataUrl(data[+b.dataset.pdf],`file-${f.date}.pdf`,'application/pdf'));
  $('#fsv').onclick=()=>{D.update(C('files/'+f.id),{note:val('fn')});closeSheet();toast('اتحفظ')};
  $('#fsh').onclick=()=>{const d=data[0];if(d)shareDataUrl(d,`${f.cat}-${p.fileNo||''}-${f.date}.${(f.types||[])[0]==='pdf'?'pdf':'jpg'}`,(f.types||[])[0]==='pdf'?'application/pdf':'image/jpeg')};
  confirmBtn($('#fdel'),()=>{(f.pages||[]).forEach(delBlob);D.del(C('files/'+f.id));closeSheet();render()})}
function viewer(src,title){const v=document.createElement('div');v.className='viewer';v.innerHTML=`<div class="vb"><b>${esc(title||'')}</b><button class="btn sm" id="vz">تكبير</button><button class="btn sm" id="vx">إغلاق</button></div><div class="vi"><img src="${src}"></div>`;
  document.body.appendChild(v);v.querySelector('#vx').onclick=()=>v.remove();v.querySelector('#vz').onclick=()=>v.querySelector('.vi').classList.toggle('z')}

/* ================= الملاحظات الصوتية ================= */
let recState=null;
async function tVoice(p){const vs=(await D.list(C('voices'),[['patientId','==',p.id]])).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $('#tab').innerHTML=`<div class="card rec"><div class="timer" id="rt">0:00</div><button class="recbtn" id="rb">تسجيل</button><span class="fine">الملاحظة الصوتية تتحفظ في ملف المريض فقط.</span></div>
   <div class="list" style="margin-top:12px">${vs.map(v=>`<div class="card" data-v="${v.id}"><div class="row" style="justify-content:space-between"><b>${fmt(v.date)} · <span class="num">${Math.floor((v.dur||0)/60)}:${pad((v.dur||0)%60)}</span></b><span class="fine">${esc(v.by||'')}</span></div>
     <div class="pl" style="margin:8px 0"><button class="btn sm" data-play="${v.id}">▶ تشغيل</button></div>
     <textarea class="in" data-tx="${v.id}" placeholder="اكتب ملخص الملاحظة أو استخدم الإملاء" style="min-height:56px">${esc(v.text||'')}</textarea>
     <div class="row" style="margin-top:6px"><button class="btn sm" data-sv="${v.id}">حفظ النص</button><button class="btn sm" data-dc="${v.id}">${I.mic}إملاء</button><button class="btn sm danger" data-del="${v.id}">حذف</button></div></div>`).join('')||'<div class="empty">لا توجد ملاحظات صوتية</div>'}</div>`;
  $('#rb').onclick=()=>recState?stopRec():startRec(p);
  $$('[data-play]').forEach(b=>b.onclick=async()=>{const v=vs.find(x=>x.id===b.dataset.play);b.textContent='جاري التحميل…';const d=await getBlob(v.blob);if(!d){b.textContent='غير متاح';return}
    const au=document.createElement('audio');au.controls=true;au.src=d;b.replaceWith(au);au.play().catch(()=>{})});
  $$('[data-sv]').forEach(b=>b.onclick=()=>{D.update(C('voices/'+b.dataset.sv),{text:$(`[data-tx="${b.dataset.sv}"]`).value});toast('اتحفظ')});
  $$('[data-dc]').forEach(b=>b.onclick=()=>dictate($(`[data-tx="${b.dataset.dc}"]`),b));
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{const v=vs.find(x=>x.id===b.dataset.del);delBlob(v.blob);D.del(C('voices/'+v.id));render()}))}
async function startRec(p){let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch{return toast('اسمح باستخدام الميكروفون')}
  const mt=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||'';
  const rec=new MediaRecorder(stream,mt?{mimeType:mt,audioBitsPerSecond:32000}:{});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const t0=Date.now();const tick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);const el=$('#rt');if(el)el.textContent=`${Math.floor(s/60)}:${pad(s%60)}`;if(s>=900)stopRec()},300);
  rec.onstop=async()=>{clearInterval(tick);stream.getTracks().forEach(t=>t.stop());const dur=Math.round((Date.now()-t0)/1000);const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
    if(dur<1)return render();toast('جاري الحفظ…');const d=await fileToDataUrl(blob);const id=await putBlob(d);
    D.add(C('voices'),{patientId:p.id,date:today(),dur,blob:id,type:blob.type,text:'',createdAt:Date.now(),by:S.name||S.email});D.update(C('patients/'+p.id),{updatedAt:Date.now()});toast('اتحفظت الملاحظة');recState=null;render()};
  rec.start(1000);recState={rec};const b=$('#rb');b.classList.add('on');b.textContent='إيقاف'}
function stopRec(){if(recState){recState.rec.stop()}}

/* ================= متابعة العمليات والكسور ================= */
const caseName=c=>c.title||((PROTO[c.kind]||{})[c.proto]||{}).n||'';
function msState(m){if(m.done)return'done';const t=today();if(m.due<t)return'late';if(m.due<=addDays(t,3))return'due';return''}
function caseMsHtml(c,clickable){return`<div class="ms">${(c.ms||[]).map((m,i)=>{const s=msState(m);return`<div class="m1 ${s}" ${clickable?`data-ms="${i}" style="cursor:pointer"`:''}><span class="d"></span><span class="x"><b>${esc(m.l)}</b><br><span class="fine">${m.done?'تمت'+(m.doneDate?' '+fmt(m.doneDate):''):fmtDay(m.due)}${s==='late'?' – متأخرة '+diffDays(m.due,today())+' يوم':''}</span>${m.union||m.wound||m.note?`<br><span class="fine">${[m.union?'الالتئام: '+(Object.fromEntries(UNION)[m.union]||''):'',m.wound?'الجرح: '+(Object.fromEntries(WOUND)[m.wound]||''):'',m.pain!=null&&m.pain!==''?'الألم '+m.pain+'/10':'',m.note||''].filter(Boolean).map(esc).join(' · ')}</span>`:''}</span>${s==='late'?'<span class="tag bad">متأخرة</span>':s==='due'?'<span class="tag warn">مستحقة</span>':''}</div>`}).join('')}</div>`}
function fuRow({c,m,i,late}){const p=patient(c.patientId)||{name:c.name};return`<div class="item" data-fu="${c.id}" data-i="${i}" style="flex-direction:column;align-items:stretch;gap:4px">
  <div style="display:flex;gap:10px;align-items:center"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><a class="m" href="#/case/${c.id}" style="text-decoration:none;color:inherit"><span class="t">${esc(p.name)}</span><span class="s">${esc(m.l)} · ${esc(caseName(c))}</span></a><span class="tag ${late?'bad':'warn'}">${late?'متأخرة':'اليوم'} ${fmtShort(m.due)}</span></div>
  <div class="acts"><button class="btn sm wa" data-k="wa">${I.wa}تذكير بالمتابعة</button><button class="btn sm" data-k="book">حجز</button><button class="btn sm primary" data-k="rec">تسجيل المتابعة</button></div></div>`}
function bindFu(){$$('[data-fu]').forEach(el=>{const c=S.cases.find(x=>x.id===el.dataset.fu);const i=+el.dataset.i;if(!c)return;const m=c.ms[i];
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.k;const p=patient(c.patientId)||{name:c.name,phone:c.phone};
   if(k==='wa'){if(wa(p.phone,fillTpl(waTpl('follow'),tplVars(p,{'المتابعة':m.l,'الحالة':caseName(c),'التاريخ':fmtDay(m.due)})))){c.ms[i].sentAt=Date.now();D.update(C('cases/'+c.id),{ms:c.ms})}}
   else if(k==='book')bookSheet({pid:c.patientId,date:m.due<today()?today():m.due,type:'fu',note:m.l});
   else msSheet(c,i)})})}
function vFollow(){const f=qs().f||'due';const t=today();const all=dueMilestones(f==='week'?7:f==='all'?3650:0);
  const list=f==='all'?S.cases:null;
  shell('متابعة العمليات والكسور',`<div class="seg"><a href="#/fu?f=due" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='due'?'on':''}">مستحقة ومتأخرة</a><a href="#/fu?f=week" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='week'?'on':''}">خلال أسبوع</a><a href="#/fu?f=all" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='all'?'on':''}">كل الحالات</a></div>
   <div class="stats" style="margin-top:12px"><div class="stat"><div class="k">حالات مفتوحة</div><div class="v">${S.cases.length}</div></div><div class="stat"><div class="k">متأخرة</div><div class="v" style="color:var(--bad)">${dueMilestones(0).filter(x=>x.late).length}</div></div><div class="stat"><div class="k">عمليات</div><div class="v">${S.cases.filter(c=>c.kind==='surgery').length}</div></div><div class="stat"><div class="k">كسور</div><div class="v">${S.cases.filter(c=>c.kind==='fracture').length}</div></div></div>
   <div class="list" style="margin-top:12px">${list?list.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(c=>{const p=patient(c.patientId)||{name:c.name};const nx=(c.ms||[]).find(m=>!m.done);return`<a class="item" href="#/case/${c.id}"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${esc(caseName(c))} · ${fmt(c.date)}</span></span><span class="r">${nx?esc(nx.l)+'<br>'+fmtShort(nx.due):'اكتملت'}</span></a>`}).join(''):all.map(fuRow).join('')}
   ${(list?!list.length:!all.length)?'<div class="empty">مفيش متابعات هنا. ضيف عملية أو كسر من ملف المريض ← المتابعة.</div>':''}</div>`);
  $$('.seg a').forEach(a=>{if(a.classList.contains('on')){a.style.background='var(--accent)';a.style.color='var(--accent-ink)'}});bindFu()}
async function tFu(p){const cs=(await D.list(C('cases'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  $('#tab').innerHTML=`<div class="row"><button class="btn primary" id="ns">${I.plus}عملية</button><button class="btn primary" id="nf">${I.plus}كسر</button></div>
   <div class="list" style="margin-top:10px">${cs.map(c=>`<a class="item" href="#/case/${c.id}"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><span class="m"><span class="t">${esc(caseName(c))}${c.side?' – '+esc(c.side):''}</span><span class="s">${fmt(c.date)} · ${(c.ms||[]).filter(m=>m.done).length}/${(c.ms||[]).length} متابعات</span></span><span class="tag ${c.status==='open'?'warn':'ok'}">${c.status==='open'?'جارية':'منتهية'}</span></a>`).join('')||'<div class="empty">لا توجد عمليات أو كسور مسجلة</div>'}</div>`;
  $('#ns').onclick=()=>caseSheet(p,'surgery');$('#nf').onclick=()=>caseSheet(p,'fracture')}
function caseSheet(p,kind,c){const x=c||{kind,date:today(),proto:Object.keys(PROTO[kind])[0]};
  sheet(`<b>${c?'تعديل':'تسجيل'} ${kind==='fracture'?'كسر':'عملية'} – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
   <label class="f">${kind==='fracture'?'نوع العلاج':'العملية'}<select class="in" id="cp">${opts(Object.entries(PROTO[kind]).map(([k,v])=>[k,v.n]),x.proto)}</select></label>
   <label class="f">${kind==='fracture'?'الكسر (المكان والتصنيف)':'التفاصيل'}<input class="in" id="ct" value="${esc(x.title||'')}" placeholder="${kind==='fracture'?'مثلاً: كسر أسفل الكعبرة يسار':'مثلاً: ACL hamstring graft'}"></label>
   <div class="grid2"><label class="f">${kind==='fracture'?'تاريخ الإصابة / التثبيت':'تاريخ العملية'}<input class="in num" type="date" id="cd" value="${x.date}"></label><label class="f">الجهة<select class="in" id="cs">${opts([['','—'],['يمين','يمين'],['يسار','يسار'],['الجهتين','الجهتين']],x.side)}</select></label></div>
   ${kind==='surgery'?`<div class="grid2"><label class="f">المستشفى<input class="in" id="ch" value="${esc(x.hospital||'')}"></label><label class="f">تكلفة العملية<input class="in num" type="number" inputmode="decimal" id="cf" value="${esc(x.fee||'')}"></label></div>`:''}
   <label class="f">ملاحظات / المسمار أو الشريحة المستخدمة<textarea class="in" id="cn" style="min-height:60px">${esc(x.notes||'')}</textarea></label>
   <p class="fine">جدول المتابعة هيتعمل تلقائياً من تاريخ ${kind==='fracture'?'الكسر':'العملية'}، وتقدر تعدّل أي تاريخ بعدين.</p>
   <div class="row"><button class="btn primary" id="csv">حفظ</button></div></div>`);
  $('#csv').onclick=()=>{const proto=$('#cp').value,date=$('#cd').value;const tpl=PROTO[kind][proto];
    const ms=c&&c.proto===proto&&c.date===date?c.ms:tpl.m.map(([d,l])=>({d,l,due:addDays(date,d),done:false}));
    const o={patientId:p.id,name:p.name,phone:p.phone||'',kind,proto,title:val('ct'),date,side:$('#cs').value,hospital:$('#ch')?val('ch'):'',fee:$('#cf')?+val('cf')||0:0,notes:val('cn'),ms,status:c?c.status:'open',updatedAt:Date.now()};
    let id;if(c){id=c.id;D.update(C('cases/'+id),o)}else{o.createdAt=Date.now();id=D.add(C('cases'),o);
      if(o.fee>0)addTx({kind:'charge',amount:o.fee,date,patientId:p.id,name:p.name,cat:'surgery',note:'عملية: '+(o.title||tpl.n),at:Date.now(),caseId:id})}
    D.update(C('patients/'+p.id),{updatedAt:Date.now()});closeSheet();toast('اتحفظ');location.hash='#/case/'+id}}
async function vCase(id){const c0=await D.get(C('cases/'+id));if(!c0){shell('الحالة','<div class="empty">غير موجودة</div>',{back:true});return}const c={id,...c0};const p=await getPatient(c.patientId)||{name:c.name};
  const files=(await D.list(C('files'),[['patientId','==',c.patientId]])).filter(f=>f.caseId===id||f.date>=c.date).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  shell(caseName(c),`<a class="item" href="#/p/${c.patientId}"><span class="av">${esc(initials(p))}</span><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${c.kind==='fracture'?'كسر':'عملية'} · ${fmt(c.date)}${c.side?' · '+esc(c.side):''} · منذ ${Math.max(0,diffDays(c.date,today()))} يوم</span></span></a>
   ${c.title||c.notes||c.hospital?`<div class="card" style="margin-top:10px">${c.title?`<b>${esc(c.title)}</b><br>`:''}${c.hospital?'المستشفى: '+esc(c.hospital)+'<br>':''}${esc(c.notes||'')}</div>`:''}
   <h3>جدول المتابعة</h3>${caseMsHtml(c,true)}
   <div class="row" style="margin-top:10px"><button class="btn" id="addm">${I.plus}متابعة إضافية</button><button class="btn" id="cx">${I.cam}أشعة متابعة</button><button class="btn" id="ced">${I.edit}تعديل</button><button class="btn" id="cst">${c.status==='open'?'إنهاء المتابعة':'إعادة فتح'}</button></div>
   ${files.length?`<h3>الأشعة من بعد ${c.kind==='fracture'?'الكسر':'العملية'}</h3><div class="thumbs">${files.map(f=>`<figure data-f="${f.id}">${f.thumb?`<img src="${f.thumb}">`:'<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center">📄</div>'}<figcaption>${fmtShort(f.date)} · ${esc(FCATN[f.cat]||'')}</figcaption></figure>`).join('')}</div>`:''}
   ${isDoc()?'<div style="margin-top:20px"><button class="btn sm danger" id="cdel">حذف الحالة</button></div>':''}`,{back:true});
  $$('[data-ms]').forEach(el=>el.onclick=()=>msSheet(c,+el.dataset.ms));
  $('#addm').onclick=()=>{c.ms.push({d:diffDays(c.date,addDays(today(),14)),l:'متابعة',due:addDays(today(),14),done:false});D.update(C('cases/'+id),{ms:c.ms});msSheet(c,c.ms.length-1)};
  $('#cx').onclick=()=>scanFlow(p,{cat:'xray',caseId:id});$('#ced').onclick=()=>caseSheet(p,c.kind,c);
  $('#cst').onclick=()=>{D.update(C('cases/'+id),{status:c.status==='open'?'closed':'open'});setTimeout(render,200)};
  $$('[data-f]').forEach(el=>el.onclick=()=>openFile(p,files.find(f=>f.id===el.dataset.f)));
  const dl=$('#cdel');if(dl)confirmBtn(dl,()=>{D.del(C('cases/'+id));history.back()})}
function msSheet(c,i){const m=c.ms[i];const frac=c.kind==='fracture'||c.proto==='hto';
  sheet(`<b>${esc(m.l)}</b> <span class="fine">${esc(caseName(c))}</span><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">اسم المتابعة<input class="in" id="ml" value="${esc(m.l)}"></label><label class="f">الموعد<input class="in num" type="date" id="mdue" value="${m.due}"></label></div>
   <label class="tog" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mdone" ${m.done?'checked':''}> تمت المتابعة</label>
   <div class="grid2"><label class="f">تاريخ الكشف<input class="in num" type="date" id="mdd" value="${m.doneDate||today()}"></label><label class="f">الألم (٠–١٠)<input class="in num" type="number" min="0" max="10" id="mp" value="${esc(m.pain??'')}"></label></div>
   <div class="grid2"><label class="f">الجرح<select class="in" id="mw">${opts(WOUND,m.wound)}</select></label>${frac?`<label class="f">الالتئام في الأشعة<select class="in" id="mu">${opts(UNION,m.union)}</select></label>`:'<span></span>'}</div>
   <label class="f">الحركة / التحميل<input class="in" id="mr" value="${esc(m.rom||'')}" placeholder="مثلاً: ثني ١٢٠°، مشي بدون عكاز"></label>
   <label class="f">ملاحظات<textarea class="in" id="mn" style="min-height:60px">${esc(m.note||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="msv">حفظ</button><button class="btn wa" id="mwa">${I.wa}تذكير</button><button class="btn danger" id="mdel">حذف</button></div></div>`);
  const sv=()=>{const nd=$('#mdue').value;Object.assign(m,{l:val('ml')||m.l,due:nd,done:$('#mdone').checked,doneDate:$('#mdone').checked?$('#mdd').value:null,pain:val('mp'),wound:$('#mw').value,union:$('#mu')?$('#mu').value:m.union||'',rom:val('mr'),note:val('mn')});
    c.ms.sort((a,b)=>a.due.localeCompare(b.due));const allDone=c.ms.every(x=>x.done);D.update(C('cases/'+c.id),{ms:c.ms,...(allDone?{status:'closed'}:{}),updatedAt:Date.now()});closeSheet();toast(allDone?'اكتملت كل المتابعات':'اتحفظ');setTimeout(render,200)};
  $('#mdd').oninput=()=>$('#mdone').checked=true;['mp','mw','mr','mn','mu'].forEach(k=>{const e=$('#'+k);if(e)e.addEventListener('change',()=>$('#mdone').checked=true)});
  $('#msv').onclick=sv;$('#mwa').onclick=()=>{const p=patient(c.patientId)||{name:c.name,phone:c.phone};wa(p.phone,fillTpl(waTpl('follow'),tplVars(p,{'المتابعة':m.l,'الحالة':caseName(c),'التاريخ':fmtDay(m.due)})))};
  confirmBtn($('#mdel'),()=>{c.ms.splice(i,1);D.update(C('cases/'+c.id),{ms:c.ms});closeSheet();setTimeout(render,200)})}
