const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d');
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const COL={pt:'#ffc247',line:'#7fd0ff',ghost:'rgba(127,208,255,.55)',meas:'#4fe3b4',alt:'#ff9f6b',bad:'#ff7a7a'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>v===''||v==null||isNaN(+v)?null:+v;

/* ---------- measurement modes ---------- */
const CAL=[['cal1','Scale bar end 1','One end of the scale bar or a known length'],['cal2','Scale bar end 2','Other end; enter its length below']];
const MODES={
 glen:{name:'Glenoid en face',sub:'bone loss % · diameter',cal:true,hint:'3D CT en-face view of the glenoid with the humeral head removed (or sagittal oblique MRI). Calibrate, mark the superior pole, then three points on the intact inferior rim for the best-fit circle, then the anterior rim at the deepest part of the defect. The posterior rim point is only needed for posterior bone loss.',pts:[...CAL,
  ['S','Superior pole of the glenoid','Top of the glenoid – sets the long axis'],
  ['C1','Circle: posterior-inferior rim','Intact posterior-inferior rim of the lower glenoid'],
  ['C2','Circle: inferior rim','Lowest point of the glenoid'],
  ['C3','Circle: anterior-inferior rim','Intact rim just below the defect'],
  ['A','Anterior rim at the defect','Deepest point of the anterior defect'],
  ['Pr','Posterior rim (optional)','Posterior rim – only for posterior bone loss']]},
 hs:{name:'Hill-Sachs',sub:'HSI · bone bridge',cal:true,hint:'3D CT posterior view of the humeral head (or axial MRI). Calibrate, then mark the medial edge of the rotator cuff footprint, the edge of the Hill-Sachs lesion nearest the footprint, and its medial (articular) edge. Hill-Sachs interval (HSI) = bone bridge + Hill-Sachs width.',pts:[...CAL,
  ['F','Medial edge of the cuff footprint','Start of the bone bridge'],
  ['H1','Hill-Sachs edge, footprint side','End of the bone bridge'],
  ['H2','Hill-Sachs medial edge','Edge of the lesion nearest the articular surface']]},
 ax:{name:'Axial CT / MRI',sub:'version · subluxation · reverse HS',cal:false,hint:'Axial slice through the middle of the glenoid. Version by the Friedman method; three points on the humeral head give its circle for the Walch subluxation index; the defect edges and articular margins give the reverse Hill-Sachs size as % of the articular arc.',pts:[
  ['M','Medial tip of the scapula','The scapular axis runs from here to the glenoid centre'],
  ['GA','Anterior glenoid rim',''],['GP','Posterior glenoid rim',''],
  ['H1','Humeral head contour 1','Three points on the articular contour → best-fit circle'],['H2','Humeral head contour 2',''],['H3','Humeral head contour 3',''],
  ['R1','Reverse Hill-Sachs edge 1','Optional – edge of the anterior head defect'],['R2','Reverse Hill-Sachs edge 2',''],
  ['A1','Articular margin, anterior','Optional – edge of the articular cartilage'],['A2','Articular margin, posterior','']]}
};
const MODE_ORDER=['glen','hs','ax'];

/* ---------- thresholds ---------- */
const TH_DEFAULT={crit:20,subcrit:13.5,gtk:0.83,dtd:8,isis:6,gtims:4,erHyper:85,gagey:105,beighton:5,retro:10,osteo:15,pcrit:15,walch:65,rhsLow:25,rhsHigh:40,oldAge:40};
const TH_LABEL={crit:['Critical glenoid bone loss (bone block) ≥','%'],subcrit:['Subcritical glenoid bone loss ≥','%'],gtk:['Glenoid track factor: GT = factor × D − d',''],dtd:['Near-track: distance to dislocation <','mm'],
 isis:['ISIS above which Latarjet is advised >',''],gtims:['GTIMS for Latarjet ≥',''],erHyper:['Hyperlaxity: external rotation at the side >','°'],gagey:['Inferior hyperlaxity: Gagey hyperabduction >','°'],beighton:['Generalised hypermobility: Beighton ≥','/9'],
 retro:['Glenoid retroversion risk factor ≥','°'],osteo:['Retroversion to consider glenoid osteotomy ≥','°'],pcrit:['Posterior glenoid bone loss for bone block ≥','%'],walch:['Static posterior subluxation (Walch) >','%'],
 rhsLow:['Reverse Hill-Sachs: non-operative below','%'],rhsHigh:['Reverse Hill-Sachs: arthroplasty considered above','%'],oldAge:['Screen for cuff tear / nerve injury from age','y']};

/* ---------- form fields ---------- */
const BEIGHTON=['Little finger extends > 90° – right','Little finger > 90° – left','Thumb touches forearm – right','Thumb touches forearm – left','Elbow hyperextends > 10° – right','Elbow > 10° – left','Knee hyperextends > 10° – right','Knee > 10° – left','Palms flat on the floor, knees straight'];
const beightonScore=d=>BEIGHTON.reduce((s,_,i)=>s+(d['b'+i]?1:0),0);
const LOAD=[['0','0'],['1','1 · to rim'],['2','2 · over rim'],['3','3 · locks']];
const FORMS={
 pt:[
  ['Patient',[
   {k:'age',l:'Age',t:'num',u:'y'},
   {k:'sex',l:'Sex',t:'seg',o:[['M','Male'],['F','Female']]},
   {k:'side',l:'Side',t:'seg',o:[['R','Right'],['L','Left']]},
   {k:'dom',l:'Dominant arm',t:'chk'}]],
  ['Instability',[
   {k:'dir',l:'Main direction',t:'seg',o:[['ant','Anterior'],['post','Posterior'],['mdi','Multidirectional']]},
   {k:'etiol',l:'Onset',t:'sel',o:[['trauma','Traumatic dislocation'],['traumaSub','Traumatic subluxation'],['atraum','Atraumatic / minor trauma'],['vol','Voluntary / habitual']]},
   {k:'nDisl',l:'Dislocations (total)',t:'num',u:'n'},
   {k:'nSub',l:'Subluxations (total)',t:'num',u:'n'},
   {k:'firstAge',l:'Age at first episode',t:'num',u:'y'},
   {k:'months',l:'Time since the first episode',t:'num',u:'months'},
   {k:'easy',l:'Dislocates with minimal force or in sleep, or reduces easily',t:'chk'},
   {k:'rehabDone',l:'Failed ≥ 6 months of structured rehabilitation',t:'chk'},
   {k:'pain',l:'Pain rather than instability is the main complaint',t:'chk'}]],
  ['Sport and work',[
   {k:'sport',l:'Sport level',t:'sel',o:[['none','None'],['rec','Recreational'],['comp','Competitive'],['pro','Professional / elite']]},
   {k:'stype',l:'Sport type',t:'sel',o:[['none','—'],['contact','Contact / collision (rugby, football, judo, wrestling)'],['overhead','Forced overhead (handball, volleyball, basketball, climbing, throwing)'],['other','Other / non-contact']],show:d=>d.sport!=='none'},
   {k:'season',l:'In season – wants to finish the season',t:'chk',show:d=>d.sport!=='none'},
   {k:'work',l:'Work',t:'sel',o:[['light','Sedentary / light'],['manual','Manual / heavy'],['overhead','Overhead work'],['military','Military / police']]}]],
  ['Background',[
   {k:'seizure',l:'Epilepsy',t:'sel',o:[['none','None'],['controlled','Controlled'],['uncontrolled','Uncontrolled seizures']]},
   {k:'ctd',l:'Connective-tissue disorder (Ehlers–Danlos, Marfan)',t:'chk'},
   {k:'physis',l:'Open physes (skeletally immature)',t:'chk'},
   {k:'smoker',l:'Smoker',t:'chk'}]],
  ['Previous surgery',[
   {k:'prior',l:'Previous stabilisation',t:'sel',o:[['none','None'],['bankart','Arthroscopic Bankart'],['bankartRemp','Arthroscopic Bankart + remplissage'],['open','Open Bankart / capsular shift'],['latarjet','Latarjet / Bristow'],['bone','Free bone block (iliac crest / allograft)'],['post','Posterior labral repair'],['postBone','Posterior bone block / glenoid osteotomy'],['thermal','Thermal capsulorrhaphy']]},
   {k:'nPrior',l:'Number of previous stabilisations',t:'num',u:'n',show:d=>d.prior!=='none'},
   {k:'anchors',l:'Anchors used',t:'num',u:'n',show:d=>['bankart','bankartRemp','post'].includes(d.prior)},
   {k:'reinj',l:'Recurrence after',t:'sel',o:[['','—'],['major','A significant new injury'],['minor','Minor or no trauma'],['early','Early (< 6 months), no trauma']],show:d=>d.prior!=='none'}]],
  ['After the dislocation',[
   {k:'weak',l:'Cannot actively raise the arm',t:'chk'},
   {k:'nerve',l:'Axillary nerve deficit (deltoid weakness, numb regimental badge area)',t:'chk'}]]],
 ex:[
  ['Anterior',[
   {k:'appr',l:'Apprehension test',t:'chk'},{k:'reloc',l:'Relocation test',t:'chk'},{k:'surprise',l:'Surprise (release) test',t:'chk'},
   {k:'loadA',l:'Anterior load-and-shift',t:'seg',o:LOAD}]],
  ['Posterior',[
   {k:'jerk',l:'Jerk test',t:'chk'},{k:'kim',l:'Kim test',t:'chk'},{k:'pAppr',l:'Pain or apprehension on posterior load',t:'chk'},
   {k:'loadP',l:'Posterior load-and-shift',t:'seg',o:LOAD}]],
  ['Laxity',[
   {k:'sulcus',l:'Sulcus sign',t:'seg',o:[['0','< 1 cm'],['1','1–2 cm'],['2','> 2 cm']]},
   {k:'sulcusER',l:'Sulcus persists in external rotation',t:'chk'},
   {k:'erSide',l:'External rotation at the side',t:'num',u:'°'},
   {k:'gagey',l:'Gagey hyperabduction (scapula fixed)',t:'num',u:'°'},
   {k:'_bg',t:'beighton'}]],
  ['Muscle control',[
   {k:'volDemo',l:'Can sublux or dislocate the shoulder at will',t:'chk'},
   {k:'musclePat',l:'Instability driven by abnormal muscle pull (muscle patterning)',t:'chk'},
   {k:'dysk',l:'Scapular dyskinesis',t:'chk'}]],
  ['Rotator cuff and nerve',[
   {k:'ffActive',l:'Active forward flexion',t:'num',u:'°'},
   {k:'erLag',l:'External rotation lag / drop-arm sign',t:'chk'},
   {k:'belly',l:'Belly-press / lift-off / bear-hug positive',t:'chk'},
   {k:'weakAbd',l:'Weak abduction or external rotation',t:'chk'}]]],
 img:[
  ['Bone loss and glenoid track',[
   {k:'gbl',l:'Anterior glenoid bone loss',t:'num',u:'%',m:'gbl'},
   {k:'D',l:'Glenoid diameter (inferior circle)',t:'num',u:'mm',m:'D'},
   {k:'hsi',l:'Hill-Sachs interval (HSI)',t:'num',u:'mm',m:'hsi'},
   {k:'engage',l:'Hill-Sachs engages on dynamic testing (EUA / arthroscopy)',t:'chk'},
   {k:'_h1',t:'note',l:'Blue numbers come from your measurements; typing a value overrides them. With large bone loss, measure D on the other shoulder.'}]],
  ['Posterior',[
   {k:'pgbl',l:'Posterior glenoid bone loss',t:'num',u:'%',m:'pgbl'},
   {k:'version',l:'Glenoid version (+ = retroversion)',t:'num',u:'°',m:'version'},
   {k:'walch',l:'Humeral head behind the scapular axis (Walch)',t:'num',u:'%',m:'walch'},
   {k:'rhs',l:'Reverse Hill-Sachs, % of the articular arc',t:'num',u:'%',m:'rhs'},
   {k:'locked',l:'Locked (unreduced) dislocation',t:'chk'},
   {k:'weeksLocked',l:'Weeks since the dislocation',t:'num',u:'wk',show:d=>d.locked},
   {k:'dysplasia',l:'Glenoid dysplasia (posteroinferior deficiency)',t:'chk'}]],
  ['X-ray (ISIS items)',[
   {k:'xrHS',l:'Hill-Sachs visible on AP X-ray in external rotation',t:'chk'},
   {k:'xrGlen',l:'Loss of the sclerotic inferior glenoid contour on AP X-ray',t:'chk'},
   {k:'gtFx',l:'Greater tuberosity fracture',t:'chk'},
   {k:'arth',l:'Instability arthropathy (Samilson–Prieto)',t:'sel',o:[['0','None'],['1','Mild – osteophyte < 3 mm'],['2','Moderate – osteophyte 3–7 mm'],['3','Severe – osteophyte > 7 mm, joint narrowing']]}]],
  ['MRI / MR arthrogram',[
   {k:'labrum',l:'Labral lesion',t:'sel',o:[['none','None'],['bankart','Bankart (soft tissue)'],['bony','Bony Bankart (fragment)'],['alpsa','ALPSA (medialised)'],['perthes','Perthes'],['glad','GLAD'],['post','Posterior labral tear (reverse Bankart)'],['kim','Kim lesion (incomplete posterior)'],['pan','Pan-labral (270–360°)']]},
   {k:'frag',l:'Bony fragment size (% of glenoid)',t:'num',u:'%',show:d=>d.labrum==='bony'},
   {k:'hagl',l:'HAGL / reverse HAGL',t:'chk'},
   {k:'slap',l:'SLAP extension',t:'chk'},
   {k:'capsule',l:'Patulous capsule / large capsular volume',t:'chk'},
   {k:'cuff',l:'Rotator cuff',t:'sel',o:[['none','Intact'],['partial','Partial-thickness tear'],['ssp','Full-thickness supraspinatus / infraspinatus'],['subsc','Subscapularis tear'],['massive','Massive, possibly irreparable']]}]]]
};
const BLANK={age:'',sex:'M',side:'R',dom:false,dir:'ant',etiol:'trauma',nDisl:'',nSub:'',firstAge:'',months:'',easy:false,rehabDone:false,pain:false,
 sport:'none',stype:'none',season:false,work:'light',seizure:'none',ctd:false,physis:false,smoker:false,prior:'none',nPrior:'',anchors:'',reinj:'',weak:false,nerve:false,
 appr:false,reloc:false,surprise:false,loadA:'0',jerk:false,kim:false,pAppr:false,loadP:'0',sulcus:'0',sulcusER:false,erSide:'',gagey:'',volDemo:false,musclePat:false,dysk:false,ffActive:'',erLag:false,belly:false,weakAbd:false,
 gbl:'',D:'',hsi:'',engage:false,pgbl:'',version:'',walch:'',rhs:'',locked:false,weeksLocked:'',dysplasia:false,xrHS:false,xrGlen:false,gtFx:false,arth:'0',labrum:'none',frag:'',hagl:false,slap:false,capsule:false,cuff:'none'};
BEIGHTON.forEach((_,i)=>BLANK['b'+i]=false);
let S={d:{...BLANK},P:{},cal:{glen:10,hs:10},th:{...TH_DEFAULT},tab:'pt',mode:'glen',active:'cal1',noViewer:false,sc:{tp:'preop',view:'risk',d:{}},rec:blankRec(),caseId:null};
let imgs={},blobs={};
let view={s:1,tx:0,ty:0};

/* ---------- geometry ---------- */
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mul=(a,k)=>({x:a.x*k,y:a.y*k}),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const dot=(a,b)=>a.x*b.x+a.y*b.y,len=a=>Math.hypot(a.x,a.y),norm=a=>mul(a,1/(len(a)||1)),perp=a=>({x:-a.y,y:a.x});
const D=180/Math.PI;
const f1=v=>v==null||isNaN(v)?'—':(+v).toFixed(1),f0=v=>v==null||isNaN(v)?'—':Math.round(+v)+'';
const P=(m,k)=>S.P[m]&&S.P[m][k];
function mmpp(m){const a=P(m,'cal1'),b=P(m,'cal2');return a&&b&&S.cal[m]?S.cal[m]/len(sub(a,b)):null}
function circ3(a,b,c){const d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-9)return null;
  const A=a.x*a.x+a.y*a.y,B=b.x*b.x+b.y*b.y,C=c.x*c.x+c.y*c.y;
  const x=(A*(b.y-c.y)+B*(c.y-a.y)+C*(a.y-b.y))/d,y=(A*(c.x-b.x)+B*(a.x-c.x)+C*(b.x-a.x))/d;return{c:{x,y},r:Math.hypot(a.x-x,a.y-y)}}
