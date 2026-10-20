
/* ---------- image handling + viewer (shared with the other planners) ---------- */
/* ---------- image handling ---------- */
function curImg(){return imgs[KM()]||null}
function blobToCanvas(blob){return new Promise((res,rej)=>{const url=URL.createObjectURL(blob);const im=new Image();
  im.onload=()=>{const MAX=3000,sc=Math.min(1,MAX/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c)};
  im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('bad'))};im.src=url})}
async function loadImageFile(f){if(!f)return;
  try{const c=await blobToCanvas(f);imgs[KM()]=c;blobs[KM()]=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));
    S.P[KM()]={};S.active=MODES[S.mode].pts[0][0];S.noViewer=false;layout();fit();update();toast(`${MODES[S.mode].name} image loaded`)}
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
function hit(x,y){const pts=S.P[KM()]||{};let best=null,bd=24;for(const k in pts){const s=toS(pts[k]);const dd=Math.hypot(s.x-x,s.y-y);if(dd<bd){bd=dd;best=k}}return best}
cv.addEventListener('pointerdown',e=>{if(!curImg())return;cv.setPointerCapture(e.pointerId);const p=loc(e);ptrs.set(e.pointerId,p);
  if(ptrs.size===1){const h=hit(p.x,p.y);G={type:h?'drag':'tap',id:h,sx:p.x,sy:p.y,lx:p.x,ly:p.y}}
  else if(ptrs.size===2){const [a,b]=[...ptrs.values()];G={type:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y),c0:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},v0:{...view}};dragId=null}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId)||!G)return;const p=loc(e);ptrs.set(e.pointerId,p);
  if(G.type==='pinch'&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const c={x:(a.x+b.x)/2,y:(a.y+b.y)/2},dd=Math.hypot(a.x-b.x,a.y-b.y);
    const s=Math.max(.05,Math.min(40,G.v0.s*dd/G.d0));const I={x:(G.c0.x-G.v0.tx)/G.v0.s,y:(G.c0.y-G.v0.ty)/G.v0.s};view={s,tx:c.x-I.x*s,ty:c.y-I.y*s};draw();return}
  if(G.type==='drag'){if(Math.hypot(p.x-G.sx,p.y-G.sy)>3||dragId){const q=S.P[KM()][G.id];q.x+=(p.x-G.lx)/view.s;q.y+=(p.y-G.ly)/view.s;dragId=G.id;G.lx=p.x;G.ly=p.y;update()}return}
  if(G.type==='tap'&&Math.hypot(p.x-G.sx,p.y-G.sy)>8)G.type='pan';
  if(G.type==='pan'){view.tx+=p.x-G.lx;view.ty+=p.y-G.ly;G.lx=p.x;G.ly=p.y;draw()}});
