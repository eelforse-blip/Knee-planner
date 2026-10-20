
/* ---------- state ---------- */
const MODES=MEAS;
let S={d:{...G_BLANK,fx:'drad'},f:{},P:{},cal:{screw:10.5},tab:'fx',mode:'dr_ap',active:null,noViewer:false,rec:null,caseId:null};
let imgs={},blobs={},view={s:1,tx:0,ty:0};
const KM=m=>S.d.fx+'|'+(m||S.mode);
const P=(m,k)=>S.P[KM(m)]&&S.P[KM(m)][k];
function mmpp(m){const a=P(m,'cal1'),b=P(m,'cal2');const c=S.cal[m]||10;return a&&b?c/len(sub(a,b)):null}
const curFx=()=>FX[S.d.fx]||FX.drad;
function fxDefaults(fx){const o={};for(const f of fx.fields)o[f.k]=f.t==='chk'?false:(f.t==='seg'||f.t==='sel')?f.o[0][0]:'';return o}
function fvals(){const fx=curFx();return{...fxDefaults(fx),...(S.f[fx.id]||{})}}
function computeImage(){const r={};for(const m of curFx().meas){const md=MEAS[m];const q=S.P[KM(m)]||{};try{Object.assign(r,md.calc(q,md.cal?mmpp(m):null,S))}catch{}}
  if(r.tadap!=null&&r.tadlat!=null)r.tad=r.tadap+r.tadlat;return r}
function vals(){const im=computeImage(),fv=fvals(),fx=curFx();const out={...fv};for(const f of fx.fields)if(f.m&&num(fv[f.k])==null&&im[f.m]!=null)out[f.k]=im[f.m];out._im=im;return out}
function patient(){const d=S.d;return{...d,age:num(d.age),hours:num(d.hours)}}

/* ---------- decision ---------- */
function decide(){const fx=curFx();const R=R0();const Pt=patient();const v=vals();
  try{fx.decide(v,Pt,R)}catch(e){console.error(e);R.notes.push('Decision error: '+e.message)}
  const lowerOrPelvis=['lower','axial'].includes(fx.reg);
  if(Pt.comp){R.opts.unshift({name:'Emergency fasciotomy (all compartments)',st:'ind',why:'Compartment syndrome is a surgical emergency – decompress within the hour, then stabilise the fracture.',pro:[],con:[]});R.timing.unshift('Compartment syndrome: fasciotomy NOW.')}
  if(Pt.vasc){R.notes.unshift('Vascular injury / ischaemia: revascularise within 3–6 h of warm ischaemia – temporary shunt, skeletal stabilisation (often ex-fix), definitive vascular repair; prophylactic fasciotomy.');R.img.unshift('CT angiography (or on-table angiography) if pulses abnormal after reduction / ABPI < 0.9')}
  if(Pt.open!=='no'){R.timing.unshift('Open fracture (BOAST 4): IV antibiotics within 1 h (e.g. cefazolin; add gram-negative cover for Gustilo III), tetanus, photograph, saline-moist dressing, splint.','Debridement: immediately if grossly contaminated or vascular injury; within 12 h for high-energy; within 24 h for other open fractures.','Definitive fixation and soft-tissue cover within 72 h (joint orthoplastic team).');
    if(['IIIB','IIIC'].includes(Pt.open))R.notes.unshift(`Gustilo ${Pt.open}: involve plastic surgery from the start (local / free flap); consider temporary spanning ex-fix if definitive fixation and cover cannot be done together.`);
    R.comp.push('Deep infection (≈ 2 % type I → > 10–30 % type III)')}
  if(Pt.poly==='unstable'||Pt.poly==='border')R.notes.unshift('Polytrauma, physiologically unstable / borderline: damage-control orthopaedics (external fixation), definitive fixation at day 4–14 when stable.');
  if(Pt.skin==='threat')R.timing.unshift('Skin under threat: reduce / splint immediately.');else if(Pt.skin==='swell'&&!R.timing.some(t=>/wrinkle/i.test(t)))R.timing.push('Marked swelling / blisters: elevate, ± spanning ex-fix; operate through healthy skin when wrinkles return.');
  if(Pt.path)R.notes.unshift('Pathological fracture: do not fix a solitary lesion before diagnosis (could be a primary sarcoma) – stage first; metastases: fix with long devices ± cement, then radiotherapy (Mirels score for impending fractures).');
  if(Pt.peri)R.notes.push('Periprosthetic fracture: classify (Vancouver / Su / Rorabeck); is the implant loose? – revision vs fixation.');
  if(Pt.child&&!['scond'].includes(fx.id))R.notes.push('Open growth plates: classify physeal injuries (Salter–Harris), accept more angulation in younger children (remodelling), avoid crossing the physis with rigid implants.');
  if(Pt.anticoag)R.notes.push('Anticoagulant / antiplatelet: plan reversal or timing (warfarin – vitamin K/PCC; DOACs – consider levels / ≈ 24–48 h); aspirin alone does not delay surgery.');
  if(Pt.osteo)R.fu.push('Fragility fracture: falls assessment, vitamin D/calcium, DEXA and osteoporosis treatment (fracture liaison service).');
  if(Pt.smoke)R.notes.push('Smoking doubles non-union and wound complication risk – advise stopping.');
  if(Pt.diab)R.notes.push('Diabetes: check glycaemic control and neuropathy (prolonged protection / non-weight-bearing if neuropathic).');
  if(lowerOrPelvis&&!Pt.child)R.fu.push('VTE prophylaxis (LMWH / DOAC) per risk assessment while mobility is reduced.');
  if(Pt.nerve&&!R.notes.some(n=>/nerve/i.test(n)))R.notes.push('Document the nerve deficit before and after any manipulation.');
  const ind=R.opts.filter(o=>o.st==='ind');R.head=ind.length?ind.map(o=>o.name).slice(0,2).join(' + '):(R.opts[0]?R.opts[0].name:'Complete the assessment');
  R.status=R.acc.some(a=>a.ok===false)?'warn':'ok';R.v=v;R.fx=fx;return R}