function segPct(R,dd){if(!(dd>0))return 0;const h=Math.max(-R,R-dd);return(R*R*Math.acos(h/R)-h*Math.sqrt(Math.max(0,R*R-h*h)))/(Math.PI*R*R)*100}
const angBetween=(a,b)=>Math.acos(Math.max(-1,Math.min(1,dot(a,b)/(len(a)*len(b)||1))))*D;
function glenGeo(){const q=S.P.glen||{};if(!(q.C1&&q.C2&&q.C3))return null;const ci=circ3(q.C1,q.C2,q.C3);if(!ci)return null;
  const u=q.S?norm(sub(ci.c,q.S)):{x:0,y:1};const h=perp(u);const g={...ci,u,h};
  if(q.A){const s=dot(sub(q.A,ci.c),h);g.sA=Math.sign(s)||1;g.dA=Math.max(0,ci.r-Math.abs(s))}
  if(q.Pr){const s=dot(sub(q.Pr,ci.c),h);if(g.sA==null||Math.sign(s)!==g.sA){g.sP=Math.sign(s)||-1;g.dP=Math.max(0,ci.r-Math.abs(s))}else g.pSame=true}
  return g}
function axGeo(){const a=S.P.ax||{};const r={};
  if(a.M&&a.GA&&a.GP){const G0=mid(a.GA,a.GP);const ax=norm(sub(G0,a.M));let pd=sub(a.GP,G0);pd=norm(sub(pd,mul(ax,dot(pd,ax))));
    let n=norm(perp(sub(a.GP,a.GA)));if(dot(n,ax)<0)n=mul(n,-1);r.G0=G0;r.ax=ax;r.pd=pd;r.n=n;r.version=Math.atan2(dot(n,pd),dot(n,ax))*D}
  if(a.H1&&a.H2&&a.H3){const hc=circ3(a.H1,a.H2,a.H3);if(hc){r.head=hc;if(r.pd){const s=dot(sub(hc.c,a.M),r.pd);r.walch=(hc.r+s)/(2*hc.r)*100}}}
  if(r.head&&a.R1&&a.R2&&a.A1&&a.A2){const c=r.head.c;const arc=angBetween(sub(a.A1,c),sub(a.A2,c));if(arc>1)r.rhs=angBetween(sub(a.R1,c),sub(a.R2,c))/arc*100}
  return r}