function up(e){if(!ptrs.has(e.pointerId))return;const p=loc(e);ptrs.delete(e.pointerId);
  if(G&&G.type==='tap'&&ptrs.size===0)place(toI(p.x,p.y));
  if(G&&G.type==='drag'&&!dragId&&ptrs.size===0){S.active=G.id;update()}
  if(ptrs.size===0){G=null;if(dragId){dragId=null;update()}}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function place(p){const md=MODES[S.mode];if(!S.active)return;(S.P[KM()]=S.P[KM()]||{})[S.active]=p;
  const ids=md.pts.map(x=>x[0]);const i=ids.indexOf(S.active);const next=ids.slice(i+1).find(k=>!S.P[KM()][k])||ids.find(k=>!S.P[KM()][k]);
  if(next)S.active=next;update();if(navigator.vibrate)try{navigator.vibrate(8)}catch{}}
function deletePoint(){const pts=S.P[KM()];if(!pts||!pts[S.active])return;delete pts[S.active];toast('Point deleted. Tap the image to place it again');update()}
$('#delPt').onclick=deletePoint;$('#delPt2').onclick=deletePoint;

let raf=0;function draw(){if(!raf)raf=requestAnimationFrame(render)}
function line(a,b,col,w=1.6,dash=null){const A=toS(a),B=toS(b);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.stroke();ctx.restore()}
function circleS(c,r,col,w=1.6,dash=null){const s=toS(c);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.arc(s.x,s.y,r*view.s,0,7);ctx.stroke();ctx.restore()}
function tag(p,text,col,dx=10,dy=-10){const s=toS(p);ctx.save();ctx.font='600 11.5px "IBM Plex Mono", monospace';const w=ctx.measureText(text).width+10;let x=s.x+dx,y=s.y+dy;if(dx<0)x-=w;ctx.fillStyle='rgba(5,8,11,.86)';ctx.fillRect(x,y-13,w,18);ctx.fillStyle=col;ctx.fillText(text,x+5,y);ctx.restore()}
function render(){raf=0;const dpr=window.devicePixelRatio||1;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#05080b';ctx.fillRect(0,0,cv.width,cv.height);
  const im=curImg();ctx.setTransform(dpr,0,0,dpr,0,0);
  if(!im){ctx.fillStyle='#8a98a4';ctx.font='14px Archivo, sans-serif';ctx.fillText('Open an image for this measurement',20,90);return}
  ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.tx,dpr*view.ty);ctx.drawImage(im,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  overlays();if(dragId&&S.P[KM()][dragId])loupe(S.P[KM()][dragId],dpr,im)}
function loupe(p,dpr,im){const r=cv.getBoundingClientRect();const s=toS(p);const R=62,Z=3;const cx=s.x<r.width/2?r.width-R-14:R+14,cy=R+60;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.clip();ctx.fillStyle='#000';ctx.fillRect(cx-R,cy-R,2*R,2*R);const k=view.s*Z;
  ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(cx-p.x*k),dpr*(cy-p.y*k));ctx.drawImage(im,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.strokeStyle=COL.pt;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx-6,cy);ctx.moveTo(cx+6,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy-6);ctx.moveTo(cx,cy+6);ctx.lineTo(cx,cy+R);ctx.stroke();ctx.restore();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke()}