/* ---------- forms ---------- */
function fieldHTML(f,d,meas,attr){
  if(f.show&&!f.show(d))return'';const a=attr||'data-k';
  if(f.t==='chk')return`<label class="tog"><input type="checkbox" ${a}="${f.k}" ${d[f.k]?'checked':''}> ${f.l}</label>`;
  if(f.t==='seg')return`<div class="full"><span>${f.l}</span><div class="seg">${f.o.map(([v,l])=>`<button ${a}="${f.k}" data-v="${v}" class="${String(d[f.k])===v?'on':''}">${l}</button>`).join('')}</div></div>`;
  if(f.t==='sel')return`<label for="f_${f.k}">${f.l}</label><select id="f_${f.k}" ${a}="${f.k}">${f.o.map(([v,l])=>`<option value="${v}" ${String(d[f.k])===v?'selected':''}>${l}</option>`).join('')}</select>`;
  const ph=f.m&&meas[f.m]!=null?f1(meas[f.m]):'';
  return`<label for="f_${f.k}">${f.l}</label><input id="f_${f.k}" type="number" inputmode="decimal" step="any" ${a}="${f.k}" value="${esc(d[f.k]??'')}" placeholder="${ph}"><span class="u">${f.u||''}</span>`}
function renderPt(){const el=$('#p-pt');const d=S.d;el.innerHTML=G_FORM.map(([t,fs])=>`<div class="group"><h3>${t}</h3><div class="fgrid">${fs.map(f=>fieldHTML(f,d,{})).join('')}</div></div>`).join('')+liveBox()}
function renderFx(){const el=$('#p-fx');const fx=curFx();const reg=fx.reg;const fv=fvals();const meas=computeImage();
  let h=`<div class="seg" id="regSeg">${REGIONS.map(([k,l])=>`<button data-reg="${k}" class="${S.regView===k||(!S.regView&&reg===k)?'on':''}">${l}</button>`).join('')}</div>`;
  const rv=S.regView||reg;h+=`<div class="fxgrid">${FX_ORDER.filter(id=>FX[id].reg===rv).map(id=>`<button data-fx="${id}" class="${id===fx.id?'on':''}"><b>${esc(FX[id].name)}</b><span>${esc(FX[id].ao)}</span></button>`).join('')}</div>`;
  h+=`<div class="group"><h3>${esc(fx.name)} <span class="badge">${esc(fx.ao)}</span></h3><div class="fgrid">${fx.fields.map(f=>fieldHTML(f,fv,meas,'data-fk')).join('')}</div><p class="h fine">Blue numbers come from your image measurements; typing a value overrides them.</p></div>`+liveBox();
  const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;
  $$('#regSeg [data-reg]').forEach(b=>b.onclick=()=>{S.regView=b.dataset.reg;renderFx()});
  $$('#p-fx [data-fx]').forEach(b=>b.onclick=()=>{S.d.fx=b.dataset.fx;S.regView=null;S.mode=curFx().meas[0];S.active=null;renderFx();autosave()})}