function computeImage(){const r={};const g=glenGeo();const k=mmpp('glen');
  if(g){if(k)r.D=2*g.r*k;if(g.dA!=null){r.gbl=g.dA/(2*g.r)*100;r.gblArea=segPct(g.r,g.dA);if(k)r.dmm=g.dA*k}
    if(g.dP!=null){r.pgbl=g.dP/(2*g.r)*100;r.pgblArea=segPct(g.r,g.dP)}if(g.pSame)r.pSame=true}
  const q=S.P.hs||{},kh=mmpp('hs');
  if(kh&&q.F&&q.H1)r.bb=len(sub(q.H1,q.F))*kh;if(kh&&q.H1&&q.H2)r.hsw=len(sub(q.H2,q.H1))*kh;if(r.bb!=null&&r.hsw!=null)r.hsi=r.bb+r.hsw;
  const a=axGeo();if(a.version!=null)r.version=a.version;if(a.walch!=null)r.walch=a.walch;if(a.rhs!=null)r.rhs=a.rhs;
  return r}
function vals(){const im=computeImage(),d=S.d,T=S.th;const g=k=>num(d[k])!=null?num(d[k]):(im[k]!=null?im[k]:null);
  const v={gbl:g('gbl'),D:g('D'),hsi:g('hsi'),pgbl:g('pgbl'),version:g('version'),walch:g('walch'),rhs:g('rhs'),im};
  if(v.D!=null&&v.gbl!=null){v.dmm=v.gbl/100*v.D;v.gt=T.gtk*v.D-v.dmm;v.gtGraft=T.gtk*v.D}
  if(v.gt!=null&&v.hsi!=null){v.dtd=v.gt-v.hsi;v.off=v.hsi>v.gt;v.offSrc='measured'}
  else if(d.engage){v.off=true;v.offSrc='dynamic'}
  v.near=v.off===false&&v.dtd!=null&&v.dtd<T.dtd;
  return v}

