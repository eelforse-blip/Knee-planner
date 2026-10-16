
/* ---------- forms ---------- */
function fieldHTML(f,d,meas){
  if(f.show&&!f.show(d))return'';
  if(f.t==='note')return`<p class="h">${f.l}</p>`;
  if(f.t==='chk')return`<label class="tog"><input type="checkbox" data-k="${f.k}" ${d[f.k]?'checked':''}> ${f.l}</label>`;
  if(f.t==='seg')return`<div class="full"><span>${f.l}</span><div class="seg">${f.o.map(([v,l])=>`<button data-k="${f.k}" data-v="${v}" class="${String(d[f.k])===v?'on':''}">${l}</button>`).join('')}</div></div>`;
  if(f.t==='sel')return`<label for="f_${f.k}">${f.l}</label><select id="f_${f.k}" data-k="${f.k}">${f.o.map(([v,l])=>`<option value="${v}" ${String(d[f.k])===v?'selected':''}>${l}</option>`).join('')}</select>`;
  if(f.t==='beighton'){const n=beightonScore(d);return`<div class="full"><span>Beighton score <span class="badge" id="bgScore">${n}/9</span></span><div class="bgrid">${BEIGHTON.map((l,i)=>`<label class="tog"><input type="checkbox" data-k="b${i}" ${d['b'+i]?'checked':''}> ${l}</label>`).join('')}</div></div>`}
  const ph=f.m&&meas[f.m]!=null?f1(meas[f.m]):'';
  return`<label for="f_${f.k}">${f.l}</label><input id="f_${f.k}" type="number" inputmode="decimal" step="any" data-k="${f.k}" value="${esc(d[f.k]??'')}" placeholder="${ph}"><span class="u">${f.u||''}</span>`}
function renderForm(tab,el){const d=S.d;const meas=computeImage();
  el.innerHTML=FORMS[tab].map(([title,fs])=>{const body=fs.map(f=>fieldHTML(f,d,meas)).join('');return body?`<div class="group"><h3>${title}</h3><div class="fgrid">${body}</div></div>`:''}).join('')+(tab==='pt'||tab==='ex'?liveBox():'')}
function liveBox(){const R=decide();return`<div class="banner" id="liveBox"><b>${esc(R.head)}</b><br><span class="fine">${esc(R.feds)} · Stanmore ${esc(R.stanmore.t)} · ISIS ${R.isisT}/10${R.gtimsT!=null?' · GTIMS '+R.gtimsT:''}</span> <button class="btn" data-goto="dec" style="margin-top:6px">Open decision</button></div>`}
function formTarget(tab){return tab==='img'?$('#imgForm'):$('#p-'+tab)}
function renderTab(tab){if(tab==='rec'){renderRecord();return}if(tab==='sc'){renderScores();return}if(tab==='dec'){renderDec();return}if(FORMS[tab]){const el=formTarget(tab);const st=(tab==='img'?$('#p-img'):el).scrollTop;renderForm(tab,el);(tab==='img'?$('#p-img'):el).scrollTop=st}if(tab==='img')renderImg()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-goto]');if(g){selectTab(g.dataset.goto);return}
  const b=e.target.closest('.seg button[data-k]');if(!b)return;S.d[b.dataset.k]=b.dataset.v;renderTab(S.tab);autosave()});
document.addEventListener('change',e=>{const i=e.target;if(!i.dataset||!i.dataset.k)return;const k=i.dataset.k;
  S.d[k]=i.type==='checkbox'?i.checked:i.value;renderTab(S.tab);autosave()});
document.addEventListener('input',e=>{const i=e.target;if(!i.dataset||!i.dataset.k||i.type!=='number')return;S.d[i.dataset.k]=i.value;autosave()});

