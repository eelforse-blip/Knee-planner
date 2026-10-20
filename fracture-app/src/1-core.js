const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d');
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const COL={pt:'#ffc247',line:'#7fd0ff',ghost:'rgba(127,208,255,.55)',meas:'#4fe3b4',alt:'#ff9f6b',bad:'#ff7a7a'};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>v===''||v==null||isNaN(+v)?null:+v;
const f1=v=>v==null||isNaN(v)?'—':(+v).toFixed(1),f0=v=>v==null||isNaN(v)?'—':Math.round(+v)+'';

/* ---------- geometry ---------- */
const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mul=(a,k)=>({x:a.x*k,y:a.y*k}),mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const dot=(a,b)=>a.x*b.x+a.y*b.y,len=a=>Math.hypot(a.x,a.y),norm=a=>mul(a,1/(len(a)||1)),perp=a=>({x:-a.y,y:a.x});
const DEG=180/Math.PI;
const angLines=(a,b,c,d)=>{const u=norm(sub(b,a)),v=norm(sub(d,c));let t=Math.acos(Math.max(-1,Math.min(1,Math.abs(dot(u,v)))))*DEG;return t};// acute angle between two lines
const ang3=(a,b,c)=>{const u=sub(a,b),v=sub(c,b);return Math.acos(Math.max(-1,Math.min(1,dot(u,v)/(len(u)*len(v)||1))))*DEG};
const distToLineAlong=(p,o,dir)=>dot(sub(p,o),norm(dir));// signed projection along dir