/* ---------- risk scores ---------- */
function hyperOf(){const d=S.d,T=S.th;const er=num(d.erSide),gg=num(d.gagey),bg=beightonScore(d);
  const r={ant:er!=null&&er>T.erHyper,inf:gg!=null&&gg>T.gagey,gen:bg>=T.beighton,bg,er,gg};r.sh=r.ant||r.inf;r.any=r.sh||r.gen||+d.sulcus>=2;return r}
function riskBase(){const d=S.d,age=num(d.age),T=S.th;const hx=hyperOf();const sp=d.sport!=='none';
  return[[`Age ≤ 20 at surgery`,age!=null&&age<=20?2:0,2],['Competitive or professional sport',['comp','pro'].includes(d.sport)?2:0,2],
   ['Contact or forced-overhead sport',sp&&['contact','overhead'].includes(d.stype)?1:0,1],[`Shoulder hyperlaxity (ER > ${T.erHyper}° or Gagey > ${T.gagey}°)`,hx.sh?1:0,1]]}
function isisItems(){const d=S.d;return[...riskBase(),['Hill-Sachs on AP X-ray in external rotation',d.xrHS?2:0,2],['Loss of the inferior glenoid contour on AP X-ray',d.xrGlen?2:0,2]]}
function gtimsItems(v){return[...riskBase(),['Off-track Hill-Sachs (3D CT)',v.off?4:0,4]]}
const sumIt=a=>a.reduce((s,x)=>s+x[1],0);

/* ---------- decision engine ---------- */
const OPT={closed:'Reduction (closed or open)',rehab:'Structured rehabilitation',bankart:'Arthroscopic Bankart repair',remp:'Remplissage',latarjet:'Latarjet (open or arthroscopic)',freebb:'Free bone block (iliac crest / distal tibia allograft)',bony:'Bony Bankart fragment fixation',hagl:'HAGL repair',
 shift:'Capsular shift / plication ± rotator interval closure',prepair:'Posterior capsulolabral repair',pbb:'Posterior bone block',osteot:'Posterior opening-wedge glenoid osteotomy',humeral:'Humeral head reconstruction (McLaughlin / graft / disimpaction)',cuff:'Rotator cuff repair',arthro:'Shoulder arthroplasty',gtfix:'Greater tuberosity fixation'};