function liveBox(){const R=decide();return`<div class="banner"><b>${esc(R.head)}</b><br><span class="fine">${esc(R.cls[0]||'')}</span><br><button class="btn" data-goto="dec" style="margin-top:6px">Open decision</button></div>`}
function renderTab(tab){if(tab==='rec'){renderRecord();return}if(tab==='pt'){const st=$('#p-pt').scrollTop;renderPt();$('#p-pt').scrollTop=st;return}if(tab==='fx'){renderFx();return}if(tab==='dec'){renderDec();return}if(tab==='img')renderImg()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){selectTab(g.dataset.goto);return}
  const b=e.target.closest('.seg button[data-k]');if(b){S.d[b.dataset.k]=b.dataset.v;renderTab(S.tab);autosave();return}
  const c=e.target.closest('.seg button[data-fk]');if(c){setF(c.dataset.fk,c.dataset.v);renderTab(S.tab);autosave()}});
function setF(k,v){const id=S.d.fx;(S.f[id]=S.f[id]||{})[k]=v}
document.addEventListener('change',e=>{const i=e.target;if(!i.dataset)return;
  if(i.dataset.k){S.d[i.dataset.k]=i.type==='checkbox'?i.checked:i.value;renderTab(S.tab);autosave()}
  else if(i.dataset.fk){setF(i.dataset.fk,i.type==='checkbox'?i.checked:i.value);renderTab(S.tab);autosave()}});
document.addEventListener('input',e=>{const i=e.target;if(!i.dataset||i.type!=='number')return;if(i.dataset.k){S.d[i.dataset.k]=i.value;autosave()}else if(i.dataset.fk){setF(i.dataset.fk,i.value);autosave()}});

/* ---------- decision tab ---------- */
const STATE={ind:['acc','Indicated'],consider:['warn','Consider'],contra:['bad','Not advised']};
let lastSummary='';
const list=(arr,ord)=>arr.length?`<${ord?'ol':'ul'}>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</${ord?'ol':'ul'}>`:'';
function renderDec(){const R=decide();const fx=R.fx;let h='';
  h+=`<div class="rec"><span class="l">${esc(fx.name)} · ${esc(fx.ao)}</span><span class="h">${esc(R.head)}</span>${R.cls.map(c=>`<span class="fine">${esc(c)}</span>`).join('')}</div>`;
  if(R.acc.length)h+=`<div class="card"><div class="hd"><b>Measurements vs acceptable limits</b><span class="pill ${R.status==='warn'?'warn':'ok'}">${R.status==='warn'?'outside limits':'within limits'}</span></div><table class="mt"><tr><th>Parameter</th><th>Value</th><th>Limit</th></tr>${R.acc.map(a=>`<tr><td>${esc(a.label)}</td><td class="n"><span class="pill ${a.ok?'ok':'bad'}">${f1(a.val)}${a.unit?' '+a.unit:''}</span></td><td class="n ref">${esc(a.limit)}</td></tr>`).join('')}</table></div>`;
  const ord={ind:0,consider:1,contra:2};
  h+=[...R.opts].sort((a,b)=>ord[a.st]-ord[b.st]).map(o=>`<div class="card ${o.st==='ind'?'ind':''}"><div class="hd"><b>${esc(o.name)}</b><span class="pill ${STATE[o.st][0]}">${STATE[o.st][1]}</span></div>${o.why?`<p class="why">${esc(o.why)}</p>`:''}${o.pro.length?`<ul class="lst pro">${o.pro.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${o.con.length?`<ul class="lst con">${o.con.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>`).join('');
  const card=(t,arr,ord)=>arr.length?`<div class="card"><div class="hd"><b>${t}</b></div>${list(arr,ord)}</div>`:'';
  h+=card('Timing of surgery',R.timing,true)+card('Approach',R.approach)+card('Implants',R.implant)+card('Follow-up and rehabilitation',R.fu)+card('Imaging and work-up',R.img)+card('Special considerations',R.notes)+card('Complications to watch for',R.comp);
  h+=`<div class="row"><button class="btn primary" id="decPrint">Print / PDF</button><button class="btn" id="copy">Copy summary</button><button class="btn" id="share">Share</button></div>`;
  h+=`<details><summary>References</summary><ol class="refs">${REFS.map(([t,doi])=>doi?`<li>${t} <a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi:${doi}</a></li>`:`<li>${t}</li>`).join('')}</ol></details>`;
  h+=`<p class="fine">Decision aid for trained surgeons: it summarises common, guideline-based practice from the data you enter. Individual patients, local resources and your judgement decide.</p>`;
  const el=$('#p-dec');const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;lastSummary=summary(R);
  $('#decPrint').onclick=openPrintSheet;$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(lastSummary);toast('Summary copied')}catch{toast('Copy not available here')}};$('#share').onclick=()=>shareText('Fracture plan',lastSummary)}