/* ---------- decision tab ---------- */
const STATE={ind:['acc','Indicated'],consider:['warn','Consider'],contra:['bad','Not advised'],no:['mut','Not needed']};
let lastSummary='';
function gblCat(G){const T=S.th;return G==null?['mut','not measured']:G>=T.crit?['bad','critical']:G>=T.subcrit?['warn','subcritical']:['ok','below subcritical']}
function trackTxt(v){return v.off==null?['mut','unknown']:v.off?['bad','off-track'+(v.offSrc==='dynamic'?' (dynamic)':'')]:v.near?['warn','near-track']:['ok','on-track']}
function renderDec(){const R=decide();const d=S.d,T=S.th,v=R.v;let h='';const tr=trackTxt(v),gc=gblCat(v.gbl);
  h+=`<div class="rec"><span class="l">Recommendation${R.prov?' (provisional)':''}</span><span class="h">${esc(R.head)}</span>
   <div class="figs">${d.dir!=='post'?`<div><span class="k">Glenoid loss</span><span class="v">${v.gbl!=null?f1(v.gbl):'—'}<small>%</small></span></div><div><span class="k">Track</span><span class="v" style="font-size:15px">${tr[1]}</span></div>`:''}
   ${d.dir==='post'?`<div><span class="k">Post. loss</span><span class="v">${v.pgbl!=null?f1(v.pgbl):'—'}<small>%</small></span></div><div><span class="k">Version</span><span class="v">${v.version!=null?f1(v.version):'—'}<small>°</small></span></div><div><span class="k">Reverse HS</span><span class="v">${v.rhs!=null?f0(v.rhs):'—'}<small>%</small></span></div>`:''}
   <div><span class="k">ISIS</span><span class="v">${R.isisT}<small>/10</small></span></div>${R.gtimsT!=null?`<div><span class="k">GTIMS</span><span class="v">${R.gtimsT}<small>/10</small></span></div>`:''}</div>
   <span class="fine">${esc(R.feds)} · Stanmore ${esc(R.stanmore.l)}</span></div>`;
  if(d.dir!=='post'||v.gbl!=null||v.hsi!=null){
    h+=`<div class="card"><div class="hd"><b>Bipolar bone loss</b><span class="pill ${tr[0]}">${tr[1]}</span></div><table class="mt">
     <tr><td>Glenoid bone loss <span class="ref">width method</span></td><td class="n">${v.gbl!=null?f1(v.gbl)+' %':'—'} <span class="pill ${gc[0]}">${gc[1]}</span></td></tr>
     ${v.im.gblArea!=null&&num(d.gbl)==null?`<tr><td>Glenoid bone loss <span class="ref">area method</span></td><td class="n">${f1(v.im.gblArea)} %</td></tr>`:''}
     <tr><td>Glenoid diameter D</td><td class="n">${v.D!=null?f1(v.D)+' mm':'—'}</td></tr>
     <tr><td>Defect width d</td><td class="n">${v.dmm!=null?f1(v.dmm)+' mm':'—'}</td></tr>
     <tr><td>Glenoid track = ${T.gtk} × D − d</td><td class="n">${v.gt!=null?f1(v.gt)+' mm':'—'}</td></tr>
     <tr><td>Hill-Sachs interval${v.im.bb!=null&&num(d.hsi)==null?` <span class="ref">bridge ${f1(v.im.bb)} + width ${f1(v.im.hsw)}</span>`:''}</td><td class="n">${v.hsi!=null?f1(v.hsi)+' mm':'—'}</td></tr>
     <tr><td>Distance to dislocation (GT − HSI)</td><td class="n">${v.dtd!=null?f1(v.dtd)+' mm':'—'}</td></tr>
     ${v.gtGraft!=null&&v.hsi!=null?`<tr><td>Track after a bone block restores D</td><td class="n">${f1(v.gtGraft)} mm · ${v.hsi>v.gtGraft?'still off-track':'on-track'}</td></tr>`:''}</table>
     <p class="why">HSI > glenoid track = off-track (Di Giacomo 2014). Distance to dislocation < ${T.dtd} mm = near-track, higher failure after Bankart (Li 2021). Bone loss ≥ ${T.subcrit} % worsens Bankart outcomes (Shaha 2015); ≥ ${T.crit} % is critical.</p></div>`}
  const isRow=a=>a.map(([l,p,m])=>`<tr><td>${esc(l)}</td><td class="n">${p}/${m}</td></tr>`).join('');
  if(d.dir==='ant')h+=`<div class="card"><div class="hd"><b>Instability scores</b></div><table class="mt"><tr><th>Item</th><th>Points</th></tr>${isRow(R.isis)}<tr><td><b>ISIS</b></td><td class="n"><b>${R.isisT}/10</b></td></tr></table>
     <p class="why">ISIS > 6: ~70 % recurrence after Bankart – Latarjet advised (Balg & Boileau 2007); many now use ≥ 4. GTIMS replaces the X-ray items with off-track on 3D CT (4 points); ≥ ${T.gtims} → Latarjet (Di Giacomo 2020).</p>
     ${R.gtimsT!=null?`<p class="why"><b>GTIMS ${R.gtimsT}/10</b> – ${R.gtimsT>=T.gtims?'Latarjet range':'Bankart range'}</p>`:'<p class="why">GTIMS needs the glenoid track (Imaging tab).</p>'}</div>`;
  const hx=R.hx;h+=`<div class="card"><div class="hd"><b>Classification and laxity</b></div><table class="mt"><tr><td>FEDS</td><td class="n" style="white-space:normal">${esc(R.feds)}</td></tr><tr><td>Stanmore</td><td class="n" style="white-space:normal">${esc(R.stanmore.l)}</td></tr>
    <tr><td>External rotation at the side</td><td class="n">${hx.er!=null?hx.er+'°':'—'}${hx.ant?' · hyperlax':''}</td></tr><tr><td>Gagey hyperabduction</td><td class="n">${hx.gg!=null?hx.gg+'°':'—'}${hx.inf?' · inferior laxity':''}</td></tr>
    <tr><td>Beighton</td><td class="n">${hx.bg}/9${hx.gen?' · hypermobile':''}</td></tr><tr><td>Sulcus</td><td class="n">${['< 1 cm','1–2 cm','> 2 cm'][+d.sulcus]}${d.sulcusER?' · persists in ER':''}</td></tr></table></div>`;
  const shown=OPT_ORDER.filter(k=>R.O[k].st!=='no').sort((a,b)=>({ind:0,consider:1,contra:2}[R.O[a].st]-{ind:0,consider:1,contra:2}[R.O[b].st]));
  h+=shown.map(k=>{const o=R.O[k];return`<div class="card ${o.st==='ind'?'ind':''}"><div class="hd"><b>${esc(OPT[k])}</b><span class="pill ${STATE[o.st][0]}">${STATE[o.st][1]}</span></div>${o.why?`<p class="why">${esc(o.why)}</p>`:''}${o.pro.length?`<ul class="lst pro">${o.pro.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${o.con.length?`<ul class="lst con">${o.con.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</div>`}).join('');
  if(R.failed)h+=`<div class="card"><div class="hd"><b>Failed stabilisation – risk factors</b><span class="pill ${R.failed.F.filter(x=>x[0]).length?'bad':'ok'}">${R.failed.F.filter(x=>x[0]).length} present</span></div><ul class="lst chk">${R.failed.F.map(([y,l])=>`<li class="${y?'y':'n'}">${esc(l)}</li>`).join('')}</ul></div>`;
  if(R.steps.length)h+=`<div class="card"><div class="hd"><b>Work-up</b></div><ol>${R.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
  if(R.notes.length)h+=`<div class="card"><div class="hd"><b>Special situations</b></div><ul>${R.notes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  h+=`<div class="card"><div class="hd"><b>Rehabilitation and return to sport</b></div><ul>${R.rts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  h+=scoresCard();
  h+=`<div class="row"><button class="btn primary" id="decPrint">Print / PDF</button><button class="btn" id="copy">Copy summary</button><button class="btn" id="share">Share</button></div>`;
  h+=`<details><summary>Thresholds</summary><div class="thr">${Object.keys(TH_DEFAULT).map(k=>`<label for="th_${k}">${TH_LABEL[k][0]} <span class="src">${TH_LABEL[k][1]}</span></label><input id="th_${k}" type="number" step="any" data-th="${k}" value="${T[k]}">`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn" id="thReset">Reset to defaults</button></div></details>`;
  h+=`<details><summary>References</summary><ol class="refs">${REFS.map(([t,doi])=>doi?`<li>${t} <a href="https://doi.org/${doi}" target="_blank" rel="noopener">doi:${doi}</a></li>`:`<li>${t}</li>`).join('')}</ol></details>`;
  h+=`<p class="fine">Decision aid only: it combines the measurements and findings you enter with published thresholds. Confirm measurements on the original images; the decision belongs to the surgeon and the patient.</p>`;
  const el=$('#p-dec');const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;
  lastSummary=summary(R);
  $('#decPrint').onclick=openPrintSheet;
  $('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(lastSummary);toast('Summary copied')}catch{toast('Copy not available here')}};
  $('#share').onclick=()=>shareText('Shoulder instability plan',lastSummary);
  $$('[data-th]').forEach(i=>i.onchange=()=>{const x=num(i.value);if(x!=null){S.th[i.dataset.th]=x;renderDec();autosave()}});
  $('#thReset').onclick=()=>{S.th={...TH_DEFAULT};renderDec();autosave()}}
const REFS=[
 ['Di Giacomo, Itoi, Burkhart 2014. Evolving concept of bipolar bone loss and the Hill-Sachs lesion: from engaging to on-track/off-track. Arthroscopy 30:90–98.','10.1016/j.arthro.2013.10.004'],
 ['Balg & Boileau 2007. The instability severity index score. J Bone Joint Surg Br 89:1470–7.','10.1302/0301-620X.89B11.18962'],
 ['Di Giacomo et al. 2020. Glenoid Track Instability Management Score: radiographic modification of the ISIS. Arthroscopy 36:56–67.','10.1016/j.arthro.2019.07.020'],
 ['Shaha et al. 2015. Redefining “critical” bone loss in shoulder instability: subcritical bone loss (13.5 %). Am J Sports Med 43:1719–25.','10.1177/0363546515578250'],
 ['Li et al. 2021. On-track lesions with a small distance to dislocation are associated with failure after arthroscopic stabilization. J Bone Joint Surg Am 103:961–7.','10.2106/JBJS.20.00917'],
 ['Boileau et al. 2006. Risk factors for recurrence after arthroscopic Bankart repair. J Bone Joint Surg Am 88:1755–63.','10.2106/JBJS.E.00817'],
 ['Hurley et al. 2022. Anterior shoulder instability part I – diagnosis, non-operative management and Bankart repair: international consensus. Arthroscopy 38:214–223.','10.1016/j.arthro.2021.07.022'],
 ['Hurley et al. 2022. Anterior shoulder instability part II – Latarjet, remplissage and glenoid bone-grafting: international consensus. Arthroscopy 38:224–233.','10.1016/j.arthro.2021.07.023'],
 ['Hurley et al. 2025. Posterior shoulder instability part I – diagnosis, non-operative management and labral repair: Delphi consensus. Arthroscopy 41:166–180.','10.1016/j.arthro.2024.04.035'],
 ['Hurley et al. 2025. Posterior shoulder instability part II – glenoid bone-grafting, osteotomy, rehabilitation and return to play: Delphi consensus. Arthroscopy 41:181–195.','10.1016/j.arthro.2024.04.034'],
 ['Guehring et al. 2017. Posterior shoulder dislocation with reverse Hill-Sachs lesion: treatment by defect size (< 25 %, 25–40 %, > 40 %). BMC Musculoskelet Disord 18:442.','10.1186/s12891-017-1808-6'],
 ['Kirkley et al. 1998. The Western Ontario Shoulder Instability Index (WOSI). Am J Sports Med 26:764–72.','10.1177/03635465980260060501'],
 ['Gerometta et al. 2018. Shoulder Instability-Return to Sport after Injury (SIRSI). Knee Surg Sports Traumatol Arthrosc 26:203–211.','10.1007/s00167-017-4645-0'],
 ['Rowe, Patel, Southmayd 1978. The Bankart procedure: a long-term end-result study (Rowe score). J Bone Joint Surg Am 60:1–16.',''],
 ['Lewis, Kitamura, Bayley 2004. The classification of shoulder instability: new light through old windows (Stanmore triangle). Curr Orthop 18:97–108.',''],
 ['Kuhn 2010. A proposed classification system for shoulder instability (FEDS). J Shoulder Elbow Surg 19:1035–43.','']];
function summary(R){const d=S.d,v=R.v,L=[];
  L.push(`Shoulder instability · ${d.age||'?'} y ${d.sex} · ${d.side==='L'?'left':'right'} · ${R.feds}`);
  L.push(`Stanmore ${R.stanmore.l}`);
  if(v.gbl!=null||v.hsi!=null)L.push(`Glenoid bone loss ${v.gbl!=null?f1(v.gbl)+' %':'—'} · D ${v.D!=null?f1(v.D):'—'} mm · GT ${v.gt!=null?f1(v.gt):'—'} mm · HSI ${v.hsi!=null?f1(v.hsi):'—'} mm · ${trackTxt(v)[1]}${v.dtd!=null?' (DTD '+f1(v.dtd)+' mm)':''}`);
  if(d.dir==='post')L.push(`Posterior bone loss ${v.pgbl!=null?f1(v.pgbl)+' %':'—'} · version ${v.version!=null?f1(v.version)+'°':'—'} · reverse Hill-Sachs ${v.rhs!=null?f0(v.rhs)+' %':'—'}`);
  if(d.dir==='ant')L.push(`ISIS ${R.isisT}/10${R.gtimsT!=null?' · GTIMS '+R.gtimsT+'/10':''}`);
  L.push('Plan: '+R.head);
  OPT_ORDER.filter(k=>R.O[k].st!=='no').forEach(k=>{const o=R.O[k];L.push(`- ${OPT[k]}: ${STATE[o.st][1]}${o.why?' – '+o.why:''}`)});
  if(R.steps.length){L.push('Work-up:');R.steps.forEach(x=>L.push('- '+x))}
  R.notes.forEach(x=>L.push('! '+x));
  return L.join('\n')}

/* ---------- image handling ---------- */
function curImg(){return imgs[S.mode]||null}
function blobToCanvas(blob){return new Promise((res,rej)=>{const url=URL.createObjectURL(blob);const im=new Image();
  im.onload=()=>{const MAX=3000,sc=Math.min(1,MAX/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c)};
  im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('bad'))};im.src=url})}
async function loadImageFile(f){if(!f)return;
  try{const c=await blobToCanvas(f);imgs[S.mode]=c;blobs[S.mode]=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));
    S.P[S.mode]={};S.active=MODES[S.mode].pts[0][0];S.noViewer=false;layout();fit();update();toast(`${MODES[S.mode].name} image loaded`)}
  catch{toast('That file could not be opened. Export the image as JPEG or PNG.')}}
$('#file').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';loadImageFile(f)});
['dragover','drop'].forEach(ev=>document.addEventListener(ev,e=>{if(!e.dataTransfer||![...e.dataTransfer.types].includes('Files'))return;e.preventDefault();
  if(ev==='drop'){const f=[...e.dataTransfer.files].find(x=>x.type.startsWith('image/'));if(!f)return;if(S.tab!=='img')selectTab('img');loadImageFile(f)}}));
document.addEventListener('paste',e=>{const it=[...(e.clipboardData||{}).items||[]].find(x=>x.type&&x.type.startsWith('image/'));if(!it)return;e.preventDefault();if(S.tab!=='img')selectTab('img');loadImageFile(it.getAsFile())});
document.addEventListener('keydown',e=>{const tag=(e.target.tagName||'').toLowerCase();const typing=['input','textarea','select'].includes(tag);
  if(e.key==='Escape'){$$('.sheet').forEach(s=>s.hidden=true);return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='p'){e.preventDefault();openPrintSheet();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveCase(false);return}
  if(typing)return;
  if((e.key==='Delete'||e.key==='Backspace')&&S.tab==='img'){e.preventDefault();deletePoint()}});
let installEvt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$('#installBtn').hidden=false;$('#installMenu').hidden=false});
const doInstall=async()=>{if(!installEvt){toast('Use the browser menu → Install app');return}installEvt.prompt();try{await installEvt.userChoice}catch{}installEvt=null;$('#installBtn').hidden=true;$('#installMenu').hidden=true};
$('#installBtn').onclick=doInstall;$('#installMenu').onclick=()=>{$('#menuSheet').hidden=true;doInstall()};
window.addEventListener('appinstalled',()=>{$('#installBtn').hidden=true;$('#installMenu').hidden=true;toast('Installed: open it from the desktop or Start menu')});

