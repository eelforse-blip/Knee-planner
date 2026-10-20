/* ---------- patient record: identity, injury, operation, follow-up (mRUST), outcome; patient list; export ---------- */
const O_COMP=[['none','None'],['ssi','Superficial wound infection'],['deep','Deep infection'],['dvt','DVT / PE'],['loss','Loss of reduction / fixation'],['delayed','Delayed union'],['nonunion','Non-union'],['malunion','Malunion'],['hardware','Prominent / broken implant'],['nerve','Nerve injury'],['crps','CRPS'],['stiff','Stiffness'],['avn','Avascular necrosis'],['cutout','Screw cut-out'],['death','Death'],['other','Other (see notes)']];
const PROC=[['','—'],['nonop','Non-operative (cast / brace / sling)'],['crpp','Closed reduction + K-wires'],['orif','ORIF – plate and screws'],['mipo','MIPO / bridge plating'],['imn','Intramedullary nail'],['screws','Screws only / tension band'],['exfix','External fixator'],['frame','Circular frame'],['hemi','Hemiarthroplasty'],['tha','Total hip arthroplasty'],['rsa','Reverse shoulder arthroplasty'],['rhr','Radial head replacement'],['dhs','Sliding hip screw'],['cmn','Cephalomedullary nail'],['spine','Spinal fixation (± decompression)'],['vertebro','Kyphoplasty / vertebroplasty'],['fasc','Fasciotomy'],['debr','Debridement / washout'],['flap','Soft-tissue cover (flap / graft)'],['amp','Amputation'],['other','Other']];
const REC_FORM=[
 ['Patient details',[
  {p:'name',l:'Name',t:'txt'},{p:'fileNo',l:'File number',t:'txt'},{p:'phone',l:'Phone',t:'tel'},
  {p:'injDate',l:'Date of injury',t:'date'},{p:'admDate',l:'Admission / first visit',t:'date'},
  {p:'xrDate',l:'X-ray date',t:'date'},{p:'ctDate',l:'CT date',t:'date'},{p:'mriDate',l:'MRI date',t:'date'},
  {p:'assoc',l:'Associated injuries',t:'txt'},
  {p:'notes',l:'Notes',t:'area'}]],
 ['Operation',[
  {p:'op.date',l:'Date of surgery',t:'date'},{p:'op.surgeon',l:'Surgeon',t:'txt'},
  {p:'op.proc',l:'Procedure',t:'sel',o:PROC},{p:'op.proc2',l:'Additional procedure',t:'sel',o:PROC},
  {p:'op.stage',l:'Stage',t:'sel',o:[['','—'],['def','Definitive (single stage)'],['temp','Temporary / damage control'],['second','Second stage (definitive)']]},
  {p:'op.approach',l:'Approach',t:'txt'},{p:'op.implant',l:'Implants (type, size, screws)',t:'txt'},
  {p:'op.reduction',l:'Reduction',t:'sel',o:[['','—'],['anat','Anatomical'],['good','Good (within limits)'],['acc','Acceptable'],['poor','Poor']]},
  {p:'op.graft',l:'Bone graft / substitute',t:'txt'},{p:'op.tq',l:'Tourniquet time',t:'num',u:'min'},{p:'op.abx',l:'Antibiotics',t:'txt'},
  {p:'op.notes',l:'Operative notes',t:'area'}]],
 ['Post-operative protocol',[
  {p:'op.wb',l:'Weight bearing',t:'sel',o:[['','—'],['nwb','Non-weight bearing'],['ttwb','Touch-toe / protected'],['pwb','Partial'],['wbat','As tolerated / full']]},
  {p:'op.wbWeeks',l:'Restricted weight bearing for',t:'num',u:'weeks'},
  {p:'op.immob',l:'Immobilisation (cast / brace / sling)',t:'txt'},{p:'op.immobWeeks',l:'Immobilisation for',t:'num',u:'weeks'},
  {p:'op.rom',l:'Range-of-motion plan',t:'txt'},{p:'op.vte',l:'VTE prophylaxis',t:'txt'},
  {p:'op.removal',l:'Planned implant / wire / frame removal',t:'txt'}]],
 ['Outcome',[
  {p:'out.union',l:'Union',t:'sel',o:[['','—'],['united','United'],['delayed','Delayed union'],['nonunion','Non-union'],['malunion','Malunion']]},
  {p:'out.unionDate',l:'Union date',t:'date'},
  {p:'out.rtw',l:'Return to work / activity',t:'sel',o:[['','—'],['same','Same level'],['lower','Reduced level'],['no','Not returned']]},
  {p:'out.rtwDate',l:'Return date',t:'date'},
  {p:'out.removal',l:'Implant removal date',t:'date'},
  {p:'out.revision',l:'Re-operation / revision',t:'txt'},
  {p:'out.lastFU',l:'Last follow-up',t:'date'}]]];