/* ---------- measurement templates ---------- */
const CAL=[['cal1','Scale bar end 1','One end of a scale bar or known length'],['cal2','Scale bar end 2','Other end; enter its length below']];
const MEAS={
 dr_ap:{name:'Distal radius – PA',sub:'inclination · height · ulnar variance',cal:true,hint:'PA wrist view. Two points on the radial shaft axis, the tip of the radial styloid, the ulnar corner of the lunate fossa and the distal articular surface of the ulnar head.',pts:[...CAL,['A1','Radial shaft axis – proximal','Centre of the radial shaft, proximal'],['A2','Radial shaft axis – distal','Centre of the shaft, nearer the wrist'],['RS','Radial styloid tip',''],['UC','Ulnar corner of the lunate fossa',''],['UH','Ulnar head – distal articular surface','For ulnar variance']],
  lines:[['A1','A2'],['RS','UC'],['UC','UH',1]],
  calc:(q,k)=>{const r={};if(q.A1&&q.A2&&q.RS&&q.UC){const ax=norm(sub(q.A2,q.A1));const art=sub(q.RS,q.UC);r.incl=90-Math.acos(Math.min(1,Math.abs(dot(norm(art),ax))))*DEG;r.incl=Math.abs(r.incl);
     if(k){r.rheight=Math.abs(dot(art,ax))*k;if(q.UH)r.uv=dot(sub(q.UH,q.UC),ax)*k}}return r}},
 dr_lat:{name:'Distal radius – lateral',sub:'volar / dorsal tilt',cal:false,hint:'True lateral wrist view. Two points on the radial shaft axis, then the volar and dorsal lips of the radial articular surface. Positive = volar tilt (normal ≈ 11°), negative = dorsal tilt.',pts:[['A1','Radial shaft axis – proximal',''],['A2','Radial shaft axis – distal',''],['VL','Volar lip of the radius',''],['DL','Dorsal lip of the radius','']],
  lines:[['A1','A2'],['VL','DL']],
  calc:q=>{const r={};if(q.A1&&q.A2&&q.VL&&q.DL){const ax=norm(sub(q.A2,q.A1));const art=sub(q.DL,q.VL);const along=dot(art,ax);const across=len(sub(art,mul(ax,along)));r.tilt=Math.atan2(along,across)*DEG}return r}},
 tad_ap:{name:'Tip–apex – AP',sub:'lag screw position',cal:false,hint:'AP hip after fixation: screw tip, apex of the femoral head (where the neck axis meets the head), and the two edges of the screw (corrects magnification). Set the true screw diameter below.',pts:[['T','Lag-screw tip',''],['X','Femoral head apex',''],['D1','Screw edge 1',''],['D2','Screw edge 2','']],lines:[['T','X'],['D1','D2']],
  calc:(q,k,S)=>{const r={};if(q.T&&q.X&&q.D1&&q.D2)r.tadap=len(sub(q.T,q.X))*(S.cal.screw||10.5)/len(sub(q.D1,q.D2));return r}},
 tad_lat:{name:'Tip–apex – lateral',sub:'lag screw position',cal:false,hint:'Lateral hip: same four points. TAD = AP + lateral distance (≤ 25 mm).',pts:[['T','Lag-screw tip',''],['X','Femoral head apex',''],['D1','Screw edge 1',''],['D2','Screw edge 2','']],lines:[['T','X'],['D1','D2']],
  calc:(q,k,S)=>{const r={};if(q.T&&q.X&&q.D1&&q.D2)r.tadlat=len(sub(q.T,q.X))*(S.cal.screw||10.5)/len(sub(q.D1,q.D2));return r}},
 pauwels:{name:'Pauwels angle',sub:'femoral neck fracture verticality',cal:false,hint:'AP hip. Two points on the femoral shaft axis and two along the fracture line. Pauwels = angle of the fracture line to the horizontal (perpendicular to the shaft).',pts:[['A1','Femoral shaft axis – distal',''],['A2','Femoral shaft axis – proximal',''],['F1','Fracture line – end 1',''],['F2','Fracture line – end 2','']],
  lines:[['A1','A2'],['F1','F2']],
  calc:q=>{const r={};if(q.A1&&q.A2&&q.F1&&q.F2)r.pauwels=90-angLines(q.A1,q.A2,q.F1,q.F2);return r}},
 bohler:{name:'Böhler angle',sub:'calcaneus, lateral view',cal:false,hint:'Lateral calcaneus: highest point of the tuberosity, highest point of the posterior facet, highest point of the anterior process. Normal 20–40°.',pts:[['T','Top of the tuberosity',''],['P','Top of the posterior facet',''],['A','Top of the anterior process','']],
  lines:[['T','P'],['P','A']],
  calc:q=>{const r={};if(q.T&&q.P&&q.A)r.bohler=180-ang3(q.T,q.P,q.A);return r}},
 ankle:{name:'Ankle mortise',sub:'medial clear space · syndesmosis',cal:true,hint:'Mortise / AP ankle. Calibrate, then the medial clear space (medial malleolus to talus at the talar dome level), tibiofibular clear space (1 cm above the plafond) and tibiofibular overlap.',pts:[...CAL,['M1','Medial clear space – malleolus',''],['M2','Medial clear space – talus',''],['C1','Tib-fib clear space – tibia (incisura)',''],['C2','Tib-fib clear space – fibula',''],['O1','Tib-fib overlap – fibula medial border',''],['O2','Tib-fib overlap – tibia lateral border','']],
  lines:[['M1','M2'],['C1','C2'],['O1','O2']],
  calc:(q,k)=>{const r={};if(!k)return r;if(q.M1&&q.M2)r.mcs=len(sub(q.M1,q.M2))*k;if(q.C1&&q.C2)r.tfcs=len(sub(q.C1,q.C2))*k;if(q.O1&&q.O2)r.ovl=len(sub(q.O1,q.O2))*k;return r}},
 kyph:{name:'Vertebral body',sub:'kyphosis · height loss',cal:false,hint:'Lateral spine. Superior endplate of the vertebra above and inferior endplate of the vertebra below (segmental Cobb), then the anterior heights of the fractured vertebra and the two neighbours.',pts:[['U1','Upper endplate (vertebra above) – anterior',''],['U2','Upper endplate (vertebra above) – posterior',''],['L1','Lower endplate (vertebra below) – anterior',''],['L2','Lower endplate (vertebra below) – posterior',''],['H1','Fractured body – anterior top',''],['H2','Fractured body – anterior bottom',''],['N1','Vertebra above – anterior top',''],['N2','Vertebra above – anterior bottom',''],['N3','Vertebra below – anterior top',''],['N4','Vertebra below – anterior bottom','']],
  lines:[['U1','U2'],['L1','L2'],['H1','H2'],['N1','N2',1],['N3','N4',1]],
  calc:q=>{const r={};if(q.U1&&q.U2&&q.L1&&q.L2)r.kyph=angLines(q.U1,q.U2,q.L1,q.L2);if(q.H1&&q.H2&&q.N1&&q.N2&&q.N3&&q.N4){const h=len(sub(q.H1,q.H2)),n=(len(sub(q.N1,q.N2))+len(sub(q.N3,q.N4)))/2;r.ahl=(1-h/n)*100}return r}},
 plateau:{name:'Tibial plateau',sub:'depression · widening',cal:true,hint:'AP knee (or coronal CT). Calibrate; articular step / depression (intact joint line to the deepest depressed fragment) and condylar widening (tibial plateau width vs femoral condyle width).',pts:[...CAL,['S1','Intact articular surface',''],['S2','Deepest depressed fragment',''],['P1','Tibial plateau – medial edge',''],['P2','Tibial plateau – lateral edge',''],['F1','Femoral condyles – medial edge',''],['F2','Femoral condyles – lateral edge','']],
  lines:[['S1','S2'],['P1','P2'],['F1','F2',1]],
  calc:(q,k)=>{const r={};if(!k)return r;if(q.S1&&q.S2)r.step=len(sub(q.S1,q.S2))*k;if(q.P1&&q.P2&&q.F1&&q.F2)r.widen=(len(sub(q.P1,q.P2))-len(sub(q.F1,q.F2)))*k;return r}},
 baumann:{name:'Baumann / shaft–physeal',sub:'paediatric elbow',cal:false,hint:'AP elbow. Two points on the humeral shaft axis and two along the capitellar (lateral condylar) physis. Compare with the other elbow (difference > 5° = malreduction).',pts:[['A1','Humeral shaft axis – proximal',''],['A2','Humeral shaft axis – distal',''],['B1','Capitellar physis – lateral',''],['B2','Capitellar physis – medial','']],
  lines:[['A1','A2'],['B1','B2']],
  calc:q=>{const r={};if(q.A1&&q.A2&&q.B1&&q.B2)r.baumann=angLines(q.A1,q.A2,q.B1,q.B2);return r}},
 len:{name:'Length / shortening',sub:'distance',cal:true,hint:'Any distance: displacement, shortening, gap, fragment size. Calibrate first.',pts:[...CAL,['D1','Point 1',''],['D2','Point 2','']],
  lines:[['D1','D2']],
  calc:(q,k)=>{const r={};if(k&&q.D1&&q.D2)r.dist=len(sub(q.D1,q.D2))*k;return r}},
 angle:{name:'Angle',sub:'angulation between two lines',cal:false,hint:'Angulation: two points on each fragment axis (or any two lines).',pts:[['A1','Line 1 – point 1',''],['A2','Line 1 – point 2',''],['B1','Line 2 – point 1',''],['B2','Line 2 – point 2','']],
  lines:[['A1','A2'],['B1','B2']],
  calc:q=>{const r={};if(q.A1&&q.A2&&q.B1&&q.B2)r.angle=angLines(q.A1,q.A2,q.B1,q.B2);return r}}};