/* ---------- viewer ---------- */
function resize(){const r=cv.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv.width=Math.max(1,Math.round(r.width*dpr));cv.height=Math.max(1,Math.round(r.height*dpr));draw()}
function fit(){const im=curImg();const r=cv.getBoundingClientRect();if(!im||!r.width){draw();return}
  const top=56,bot=50,s=Math.min(r.width/im.width,(r.height-top-bot)/im.height)*.96;view={s,tx:(r.width-im.width*s)/2,ty:top+(r.height-top-bot-im.height*s)/2};draw()}
let lastSize='';new ResizeObserver(()=>{const r=cv.getBoundingClientRect();const k=Math.round(r.width)+'x'+Math.round(r.height);if(k===lastSize)return;lastSize=k;resize();fit()}).observe($('#viewer'));
$('#fit').onclick=fit;
const zoomAt=(k,x,y)=>{const ns=Math.max(.05,Math.min(40,view.s*k));const kk=ns/view.s;view.tx=x-(x-view.tx)*kk;view.ty=y-(y-view.ty)*kk;view.s=ns;draw()};
$('#zin').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(1.4,r.width/2,r.height/2)};
$('#zout').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(1/1.4,r.width/2,r.height/2)};
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
const toS=p=>({x:p.x*view.s+view.tx,y:p.y*view.s+view.ty}),toI=(x,y)=>({x:(x-view.tx)/view.s,y:(y-view.ty)/view.s});
const ptrs=new Map();let G=null,dragId=null;
const loc=e=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
function hit(x,y){const pts=S.P[S.mode]||{};let best=null,bd=24;for(const k in pts){const s=toS(pts[k]);const dd=Math.hypot(s.x-x,s.y-y);if(dd<bd){bd=dd;best=k}}return best}
cv.addEventListener('pointerdown',e=>{if(!curImg())return;cv.setPointerCapture(e.pointerId);const p=loc(e);ptrs.set(e.pointerId,p);
  if(ptrs.size===1){const h=hit(p.x,p.y);G={type:h?'drag':'tap',id:h,sx:p.x,sy:p.y,lx:p.x,ly:p.y}}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()];G={type:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y),c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},v0:{...view}};dragId=null}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId)||!G)return;const p=loc(e);ptrs.set(e.pointerId,p);
  if(G.type==='pinch'&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const c={x:(a.x+b.x)/2,y:(a.y+b.y)/2},dd=Math.hypot(a.x-b.x,a.y-b.y);
    const s=Math.max(.05,Math.min(40,G.v0.s*dd/G.d0));const I={x:(G.c0.x-G.v0.tx)/G.v0.s,y:(G.c0.y-G.v0.ty)/G.v0.s};view={s,tx:c.x-I.x*s,ty:c.y-I.y*s};draw();return}
  if(G.type==='drag'){if(Math.hypot(p.x-G.sx,p.y-G.sy)>3||dragId){const q=S.P[S.mode][G.id];q.x+=(p.x-G.lx)/view.s;q.y+=(p.y-G.ly)/view.s;dragId=G.id;G.lx=p.x;G.ly=p.y;update()}return}
  if(G.type==='tap'&&Math.hypot(p.x-G.sx,p.y-G.sy)>8)G.type='pan';
  if(G.type==='pan'){view.tx+=p.x-G.lx;view.ty+=p.y-G.ly;G.lx=p.x;G.ly=p.y;draw()}});