const VISIT_F=[
 {p:'date',l:'Visit date',t:'date'},
 {p:'pain',l:'Pain (0–10)',t:'num',u:'/10'},
 {p:'wound',l:'Wound',t:'sel',o:[['','—'],['healed','Healed'],['ok','Healing'],['ooze','Oozing'],['inf','Infected']]},
 {p:'wb',l:'Weight bearing',t:'sel',o:[['','—'],['nwb','Non-weight bearing'],['ttwb','Touch-toe'],['pwb','Partial'],['fwb','Full']]},
 {p:'rom',l:'Range of motion (joint, arc)',t:'txt'},
 {p:'c1',l:'mRUST cortex 1 (AP medial)',t:'sel',o:[['','—'],['1','1 – callus absent'],['2','2 – callus, line visible'],['3','3 – bridging, line gone'],['4','4 – remodelled']]},
 {p:'c2',l:'mRUST cortex 2 (AP lateral)',t:'sel',o:[['','—'],['1','1 – callus absent'],['2','2 – callus, line visible'],['3','3 – bridging, line gone'],['4','4 – remodelled']]},
 {p:'c3',l:'mRUST cortex 3 (lateral anterior)',t:'sel',o:[['','—'],['1','1 – callus absent'],['2','2 – callus, line visible'],['3','3 – bridging, line gone'],['4','4 – remodelled']]},
 {p:'c4',l:'mRUST cortex 4 (lateral posterior)',t:'sel',o:[['','—'],['1','1 – callus absent'],['2','2 – callus, line visible'],['3','3 – bridging, line gone'],['4','4 – remodelled']]},
 {p:'xr',l:'X-ray: alignment / implant',t:'sel',o:[['','—'],['ok','Maintained'],['loss','Loss of reduction'],['loose','Implant loosening / failure']]},
 {p:'comp',l:'Complication',t:'sel',o:O_COMP},
 {p:'notes',l:'Notes',t:'area'}];
const mrust=v=>{const c=['c1','c2','c3','c4'].map(k=>num(v[k]));return c.every(x=>x!=null)?c.reduce((a,b)=>a+b,0):null};
function blankRec(){return{name:'',fileNo:'',phone:'',injDate:'',admDate:'',xrDate:'',ctDate:'',mriDate:'',assoc:'',notes:'',op:{},visits:[],out:{}}}
const getP=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
const setP=(o,p,v)=>{const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++)a=a[ks[i]]=a[ks[i]]||{};a[ks[ks.length-1]]=v};
const lab=(f,v)=>{if(v===''||v==null)return'';if(f.t==='chk')return v?'Yes':'';if(f.t==='sel'){const o=f.o.find(x=>String(x[0])===String(v));return o?o[1]:v}return String(v)+(f.u&&f.u!=='n'?' '+f.u:'')};
function weeksPostOp(date){const od=S.rec.op.date;if(!od||!date)return null;return Math.round((new Date(date)-new Date(od))/6048e5*10)/10}
function rField(f,val,attr){const id='r_'+Math.random().toString(36).slice(2,8);
  if(f.t==='chk')return`<label class="tog"><input type="checkbox" ${attr} ${val?'checked':''}> ${f.l}</label>`;
  if(f.t==='area')return`<div class="full"><span>${f.l}</span><textarea ${attr} rows="3" class="ta">${esc(val??'')}</textarea></div>`;
  if(f.t==='sel')return`<label for="${id}">${f.l}</label><select id="${id}" ${attr}>${f.o.map(([v,l])=>`<option value="${v}" ${String(val??'')===String(v)?'selected':''}>${l}</option>`).join('')}</select>`;
  if(f.t==='num')return`<label for="${id}">${f.l}</label><input id="${id}" type="number" inputmode="decimal" step="any" ${attr} value="${esc(val??'')}"><span class="u">${f.u||''}</span>`;
  return`<label for="${id}">${f.l}</label><input id="${id}" type="${f.t==='txt'?'text':f.t}" ${attr} value="${esc(val??'')}" class="wide">`}
function weeksPostOp(date){const od=S.rec.op.date||S.rec.injDate;if(!od||!date)return null;return Math.round((new Date(date)-new Date(od))/6048e5*10)/10}
function renderRecord(){const el=$('#p-rec');const R=S.rec;let h='';const fx=curFx();
  h+=`<div class="rec" style="padding:10px 12px"><span class="l">Patient record</span><span class="h" style="font-size:16px" id="recHead">${esc(R.name||'Unnamed patient')}${R.fileNo?' · #'+esc(R.fileNo):''}</span>
   <span class="fine">${esc(fx.name)}${S.caseId?' · saved; changes save automatically':' · not in the patient list yet'}${R.op.date?' · Surgery '+esc(R.op.date):''}${R.visits.length?' · '+R.visits.length+' visit'+(R.visits.length>1?'s':''):''}</span>
   <div class="row">${S.caseId?'':'<button class="btn primary" id="recSave">Add to patient list</button>'}<button class="btn" id="recPrint">Print / PDF</button><button class="btn" id="recShare">Share as text</button></div></div>`;
  h+=`<p class="fine">Fracture details, measurements and the plan come from the Patient, Fracture, Imaging and Decision tabs. Weeks are counted from surgery (or from injury if non-operative).</p>`;
  REC_FORM.forEach(([title,fs],gi)=>{h+=`<details class="sec" ${gi<2?'open':''}><summary>${title}</summary><div class="fgrid">${fs.map(f=>rField(f,getP(R,f.p),`data-r="${f.p}"`)).join('')}</div></details>`;
    if(gi===REC_FORM.length-2){h+=`<details class="sec" open><summary>Follow-up visits · ${R.visits.length}</summary><div class="group" id="visits">${visitsHTML()}</div><div class="row"><button class="btn primary" id="addVisit">Add visit</button></div><p class="fine">mRUST (Litrenta 2015): 4 cortices × 1–4, total 4–16; ≥ 13 is consistent with union of a diaphyseal fracture.</p></details>`}});
  const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;bindRecord()}
