/* ---------- patient record: identity, operation, follow-up visits, outcome; patient list; export ---------- */
const O_LACH=[['0','Normal'],['1','Grade I · 3–5 mm'],['2','Grade II · 6–10 mm'],['3','Grade III · > 10 mm']];
const O_PIV=[['0','0 · equal'],['1','1 · glide'],['2','2 · clunk'],['3','3 · gross']];
const O_MEN=[['none','Intact / not treated'],['left','Stable tear left alone'],['partial','Partial meniscectomy'],['allin','All-inside repair'],['insideout','Inside-out repair'],['outsidein','Outside-in repair'],['root','Root repair'],['ramp','Ramp repair'],['bh','Bucket-handle repair']];
const O_COMP=[['none','None'],['superf','Superficial wound infection'],['deep','Deep infection / septic arthritis'],['dvt','DVT / PE'],['stiff','Stiffness / arthrofibrosis'],['cyclops','Cyclops lesion'],['retear','Graft re-rupture'],['contra','Contralateral ACL tear'],['menis','Meniscal re-tear'],['hw','Hardware irritation'],['nerve','Infrapatellar nerve numbness'],['other','Other (see notes)']];
const REC_FORM=[
 ['Patient details',[
  {p:'name',l:'Name',t:'txt'},{p:'fileNo',l:'File number',t:'txt'},{p:'phone',l:'Phone',t:'tel'},
  {p:'injuryDate',l:'Date of injury',t:'date'},{p:'firstVisit',l:'First clinic visit',t:'date'},
  {p:'mechanism',l:'Mechanism',t:'sel',o:[['','—'],['noncontact','Non-contact pivoting / landing'],['contact','Contact injury'],['fall','Fall'],['rta','Road traffic accident'],['other','Other']]},
  {p:'notes',l:'Notes (history, comorbidities)',t:'area'}]],
 ['Operation',[
  {p:'op.date',l:'Date of surgery',t:'date'},{p:'op.surgeon',l:'Surgeon',t:'txt'},{p:'op.assistant',l:'Assistant',t:'txt'},
  {p:'op.anaes',l:'Anaesthesia',t:'sel',o:[['','—'],['spinal','Spinal'],['ga','General'],['gablock','General + nerve block'],['other','Other']]},
  {p:'op.tq',l:'Tourniquet time',t:'num',u:'min'},
  {p:'op.euaL',l:'Lachman under anaesthesia',t:'sel',o:[['','—'],...O_LACH]},{p:'op.euaP',l:'Pivot shift under anaesthesia',t:'sel',o:[['','—'],...O_PIV]},
  {p:'op.type',l:'Procedure',t:'sel',o:[['primary','Primary ACLR'],['rev1','Revision, single stage'],['rev2a','Revision stage 1 (tunnel grafting)'],['rev2b','Revision stage 2'],['phys','Physeal-sparing / paediatric']]},
  {p:'op.graft',l:'Graft',t:'sel',o:[['','—'],['st4','Semitendinosus 4-strand'],['stg4','ST + gracilis 4-strand'],['st56','Hamstring 5–6 strand'],['bptb','Bone–patellar tendon–bone'],['qtb','Quadriceps tendon with bone'],['qts','Quadriceps tendon, all soft tissue'],['pl','Peroneus longus'],['allo','Allograft'],['itb','Iliotibial band (Kocher–Micheli)']]},
  {p:'op.graftSide',l:'Harvest side',t:'sel',o:[['ipsi','Ipsilateral'],['contra','Contralateral'],['na','Not applicable']]},
  {p:'op.dia',l:'Graft diameter',t:'num',u:'mm'},{p:'op.len',l:'Graft length',t:'num',u:'mm'},
  {p:'op.fem',l:'Femoral tunnel technique',t:'sel',o:[['','—'],['am','Anteromedial portal'],['tt','Transtibial'],['oi','Outside-in'],['epi','All-epiphyseal'],['ott','Over-the-top']]},
  {p:'op.femT',l:'Femoral tunnel',t:'num',u:'mm'},{p:'op.tibT',l:'Tibial tunnel',t:'num',u:'mm'},
  {p:'op.femFix',l:'Femoral fixation',t:'sel',o:[['','—'],['fixed','Cortical button, fixed loop'],['adj','Cortical button, adjustable loop'],['iscrew','Interference screw'],['xpin','Cross-pin'],['other','Other']]},
  {p:'op.tibFix',l:'Tibial fixation',t:'sel',o:[['','—'],['iscrew','Interference screw'],['button','Cortical button'],['post','Screw-post / staple'],['hybrid','Hybrid (screw + button)'],['other','Other']]},
  {p:'op.tension',l:'Graft fixed at flexion',t:'num',u:'°'},
  {p:'op.remnant',l:'Remnant preserved',t:'chk'},{p:'op.notchplasty',l:'Notchplasty',t:'chk'},
  {p:'op.let',l:'Lateral procedure',t:'sel',o:[['none','None'],['lemaire','Modified Lemaire LET'],['all','ALL reconstruction'],['other','Other']]},
  {p:'op.medMen',l:'Medial meniscus',t:'sel',o:O_MEN},{p:'op.latMen',l:'Lateral meniscus',t:'sel',o:O_MEN},
  {p:'op.sutures',l:'Number of meniscal sutures/implants',t:'num',u:'n'},
  {p:'op.cart',l:'Cartilage',t:'sel',o:[['none','Normal / not treated'],['debr','Debridement'],['mfx','Microfracture'],['other','Other cartilage procedure']]},
  {p:'op.cartNote',l:'Cartilage lesion (site, ICRS grade, size)',t:'txt'},
  {p:'op.mcl',l:'MCL',t:'sel',o:[['none','No procedure'],['repair','Repair'],['recon','Reconstruction']]},
  {p:'op.plc',l:'Posterolateral corner',t:'sel',o:[['none','No procedure'],['repair','Repair'],['recon','Reconstruction']]},
  {p:'op.ost',l:'Osteotomy',t:'sel',o:[['none','None'],['owhto','Medial opening-wedge HTO'],['cwhto','Lateral closing-wedge HTO'],['acwo','Anterior closing wedge (slope)'],['comb','Combined']]},
  {p:'op.ostCorr',l:'Osteotomy correction',t:'num',u:'°'},{p:'op.ostWedge',l:'Wedge / gap',t:'num',u:'mm'},
  {p:'op.intraComp',l:'Intra-operative complications',t:'txt'},
  {p:'op.notes',l:'Operative notes',t:'area'}]],
 ['Post-operative protocol',[
  {p:'op.wb',l:'Weight-bearing',t:'sel',o:[['','—'],['fwb','Full as tolerated'],['pwb2','Partial for 2 weeks'],['pwb6','Partial for 4–6 weeks'],['nwb','Non-weight-bearing']]},
  {p:'op.brace',l:'Brace',t:'sel',o:[['','—'],['none','None'],['hinged','Hinged brace'],['ext','Locked in extension'],['stop','Extension stop at 0°']]},
  {p:'op.rom',l:'Range-of-motion limits',t:'txt'},{p:'op.dvt',l:'DVT prophylaxis',t:'chk'},{p:'op.antibiotic',l:'Antibiotic prophylaxis',t:'chk'}]],
 ['Outcome',[
  {p:'out.rtsDate',l:'Return to sport date',t:'date'},
  {p:'out.rtsLevel',l:'Return to sport',t:'sel',o:[['','—'],['same','Same level'],['lower','Lower level'],['changed','Changed to another sport'],['no','Did not return']]},
  {p:'out.retearDate',l:'Graft re-rupture date',t:'date'},{p:'out.revDate',l:'Revision surgery date',t:'date'},
  {p:'out.contraDate',l:'Contralateral ACL tear date',t:'date'},
  {p:'out.satisfied',l:'Patient satisfaction',t:'sel',o:[['','—'],['4','Very satisfied'],['3','Satisfied'],['2','Neutral'],['1','Dissatisfied']]}]]];