function up(e){if(!ptrs.has(e.pointerId))return;const p=loc(e);ptrs.delete(e.pointerId);
  if(G&&G.type==='tap'&&ptrs.size===0)place(toI(p.x,p.y));
  if(G&&G.type==='drag'&&!dragId&&ptrs.size===0){S.active=G.id;update()}
  if(ptrs.size===0){G=null;if(dragId){dragId=null;update()}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function place(p){const md=MODES[S.mode];if(!S.active)return;(S.P[S.mode]=S.P[S.mode]||{})[S.active]=p;
  const ids=md.pts.map(x=>x[0]);const i=ids.indexOf(S.active);const next=ids.slice(i+1).find(k=>!S.P[S.mode][k])||ids.find(k=>!S.P[S.mode][k]);
  if(next)S.active=next;update();if(navigator.vibrate)try{navigator.vibrate(8)}catch{}}
function deletePoint(){const pts=S.P[S.mode];if(!pts||!pts[S.active])return;delete pts[S.active];toast('Point deleted. Tap the image to place it again');update()}
$('#delPt').onclick=deletePoint;$('#delPt2').onclick=deletePoint;

let raf=0;function draw(){if(!raf)raf=requestAnimationFrame(render)}
function line(a,b,col,w=1.6,dash=null){const A=toS(a),B=toS(b);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.restore()}
function circleS(c,r,col,w=1.6,dash=null){const s=toS(c);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.arc(s.x,s.y,r*view.s,0,7);ctx.stroke();ctx.restore()}
function tag(p,text,col,dx=10,dy=-10){const s=toS(p);ctx.save();ctx.font='600 11.5px "IBM Plex Mono", monospace';const w=ctx.measureText(text).width+10;let x=s.x+dx,y=s.y+dy;if(dx<0)x-=w;ctx.fillStyle='rgba(5,8,11,.86)';ctx.fillRect(x,y-13,w,18);ctx.fillStyle=col;ctx.fillText(text,x+5,y);ctx.restore()}
function render(){raf=0;const dpr=window.devicePixelRatio||1;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#05080b';ctx.fillRect(0,0,cv.width,cv.height);
  const im=curImg();ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!im){ctx.fillStyle='#8a98a4';ctx.font='14px Archivo, sans-serif';ctx.fillText('Open an image for this measurement',20,90);return}
  ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.tx,dpr*view.ty);ctx.drawImage(im,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  overlays();if(dragId&&S.P[S.mode][dragId])loupe(S.P[S.mode][dragId],dpr,im)}
function overlays(){const m=S.mode,pts=S.P[m]||{};const r=computeImage();
  if(pts.cal1&&pts.cal2)line(pts.cal1,pts.cal2,'#fff',1.4);
  if(m==='glen'){const g=glenGeo();
    if(g){circleS(g.c,g.r,COL.line,1.6,[6,4]);const top=add(g.c,mul(g.u,-g.r*1.6)),bot=add(g.c,mul(g.u,g.r*1.1));line(top,bot,COL.ghost,1.2,[4,4]);
      const e1=add(g.c,mul(g.h,g.r)),e2=add(g.c,mul(g.h,-g.r));line(e1,e2,COL.ghost,1.2);
      tag(add(g.c,mul(g.u,g.r)),r.D!=null?`D ${f1(r.D)} mm`:'calibrate',COL.line,10,16);
      if(g.dA!=null){const edge=add(g.c,mul(g.h,g.sA*g.r));line(pts.A,edge,COL.bad,3);tag(pts.A,`${f1(r.gbl)} %${r.dmm!=null?' · '+f1(r.dmm)+' mm':''}`,COL.bad,g.sA>0?12:-12,-12)}
      if(g.dP!=null){const edge=add(g.c,mul(g.h,g.sP*g.r));line(pts.Pr,edge,COL.alt,3);tag(pts.Pr,`post ${f1(r.pgbl)} %`,COL.alt,g.sP>0?12:-12,-12)}}
    if(pts.S&&g)line(pts.S,g.c,COL.ghost,1)}
  if(m==='hs'){if(pts.F&&pts.H1){line(pts.F,pts.H1,COL.line,2.4);if(r.bb!=null)tag(mid(pts.F,pts.H1),`bridge ${f1(r.bb)}`,COL.line,-10,-14)}
    if(pts.H1&&pts.H2){line(pts.H1,pts.H2,COL.alt,3);if(r.hsw!=null)tag(mid(pts.H1,pts.H2),`HS ${f1(r.hsw)}`,COL.alt,-10,22)}
    if(r.hsi!=null){const v=vals();tag(pts.H2,`HSI ${f1(r.hsi)} mm${v.gt!=null?(v.off?' > ':' ≤ ')+'GT '+f1(v.gt):''}`,v.off?COL.bad:COL.meas,-12,-14)}}
  if(m==='ax'){const a=axGeo();
    if(a.G0){line(pts.M,add(a.G0,mul(a.ax,180)),COL.ghost,1.4,[6,4]);line(pts.GA,pts.GP,COL.line,2.2);line(a.G0,add(a.G0,mul(a.n,90)),COL.meas,1.6);tag(pts.GP,`version ${f1(a.version)}° ${a.version>=0?'retro':'ante'}`,COL.meas,-12,26)}
    if(a.head){circleS(a.head.c,a.head.r,COL.line,1.4,[6,4]);if(a.walch!=null)tag(a.head.c,`Walch ${f0(a.walch)} %`,COL.line,-50,4)}
    if(a.head&&pts.R1&&pts.R2){line(pts.R1,pts.R2,COL.bad,3);if(a.rhs!=null)tag(pts.R2,`reverse HS ${f0(a.rhs)} %`,COL.bad,-14,-14)}
    if(a.head&&pts.A1&&pts.A2){line(a.head.c,pts.A1,COL.ghost,1);line(a.head.c,pts.A2,COL.ghost,1)}}
  for(const k in pts){const s=toS(pts[k]);const on=k===S.active;ctx.save();ctx.lineWidth=on?2.4:1.6;ctx.strokeStyle=on?'#fff':COL.pt;ctx.fillStyle='rgba(5,8,11,.5)';
    ctx.beginPath();ctx.arc(s.x,s.y,on?8:6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=on?'#fff':COL.pt;ctx.beginPath();ctx.arc(s.x,s.y,1.6,0,7);ctx.fill();ctx.restore()}}
function loupe(p,dpr,im){const r=cv.getBoundingClientRect();const s=toS(p);const R=62,Z=3;const cx=s.x<r.width/2?r.width-R-14:R+14,cy=R+60;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(cx-R,cy-R,2*R,2*R);const k=view.s*Z;
  ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(cx-p.x*k),dpr*(cy-p.y*k));ctx.drawImage(im,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.strokeStyle=COL.pt;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx-6,cy);ctx.moveTo(cx+6,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy-6);ctx.moveTo(cx,cy+6);ctx.lineTo(cx,cy+R);ctx.stroke();ctx.restore();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke()}

/* ---------- imaging pane ---------- */
function renderImg(){const md=MODES[S.mode];const r=computeImage();
  const val={glen:r.gbl!=null?f1(r.gbl)+' %'+(r.D!=null?' · D '+f1(r.D):''):'',hs:r.hsi!=null?'HSI '+f1(r.hsi)+' mm':'',ax:r.version!=null?f1(r.version)+'°'+(r.rhs!=null?' · RHS '+f0(r.rhs)+' %':''):''};
  $('#modes').innerHTML=MODE_ORDER.map(k=>`<button class="sl ${k===S.mode?'on':''}" data-m="${k}"><b>${MODES[k].name}</b><span>${val[k]||MODES[k].sub}</span></button>`).join('');
  $$('#modes .sl').forEach(b=>b.onclick=()=>chooseMode(b.dataset.m));
  $('#modeHint').textContent=md.hint;$('#hideViewer').textContent=S.noViewer?'Show viewer':'Hide viewer';
  $('#steps').innerHTML=md.pts.map(([id,l])=>`<button class="step ${P(S.mode,id)?'done':''} ${id===S.active?'on':''}" data-id="${id}"><span class="dot"></span><span>${l}</span><span class="gl">${id.indexOf('cal')===0?'Scale':''}</span></button>`).join('');
  $$('#steps .step').forEach(b=>b.onclick=()=>{S.active=b.dataset.id;update()});
  const can=!!(curImg()&&P(S.mode,S.active));$('#delPt').hidden=!can;$('#delPt2').hidden=!can;
  $('#calBox').hidden=!md.cal;if(md.cal){$('#calmm').value=S.cal[S.mode];const k=mmpp(S.mode);$('#scaleout').textContent=k?`${k.toFixed(3)} mm/px`:'No scale yet: place both ends of the scale bar.'}
  $('#measOut').innerHTML=measHTML(r);
  renderPrompt()}
function measHTML(r){const rows=[];const v=vals();
  if(S.mode==='glen'){rows.push(['Bone loss (width)',r.gbl!=null?f1(r.gbl)+' %':'—'],['Bone loss (area)',r.gblArea!=null?f1(r.gblArea)+' %':'—'],['Diameter D',r.D!=null?f1(r.D)+' mm':'—'],['Defect d',r.dmm!=null?f1(r.dmm)+' mm':'—'],['Glenoid track',v.gt!=null?f1(v.gt)+' mm':'—']);if(r.pgbl!=null)rows.push(['Posterior bone loss',f1(r.pgbl)+' %']);if(r.pSame)rows.push(['Posterior point','same side as the defect – ignored'])}
  if(S.mode==='hs')rows.push(['Bone bridge',r.bb!=null?f1(r.bb)+' mm':'—'],['Hill-Sachs width',r.hsw!=null?f1(r.hsw)+' mm':'—'],['HSI',r.hsi!=null?f1(r.hsi)+' mm':'—'],['Glenoid track',v.gt!=null?f1(v.gt)+' mm':'measure the glenoid'],['Status',trackTxt(v)[1]]);
  if(S.mode==='ax')rows.push(['Glenoid version',r.version!=null?f1(r.version)+'° '+(r.version>=0?'retroversion':'anteversion'):'—'],['Walch subluxation',r.walch!=null?f0(r.walch)+' %':'—'],['Reverse Hill-Sachs',r.rhs!=null?f0(r.rhs)+' % of arc':'—']);
  return`<table class="mt">${rows.map(([a,b])=>`<tr><td>${a}</td><td class="n">${b}</td></tr>`).join('')}</table>`}
$('#calmm').addEventListener('input',e=>{const x=num(e.target.value);if(x){S.cal[S.mode]=x;update()}});
$('#hideViewer').onclick=()=>{S.noViewer=!S.noViewer;layout();update()};
function chooseMode(m){S.mode=m;const ids=MODES[m].pts.map(x=>x[0]);S.active=ids.find(k=>!P(m,k)&&k.indexOf('cal')!==0)||ids.find(k=>k.indexOf('cal')!==0);fit();update()}
function renderPrompt(){const md=MODES[S.mode];const st=md.pts.find(p=>p[0]===S.active)||md.pts[0];
  $('#vlabel').textContent=md.name;
  $('#prompt').innerHTML=!curImg()?`<span class="k">Image</span><span>Open the ${md.name} image<small>${md.hint}</small></span>`:`<span class="k">${P(S.mode,S.active)?'Adjust':'Tap'}</span><span>${st[1]}<small>${st[2]||''}</small></span>`}