function visitsHTML(){const V=S.rec.visits;if(!V.length)return'<div class="empty">No follow-up visits yet.</div>';
  return V.map((v,i)=>`<details class="visit" ${v._open?'open':''} data-vi="${i}"><summary>${visitSummary(v,i)}</summary>
   <div class="fgrid">${VISIT_F.map(f=>rField(f,v[f.p],`data-v="${i}.${f.p}"`)).join('')}</div><div class="row"><button class="btn danger" data-vdel="${i}">Delete visit</button></div></details>`).join('')}
function visitSummary(v,i){const w=weeksPostOp(v.date);const m=mrust(v);return`<b>${v.date?esc(v.date):'Visit '+(i+1)}</b>${w!=null?` <span class="pill mut">${w<0?'pre-op':w+' wk'}</span>`:''}${m!=null?` <span class="pill ${m>=13?'ok':'warn'}">mRUST ${m}</span>`:''}${v.comp&&v.comp!=='none'?` <span class="pill bad">${lab(VISIT_F.find(f=>f.p==='comp'),v.comp)}</span>`:''}`}
function recHeader(){const R=S.rec,h=$('#recHead');if(h)h.textContent=(R.name||'Unnamed patient')+(R.fileNo?' · #'+R.fileNo:'')}
function bindRecord(){
  const sv=$('#recSave');if(sv)sv.onclick=()=>saveCase(true);
  $('#recPrint').onclick=openPrintSheet;
  $('#recShare').onclick=()=>shareText('Fracture record',recordReport());
  $('#addVisit').onclick=()=>{S.rec.visits.forEach(v=>v._open=false);S.rec.visits.push({date:new Date().toISOString().slice(0,10),comp:'none',_open:true});renderRecord();autosave();
    const last=[...$$('#visits .visit')].pop();if(last)last.scrollIntoView({block:'start'})};
  $$('#p-rec [data-vdel]').forEach(b=>b.onclick=()=>{if(b.dataset.armed){S.rec.visits.splice(+b.dataset.vdel,1);renderRecord();autosave()}else{b.dataset.armed=1;b.textContent='Tap again to delete'}});
  $$('#p-rec details.visit').forEach(d=>d.addEventListener('toggle',()=>{S.rec.visits[+d.dataset.vi]._open=d.open}))}
function recInput(e,commit){const i=e.target;if(!i.closest||!i.closest('#p-rec'))return;
  const val=i.type==='checkbox'?i.checked:i.value;
  if(i.dataset.r){setP(S.rec,i.dataset.r,val);recHeader();if(commit&&(i.dataset.r==='op.date'||i.dataset.r==='injDate'))$$('#visits .visit').forEach(d=>{const k=+d.dataset.vi;d.querySelector('summary').innerHTML=visitSummary(S.rec.visits[k],k)});autosave()}
  else if(i.dataset.v){const [vi,k]=i.dataset.v.split('.');S.rec.visits[+vi][k]=val;if(['date','comp','c1','c2','c3','c4'].includes(k)){const d=i.closest('.visit');if(d)d.querySelector('summary').innerHTML=visitSummary(S.rec.visits[+vi],+vi)}autosave()}}
document.addEventListener('input',e=>recInput(e,false));document.addEventListener('change',e=>recInput(e,true));

/* ---------- text report ---------- */
function recordReport(){const R=S.rec,L=[];
  L.push(`${R.name||'Patient'}${R.fileNo?' · file '+R.fileNo:''}${R.phone?' · '+R.phone:''}`);
  const fl=(fs,obj)=>fs.map(f=>{const v=lab(f,getP(obj,f.p));return v&&f.t!=='area'?`${f.l}: ${v}`:''}).filter(Boolean);
  const dets=fl(REC_FORM[0][1].filter(f=>!['name','fileNo','phone'].includes(f.p)),R);if(dets.length)L.push(dets.join(' · '));if(R.notes)L.push('Notes: '+R.notes);
  L.push('');L.push('ASSESSMENT AND PLAN');L.push(summary(decide()));
  const grp=(i,title)=>{const x=fl(REC_FORM[i][1],R);if(x.length){L.push('');L.push(title);x.forEach(y=>L.push('- '+y))}};
  grp(1,'OPERATION');if(R.op.notes)L.push('Notes: '+R.op.notes);grp(2,'POST-OPERATIVE');
  if(R.visits.length){L.push('');L.push('FOLLOW-UP');R.visits.forEach(v=>{const w=weeksPostOp(v.date);const m=mrust(v);L.push(`- ${v.date||'?'}${w!=null&&w>=0?' ('+w+' wk)':''}: `+[m!=null?'mRUST '+m+'/16':'',...VISIT_F.filter(f=>!['date','notes','c1','c2','c3','c4'].includes(f.p)).map(f=>{const x=lab(f,v[f.p]);return x&&x!=='None'?`${f.l} ${x}`:''})].filter(Boolean).join(', ')+(v.notes?'. '+v.notes:''))})}
  grp(3,'OUTCOME');
  return L.join('\n')}