const VISIT_F=[
 {p:'date',l:'Visit date',t:'date'},
 {p:'extDef',l:'Extension deficit',t:'num',u:'°'},{p:'flex',l:'Flexion',t:'num',u:'°'},
 {p:'effusion',l:'Effusion',t:'sel',o:[['','—'],['none','None'],['mild','Mild'],['mod','Moderate'],['severe','Severe']]},
 {p:'lachman',l:'Lachman',t:'sel',o:[['','—'],...O_LACH]},{p:'kt',l:'KT side-to-side',t:'num',u:'mm'},{p:'pivot',l:'Pivot shift',t:'sel',o:[['','—'],...O_PIV]},
 {p:'quad',l:'Quadriceps strength LSI',t:'num',u:'%'},{p:'hop',l:'Hop test LSI',t:'num',u:'%'},{p:'pain',l:'Pain (0–10)',t:'num',u:'/10'},
 {p:'wound',l:'Wound',t:'sel',o:[['','—'],['ok','Healed'],['delay','Delayed / oozing'],['inf','Infected']]},
 {p:'comp',l:'Complication',t:'sel',o:O_COMP},
 {p:'phase',l:'Rehab phase',t:'sel',o:[['','—'],['1','1 · protection, ROM, quads'],['2','2 · strength'],['3','3 · running, plyometrics'],['4','4 · sport-specific'],['5','5 · returned to sport']]},
 {p:'sport',l:'Sport status',t:'sel',o:[['','—'],['no','Not yet'],['train','Training'],['same','Competing, same level'],['lower','Competing, lower level'],['stop','Stopped sport']]},
 {p:'notes',l:'Notes',t:'area'}];