/* ---------- patient (general) fields ---------- */
const G_FORM=[
 ['Patient',[
  {k:'age',l:'Age',t:'num',u:'y'},{k:'sex',l:'Sex',t:'seg',o:[['M','Male'],['F','Female']]},{k:'side',l:'Side',t:'seg',o:[['R','Right'],['L','Left'],['B','Bilateral / midline']]},
  {k:'dom',l:'Dominant limb',t:'chk'},
  {k:'demand',l:'Activity level',t:'sel',o:[['high','High – manual worker / athlete'],['mod','Normal – independent, active'],['low','Low – limited walking, housebound'],['frail','Frail / bed-bound / nursing home']]},
  {k:'cog',l:'Cognitive impairment',t:'chk'}]],
 ['Injury',[
  {k:'energy',l:'Mechanism',t:'seg',o:[['low','Low energy (fall from standing)'],['high','High energy']]},
  {k:'hours',l:'Time since injury',t:'num',u:'h'},
  {k:'open',l:'Open fracture (Gustilo–Anderson)',t:'sel',o:[['no','Closed'],['I','I – wound < 1 cm, clean'],['II','II – 1–10 cm, moderate soft-tissue damage'],['IIIA','IIIA – adequate soft-tissue cover'],['IIIB','IIIB – periosteal stripping, needs flap'],['IIIC','IIIC – arterial injury needing repair']]},
  {k:'skin',l:'Closed soft-tissue injury',t:'sel',o:[['ok','No significant swelling'],['swell','Marked swelling / fracture blisters'],['threat','Skin under threat (tenting, dislocation)']]},
  {k:'vasc',l:'Absent / reduced pulses or ischaemia',t:'chk'},
  {k:'nerve',l:'Nerve deficit',t:'chk'},
  {k:'comp',l:'Signs of compartment syndrome',t:'chk'},
  {k:'poly',l:'Polytrauma',t:'sel',o:[['no','No'],['stable','Yes – physiologically stable'],['border','Borderline'],['unstable','Unstable / in extremis']]},
  {k:'path',l:'Pathological fracture (tumour / metastasis)',t:'chk'},
  {k:'peri',l:'Periprosthetic / around an implant',t:'chk'}]],
 ['Health',[
  {k:'child',l:'Open growth plates (child)',t:'chk'},
  {k:'osteo',l:'Osteoporosis / fragility fracture',t:'chk'},
  {k:'diab',l:'Diabetes (peripheral neuropathy?)',t:'chk'},
  {k:'smoke',l:'Smoker',t:'chk'},
  {k:'anticoag',l:'Anticoagulant / antiplatelet',t:'chk'},
  {k:'asa',l:'ASA grade',t:'seg',o:[['1','1'],['2','2'],['3','3'],['4','4']]}]]];