async function shareText(title,text){try{if(isNative&&window.Capacitor.Plugins.Share){await window.Capacitor.Plugins.Share.share({title,text});return}if(navigator.share){await navigator.share({title,text});return}await navigator.clipboard.writeText(text);toast('Copied')}catch{}}

/* ---------- patient list ---------- */
async function saveCase(fromRecord){const R=S.rec;const name=(R.name||$('#caseName').value.trim()||('Case '+new Date().toLocaleString([],{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})));
  if(!R.name)R.name=name;S.caseId=S.caseId||('c'+Date.now());
  try{await DB.put(caseRow());await saveNow();$('#caseName').value='';toast(`Saved “${name}”`);if(!$('#casesSheet').hidden)renderCases();if(S.tab==='rec')renderRecord()}catch{toast('Could not save on this device')}}
function caseRow(){return{id:S.caseId,name:S.rec.name||'Unnamed',state:snap(),blobs:{...blobs},demo:isDemoImg(),date:Date.now()}}
async function renderCases(){let list=[];try{list=(await DB.all()).filter(c=>!String(c.id).startsWith('__')).sort((a,b)=>b.date-a.date)}catch{}
  const q=($('#caseSearch').value||'').trim().toLowerCase();
  $('#caseCount').textContent=list.length?`${list.length} patient${list.length>1?'s':''}`:'';
  if(q)list=list.filter(c=>{const r=c.state.rec||{};const d=c.state.d||{};return[c.name,r.fileNo,r.phone,r.op&&r.op.date,FX[d.fx]&&FX[d.fx].name].join(' ').toLowerCase().includes(q)});
  const el=$('#caseList');if(!list.length){el.innerHTML=`<div class="empty">${q?'No match.':'No patients saved yet.'}</div>`;return}
  el.innerHTML=list.map(c=>{const r=c.state.rec||{},d=c.state.d||{};const op=r.op||{};
    return`<div class="case ${c.id===S.caseId?'cur':''}"><div style="min-width:0"><div class="t"></div><div class="d">${[r.fileNo?'#'+esc(r.fileNo):'',esc(d.age||'?')+' y',FX[d.fx]?esc(FX[d.fx].name):'',op.date?'op '+esc(op.date):'no surgery yet',(r.visits||[]).length?(r.visits.length+' visits'):''].filter(Boolean).join(' · ')}</div></div><div class="row"><button class="btn primary" data-open="${c.id}">Open</button><button class="btn danger" data-del="${c.id}">✕</button></div></div>`}).join('');
  $$('#caseList .t').forEach((t,i)=>t.textContent=list[i].name);
  $$('#caseList [data-open]').forEach(b=>b.onclick=async()=>{await saveNow();const r=await DB.get(b.dataset.open);await loadRecord(r);S.caseId=r.id;$('#casesSheet').hidden=true;selectTab('rec')});
  $$('#caseList [data-del]').forEach(b=>b.onclick=async()=>{if(b.dataset.armed){await DB.del(b.dataset.del);if(S.caseId===b.dataset.del)S.caseId=null;renderCases()}else{b.dataset.armed=1;b.textContent='Delete?'}})}