function blankRec(){return{name:'',fileNo:'',phone:'',injuryDate:'',firstVisit:'',mechanism:'',notes:'',op:{type:'primary',graftSide:'ipsi',let:'none',medMen:'none',latMen:'none',cart:'none',mcl:'none',plc:'none',ost:'none'},visits:[],out:{}}}
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
function renderRecord(){const el=$('#p-rec');const R=S.rec;let h='';
  h+=`<div class="rec" style="padding:10px 12px"><span class="l">Patient record</span><span class="h" style="font-size:16px" id="recHead">${esc(R.name||'Unnamed patient')}${R.fileNo?' · #'+esc(R.fileNo):''}</span>
   <span class="fine">${S.caseId?'Saved in the patient list; changes save automatically.':'Not in the patient list yet.'}${R.op.date?' · Surgery '+esc(R.op.date):''}${R.visits.length?' · '+R.visits.length+' follow-up visit'+(R.visits.length>1?'s':''):''}</span>
   <div class="row">${S.caseId?'':'<button class="btn primary" id="recSave">Add to patient list</button>'}<button class="btn" id="recShare">Share report</button></div></div>`;
  h+=`<p class="fine">Pre-operative findings come from the History, Exam, Imaging and Child tabs; scores from the Scores tab.</p>`;
  REC_FORM.forEach(([title,fs],gi)=>{h+=`<details class="sec" ${gi<2?'open':''}><summary>${title}</summary><div class="fgrid">${fs.map(f=>rField(f,getP(R,f.p),`data-r="${f.p}"`)).join('')}</div></details>`;
    if(gi===2){h+=`<details class="sec" open><summary>Follow-up visits · ${R.visits.length}</summary><div class="group" id="visits">${visitsHTML()}</div><div class="row"><button class="btn primary" id="addVisit">Add visit</button></div></details>`}});
  const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;bindRecord()}
function visitsHTML(){const V=S.rec.visits;if(!V.length)return'<div class="empty">No follow-up visits yet.</div>';
  return V.map((v,i)=>`<details class="visit" ${v._open?'open':''} data-vi="${i}"><summary>${visitSummary(v,i)}</summary>
   <div class="fgrid">${VISIT_F.map(f=>rField(f,v[f.p],`data-v="${i}.${f.p}"`)).join('')}</div><div class="row"><button class="btn danger" data-vdel="${i}">Delete visit</button></div></details>`).join('')}