const OPT_ORDER=['closed','latarjet','freebb','bony','bankart','remp','hagl','shift','prepair','pbb','osteot','humeral','cuff','gtfix','arthro','rehab'];
const RANK={no:0,consider:1,contra:1,ind:2};
function decide(){const d=S.d,T=S.th,v=vals();const age=num(d.age);const hx=hyperOf();
  const R={v,hx,steps:[],notes:[],rts:[]};const O={};for(const k in OPT)O[k]={st:'no',why:'',pro:[],con:[]};R.O=O;
  const set=(k,st,why)=>{const o=O[k];if(st==='contra'||RANK[st]>=RANK[o.st]||o.st==='no'){o.st=st;if(why)o.why=why}else if(why&&!o.why)o.why=why};
  const pro=(k,t)=>O[k].pro.push(t),con=(k,t)=>O[k].con.push(t);
  const step=t=>R.steps.push(t),note=t=>R.notes.push(t);
  const nEp=(num(d.nDisl)||0)+(num(d.nSub)||0);const first=nEp<=1&&d.prior==='none';
  const sp=d.sport!=='none',contact=sp&&d.stype==='contact',overhead=sp&&d.stype==='overhead',compet=['comp','pro'].includes(d.sport);
  const vol=d.etiol==='vol'||d.volDemo||d.musclePat;const months=num(d.months);
  /* classification */
  const trauma=['trauma','traumaSub'].includes(d.etiol);const structural=d.labrum!=='none'||(v.gbl!=null&&v.gbl>=5)||(v.hsi!=null)||d.xrHS||d.xrGlen||d.hagl||(v.pgbl!=null&&v.pgbl>=5);
  R.stanmore=d.musclePat||d.etiol==='vol'?{t:'III',l:'Polar type III – muscle patterning (non-structural)'}:trauma?{t:'I',l:'Polar type I – traumatic structural'}:{t:'II',l:'Polar type II – atraumatic structural'};
  if(R.stanmore.t!=='III'&&!trauma&&d.musclePat)R.stanmore={t:'II/III',l:'Between type II and III'};
  const fr=nEp<=1?'Solitary':nEp<=5?'Occasional (2–5)':'Frequent (> 5)';
  R.feds=`${fr} · ${trauma?'Traumatic':'Atraumatic'} · ${{ant:'Anterior',post:'Posterior',mdi:'Inferior / multidirectional'}[d.dir]} · ${(num(d.nDisl)||0)>0?'Dislocation':'Subluxation'}`;
  R.isis=isisItems();R.isisT=sumIt(R.isis);R.gtims=gtimsItems(v);R.gtimsT=v.off!=null?sumIt(R.gtims):null;
  /* universal: rotator cuff, nerve, tuberosity */
  const cuffTear=['ssp','subsc','massive'].includes(d.cuff);const old=age!=null&&age>=T.oldAge;
  if(cuffTear){set('cuff',d.cuff==='massive'?'consider':'ind',d.cuff==='subsc'?'Subscapularis tears remove the anterior restraint – repair them with any stabilisation.':'A full-thickness tear after dislocation (especially over '+T.oldAge+') is the usual cause of weakness and pain; early repair gives the best function.');
    pro('cuff','Restores strength; cuff repair alone may restore stability in older patients');if(d.cuff==='massive')con('cuff','Massive / retracted tear may be irreparable – check fatty infiltration and acromiohumeral distance');
    if(d.cuff==='massive'&&age!=null&&age>=65&&(d.weak||num(d.ffActive)!=null&&num(d.ffActive)<90)){set('arthro','consider','Massive cuff tear with pseudoparalysis and instability in an older patient: reverse shoulder arthroplasty.')}}
  else if(old&&(d.weak||d.erLag||d.weakAbd||d.belly)&&d.dir!=='mdi')step(`Ultrasound or MRI now: weakness after dislocation over ${T.oldAge} is more often a rotator cuff tear than a nerve palsy`);
  else if(old&&d.dir==='ant')step(`Over ${T.oldAge}: check the rotator cuff (ultrasound / MRI) if the arm is not rising well by 2–3 weeks`);
  if(d.nerve)step('Axillary nerve deficit: most recover; EMG / nerve conduction at 3–4 weeks if not improving, refer if no recovery by 3–6 months');
  if(d.gtFx){set('gtfix','consider','Displaced greater tuberosity fractures (> 5 mm, or > 3 mm in overhead athletes) need fixation; recurrent instability is uncommon after this injury.')}
  const arth=+d.arth;
  /* voluntary / muscle patterning first */
  if(vol&&!trauma){set('rehab','ind','Muscle-patterning instability: specialist rehabilitation with biofeedback and motor-control retraining; address psychological factors.');
    pro('rehab','Treats the cause (abnormal muscle activation)');
    ['bankart','latarjet','shift','prepair','remp'].forEach(k=>set(k,'contra','Stabilisation fails when instability is driven by muscle patterning.'));
    R.head='Muscle-patterning instability: rehabilitation, no surgery';R.cls='warn'}
  else if(d.dir==='ant')anterior();
  else if(d.dir==='post')posterior();
  else mdi();
  if(vol&&trauma)note('Voluntary / muscle-patterning component in a traumatic shoulder: treat the muscle patterning first; surgery only if a structural lesion remains symptomatic after rehabilitation.');
  /* special situations */
  if(d.seizure==='uncontrolled')note('Uncontrolled epilepsy: optimise seizure control with neurology before stabilisation – recurrence is high after any procedure. Bony procedures are preferred; the consensus favours glenoid bone-grafting over the Latarjet in epilepsy.');
  else if(d.seizure==='controlled')note('Controlled epilepsy: recurrent seizures still threaten soft-tissue repairs; favour a bony procedure if there is bone loss.');
  if(d.ctd)note('Connective-tissue disorder: soft-tissue repairs stretch out; rehabilitation first, and if surgery is needed favour bony or combined procedures. Consider genetics / rheumatology review.');
  if(d.physis&&d.dir==='ant'){if(O.latarjet.st!=='no')con('latarjet','Open physes: the coracoid physis closes around 16–18 y; Latarjet is usually deferred');note('Skeletally immature: recurrence is very high in adolescents; arthroscopic Bankart ± remplissage is usual, bony procedures after physeal closure.')}
  if(d.smoker&&(O.latarjet.st!=='no'||O.freebb.st!=='no')){con('latarjet','Smoking increases graft non-union');note('Smoker: advise stopping before a bone-block procedure (graft union).')}
  if(arth>=2){if(O.latarjet.st!=='no')con('latarjet','Moderate–severe instability arthropathy: outcomes are poorer; a lateral graft accelerates arthritis');if(arth===3&&age!=null&&age>=50)set('arthro','consider','Severe instability arthropathy in an older patient: arthroplasty may treat both pain and instability.')}
  if(d.pain&&!vol)note('Pain is the main complaint: look for other causes (SLAP, cuff, biceps, arthropathy, cervical spine) before attributing it to instability.');
  if(d.slap&&(O.bankart.st!=='no'||O.prepair.st!=='no'))note('SLAP extension: include the superior labrum in the repair if unstable; consider biceps tenodesis in patients over 35.');
  /* headline */
  if(!R.head){const ind=OPT_ORDER.filter(k=>O[k].st==='ind');let surg=ind.filter(k=>k!=='rehab');if(surg.length>1)surg=surg.filter(k=>k!=='closed');
    let h;if(surg.includes('bankart')&&surg.includes('remp'))h=['Arthroscopic Bankart + remplissage',...surg.filter(k=>!['bankart','remp'].includes(k)).map(k=>OPT[k])];
    else h=surg.map(k=>OPT[k]);
    if(!h.length){const cons=OPT_ORDER.filter(k=>O[k].st==='consider'&&k!=='rehab');R.head=ind.includes('rehab')?'Rehabilitation first'+(cons.length?'; consider '+cons.map(k=>OPT[k].split(' (')[0].toLowerCase()).slice(0,2).join(' or '):''):'Complete the assessment';R.cls=ind.includes('rehab')?'ok':'mut'}
    else{R.head=h.slice(0,3).join(' + ');R.cls='acc'}}
  /* return to sport */
  R.rts=['Return to sport on criteria, not time: full painless range, symmetric strength, proprioception and sport-specific skills, no apprehension (consensus).','Typical: ~4–6 months after Bankart or Latarjet; collision athletes and military personnel may need longer.'];
  if(O.remp.st==='ind')R.rts.push('Remplissage: expect a small loss of external rotation (a few degrees); warn throwing athletes.');
  R.steps=[...new Set(R.steps)];
  return R;

  function anterior(){const G=v.gbl;const bigFrag=d.labrum==='bony'&&num(d.frag)!=null;const acute=months!=null&&months<=3;
    step('X-rays: true AP (Grashey), axillary lateral, AP in external rotation, Bernageau / West Point glenoid profile');
    if(G==null||v.hsi==null)step('3D CT with humeral-head subtraction (ideally both shoulders) to measure glenoid bone loss and the Hill-Sachs interval');
    if(d.labrum==='none'&&!first)step('MR arthrogram: labrum, capsule (HAGL, ALPSA), rotator cuff');
    step('Examination under anaesthesia and dynamic arthroscopic assessment of engagement');
    if(d.hagl){set('hagl','ind','HAGL / reverse HAGL must be repaired – an unrecognised HAGL is a classic cause of failure.')}
    if(d.labrum==='alpsa'){con('bankart','ALPSA: medialised labrum – mobilise fully; higher recurrence after Bankart');note('ALPSA lesion: convert to a Bankart lesion by full mobilisation; recurrence is higher, so lower the threshold for remplissage or Latarjet.')}
    if(bigFrag){if(acute||first){set('bony','ind','Acute bony Bankart: fixing the fragment restores the glenoid arc, even with a large defect.');pro('bony','Anatomic, preserves the coracoid')}
      else note('Chronic bony Bankart: the fragment may be resorbed or malunited; measure the true missing bone on 3D CT (fragment included and excluded).')}
    if(d.prior!=='none'&&!['post','postBone'].includes(d.prior))return failed();
    if(first&&!(G!=null&&G>=T.subcrit)&&v.off!==true){firstTime();return}
    recurrent()}

  function firstTime(){const young=age!=null&&age<=25;const highDemand=contact||compet||overhead||d.work==='military';
    set('closed','ind','Reduce, check the axillary nerve and cuff, sling for comfort (1–3 weeks); no consensus on the immobilisation position.');
    if(young&&highDemand&&!d.season){set('bankart','ind','First dislocation in a young, high-demand patient: recurrence after rehabilitation alone is high (often > 50 % under 20–25 y, highest in contact sport); primary arthroscopic stabilisation lowers it substantially.');
      pro('bankart','Prevents further episodes and cumulative bone loss');set('rehab','consider','Acceptable after informed discussion – about half of young patients still re-dislocate.');con('rehab','High recurrence; each episode can add bone loss')}
    else if(d.season&&highDemand){set('rehab','ind','In-season athlete: accelerated rehabilitation ± brace to finish the season, then stabilise – provided there is no significant bone loss.');con('rehab','Recurrence during the season is common; each episode adds bone loss');set('bankart','consider','Planned after the season (or now if bone loss or recurrence).')}
    else if(old){set('rehab','ind',`First dislocation over ${T.oldAge}: recurrence is low; the priority is the cuff and nerve.`);}
    else{set('rehab','ind','First dislocation with lower risk: rehabilitation; stabilise if instability recurs.');set('bankart','consider','If symptoms recur, or the patient prefers to avoid a second episode.')}
    if(hx.any&&O.bankart.st!=='no')con('bankart','Hyperlaxity: tension the capsule with the repair (capsular shift)')}

  function recurrent(){const G=v.gbl;const iT=R.isisT,gT=R.gtimsT;
    if(G==null&&v.off==null){
      if(iT>T.isis){set('latarjet','ind',`ISIS ${iT} > ${T.isis}: high recurrence after Bankart (about 70 % in the original series).`);set('bankart','contra','ISIS too high for a soft-tissue repair alone.')}
      else{set('bankart','ind',`Provisional (no CT measurement yet): ISIS ${iT} ≤ ${T.isis}.`);if(iT>=4)set('latarjet','consider','ISIS ≥ 4: recurrence after Bankart rises; many surgeons now use 4 as the threshold.')}
      R.prov=true}
    else if(G!=null&&G>=T.crit){
      set('latarjet','ind',`Critical glenoid bone loss (${f1(G)} % ≥ ${T.crit} %): restore the glenoid arc with a bone block.`);pro('latarjet','Bone block + sling effect of the conjoint tendon + capsular repair');con('latarjet','Complications ~ 15 % (graft non-union or lysis, screw problems, nerve injury), later arthritis if the graft is lateral');
      set('bankart','contra','Soft-tissue repair alone fails with critical bone loss.');
      set('freebb','consider','Free iliac-crest or distal-tibia allograft when the defect is larger than a coracoid graft can restore, the coracoid is unsuitable, or in epilepsy.');
      if(G>=30)set('freebb','ind',`Very large defect (${f1(G)} %): a coracoid graft may not restore the arc – iliac crest or distal tibia allograft.`)}
    else if(G!=null&&G>=T.subcrit){
      const hi=v.off||contact||(gT!=null&&gT>=T.gtims)||hx.sh||iT>T.isis;
      set('latarjet',hi?'ind':'consider',`Subcritical bone loss (${f1(G)} %): Bankart outcomes worsen above ~13.5 % (Shaha 2015)${hi?' and risk factors are present':''}.`);
      set('bankart','consider','Only with remplissage and in a lower-risk patient.');con('bankart',`Glenoid bone loss ${f1(G)} % (subcritical)`);
      set('remp',v.off&&!hi?'ind':'consider',v.off?'Off-track: fill the Hill-Sachs if a Bankart is chosen.':'Adds stability to a Bankart in subcritical bone loss.');if(contact)con('remp','Contact athletes: Latarjet preferred')}
    else{
      if(v.off){set('bankart','ind','Off-track Hill-Sachs with glenoid bone loss below '+T.subcrit+' %: Bankart repair with remplissage (glenoid track algorithm).');set('remp','ind',`Off-track: HSI ${f1(v.hsi)} mm > glenoid track ${f1(v.gt)} mm${v.offSrc==='dynamic'?' (engages on dynamic testing)':''}.`);
        pro('remp','Rare complications; converts the lesion to extra-articular');con('remp','Small loss of external rotation');
        set('latarjet',contact&&compet?'ind':'consider',contact&&compet?'Off-track lesion in a competitive contact athlete: Latarjet is a strong alternative.':`GTIMS ${gT} ≥ ${T.gtims} favours Latarjet; Bankart + remplissage is the alternative.`)}
      else{
        set('bankart','ind',v.off===false?`On-track: HSI ${f1(v.hsi)} mm < glenoid track ${f1(v.gt)} mm (distance to dislocation ${f1(v.dtd)} mm).`:'Glenoid bone loss below the subcritical level.');pro('bankart','Anatomic, arthroscopic, low complication rate');
        if(v.near){set('remp','consider',`Near-track: distance to dislocation ${f1(v.dtd)} mm < ${T.dtd} mm – failure after Bankart rises (Li 2021); add remplissage.`);con('bankart','Near-track lesion')}
        if(gT!=null&&gT>=T.gtims){set('latarjet','ind',`GTIMS ${gT} ≥ ${T.gtims} (age, competitive / contact sport, hyperlaxity).`);O.bankart.st='consider';con('bankart',`GTIMS ${gT}`)}
        else if(iT>T.isis){set('latarjet','consider',`ISIS ${iT} > ${T.isis}.`)}
        else if(contact&&compet)set('latarjet','consider','Competitive contact athlete: some surgeons prefer Latarjet even without bone loss.')}}
    if(hx.sh&&O.bankart.st!=='no'){con('bankart','Hyperlaxity: bone loss + inferior hyperlaxity gave 75 % recurrence (Boileau 2006)');set('shift','consider','Add capsular shift / plication to the Bankart in the hyperlax shoulder.')}
    if(d.capsule&&O.bankart.st!=='no')con('bankart','Patulous capsule: plicate / shift the capsule');
    if(v.off&&O.latarjet.st!=='no'&&v.gtGraft!=null&&v.hsi>v.gtGraft){note(`HSI ${f1(v.hsi)} mm exceeds even the restored track (${f1(v.gtGraft)} mm): the Hill-Sachs may stay off-track after the graft – consider adding remplissage.`);if(O.remp.st==='no')set('remp','consider','Residual off-track after bone block.')}
    if(d.easy)note('Dislocation in sleep or with minimal force suggests large bipolar bone loss – measure it on 3D CT.')}

  function failed(){const G=v.gbl;const nP=num(d.nPrior)||1;const anc=num(d.anchors);
    const F=[[G!=null&&G>=T.subcrit,`Glenoid bone loss ≥ ${T.subcrit} %`+(G!=null?` (${f1(G)} %)`:'')],[v.off===true||v.near,'Off-track or near-track Hill-Sachs'],[hx.any,'Hyperlaxity'],[contact,'Contact / collision sport'],[nP>=2,'Two or more previous stabilisations'],
      [anc!=null&&anc<4,'Fewer than 4 anchors used (Boileau 2006)'],[d.reinj==='minor'||d.reinj==='early','Recurrence with little or no trauma'],[d.capsule||d.labrum==='alpsa','Poor capsulolabral tissue / ALPSA']];
    R.failed={F,prior:d.prior};
    step('3D CT: bone loss, previous anchors / tunnels, graft position and union (if bone block)');step('MR arthrogram: labrum, capsule, HAGL, cuff');
    if(['latarjet','bone'].includes(d.prior)){set('freebb','ind','Failed Latarjet / bone block: revise with a free bone block (iliac crest – e.g. Eden–Hybinette – or distal tibia allograft).');pro('freebb','Restores the arc when the coracoid is gone');con('freebb','Graft resorption; technically demanding');
      set('latarjet','contra','Coracoid already used.');note('Check the cause: graft malposition (too medial → recurrence; too lateral → arthritis), non-union, lysis, screw failure, or an off-track Hill-Sachs that was not addressed.');
      if(v.off)set('remp','consider','Hill-Sachs still off-track.');if(arth>=2&&age!=null&&age>=50)set('arthro','consider','Painful arthropathy after failed bone block.');
      R.head='Revision with free bone block';R.cls='bad';return}
    if(d.prior==='thermal'){set('latarjet','ind','After thermal capsulorrhaphy the capsule is often deficient – a bony procedure is more reliable.');set('freebb','consider','');set('bankart','contra','Deficient capsule.');note('Thermal capsulorrhaphy: check for chondrolysis (joint-space narrowing) before any revision.');return}
    const revOK=(G==null||G<T.subcrit)&&v.off!==true&&!v.near&&!hx.any&&!contact&&nP<2&&(d.reinj==='major'||(anc!=null&&anc<4));
    if(revOK){set('bankart','consider','Revision arthroscopic Bankart is reasonable: little bone loss, on-track, no hyperlaxity, non-contact, and a clear reason for failure (new injury or too few anchors).');
      set('latarjet','consider','Lower recurrence than revision Bankart in most series.');set('remp','consider','Add to a revision Bankart for extra security.');R.head='Revision Bankart (± remplissage) or Latarjet';R.cls='acc'}
    else{set('latarjet','ind','Failed soft-tissue stabilisation with risk factors: Latarjet gives lower recurrence than revision Bankart.');pro('latarjet','Does not rely on the damaged capsulolabral tissue');
      set('bankart','contra','Revision Bankart failure risk is high with these factors.');if(G!=null&&G>=30)set('freebb','consider','Bone loss larger than the coracoid can restore.')}
    if(v.off&&v.gtGraft!=null&&v.hsi>v.gtGraft)set('remp','consider','Hill-Sachs may stay off-track after the graft.')}

  function posterior(){const PG=v.pgbl,V=v.version,RH=v.rhs;const wk=num(d.weeksLocked);
    step('X-rays: AP and axillary lateral (mandatory – posterior dislocations are missed on the AP alone)');
    step('Axial CT: posterior glenoid bone loss, version (Friedman), humeral-head subluxation, reverse Hill-Sachs size');
    step('MR arthrogram: posterior labrum (reverse Bankart, Kim lesion), capsule, RHAGL');
    if(V!=null&&V>=T.retro)note(`Glenoid retroversion ${f1(V)}° (≥ ${T.retro}°) is associated with failure of posterior labral repair.`);
    if(v.walch!=null&&v.walch>T.walch)note(`Humeral head ${f0(v.walch)} % behind the scapular axis: static posterior subluxation – this is a pre-arthritic deformity rather than classic instability; treat differently.`);
    if(d.locked){set('closed','ind',wk!=null&&wk<3?'Locked posterior dislocation < 3 weeks: closed reduction under anaesthesia if the head defect is small; otherwise open reduction.':'Chronic locked posterior dislocation: open reduction.');
      if(wk!=null&&wk>=26&&RH!=null&&RH>=T.rhsLow)set('arthro','consider','Locked > 6 months with a significant head defect: cartilage is usually damaged – arthroplasty.')}
    if(RH!=null){if(RH<T.rhsLow){set('rehab','ind',`Reverse Hill-Sachs ${f0(RH)} % (< ${T.rhsLow} %): stable after reduction – immobilise in neutral / slight external rotation for 4–6 weeks, then rehabilitate.`)}
      else if(RH<=T.rhsHigh){set('humeral','ind',`Reverse Hill-Sachs ${f0(RH)} % (${T.rhsLow}–${T.rhsHigh} %): fill or elevate the defect – McLaughlin / modified McLaughlin (lesser tuberosity transfer), allograft, or disimpaction with bone graft if acute (< 3 weeks).`);pro('humeral','Prevents engagement and re-dislocation')}
      else{set('arthro',age!=null&&age<50?'consider':'ind',`Reverse Hill-Sachs ${f0(RH)} % (> ${T.rhsHigh} %): arthroplasty, especially if older or chronic.`);set('humeral','consider','Younger patient: osteochondral allograft reconstruction of the head.')}}
    else if(d.etiol==='trauma'&&first)step('Measure the reverse Hill-Sachs size (% of the articular arc) on axial CT to choose treatment');
    if(PG!=null&&PG>=T.pcrit){set('pbb','ind',`Posterior glenoid bone loss ${f1(PG)} % (≥ ${T.pcrit} %): posterior bone block (iliac crest or distal tibia allograft).`);pro('pbb','Restores the posterior arc');con('pbb','Hardware irritation, graft resorption; suprascapular nerve at risk')}
    if(V!=null&&V>=T.osteo){set('osteot','consider',`Glenoid retroversion ${f1(V)}° (≥ ${T.osteo}°): posterior opening-wedge osteotomy corrects the bony cause (no consensus on exact indications).`);con('osteot','Technically demanding; risk of intra-articular fracture and arthritis')}
    if(d.dysplasia){set('pbb','consider','Posteroinferior glenoid dysplasia: a bone block deepens the deficient rim.')}
    const structuralP=['post','kim','pan'].includes(d.labrum)||d.hagl||trauma;function structuralP0(){return['post','kim','pan'].includes(d.labrum)||d.hagl}
    if(first&&d.etiol==='trauma'){if(structuralP0())set('prepair','consider','Repair the posterior labrum at the same time if the joint stays unstable after reduction / head reconstruction.')}
    else{
      if(d.prior==='post'){set('pbb','ind','Failed posterior labral repair: posterior bone block'+(V!=null&&V>=T.osteo?' or glenoid osteotomy':'')+'.');set('prepair','consider','Revision repair only if no bony risk factors.')}
      else if(structuralP&&(d.rehabDone||compet||!first)){set('prepair','ind','Symptomatic recurrent posterior instability with a structural labral / capsular lesion: arthroscopic posterior capsulolabral repair (small anchors, inferior placement, multiple fixation points).');
        pro('prepair','Good return to sport in most athletes');if(V!=null&&V>=T.retro)con('prepair',`Retroversion ${f1(V)}°`);if(PG!=null&&PG>=T.pcrit)con('prepair','Bone loss not addressed');
        if(!d.rehabDone)set('rehab','consider','A trial of rehabilitation is reasonable first in non-elite patients.')}
      else{set('rehab','ind','Posterior instability without a clear structural lesion, or before 3–6 months of rehabilitation: rehabilitate first (scapular control, posterior cuff strengthening).');set('prepair','consider','If symptoms persist after rehabilitation and a structural lesion is present.')}}
    if(d.hagl)set('hagl','ind','Reverse HAGL: repair it.')}

  function mdi(){const bg=hx.bg;
    step('Beighton score and a hypermobility history; consider hypermobile Ehlers–Danlos (2017 criteria) and refer if suspected');
    step('MR arthrogram: capsular volume, labral lesions; exclude a structural lesion that is the true cause');
    set('rehab',d.rehabDone?'consider':'ind','Multidirectional instability: at least 6 months of a structured programme (scapular control, rotator cuff, proprioception – e.g. the Watson programme) before any surgery.');pro('rehab','Most patients improve; avoids surgery in lax tissue');
    if(d.rehabDone&&!d.musclePat){set('shift','ind','Failed ≥ 6 months of rehabilitation: arthroscopic pancapsular plication or open inferior capsular shift'+(d.sulcusER?'; close the rotator interval (sulcus persists in external rotation).':'.'));
      con('shift','Avoid thermal capsulorrhaphy (capsular necrosis, chondrolysis)');if(d.ctd||bg>=T.beighton)con('shift',`Generalised hypermobility (Beighton ${bg}/9) / connective-tissue disorder: higher failure`)}
    else set('shift','consider','Only after failed structured rehabilitation.');
    if(['bankart','bony','post','kim'].includes(d.labrum)||(v.gbl!=null&&v.gbl>=T.subcrit))note('A structural lesion is present: treat the dominant direction and its lesion together with the capsular laxity.')}
}