/* ---------- export / backup ---------- */
const csvCell=v=>{v=v==null?'':String(v);return/[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
async function allCases(){let list=[];try{list=(await DB.all()).filter(c=>!String(c.id).startsWith('__'))}catch{}return list.sort((a,b)=>a.date-b.date)}
function withState(st,fn){const keep=S;S={...S,d:{...G_BLANK,...st.d},f:st.f||{},P:st.P||{},cal:{screw:10.5,...st.cal},rec:{...blankRec(),...(st.rec||{})}};S.rec.op=S.rec.op||{};try{return fn()}finally{S=keep}}
async function exportCSV(){const list=await allCases();if(!list.length){toast('No saved patients to export');return}
  const dKeys=Object.keys(G_BLANK);const recF=REC_FORM.flatMap(([,fs])=>fs).filter(f=>f.t!=='area');
  const head=['id',...recF.map(f=>f.p),'fracture','classification',...dKeys,'measurements','plan','visits','last_visit','last_mrust','op_notes','notes'];
  const rows=[head],vrows=[['id','name','file_no','fracture','op_date','weeks',...VISIT_F.map(f=>f.p),'mrust']];
  for(const c of list)withState(c.state,()=>{const R=decide();const r=S.rec;
    const vs=r.visits||[];const lastM=[...vs].reverse().map(mrust).find(x=>x!=null);
    rows.push([c.id,...recF.map(f=>{const x=getP(r,f.p);return f.t==='sel'?lab(f,x):x??''}),R.fx.name,R.cls.join(' | '),...dKeys.map(k=>S.d[k]===true?1:S.d[k]===false?'':S.d[k]),R.acc.map(a=>`${a.label} ${f1(a.val)}${a.unit}`).join('; '),R.head,vs.length,vs.length?vs[vs.length-1].date:'',lastM??'',r.op.notes||'',r.notes||'']);
    vs.forEach(x=>vrows.push([c.id,r.name,r.fileNo,R.fx.name,r.op.date||'',weeksPostOp(x.date)??'',...VISIT_F.map(f=>f.t==='sel'?lab(f,x[f.p]):x[f.p]??''),mrust(x)??'']))});
  const day=new Date().toISOString().slice(0,10);
  await saveFiles([[`Fractures-patients-${day}.csv`,toCSV(rows),'text/csv'],[`Fractures-visits-${day}.csv`,toCSV(vrows),'text/csv']]);toast(`Exported ${list.length} patients`)}
const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
async function backup(){const list=await allCases();if(!list.length){toast('Nothing to back up yet');return}
  const out=[];for(const c of list){const b={};for(const k in c.blobs||{}){try{b[k]=await blobToDataURL(c.blobs[k])}catch{}}out.push({...c,blobs:b})}
  await saveFiles([[`Fractures-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({app:'fracture-planner',v:1,cases:out}),'application/json']]);toast(`Backed up ${list.length} patients`)}
async function restore(file){try{const j=JSON.parse(await file.text());if(!j.cases)throw 0;let n=0;
  for(const c of j.cases){const b={};for(const k in c.blobs||{}){try{b[k]=await (await fetch(c.blobs[k])).blob()}catch{}}await DB.put({...c,blobs:b});n++}
  toast(`Restored ${n} patients`);renderCases()}catch{toast('That is not a Fracture Planner backup file')}}
async function saveFiles(files){
  if(isNative&&window.Capacitor.Plugins.Filesystem&&window.Capacitor.Plugins.Share){const {Filesystem,Share}=window.Capacitor.Plugins;const uris=[];
    for(const [name,text] of files){const w=await Filesystem.writeFile({path:name,data:text,directory:'CACHE',encoding:'utf8'});uris.push(w.uri)}
    try{await Share.share({title:files.map(f=>f[0]).join(', '),files:uris})}catch{}return}
  for(const [name,text,type] of files){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);await new Promise(r=>setTimeout(r,400))}}
$('#saveCase').onclick=()=>saveCase(false);
$('#caseSearch').addEventListener('input',renderCases);
$('#exportCsv').onclick=exportCSV;$('#backupBtn').onclick=backup;
$('#restoreFile').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)restore(f)});

/* ---------- printing: PDF reports ---------- */
let SET={doctor:'',title:'Consultant Orthopaedic and Trauma Surgeon',clinic:'',phone:'',address:''};
function loadPdfLib(){if(window.jsPDF)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src='pdf.bundle.js';s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
const pe=s=>esc(s==null?'':s);
function fLabel(f,v){if(v===''||v==null||v===false)return'';if(f.t==='chk')return v?'Yes':'';if(f.t==='seg'||f.t==='sel'){const o=f.o.find(x=>String(x[0])===String(v));return o?o[1]:String(v)}return String(v)+(f.u&&!['n','0–10'].includes(f.u)?' '+f.u:'')}
function kvTable(pairs){pairs=pairs.filter(p=>p[1]!==''&&p[1]!=null);if(!pairs.length)return'<p class="muted">Not recorded.</p>';
  const rows=[];for(let i=0;i<pairs.length;i+=2)rows.push(`<tr><th>${pe(pairs[i][0])}</th><td>${pe(pairs[i][1])}</td>${pairs[i+1]?`<th>${pe(pairs[i+1][0])}</th><td>${pe(pairs[i+1][1])}</td>`:'<th></th><td></td>'}</tr>`);
  return`<table class="kv">${rows.join('')}</table>`}
function gPairs(){const d=S.d;const out=[];G_FORM.forEach(([,fs])=>fs.forEach(f=>{if(['age','sex','side'].includes(f.k))return;if(f.show&&!f.show(d))return;const v=fLabel(f,d[f.k]);if(v&&!(['no','ok'].includes(d[f.k])))out.push([f.l,v])}));return out}
function fxPairs(){const fx=curFx();const v=vals();const out=[];fx.fields.forEach(f=>{if(f.show&&!f.show(v))return;let x=v[f.k];if(f.t==='num'&&num(x)!=null)x=f1(num(x));out.push([f.l,fLabel(f,x)])});return out}
function recPairs(gi){const R=S.rec;return REC_FORM[gi][1].filter(f=>f.t!=='area').map(f=>[f.l,lab(f,getP(R,f.p))])}
function blk(title,html){return`<div class="blk"><h2>${pe(title)}</h2>${html}</div>`}
const ul=a=>a.length?`<ul>${a.map(x=>`<li>${pe(x)}</li>`).join('')}</ul>`:'';
function reportHTML(kind){const d=S.d,R=decide(),r=S.rec;const age=num(d.age);const fx=R.fx;
  const head=`<div class="blk lh"><div><b>${pe(SET.doctor||'')}</b><span>${pe(SET.title||'')}</span><span>${pe([SET.clinic,SET.address,SET.phone].filter(Boolean).join(' · '))}</span></div><div class="lt">${pe({full:'Fracture record',preop:'Assessment and treatment plan',op:'Operative note',fu:'Follow-up and union'}[kind])}</div></div>
   <div class="blk pt"><span><b>Patient:</b> ${pe(r.name||'—')}</span><span><b>File:</b> ${pe(r.fileNo||'—')}</span><span><b>Age/Sex:</b> ${age??'—'} / ${d.sex}</span><span><b>Side:</b> ${{R:'Right',L:'Left',B:'Bilateral / midline'}[d.side]}</span>${r.injDate?`<span><b>Injury:</b> ${pe(r.injDate)}</span>`:''}<span><b>Printed:</b> ${new Date().toISOString().slice(0,10)}</span></div>`;
  let h='';
  const preop=()=>{
    h+=blk('Patient and injury',kvTable([...recPairs(0).filter(p=>!['Name','File number','Phone','Date of injury'].includes(p[0])),...gPairs()])+(r.notes?`<p>${pe(r.notes)}</p>`:''));
    h+=blk(`${fx.name} – classification and imaging`,`<p><b>${pe(R.cls.join(' · '))}</b></p>`+kvTable(fxPairs())+(R.acc.length?`<table class="grid"><tr><th>Parameter</th><th>Value</th><th>Acceptable</th><th></th></tr>${R.acc.map(a=>`<tr><td>${pe(a.label)}</td><td>${f1(a.val)} ${pe(a.unit)}</td><td>${pe(a.limit)}</td><td>${a.ok?'within':'<b>outside</b>'}</td></tr>`).join('')}</table>`:''));
    let plan=`<p class="big">${pe(R.head)}</p>`;const ord={ind:0,consider:1,contra:2};
    [...R.opts].sort((a,b)=>ord[a.st]-ord[b.st]).forEach(o=>{plan+=`<h3>${pe(o.name)} – ${pe(STATE[o.st][1])}</h3>${o.why?`<p>${pe(o.why)}</p>`:''}`});
    if(R.timing.length)plan+=`<h3>Timing</h3>${ul(R.timing)}`;if(R.approach.length)plan+=`<h3>Approach</h3>${ul(R.approach)}`;if(R.implant.length)plan+=`<h3>Implants</h3>${ul(R.implant)}`;
    if(R.img.length)plan+=`<h3>Imaging and work-up</h3>${ul(R.img)}`;if(R.notes.length)plan+=`<h3>Special considerations</h3>${ul(R.notes)}`;
    h+=blk('Plan',plan);if(R.fu.length||R.comp.length)h+=blk('Follow-up plan and risks',ul(R.fu)+(R.comp.length?`<h3>Complications to watch for</h3>${ul(R.comp)}`:''))};
  const op=()=>{h+=blk('Operation',kvTable(recPairs(1))+(r.op.notes?`<h3>Operative notes</h3><p class="pre">${pe(r.op.notes)}</p>`:''));h+=blk('Post-operative protocol',kvTable(recPairs(2)))};
  const fu=()=>{const V=r.visits||[];
    h+=blk('Follow-up visits',V.length?`<table class="grid"><tr><th>Date</th><th>Wk</th><th>Pain</th><th>Wound</th><th>WB</th><th>ROM</th><th>mRUST</th><th>X-ray</th><th>Event</th></tr>${V.map(x=>{const w=weeksPostOp(x.date);const Lb=k=>lab(VISIT_F.find(f=>f.p===k),x[k]);const m=mrust(x);
      return`<tr><td>${pe(x.date||'')}</td><td>${w!=null&&w>=0?Math.round(w):''}</td><td>${pe(x.pain??'')}</td><td>${pe(Lb('wound'))}</td><td>${pe(Lb('wb'))}</td><td>${pe(x.rom||'')}</td><td>${m!=null?m+'/16':''}</td><td>${pe(Lb('xr'))}</td><td>${pe(x.comp&&x.comp!=='none'?Lb('comp'):'')}</td></tr>${x.notes?`<tr><td></td><td colspan="8" class="muted">${pe(x.notes)}</td></tr>`:''}`}).join('')}</table>`:'<p class="muted">No follow-up visits recorded.</p>');
    h+=blk('Outcome',kvTable(recPairs(3)))};
  if(kind==='full'){preop();op();fu()}else if(kind==='preop')preop();else if(kind==='op'){h+=blk('Indication',`<p>${pe(fx.name)} (${pe(R.cls.join('; '))}) – ${{R:'right',L:'left',B:'bilateral / midline'}[d.side]}. Plan: ${pe(R.head)}</p>`);op()}else fu();
  h+=`<div class="blk sig"><span>Signature: ______________________</span><span>${pe(SET.doctor||'')}</span></div>`;
  return`<div class="page">${head}${h}<div class="foot">${pe(SET.clinic||'Fracture Planner')} · ${pe(r.name||'')} ${r.fileNo?'#'+pe(r.fileNo):''}</div></div>`}
async function printReport(kind){toast('Preparing PDF…');try{await loadPdfLib();const html=reportHTML(kind);const blob=await htmlToPdf(html);
  const nm=(S.rec.name||'patient').replace(/[^\w؀-ۿ]+/g,'_');await shareBlob(blob,`${nm}_${kind}_${new Date().toISOString().slice(0,10)}.pdf`)}catch(e){console.error(e);toast('Could not create the PDF')}}
async function htmlToPdf(html){const root=$('#printRoot');root.innerHTML=html;try{await document.fonts.ready}catch{}const el=root.firstElementChild;
  const scale=2;const canvas=await window.html2canvas(el,{scale,backgroundColor:'#ffffff'});
  const top=el.getBoundingClientRect().top;const breaks=[...el.querySelectorAll('.blk, .kv tr, .grid tr, li, p')].map(b=>Math.round((b.getBoundingClientRect().bottom-top)*scale)).sort((a,b)=>a-b);
  root.innerHTML='';
  const pdf=new window.jsPDF({unit:'pt',format:'a4'});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
  const margin=28,usable=Math.floor((ph-2*margin)*canvas.width/pw);let y=0,first=true;
  while(y<canvas.height-4){let end=Math.min(y+usable,canvas.height);if(end<canvas.height){const cand=breaks.filter(b=>b>y+usable*0.5&&b<=end);if(cand.length)end=cand[cand.length-1]+2}
    const h=end-y;const c=document.createElement('canvas');c.width=canvas.width;c.height=h;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,h);g.drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
    if(!first)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,margin,pw,h*pw/canvas.width);first=false;y=end}
  const n=pdf.getNumberOfPages();for(let i=1;i<=n;i++){pdf.setPage(i);pdf.setFontSize(8);pdf.setTextColor(120);pdf.text(`Page ${i} of ${n}`,pw-margin,ph-12,{align:'right'})}
  return pdf.output('blob')}
const blobToB64=b=>new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(b)});
async function shareBlob(blob,name){
  if(isNative&&window.Capacitor.Plugins.Filesystem){try{const {Filesystem,Share}=window.Capacitor.Plugins;const w=await Filesystem.writeFile({path:name,data:await blobToB64(blob),directory:'CACHE'});await Share.share({title:name,files:[w.uri]});return}catch(e){if(String(e).includes('cancel'))return;console.error(e)}}
  const file=new File([blob],name,{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
  const url=URL.createObjectURL(blob);const w=window.open(url,'_blank');if(w)return;const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Saved '+name)}
function openPrintSheet(){$('#printSheet').hidden=false}
$$('#printSheet [data-print]').forEach(b=>b.onclick=()=>{$('#printSheet').hidden=true;printReport(b.dataset.print)});
$('#shareApp').onclick=async()=>{const url='https://eelforse-blip.github.io/Knee-planner/fractures/';const text='Fracture Planner – upper limb, pelvis & hip, lower limb and spine: classification (AO/OTA, Garden, Schatzker, Weber, Gustilo, TLICS, SLIC…), X-ray measurements (TAD, Böhler, radial tilt, clear space, kyphosis), timing, approaches, implants and follow-up with mRUST. Free, works offline on iPhone, Android and PC.\n\niPhone: open in Safari → Share → Add to Home Screen.\nAndroid / PC: open in Chrome or Edge → Install app.\n\n';
  try{if(isNative&&window.Capacitor.Plugins.Share){await window.Capacitor.Plugins.Share.share({title:'Fracture Planner',text:text+url});return}if(navigator.share){await navigator.share({title:'Fracture Planner',text,url});return}await navigator.clipboard.writeText(text+url);toast('Link copied')}catch{}};
$('#setBtn').onclick=()=>{['doctor','title','clinic','phone','address'].forEach(k=>$('#set_'+k).value=SET[k]||'');$('#menuSheet').hidden=true;$('#setSheet').hidden=false};
$('#setSave').onclick=async()=>{['doctor','title','clinic','phone','address'].forEach(k=>SET[k]=$('#set_'+k).value.trim());try{await DB.put({id:'__settings',set:SET})}catch{}$('#setSheet').hidden=true;toast('Letterhead saved')};

/* ---------- tabs ---------- */
const TABS=['rec','pt','fx','img','dec'];
function update(){if(S.tab==='img')renderImg();if(S.tab==='dec')renderDec();draw();autosave()}
function layout(){const w=$('#work');const showV=S.tab==='img'&&!S.noViewer;w.classList.toggle('calc',!showV);requestAnimationFrame(()=>{resize();fit()})}
function selectTab(t){S.tab=t;$$('.tab').forEach(x=>x.setAttribute('aria-selected',x.dataset.t===t));TABS.forEach(n=>$('#p-'+n).hidden=n!==t);
  if(t==='img'){const fx=curFx();if(!fx.meas.includes(S.mode))S.mode=fx.meas[0];if(!S.active||!MODES[S.mode].pts.some(p=>p[0]===S.active)){const ids=MODES[S.mode].pts.map(x=>x[0]);S.active=ids.find(k=>!P(S.mode,k))||ids[0]}}
  layout();renderTab(t);$('#p-'+t).scrollTop=0;autosave()}
$$('.tab').forEach(t=>t.onclick=()=>selectTab(t.dataset.t));
$('#grab').onclick=()=>{$('#work').classList.toggle('tall');requestAnimationFrame(()=>{resize();fit()})};

/* ---------- storage ---------- */
const DB=(()=>{let p=null;const open=()=>p||(p=new Promise((res,rej)=>{try{const r=indexedDB.open('fracture-planner',1);r.onupgradeneeded=()=>r.result.createObjectStore('cases',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}));
  const tx=async(mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction('cases',mode);const out=fn(t.objectStore('cases'));t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)})};
  return{put:v=>tx('readwrite',s=>s.put(v)),get:id=>tx('readonly',s=>s.get(id)),del:id=>tx('readwrite',s=>s.delete(id)),all:()=>tx('readonly',s=>s.getAll())}})();
const snap=()=>JSON.parse(JSON.stringify({d:S.d,f:S.f,P:S.P,cal:S.cal,mode:S.mode,rec:S.rec}));
const isDemoImg=()=>false;
const saveNow=()=>{clearTimeout(saveT);const p=[DB.put({id:'__current',caseId:S.caseId,state:snap(),tab:S.tab,blobs:{...blobs},date:Date.now()})];if(S.caseId)p.push(DB.put(caseRow()));return Promise.all(p).catch(()=>{})};
let saveT=0;function autosave(){clearTimeout(saveT);saveT=setTimeout(saveNow,400)}
addEventListener('pagehide',saveNow);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow()});
async function loadRecord(r){const st=JSON.parse(JSON.stringify(r.state));S.d={...G_BLANK,...st.d};if(!FX[S.d.fx])S.d.fx='drad';S.f=st.f||{};S.P=st.P||{};S.cal={screw:10.5,...st.cal};S.mode=MODES[st.mode]?st.mode:curFx().meas[0];S.regView=null;
  {const b0=blankRec(),rr=st.rec||{};S.rec={...b0,...rr,op:{...(rr.op||{})},out:{...(rr.out||{})},visits:rr.visits||[]}}S.caseId=r.caseId||null;S.active=null;
  imgs={};blobs={...(r.blobs||{})};for(const k in blobs){try{imgs[k]=await blobToCanvas(blobs[k])}catch{}}}
$('#casesBtn').onclick=()=>{$('#caseSearch').value='';renderCases();$('#casesSheet').hidden=false};$('#menuBtn').onclick=()=>$('#menuSheet').hidden=false;
$$('.sheet').forEach(s=>s.addEventListener('click',e=>{if(e.target===s||e.target.hasAttribute('data-close'))s.hidden=true}));
$('#newCase').onclick=()=>{S={d:{...G_BLANK,fx:S.d.fx},f:{},P:{},cal:{screw:10.5},tab:'pt',mode:curFx().meas[0],active:null,noViewer:false,rec:blankRec(),caseId:null,regView:null};imgs={};blobs={};$('#menuSheet').hidden=true;selectTab('rec');toast('New patient')};
$('#demoList').innerHTML=DEMOS.map((x,i)=>`<button class="btn" data-demo="${i}">${x.t}</button>`).join('');
$$('[data-demo]').forEach(b=>b.onclick=()=>{$('#menuSheet').hidden=true;openDemo(+b.dataset.demo)});
let toastT=0;function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2200)}

/* ---------- iPhone install hint ---------- */
(()=>{const ua=navigator.userAgent;const ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const standalone=window.navigator.standalone||matchMedia('(display-mode: standalone)').matches;let seen=false;try{seen=!!localStorage.getItem('iosHint')}catch{}
  if(ios&&!standalone&&!isNative&&!seen){const h=$('#iosHint');setTimeout(()=>h.hidden=false,1500);$('#iosHintX').onclick=()=>{h.hidden=true;try{localStorage.setItem('iosHint','1')}catch{}}}})();


/* ---------- boot ---------- */
DB.get('__settings').then(r=>{if(r&&r.set)SET={...SET,...r.set}}).catch(()=>{});
resize();
(async()=>{let r=null;try{r=await DB.get('__current')}catch{}
  if(r&&r.state){await loadRecord(r);selectTab(r.tab||'dec')}else openDemo(0)})();
window.__fx={pdf:k=>loadPdfLib().then(()=>htmlToPdf(reportHTML(k))).then(blobToB64),decide,vals,computeImage,openDemo,selectTab,S:()=>S,FX,DEMOS,setMode:m=>chooseMode(m),setD:o=>{Object.assign(S.d,o);renderTab(S.tab)},setF:o=>{for(const k in o)setF(k,o[k]);renderTab(S.tab)},csv:exportCSV};
if('serviceWorker' in navigator&&!isNative&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