const G_BLANK={age:'',sex:'M',side:'R',dom:false,demand:'mod',cog:false,energy:'low',hours:'',open:'no',skin:'ok',vasc:false,nerve:false,comp:false,poly:'no',path:false,peri:false,child:false,osteo:false,diab:false,smoke:false,anticoag:false,asa:'2'};

/* ---------- fracture registry (filled by kb files) ---------- */
const FX={};const FX_ORDER=[];
const REGIONS=[['upper','Upper limb'],['axial','Pelvis & hip'],['lower','Lower limb'],['spine','Spine']];
function defFx(o){FX[o.id]=o;FX_ORDER.push(o.id)}
/* builder for decisions */
function R0(){return{head:'',cls:[],acc:[],opts:[],timing:[],approach:[],implant:[],fu:[],img:[],notes:[],comp:[],status:'acc'}}
const opt=(R,name,st,why,pro,con)=>R.opts.push({name,st,why:why||'',pro:pro||[],con:con||[]});
const accept=(R,label,val,unit,ok,limit)=>R.acc.push({label,val,unit,ok,limit});
const lowDemand=P=>P.demand==='low'||P.demand==='frail';
const old=(P,a)=>P.age!=null&&P.age>=(a||65);
const young=(P,a)=>P.age!=null&&P.age<(a||60);