/* ---------- demo cases ---------- */
const SB=127; // demo scale bar: 10 mm
function demoGlen(){const c=document.createElement('canvas');c.width=700;c.height=900;const g=c.getContext('2d');g.fillStyle='#070707';g.fillRect(0,0,700,900);
  g.fillStyle='#8f8f8f';g.beginPath();g.arc(350,560,165,0,7);g.fill();g.beginPath();g.ellipse(350,330,110,170,0,0,7);g.fill();
  g.fillStyle='#070707';g.fillRect(455,380,260,260);
  g.fillStyle='#fff';g.fillRect(40,860,SB,5);g.font='16px sans-serif';g.fillText('10 mm',40,850);g.fillStyle='#bbb';g.fillText('Demo: en-face glenoid (anterior = right)',40,40);return c}
function demoHS(){const c=document.createElement('canvas');c.width=700;c.height=700;const g=c.getContext('2d');g.fillStyle='#070707';g.fillRect(0,0,700,700);
  g.fillStyle='#8f8f8f';g.beginPath();g.arc(350,360,250,0,7);g.fill();g.fillStyle='#454545';g.beginPath();g.ellipse(300,330,68,120,-0.2,0,7);g.fill();
  g.fillStyle='#b5b5b5';g.fillRect(470,160,30,360);g.fillStyle='#fff';g.fillRect(40,660,SB,5);g.font='16px sans-serif';g.fillText('10 mm',40,650);g.fillStyle='#bbb';g.fillText('Demo: posterior view of the humeral head',40,40);return c}