function visitSummary(v,i){const w=weeksPostOp(v.date);return`<b>${v.date?esc(v.date):'Visit '+(i+1)}</b>${w!=null?` <span class="pill mut">${w<0?'pre-op':w+' wk post-op'}</span>`:''}${v.comp&&v.comp!=='none'?` <span class="pill bad">${lab(VISIT_F.find(f=>f.p==='comp'),v.comp)}</span>`:''}`}
function recHeader(){const R=S.rec,h=$('#recHead');if(h)h.textContent=(R.name||'Unnamed patient')+(R.fileNo?' · #'+R.fileNo:'')}
function bindRecord(){const el=$('#p-rec');
  const sv=$('#recSave');if(sv)sv.onclick=()=>saveCase(true);
  $('#recShare').onclick=()=>shareText('ACL patient report',recordReport());
  $('#addVisit').onclick=()=>{S.rec.visits.forEach(v=>v._open=false);S.rec.visits.push({date:new Date().toISOString().slice(0,10),comp:'none',_open:true});renderRecord();autosave();
    const last=[...$$('#visits .visit')].pop();if(last)last.scrollIntoView({block:'start'})};
  $$('#p-rec [data-vdel]').forEach(b=>b.onclick=()=>{if(b.dataset.armed){S.rec.visits.splice(+b.dataset.vdel,1);renderRecord();autosave()}else{b.dataset.armed=1;b.textContent='Tap again to delete'}});
  $$('#p-rec details.visit').forEach(d=>d.addEventListener('toggle',()=>{S.rec.visits[+d.dataset.vi]._open=d.open}))}
function recInput(e,commit){const i=e.target;if(!i.closest||!i.closest('#p-rec'))return;
  const val=i.type==='checkbox'?i.checked:i.value;
  if(i.dataset.r){setP(S.rec,i.dataset.r,val);recHeader();if(commit&&i.dataset.r==='op.date')$$('#visits .visit').forEach(d=>{const k=+d.dataset.vi;d.querySelector('summary').innerHTML=visitSummary(S.rec.visits[k],k)});autosave()}
  else if(i.dataset.v){const [vi,k]=i.dataset.v.split('.');S.rec.visits[+vi][k]=val;if(k==='date'||k==='comp'){const d=i.closest('.visit');if(d)d.querySelector('summary').innerHTML=visitSummary(S.rec.visits[+vi],+vi)}autosave()}}
document.addEventListener('input',e=>recInput(e,false));document.addEventListener('change',e=>recInput(e,true));

/* ---------- text report ---------- */
function recordReport(){const R=S.rec,L=[];
  L.push(`${R.name||'Patient'}${R.fileNo?' · file '+R.fileNo:''}${R.phone?' · '+R.phone:''}`);
  const fl=(fs,obj)=>fs.map(f=>{const v=lab(f,getP(obj,f.p));return v&&f.t!=='area'?`${f.l}: ${v}`:''}).filter(Boolean);
  const dets=fl(REC_FORM[0][1].filter(f=>!['name','fileNo','phone'].includes(f.p)),R);if(dets.length)L.push(dets.join(' · '));if(R.notes)L.push('Notes: '+R.notes);
  L.push('');L.push('PRE-OPERATIVE');L.push(summary(decide()));
  const op=fl(REC_FORM[1][1],R);if(op.length){L.push('');L.push('OPERATION');op.forEach(x=>L.push('- '+x));if(R.op.notes)L.push('Notes: '+R.op.notes)}
  const pp=fl(REC_FORM[2][1],R);if(pp.length){L.push('');L.push('POST-OP PROTOCOL');pp.forEach(x=>L.push('- '+x))}
  if(R.visits.length){L.push('');L.push('FOLLOW-UP');R.visits.forEach(v=>{const w=weeksPostOp(v.date);L.push(`- ${v.date||'?'}${w!=null&&w>=0?' ('+w+' wk)':''}: `+VISIT_F.filter(f=>f.p!=='date'&&f.p!=='notes').map(f=>{const x=lab(f,v[f.p]);return x?`${f.l} ${x}`:''}).filter(Boolean).join(', ')+(v.notes?'. '+v.notes:''))})}
  const out=fl(REC_FORM[3][1],R);if(out.length){L.push('');L.push('OUTCOME');out.forEach(x=>L.push('- '+x))}
  return L.join('\n')}