const REFS=[
 ['AO Surgery Reference / AO/OTA Fracture and Dislocation Classification Compendium 2018. J Orthop Trauma 32 Suppl 1.',''],
 ['BOAST – Open fractures (British Orthopaedic Association / BAPRAS, 2017).',''],
 ['NICE CG124 – Hip fracture: management (updated 2023).',''],
 ['Canadian Orthopaedic Trauma Society 2007. Nonoperative treatment vs plate fixation of displaced midshaft clavicular fractures. J Bone Joint Surg Am 89:1–10.','10.2106/JBJS.F.00020'],
 ['Rangan et al. 2015. PROFHER: surgical vs nonsurgical treatment of displaced proximal humerus fractures. JAMA 313:1037–47.','10.1001/jama.2015.1629'],
 ['Hertel et al. 2004. Predictors of humeral head ischemia after intracapsular fracture of the proximal humerus. J Shoulder Elbow Surg 13:427–33.','10.1016/j.jse.2004.01.034'],
 ['Baumgaertner et al. 1995. The value of the tip-apex distance in predicting failure of fixation of peritrochanteric fractures. J Bone Joint Surg Am 77:1058–64.','10.2106/00004623-199507000-00012'],
 ['Willett et al. 2016. Close contact casting vs surgery for unstable ankle fractures in older adults (AIM). JAMA 316:1455–63.','10.1001/jama.2016.14719'],
 ['Griffin et al. 2014. Operative vs non-operative treatment for displaced intra-articular calcaneal fractures (UK HeFT). BMJ 349:g4483.','10.1136/bmj.g4483'],
 ['Vaccaro et al. 2007. The subaxial cervical spine injury classification system (SLIC). Spine 32:2365–74.','10.1097/BRS.0b013e3181557b92'],
 ['Dvorak et al. 2007. The surgical approach to subaxial cervical spine injuries: an algorithm based on SLIC. Spine 32:2620–9.','10.1097/BRS.0b013e318158ce16'],
 ['Lee et al. 2005. Thoracolumbar injury classification and severity score (TLICS). J Orthop Sci 10:671–5.','10.1007/s00776-005-0956-y'],
 ['Bailey et al. 2014. Orthosis vs no orthosis for thoracolumbar burst fractures without neurologic injury. Spine J 14:2557–64.','10.1016/j.spinee.2013.10.017'],
 ['Fehlings et al. 2017. Clinical practice guideline: timing of decompressive surgery in acute spinal cord injury. Global Spine J 7(3 Suppl):195S–202S.','10.1177/2192568217706367']];
function summary(R){const d=S.d,L=[];L.push(`${R.fx.name} (${R.fx.ao}) · ${d.age||'?'} y ${d.sex} · ${{R:'right',L:'left',B:'bilateral / midline'}[d.side]}${d.open!=='no'?' · open Gustilo '+d.open:''}`);
  R.cls.forEach(c=>L.push(c));if(R.acc.length)L.push('Measurements: '+R.acc.map(a=>`${a.label} ${f1(a.val)}${a.unit?' '+a.unit:''}${a.ok?'':' (outside limit)'}`).join('; '));
  L.push('Plan: '+R.head);R.opts.forEach(o=>L.push(`- ${o.name}: ${STATE[o.st][1]}${o.why?' – '+o.why:''}`));
  const sec=(t,a)=>{if(a.length){L.push(t+':');a.forEach(x=>L.push('- '+x))}};sec('Timing',R.timing);sec('Approach',R.approach);sec('Implants',R.implant);sec('Follow-up',R.fu);sec('Work-up',R.img);sec('Notes',R.notes);return L.join('\n')}