function demoAx(){const c=document.createElement('canvas');c.width=820;c.height=600;const g=c.getContext('2d');g.fillStyle='#070707';g.fillRect(0,0,820,600);
  g.strokeStyle='#8f8f8f';g.lineWidth=14;g.beginPath();g.moveTo(80,330);g.lineTo(440,302);g.stroke();
  g.fillStyle='#8f8f8f';g.beginPath();g.moveTo(430,260);g.lineTo(500,215);g.lineTo(470,390);g.lineTo(430,340);g.fill();
  g.beginPath();g.arc(640,330,120,0,7);g.fill();g.fillStyle='#303030';g.beginPath();g.ellipse(556,246,40,22,-0.8,0,7);g.fill();
  g.fillStyle='#bbb';g.font='16px sans-serif';g.fillText('Demo: axial slice (anterior = up)',30,40);return c}
const DEMO_P={
 glen:{cal1:{x:40,y:862},cal2:{x:40+SB,y:862},S:{x:350,y:162},C1:{x:212,y:650},C2:{x:350,y:725},C3:{x:452,y:690},A:{x:455,y:560}},
 hs:{cal1:{x:40,y:662},cal2:{x:40+SB,y:662},F:{x:470,y:330},H1:{x:368,y:330},H2:{x:232,y:330}},
 ax:{M:{x:80,y:330},GA:{x:500,y:215},GP:{x:470,y:390},H1:{x:640,y:210},H2:{x:760,y:330},H3:{x:640,y:450},R1:{x:531,y:279},R2:{x:593,y:220},A1:{x:599,y:217},A2:{x:599,y:443}}};