async function shareText(title,text){try{if(isNative&&window.Capacitor.Plugins.Share){await window.Capacitor.Plugins.Share.share({title,text});return}if(navigator.share){await navigator.share({title,text});return}await navigator.clipboard.writeText(text);toast('Copied')}catch{}}

/* ---------- patient list ---------- */
async function saveCase(fromRecord){const R=S.rec;const name=(R.name||$('#caseName').value.trim()||('Case '+new Date().toLocaleString([],{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})));
  if(!R.name)R.name=name;S.caseId=S.caseId||('c'+Date.now());
  try{await DB.put(caseRow());await saveNow();$('#caseName').value='';toast(`Saved “${name}”`);if(!$('#casesSheet').hidden)renderCases();if(S.tab==='rec')renderRecord()}catch{toast('Could not save on this device')}}
function caseRow(){return{id:S.caseId,name:S.rec.name||'Unnamed',state:snap(),blobs:{...blobs},demo:isDemoImg(),date:Date.now()}}
async function renderCases(){let list=[];try{list=(await DB.all()).filter(c=>c.id!=='__current').sort((a,b)=>b.date-a.date)}catch{}
  const q=($('#caseSearch').value||'').trim().toLowerCase();
  $('#caseCount').textContent=list.length?`${list.length} patient${list.length>1?'s':''}`:'';
  if(q)list=list.filter(c=>{const r=c.state.rec||{};return[c.name,r.fileNo,r.phone,r.op&&r.op.date].join(' ').toLowerCase().includes(q)});
  const el=$('#caseList');if(!list.length){el.innerHTML=`<div class="empty">${q?'No match.':'No patients saved yet.'}</div>`;return}
  el.innerHTML=list.map(c=>{const r=c.state.rec||{},d=c.state.d||{};const op=r.op||{};
    return`<div class="case ${c.id===S.caseId?'cur':''}"><div style="min-width:0"><div class="t"></div><div class="d">${[r.fileNo?'#'+esc(r.fileNo):'',esc(d.age||'?')+' y',op.date?'op '+esc(op.date):'no surgery yet',(r.visits||[]).length?(r.visits.length+' visits'):''].filter(Boolean).join(' · ')}</div></div><div class="row"><button class="btn primary" data-open="${c.id}">Open</button><button class="btn danger" data-del="${c.id}">✕</button></div></div>`}).join('');
  $$('#caseList .t').forEach((t,i)=>t.textContent=list[i].name);
  $$('#caseList [data-open]').forEach(b=>b.onclick=async()=>{await saveNow();const r=await DB.get(b.dataset.open);await loadRecord(r);S.caseId=r.id;$('#casesSheet').hidden=true;selectTab('rec')});
  $$('#caseList [data-del]').forEach(b=>b.onclick=async()=>{if(b.dataset.armed){await DB.del(b.dataset.del);if(S.caseId===b.dataset.del)S.caseId=null;renderCases()}else{b.dataset.armed=1;b.textContent='Delete?'}})}