/* ---------- overlays ---------- */
const OUT={incl:['Radial inclination','°'],rheight:['Radial height','mm'],uv:['Ulnar variance','mm'],tilt:['Volar tilt (+) / dorsal (−)','°'],tadap:['TAD – AP','mm'],tadlat:['TAD – lateral','mm'],tad:['Tip–apex distance','mm'],pauwels:['Pauwels angle','°'],bohler:['Böhler angle','°'],mcs:['Medial clear space','mm'],tfcs:['Tib-fib clear space','mm'],ovl:['Tib-fib overlap','mm'],kyph:['Segmental kyphosis','°'],ahl:['Anterior height loss','%'],step:['Articular step / depression','mm'],widen:['Condylar widening','mm'],baumann:['Baumann angle','°'],dist:['Distance','mm'],angle:['Angle','°']};
function modeOut(m){const md=MEAS[m];const q=S.P[KM(m)]||{};let r={};try{r=md.calc(q,md.cal?mmpp(m):null,S)}catch{}return r}
function overlays(){const m=S.mode,md=MODES[m],pts=S.P[KM()]||{};
  if(pts.cal1&&pts.cal2)line(pts.cal1,pts.cal2,'#fff',1.4);
  (md.lines||[]).forEach(([a,b,dash],i)=>{if(pts[a]&&pts[b])line(pts[a],pts[b],dash?COL.ghost:[COL.line,COL.alt,COL.meas][i%3],dash?1.2:2.2,dash?[6,4]:null)});
  if(m==='bohler'&&pts.T&&pts.P&&pts.A){const d=sub(pts.P,pts.T);line(pts.P,add(pts.P,d),COL.ghost,1,[4,4])}
  const r=modeOut(m);const ks=Object.keys(r).filter(k=>r[k]!=null&&isFinite(r[k]));
  if(ks.length){const dpr=1;ctx.save();ctx.font='600 12px "IBM Plex Mono", monospace';const L=ks.map(k=>`${(OUT[k]||[k])[0]}: ${f1(r[k])} ${(OUT[k]||['',''])[1]}`);
    const w=Math.max(...L.map(t=>ctx.measureText(t).width))+16,h=L.length*18+10;const rr=cv.getBoundingClientRect();const x=10,y=rr.height-h-54;
    ctx.fillStyle='rgba(5,8,11,.86)';ctx.fillRect(x,y,w,h);ctx.fillStyle=COL.meas;L.forEach((t,i)=>ctx.fillText(t,x+8,y+20+i*18));ctx.restore()}
  if(md.cal&&!mmpp(m)&&Object.keys(pts).length>2){const rr=cv.getBoundingClientRect();ctx.save();ctx.font='12px Archivo, sans-serif';ctx.fillStyle=COL.bad;ctx.fillText('Place the scale bar for mm values',10,rr.height-40);ctx.restore()}
  for(const k in pts){const s=toS(pts[k]);const on=k===S.active;ctx.save();ctx.lineWidth=on?2.4:1.6;ctx.strokeStyle=on?'#fff':COL.pt;ctx.fillStyle='rgba(5,8,11,.5)';
    ctx.beginPath();ctx.arc(s.x,s.y,on?8:6,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=on?'#fff':COL.pt;ctx.beginPath();ctx.arc(s.x,s.y,1.6,0,7);ctx.fill();
    ctx.font='600 10px "IBM Plex Mono", monospace';ctx.fillText(k,s.x+9,s.y+14);ctx.restore()}}

/* ---------- imaging pane ---------- */
function renderImg(){const fx=curFx();if(!fx.meas.includes(S.mode))S.mode=fx.meas[0];const md=MODES[S.mode];
  $('#imgFx').textContent=fx.name;
  $('#modes').innerHTML=fx.meas.map(k=>{const r=modeOut(k);const ks=Object.keys(r).filter(x=>r[x]!=null);return`<button class="sl ${k===S.mode?'on':''}" data-m="${k}"><b>${MODES[k].name}</b><span>${ks.length?ks.map(x=>f1(r[x])+' '+OUT[x][1]).join(' · '):MODES[k].sub}</span></button>`}).join('');
  $$('#modes .sl').forEach(b=>b.onclick=()=>chooseMode(b.dataset.m));
  $('#modeHint').textContent=md.hint;$('#hideViewer').textContent=S.noViewer?'Show viewer':'Hide viewer';
  $('#steps').innerHTML=md.pts.map(([id,l])=>`<button class="step ${P(S.mode,id)?'done':''} ${id===S.active?'on':''}" data-id="${id}"><span class="dot"></span><span>${l}</span><span class="gl">${id.indexOf('cal')===0?'Scale':id}</span></button>`).join('');
  $$('#steps .step').forEach(b=>b.onclick=()=>{S.active=b.dataset.id;update()});
  const can=!!(curImg()&&P(S.mode,S.active));$('#delPt').hidden=!can;$('#delPt2').hidden=!can;
  $('#calBox').hidden=!md.cal;if(md.cal){$('#calmm').value=S.cal[S.mode]||10;const k=mmpp(S.mode);$('#scaleout').textContent=k?`${k.toFixed(3)} mm/px`:'No scale yet: place both ends of a ruler, calibration ball or known implant.'}
  $('#screwBox').hidden=!/^tad/.test(S.mode);$('#screwmm').value=S.cal.screw||10.5;
  $('#measOut').innerHTML=measHTML();renderPrompt()}
function measHTML(){const im=computeImage();const fx=curFx();const ks=Object.keys(im).filter(k=>im[k]!=null&&isFinite(im[k]));
  const used=new Set(fx.fields.filter(f=>f.m).map(f=>f.m));
  if(!ks.length)return'<p class="fine">No measurements yet. Open an image and place the points; values flow into the Fracture tab and the decision.</p>';
  return`<h3>Measurements</h3><table class="mt">${ks.map(k=>`<tr><td>${(OUT[k]||[k])[0]}${used.has(k)?'':' <span class="fine">(reference)</span>'}</td><td class="n">${f1(im[k])} ${(OUT[k]||['',''])[1]}</td></tr>`).join('')}</table>`}
$('#calmm').addEventListener('input',e=>{const x=num(e.target.value);if(x){S.cal[S.mode]=x;update()}});
$('#screwmm').addEventListener('input',e=>{const x=num(e.target.value);if(x){S.cal.screw=x;update()}});
$('#hideViewer').onclick=()=>{S.noViewer=!S.noViewer;layout();update()};
function chooseMode(m){S.mode=m;const ids=MODES[m].pts.map(x=>x[0]);S.active=ids.find(k=>!P(m,k)&&k.indexOf('cal')!==0)||ids.find(k=>k.indexOf('cal')!==0);fit();update()}
function renderPrompt(){const md=MODES[S.mode];const st=md.pts.find(p=>p[0]===S.active)||md.pts[0];
  $('#vlabel').textContent=md.name;
  $('#prompt').innerHTML=!curImg()?`<span class="k">Image</span><span>Open the ${md.name} image<small>${md.hint}</small></span>`:`<span class="k">${P(S.mode,S.active)?'Adjust':'Tap'}</span><span>${st[1]}<small>${st[2]||''}</small></span>`}

/* ---------- demo cases ---------- */
const DEMOS=[
 {t:'68 F · distal radius, dorsal tilt 22°',d:{age:68,sex:'F',side:'L',demand:'mod',osteo:true},fx:'drad',f:{ao:'A',dir:'dorsal',tilt:-22,incl:14,rheight:8,uv:3.5,dcomm:true}},
 {t:'32 M · intra-articular distal radius (AO C)',d:{age:32,sex:'M',side:'R',dom:true,demand:'high',energy:'high'},fx:'drad',f:{ao:'C',dir:'dorsal',tilt:-10,incl:18,rheight:10,uv:1,step:3}},
 {t:'82 F · displaced femoral neck (Garden IV)',d:{age:82,sex:'F',side:'R',demand:'mod',osteo:true,anticoag:true,asa:'3',hours:6},fx:'neck',f:{garden:'IV',walker:true}},
 {t:'78 F · unstable trochanteric (AO A2)',d:{age:78,sex:'F',side:'L',demand:'low',osteo:true,asa:'3',hours:10},fx:'troch',f:{ao:'A2',lw:true}},
 {t:'45 M · Weber B bimalleolar ankle',d:{age:45,sex:'M',side:'R',demand:'mod',skin:'swell'},fx:'ankle',f:{weber:'B',pattern:'bimal',mcs:6,tfcs:5,ovl:4}},
 {t:'28 M · open tibial shaft, Gustilo IIIA',d:{age:28,sex:'M',side:'L',demand:'high',energy:'high',open:'IIIA',hours:2,smoke:true},fx:'tshaft',f:{pat:'B',level:'mid',ang:12,shortn:8,fibula:true}},
 {t:'52 M · bicondylar plateau (Schatzker VI)',d:{age:52,sex:'M',side:'R',demand:'high',energy:'high',skin:'swell'},fx:'plat',f:{sch:'VI',step:5,widen:7,instab:true}},
 {t:'6 y · Gartland III supracondylar, pink pulseless',d:{age:6,sex:'M',side:'L',child:true,demand:'high',nerve:true},fx:'scond',f:{gart:'III',pulse:'pink',ain:true}},
 {t:'35 M · L1 burst, intact neurology',d:{age:35,sex:'M',side:'B',demand:'high',energy:'high'},fx:'tlspine',f:{morph:'2',plc:'0',neuro:'0',kyph:14,ahl:35}},
 {t:'74 F · 4-part proximal humerus',d:{age:74,sex:'F',side:'R',dom:true,demand:'mod',osteo:true},fx:'phum',f:{parts:'4',valg:'varus',calcar:true}},
 {t:'24 M · displaced midshaft clavicle',d:{age:24,sex:'M',side:'R',dom:true,demand:'high'},fx:'clav',f:{disp:'full',short:22,comm:true,overhead:true}},
 {t:'48 M · joint-depression calcaneus, smoker',d:{age:48,sex:'M',side:'L',demand:'high',energy:'high',smoke:true,diab:true,skin:'swell'},fx:'calc',f:{sand:'III',el:'joint',bohler:5}},
 {t:'86 F · fragility pelvis (LC1), cannot mobilise',d:{age:86,sex:'F',side:'B',demand:'low',osteo:true,asa:'3'},fx:'pelvis',f:{yb:'LC1',fragility:true,mobil:true}}];
function openDemo(i){const x=DEMOS[i];S={...S,d:{...G_BLANK,...x.d,fx:x.fx},f:{[x.fx]:{...x.f}},P:{},cal:{screw:10.5},mode:FX[x.fx].meas[0],active:null,noViewer:false,rec:blankRec(),caseId:null,regView:null};
  for(const k in S.d)if(typeof S.d[k]==='number')S.d[k]=String(S.d[k]);for(const k in S.f[x.fx])if(typeof S.f[x.fx][k]==='number')S.f[x.fx][k]=String(S.f[x.fx][k]);
  S.rec.name='Demo – '+x.t;imgs={};blobs={};selectTab('dec');toast('Demo loaded: '+x.t)}