const DEMOS=[
 {t:'19 y rugby player, 4 dislocations, 3D CT done',d:{age:19,sex:'M',dir:'ant',etiol:'trauma',nDisl:4,months:20,sport:'comp',stype:'contact',appr:true,reloc:true,erSide:70,xrHS:true,xrGlen:true,labrum:'bankart'},img:['glen','hs']},
 {t:'24 y recreational, recurrent anterior, small bone loss',d:{age:24,sex:'M',dir:'ant',etiol:'trauma',nDisl:3,sport:'rec',stype:'other',appr:true,erSide:70,gbl:6,D:27,hsi:14,labrum:'bankart'}},
 {t:'28 y handball player, off-track, 9 % bone loss',d:{age:28,sex:'F',dir:'ant',etiol:'trauma',nDisl:5,sport:'comp',stype:'overhead',appr:true,erSide:80,gbl:9,D:25,hsi:22,xrHS:true,labrum:'bankart'}},
 {t:'17 y footballer, first dislocation',d:{age:17,sex:'M',dir:'ant',etiol:'trauma',nDisl:1,months:1,sport:'comp',stype:'contact',appr:true,labrum:'bankart',physis:true}},
 {t:'58 y woman, first dislocation, cannot lift the arm',d:{age:58,sex:'F',dir:'ant',etiol:'trauma',nDisl:1,months:1,weak:true,erLag:true,weakAbd:true,ffActive:60,cuff:'ssp'}},
 {t:'23 y, failed arthroscopic Bankart (3 anchors), 15 % bone loss',d:{age:23,sex:'M',dir:'ant',etiol:'trauma',nDisl:6,sport:'comp',stype:'contact',prior:'bankart',nPrior:1,anchors:3,reinj:'minor',gbl:15,D:26,hsi:18,labrum:'bankart'}},
 {t:'31 y, failed Latarjet with graft lysis',d:{age:31,sex:'M',dir:'ant',etiol:'trauma',nDisl:8,prior:'latarjet',nPrior:2,reinj:'minor',gbl:24,D:26,hsi:20,arth:'1'}},
 {t:'34 y epileptic, posterior dislocation, reverse Hill-Sachs',d:{age:34,sex:'M',dir:'post',etiol:'trauma',nDisl:1,months:0.5,seizure:'uncontrolled',labrum:'post'},img:['ax']},
 {t:'21 y weightlifter, recurrent posterior subluxation',d:{age:21,sex:'M',dir:'post',etiol:'traumaSub',nSub:10,sport:'comp',stype:'other',jerk:true,kim:true,pAppr:true,loadP:'2',version:17,pgbl:8,labrum:'post',rehabDone:true}},
 {t:'17 y swimmer, multidirectional, hypermobile',d:{age:17,sex:'F',dir:'mdi',etiol:'atraum',nSub:20,sport:'comp',stype:'other',sulcus:'2',sulcusER:true,gagey:115,erSide:95,b0:true,b1:true,b2:true,b3:true,b4:true,b5:true,b8:true,capsule:true}},
 {t:'15 y, dislocates at will (muscle patterning)',d:{age:15,sex:'F',dir:'post',etiol:'vol',nSub:30,volDemo:true,musclePat:true,dysk:true}}];
function openDemo(i){const x=DEMOS[i];S.d={...BLANK,...x.d};S.sc={tp:'preop',view:'risk',d:{}};S.rec=blankRec();S.caseId=null;S.P={};S.cal={glen:10,hs:10};imgs={};blobs={};
  if(x.img){for(const m of x.img){imgs[m]={glen:demoGlen,hs:demoHS,ax:demoAx}[m]();S.P[m]=JSON.parse(JSON.stringify(DEMO_P[m]))}S.mode=x.img[0]}else S.mode='glen';
  S.active=MODES[S.mode].pts[0][0];selectTab('dec');toast('Demo: '+x.t)}