/* ---------- export / backup ---------- */
const csvCell=v=>{v=v==null?'':String(v);return/[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
async function allCases(){let list=[];try{list=(await DB.all()).filter(c=>c.id!=='__current')}catch{}return list.sort((a,b)=>a.date-b.date)}
function withState(st,fn){const keep=S;S={...S,d:{...BLANK,...st.d},P:st.P||{},cal:{att:50,notch:50,...st.cal},th:{...TH_DEFAULT,...st.th},sc:st.sc||{tp:'preop',view:'ikdc',d:{}},rec:{...blankRec(),...(st.rec||{})}};try{return fn()}finally{S=keep}}
async function exportCSV(){const list=await allCases();if(!list.length){toast('No saved patients to export');return}
  const dKeys=['age','sex','side','sport','goal','level','tegner','job','weeks','episodes','revision','lachman','pivot','kt','effusion','extDef','flex','mcl','plc','recurv','recurvOther','pts','lts','att','telos','notch','tear','meniscus','segond','hka','mpta','kl','physes','tanner','boneAge','childInj'];
  const recF=REC_FORM.flatMap(([,fs])=>fs).filter(f=>f.t!=='area');
  const tps=TP.map(t=>t[0]);
  const head=['id',...recF.map(f=>f.p),...dKeys,'beighton','recommendation','let_advice','graft_advice','slope_advice','varus_advice',...tps.flatMap(t=>['tegner_'+t,'lysholm_'+t,'ikdc_'+t,'ikdc_exam_'+t,'acl_rsi_'+t]),'visits','last_visit','op_notes','notes'];
  const rows=[head],vrows=[['id','name','file_no','op_date','weeks_post_op',...VISIT_F.map(f=>f.p)]];
  for(const c of list)withState(c.state,()=>{const R=decide();const r=S.rec;
    const row=[c.id,...recF.map(f=>{const v=getP(r,f.p);return f.t==='sel'?lab(f,v):f.t==='chk'?(v?1:''):v??''}),...dKeys.map(k=>S.d[k]===true?1:S.d[k]===false?'':S.d[k]),beightonScore(S.d),
      R.mgmt?R.mgmt.rec:'Tibial spine avulsion',STATE[R.let.state][1],R.grafts[0].n,R.slope?STATE[R.slope.st][1]:'',R.varus?STATE[R.varus.st][1]:''];
    tps.forEach(t=>{const s=scoreRow(t);row.push(s.tegner??'',s.lys??'',s.ikdc!=null?s.ikdc.toFixed(1):'',s.obj!=null?GRADE[s.obj]:'',s.rsi!=null?s.rsi.toFixed(0):'')});
    const vs=r.visits||[];row.push(vs.length,vs.length?vs[vs.length-1].date:'',r.op.notes||'',r.notes||'');rows.push(row);
    vs.forEach(v=>vrows.push([c.id,r.name,r.fileNo,r.op.date||'',weeksPostOp(v.date)??'',...VISIT_F.map(f=>f.t==='sel'?lab(f,v[f.p]):v[f.p]??'')]))});
  const day=new Date().toISOString().slice(0,10);
  await saveFiles([[`ACL-patients-${day}.csv`,toCSV(rows),'text/csv'],[`ACL-visits-${day}.csv`,toCSV(vrows),'text/csv']]);toast(`Exported ${list.length} patients`)}
const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
async function backup(){const list=await allCases();if(!list.length){toast('Nothing to back up yet');return}
  const out=[];for(const c of list){const b={};for(const k in c.blobs||{}){try{b[k]=await blobToDataURL(c.blobs[k])}catch{}}out.push({...c,blobs:b})}
  await saveFiles([[`ACL-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify({app:'acl-planner',v:1,cases:out}),'application/json']]);toast(`Backed up ${list.length} patients`)}
async function restore(file){try{const j=JSON.parse(await file.text());if(!j.cases)throw 0;let n=0;
  for(const c of j.cases){const b={};for(const k in c.blobs||{}){try{b[k]=await (await fetch(c.blobs[k])).blob()}catch{}}await DB.put({...c,blobs:b});n++}
  toast(`Restored ${n} patients`);renderCases()}catch{toast('That is not an ACL Planner backup file')}}
async function saveFiles(files){
  if(isNative&&window.Capacitor.Plugins.Filesystem&&window.Capacitor.Plugins.Share){const {Filesystem,Share}=window.Capacitor.Plugins;const uris=[];
    for(const [name,text] of files){const w=await Filesystem.writeFile({path:name,data:text,directory:'CACHE',encoding:'utf8'});uris.push(w.uri)}
    try{await Share.share({title:files.map(f=>f[0]).join(', '),files:uris})}catch{}return}
  for(const [name,text,type] of files){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);await new Promise(r=>setTimeout(r,400))}}
$('#saveCase').onclick=()=>saveCase(false);
$('#caseSearch').addEventListener('input',renderCases);
$('#exportCsv').onclick=exportCSV;$('#backupBtn').onclick=backup;
$('#restoreFile').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)restore(f)});
