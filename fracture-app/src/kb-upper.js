
/* ================= UPPER LIMB ================= */
defFx({id:'clav',reg:'upper',name:'Clavicle – midshaft',ao:'AO/OTA 15.2',meas:['len'],
 fields:[
  {k:'disp',l:'Displacement',t:'seg',o:[['none','Undisplaced'],['part','< 100 %'],['full','≥ 100 % (no contact)']]},
  {k:'short',l:'Shortening',t:'num',u:'mm',m:'dist'},
  {k:'comm',l:'Comminuted / Z-shaped butterfly',t:'chk'},
  {k:'tent',l:'Skin tenting',t:'chk'},
  {k:'float',l:'Floating shoulder (with scapular neck / glenoid fracture)',t:'chk'},
  {k:'overhead',l:'Overhead athlete / manual worker',t:'chk'}],
 decide(f,P,R){const sh=num(f.short);R.cls.push(`Allman I / Robinson 2${f.disp==='full'?'B':'A'} – ${f.disp==='full'?'completely displaced':f.disp==='part'?'partly displaced':'undisplaced'}${f.comm?', comminuted':''}`);
  if(sh!=null)accept(R,'Shortening',sh,'mm',sh<20,'< 15–20 mm');
  const ind=f.tent||P.open!=='no'||P.vasc||f.float;const rel=f.disp==='full'&&(sh!=null&&sh>=15||f.comm)&&!lowDemand(P);
  if(ind||rel){opt(R,'Open reduction and plate fixation','ind',ind?'Open fracture, skin tenting, neurovascular injury or floating shoulder.':'Completely displaced, shortened or comminuted in an active adult: plating lowers non-union and symptomatic malunion and gives faster recovery (COTS 2007).',['Union ≈ 16 vs 28 weeks','Non-union ≈ 3 % vs 14 %'],['Hardware irritation – removal is the commonest re-operation','Infraclavicular numbness']);
    opt(R,'Sling and early movement','consider','Acceptable after discussion: most unite; ~15 % non-union and some symptomatic malunion.')}
  else opt(R,'Sling and early movement','ind','Undisplaced / minimally displaced or low-demand patient.');
  if(f.disp==='full'&&f.overhead)R.notes.push('Overhead or manual workers notice shortening and weakness more – lower threshold for fixation.');
  R.timing.push(f.tent?'Skin tenting: fix within 24–48 h before the skin breaks down.':'Elective, ideally within 1–2 weeks (easier reduction).');
  R.approach.push('Superior or anteroinferior approach; protect the supraclavicular nerves where possible.','Anteroinferior plating: less prominent hardware and safer drilling direction (away from subclavian vessels).');
  R.implant.push('Pre-contoured 3.5 mm superior or anteroinferior locking plate (≥ 3 bicortical screws each side) or dual mini-plates','Intramedullary pin/nail for simple transverse patterns');
  R.fu.push('Sling for comfort 2–3 weeks; pendulum then active movement as pain allows','No lifting > 2–3 kg and no contact sport until union (≈ 12 weeks)','X-rays at 2, 6 and 12 weeks');
  R.comp.push('Non-union (higher with displacement, shortening, smoking, women, older age)','Hardware prominence','Subclavian vessel injury during drilling');
  R.img.push('AP clavicle and 15–30° cephalic tilt view','CT only for medial-end or complex patterns')}});

defFx({id:'clavlat',reg:'upper',name:'Clavicle – lateral end',ao:'Neer / Robinson 3',meas:['len'],
 fields:[{k:'neer',l:'Neer type',t:'sel',o:[['I','I – lateral to intact CC ligaments, undisplaced'],['IIa','IIa – medial to both CC ligaments, displaced'],['IIb','IIb – between conoid and trapezoid / conoid torn'],['III','III – into the AC joint, ligaments intact'],['IV','IV – paediatric, periosteal sleeve'],['V','V – comminuted, only an inferior fragment attached to the CC ligaments']]},
  {k:'gap',l:'Displacement',t:'num',u:'mm',m:'dist'}],
 decide(f,P,R){R.cls.push('Neer type '+f.neer);const unst=['IIa','IIb','V'].includes(f.neer);
  if(unst&&!lowDemand(P)){opt(R,'Fixation (stabilise against the CC ligaments)','ind','Neer II and V are unstable: the medial fragment is pulled up by trapezius; high non-union rate if left.',['Union in most'],['Hook plates often need removal; subacromial impingement']);opt(R,'Sling','consider','Low-demand or elderly: non-union is frequent but often painless.')}
  else opt(R,'Sling and early movement','ind',unst?'Low demand: accept a possibly painless non-union.':'Stable pattern (types I, III, IV).');
  if(f.neer==='III')R.notes.push('Type III can lead to AC joint arthritis – later distal clavicle excision if painful.');
  R.timing.push('Within 1–2 weeks if fixing.');R.approach.push('Superior approach over the distal clavicle / AC joint.');
  R.implant.push('Lateral locking plate with distal screws ± coracoclavicular suture-button/tape augmentation','Hook plate (remove at ≈ 3 months)','Arthroscopically assisted CC fixation for small lateral fragments');
  R.fu.push('Sling 3–4 weeks; no lifting above shoulder for 6 weeks','X-rays at 2, 6, 12 weeks; hook plate removal after union');R.img.push('AP and Zanca view; stress views rarely needed')}});

defFx({id:'phum',reg:'upper',name:'Proximal humerus',ao:'AO/OTA 11 · Neer',meas:['angle','len'],
 fields:[{k:'parts',l:'Neer parts (displacement > 1 cm or > 45°)',t:'seg',o:[['1','1-part'],['2','2-part'],['3','3-part'],['4','4-part']]},
  {k:'two',l:'2-part type',t:'sel',o:[['sn','Surgical neck'],['gt','Greater tuberosity'],['lt','Lesser tuberosity'],['an','Anatomical neck']],show:f=>f.parts==='2'},
  {k:'gtdisp',l:'Greater tuberosity displacement',t:'num',u:'mm',m:'dist'},
  {k:'split',l:'Head-split / impression > 40 %',t:'chk'},{k:'disl',l:'Fracture–dislocation',t:'chk'},
  {k:'valg',l:'Head alignment',t:'seg',o:[['ok','Normal'],['valgus','Valgus impacted'],['varus','Varus']]},
  {k:'calcar',l:'Medial calcar extension < 8 mm',t:'chk'},{k:'hinge',l:'Medial hinge disrupted (> 2 mm)',t:'chk'},
  {k:'bone',l:'Poor bone quality',t:'chk'}],
 decide(f,P,R){const pts=+f.parts;const gt=num(f.gtdisp);const elderly=old(P,65);
  R.cls.push(`Neer ${pts}-part${pts===2?' ('+{sn:'surgical neck',gt:'greater tuberosity',lt:'lesser tuberosity',an:'anatomical neck'}[f.two]+')':''}${f.valg!=='ok'?', '+f.valg:''}${f.disl?', fracture–dislocation':''}${f.split?', head-split':''}`);
  if(f.calcar&&f.hinge)R.cls.push('Hertel: short calcar + disrupted medial hinge → high risk of head ischaemia (PPV up to 97 %).');
  if(gt!=null)accept(R,'Greater tuberosity displacement',gt,'mm',gt<5,'< 5 mm (< 3 mm in overhead athletes)');
  if(pts===1)opt(R,'Sling, early pendulum exercises','ind','Undisplaced: excellent results without surgery.');
  else if(pts===2&&f.two==='gt'){if(gt!=null&&gt>=(P.demand==='high'?3:5))opt(R,'Fixation of the greater tuberosity','ind','Displaced tuberosity causes impingement and cuff weakness.',[],[]);else opt(R,'Sling, early movement','ind','Tuberosity displacement within limits.')}
  else if(pts===2&&f.two==='sn'){if(elderly||lowDemand(P))opt(R,'Sling and supervised rehabilitation','ind','PROFHER: no benefit of surgery for displaced surgical-neck fractures in adults (mean age 66).');
    else{opt(R,'Locking plate or intramedullary nail','consider','Younger active patient with substantial displacement or translation.');opt(R,'Sling and rehabilitation','consider','Many unite with acceptable function.')}}
  else{const replace=((f.split||f.disl||(f.calcar&&f.hinge)||f.bone)&&(elderly||P.age>=60))||(pts===4&&old(P,70));
    if(elderly&&lowDemand(P)&&!f.disl)opt(R,'Sling and rehabilitation','ind','Frail or low demand: non-operative care is reasonable even for 3–4-part fractures.');
    if(replace){opt(R,'Reverse shoulder arthroplasty','ind','Older patient with complex 3–4-part, head-split or dislocated fracture: reliable function, independent of tuberosity healing.',['Predictable elevation'],['Limited rotation','Dislocation, notching']);opt(R,'Locking plate ORIF','consider','If the head is reconstructable and bone quality good.');if(elderly&&!f.disl&&!lowDemand(P))opt(R,'Sling and rehabilitation','consider','PROFHER included 3–4-part fractures: no difference in Oxford score at 2 years vs surgery.')}
    else{opt(R,'Open reduction and locking plate (with calcar screws)','ind','Reconstructable fracture in a younger patient.',['Retains the native joint'],['Screw cut-out, AVN, varus collapse']);
      if(f.valg==='valgus')R.notes.push('Valgus-impacted 4-part fractures have a lower AVN rate and often do well with fixation or even non-operatively.')}
    if(f.split&&young(P,60))opt(R,'ORIF; hemiarthroplasty if unreconstructable','consider','Young head-split: attempt anatomical reduction.')}
  if(f.disl)R.timing.push('Fracture–dislocation: urgent reduction (often open) – avoid repeated closed attempts that displace the neck.');
  R.timing.push('Fixation ideally within 1–2 weeks; arthroplasty within 2–3 weeks (tuberosities heal less well later).');
  R.approach.push('Deltopectoral (standard for plates and arthroplasty)','Deltoid-split (lateral) for tuberosity and minimally invasive plating – protect the axillary nerve ≈ 5 cm below the acromion');
  R.implant.push('Proximal humeral locking plate with inferomedial (calcar) screws ± fibular strut allograft','Short proximal humeral nail for 2-part surgical-neck fractures','Reverse shoulder arthroplasty with tuberosity repair','Screws / suture-bridge for isolated tuberosities');
  R.fu.push('Sling 2–4 weeks; pendulum from the first week; active-assisted at 3–6 weeks; strengthening from 8–12 weeks','X-rays at 2, 6, 12 weeks and 1 year (AVN, screw cut-out)');
  R.comp.push('Avascular necrosis','Screw cut-out / varus collapse','Stiffness','Axillary nerve injury');
  R.img.push('True AP (Grashey), scapular Y and axillary views','CT with 3D for 3–4-part, head-split or when planning fixation')}});

defFx({id:'hshaft',reg:'upper',name:'Humeral shaft',ao:'AO/OTA 12',meas:['angle','len'],
 fields:[{k:'pat',l:'Pattern',t:'sel',o:[['A','A – simple (transverse / oblique / spiral)'],['B','B – wedge'],['C','C – multifragmentary / segmental']]},
  {k:'loc',l:'Level',t:'seg',o:[['prox','Proximal third'],['mid','Middle third'],['dist','Distal third']]},
  {k:'radial',l:'Radial nerve palsy',t:'sel',o:[['no','None'],['primary','Present at injury'],['secondary','After manipulation / splinting']]},
  {k:'ang',l:'Angulation',t:'num',u:'°',m:'angle'},{k:'shortn',l:'Shortening',t:'num',u:'mm',m:'dist'},
  {k:'floatel',l:'Floating elbow (with forearm fracture)',t:'chk'},{k:'bilat',l:'Bilateral / needs arms for crutches',t:'chk'},{k:'obese',l:'Obesity / large breasts (brace fails)',t:'chk'}],
 decide(f,P,R){const a=num(f.ang),s=num(f.shortn);R.cls.push(`AO 12-${f.pat}, ${({prox:'proximal',mid:'middle',dist:'distal'})[f.loc]} third${f.radial!=='no'?', radial nerve palsy':''}`);
  if(a!=null)accept(R,'Angulation',a,'°',a<=20,'≤ 20° anterior, ≤ 30° varus');if(s!=null)accept(R,'Shortening',s,'mm',s<=30,'≤ 3 cm');
  const surg=P.open!=='no'||P.vasc||f.floatel||f.bilat||P.poly!=='no'||P.path||(a!=null&&a>30)||(s!=null&&s>30)||f.pat==='C'&&f.loc!=='mid';
  if(surg){opt(R,'Plate fixation','ind','Open fracture, vascular injury, floating elbow, polytrauma, bilateral, pathological or unacceptable alignment.',['Highest union rate','Allows nerve exploration'],['Radial nerve at risk (anterolateral / posterior)']);opt(R,'Antegrade intramedullary nail','consider','Pathological, segmental or obese patients.',[],['Shoulder pain','Higher non-union than plating'])}
  else{opt(R,'Functional brace (Sarmiento)','ind','Most closed shaft fractures unite in a brace (≈ 90 %).',['Avoids surgery'],['Non-union ≈ 10 % (higher in proximal-third and transverse)','Skin problems, compliance']);opt(R,'Plate fixation','consider','Faster function; consider for transverse/proximal-third patterns, obesity, or patient preference.')}
  if(f.obese)R.notes.push('Obesity / large breasts push the fracture into varus in a brace – consider surgery.');
  if(f.radial==='primary')R.notes.push('Primary radial nerve palsy: ≈ 70–90 % recover – observe; wrist splint; EMG at 6–12 weeks; explore if no recovery by 4–6 months (or immediately if open fracture or you are operating anyway).');
  if(f.radial==='secondary')R.notes.push('Palsy after manipulation: many surgeons explore; at minimum early nerve studies.');
  if(f.loc==='dist'&&f.pat==='A')R.notes.push('Distal-third spiral (Holstein–Lewis): radial nerve is tethered at the lateral intermuscular septum – check it carefully.');
  R.timing.push('Coaptation (U-slab) splint now; brace at 1–2 weeks when swelling settles.','Surgery electively within the first 1–2 weeks (urgent if open / vascular).');
  R.approach.push('Anterolateral (proximal and middle third; brachialis split)','Posterior triceps-split or paratricipital (distal third) – identify the radial nerve','Medial for vascular repair');
  R.implant.push('4.5 mm (or 3.5 mm in small humeri) compression / locking plate, ≥ 6–8 cortices each side','Antegrade locked humeral nail');
  R.fu.push('Brace until union (≈ 10–12 weeks); shoulder pendulum and elbow movement in the brace','X-rays at 1, 2, 6 and 12 weeks; consider surgery if no callus by 6–8 weeks (high risk of non-union)');
  R.comp.push('Non-union','Radial nerve palsy','Malunion (well tolerated up to 20–30°)');R.img.push('AP and lateral of the whole humerus including shoulder and elbow')}});

defFx({id:'dhum',reg:'upper',name:'Distal humerus (adult)',ao:'AO/OTA 13',meas:['angle','len'],
 fields:[{k:'type',l:'AO type',t:'sel',o:[['A','A – extra-articular'],['B','B – partial articular (single column / capitellum)'],['C1','C1 – simple articular, simple metaphyseal'],['C2','C2 – simple articular, comminuted metaphysis'],['C3','C3 – comminuted articular']]},
  {k:'low',l:'Very low (transcondylar) fracture',t:'chk'},{k:'ulnar',l:'Ulnar nerve symptoms',t:'chk'}],
 decide(f,P,R){R.cls.push('AO 13-'+f.type+(f.low?', low transcondylar':''));const elderly=old(P,70);
  if(lowDemand(P)&&P.demand==='frail')opt(R,'“Bag of bones” – collar & cuff, early movement','ind','Frail, very low-demand patient unfit for surgery.');
  if(elderly&&(f.type==='C3'||f.low)&&P.osteo)opt(R,'Total elbow arthroplasty','ind','Elderly osteoporotic comminuted or very low fracture: more reliable than fixation.',['Immediate movement'],['Lifelong 5 kg lifting limit','Loosening, infection']);
  opt(R,'Open reduction and dual (parallel or orthogonal) plating','ind','Standard for displaced intra-articular fractures – aim for stable fixation that allows early movement.',['Anatomical joint'],['Stiffness, ulnar neuritis, heterotopic ossification']);
  R.timing.push('Within 1–7 days; splint in extension-ish with elevation meanwhile.');
  R.approach.push(f.type==='A'?'Paratricipital (triceps-sparing) or triceps-split':'Olecranon chevron osteotomy for articular (C) fractures; triceps-reflecting or paratricipital alternatives','Identify and protect (± transpose) the ulnar nerve');
  R.implant.push('Pre-contoured 3.5 mm medial + posterolateral (orthogonal) or medial + lateral (parallel) locking plates','Headless compression screws for capitellum / trochlea shear fractures','Semi-constrained total elbow arthroplasty');
  R.fu.push('Active movement from day 1–3 (stiffness is the main enemy)','X-rays at 2, 6, 12 weeks','Watch ulnar nerve function');R.comp.push('Stiffness','Ulnar neuropathy','Heterotopic ossification','Osteotomy non-union');
  R.img.push('AP and lateral; traction views help','CT with 3D reconstruction for all articular fractures')}});

defFx({id:'scond',reg:'upper',name:'Supracondylar humerus (child)',ao:'Gartland',meas:['baumann','angle'],
 fields:[{k:'gart',l:'Gartland type (extension)',t:'sel',o:[['I','I – undisplaced'],['IIa','IIa – posterior cortex intact, no rotation'],['IIb','IIb – posterior hinge, with rotation / translation'],['III','III – completely displaced'],['IV','IV – multidirectionally unstable'],['flex','Flexion type']]},
  {k:'ahl',l:'Anterior humeral line misses the capitellum',t:'chk'},{k:'baum',l:'Baumann angle difference to other side',t:'num',u:'°'},
  {k:'pulse',l:'Hand perfusion',t:'sel',o:[['ok','Normal pulse'],['pink','Pink, pulseless'],['white','White / cold, pulseless']]},
  {k:'ain',l:'Nerve injury (AIN / radial / ulnar)',t:'chk'},{k:'medcom',l:'Medial column comminution',t:'chk'}],
 decide(f,P,R){R.cls.push('Gartland '+f.gart);const disp=['IIb','III','IV','flex'].includes(f.gart)||(f.gart==='IIa'&&f.ahl)||f.medcom;
  if(f.pulse==='white'){opt(R,'Emergency closed reduction and pinning','ind','Ischaemic hand: reduce immediately; if still white / no flow after reduction → explore the brachial artery.');R.timing.push('EMERGENCY – theatre now.')}
  else if(f.pulse==='pink'){opt(R,'Urgent closed reduction and percutaneous pinning','ind','Pink pulseless hand: reduce and pin; then observe closely for 24–48 h (pulse often returns).');R.timing.push('Urgent – same night.')}
  if(f.gart==='I'||(f.gart==='IIa'&&!f.ahl&&!f.medcom))opt(R,'Above-elbow cast at ~90° for 3 weeks','ind','Stable: anterior humeral line through the capitellum, no rotation.');
  else if(disp&&f.pulse==='ok')opt(R,'Closed reduction and percutaneous K-wire pinning','ind','Displaced / unstable fracture.',['Two or three divergent lateral wires are usually enough'],['Medial wire risks the ulnar nerve – use a mini-open technique with elbow < 90°']);
  if(f.gart==='III'||f.gart==='IV')opt(R,'Open reduction','consider','If closed reduction fails (interposed brachialis / neurovascular bundle; puckered skin).');
  if(f.pulse==='ok'&&disp)R.timing.push('No neurovascular compromise: next available daytime list is acceptable (within ~12–24 h), keeping the arm elevated and checking circulation.');
  if(f.ain)R.notes.push('Nerve palsies (AIN commonest in extension type, ulnar in flexion type) usually recover in 3–6 months.');
  const b=num(f.baum);if(b!=null)accept(R,'Baumann angle difference',b,'°',b<=5,'≤ 5° (avoids cubitus varus)');
  R.approach.push('Closed reduction: traction, correct medial/lateral, flex with pressure on the olecranon, pronate','Open: anterior approach (or lateral / medial) if needed');
  R.implant.push('1.6–2.0 mm K-wires: 2–3 lateral divergent; crossed if unstable (ulnar nerve protected)');
  R.fu.push('Above-elbow backslab 3–4 weeks; wires removed in clinic at 3–4 weeks','Check X-rays at 1 week for loss of reduction','Compartment syndrome check the first night','Movement returns over months; no physiotherapy usually needed');
  R.comp.push('Cubitus varus (malreduction)','Compartment syndrome / Volkmann','Nerve palsy','Pin-site infection');R.img.push('AP and true lateral (anterior humeral line, Baumann angle); compare with the other side if unsure')}});

defFx({id:'olec',reg:'upper',name:'Olecranon',ao:'Mayo',meas:['len'],
 fields:[{k:'mayo',l:'Mayo type',t:'sel',o:[['I','I – undisplaced'],['IIA','IIA – displaced, stable, non-comminuted'],['IIB','IIB – displaced, stable, comminuted'],['III','III – unstable (with dislocation)']]},
  {k:'gap',l:'Displacement / gap',t:'num',u:'mm',m:'dist'},{k:'obl',l:'Oblique fracture distal to the coronoid midpoint',t:'chk'}],
 decide(f,P,R){R.cls.push('Mayo '+f.mayo);const g=num(f.gap);if(g!=null)accept(R,'Displacement',g,'mm',g<2,'< 2 mm');
  if(f.mayo==='I')opt(R,'Splint 1–2 weeks then active movement','ind','Undisplaced, intact extensor mechanism.');
  else{if(old(P,75)&&lowDemand(P))opt(R,'Non-operative – sling, early movement','ind','Elderly low-demand: function is good despite displacement and fibrous union.');
    if(f.mayo==='IIA'&&!f.obl)opt(R,'Tension-band wiring','ind','Simple transverse fracture.',['Cheap, effective'],['Prominent wires – removal often needed']);
    else opt(R,'Plate fixation (pre-contoured posterior plate)','ind',f.mayo==='III'?'Unstable fracture–dislocation: restore the trochlear notch and treat associated injuries.':'Comminuted or oblique fracture – tension band is not appropriate.')}
  R.timing.push('Within 1 week; urgent if open or dislocated.');R.approach.push('Posterior approach (ulnar nerve medially)');R.implant.push('K-wires + tension-band wire','Pre-contoured olecranon locking plate','Fragment excision + triceps advancement (small comminuted proximal fragments in the elderly)');
  R.fu.push('Active movement within 1–2 weeks after stable fixation','X-rays at 2 and 6 weeks');R.comp.push('Prominent hardware','Stiffness','Ulnar neuritis');R.img.push('True lateral elbow; CT if comminuted')}});

defFx({id:'rhead',reg:'upper',name:'Radial head',ao:'Mason (Johnston / Hotchkiss)',meas:['len'],
 fields:[{k:'mason',l:'Mason type',t:'sel',o:[['I','I – undisplaced (< 2 mm)'],['II','II – displaced partial head (> 2 mm)'],['III','III – comminuted whole head'],['IV','IV – with elbow dislocation']]},
  {k:'block',l:'Mechanical block to rotation (after aspiration / local)',t:'chk'},{k:'frags',l:'Fragments',t:'seg',o:[['1','1–2'],['3','3'],['4','> 3']]},
  {k:'triad',l:'Coronoid fracture + dislocation (terrible triad)',t:'chk'},{k:'essex',l:'Wrist pain / DRUJ (Essex-Lopresti)',t:'chk'}],
 decide(f,P,R){R.cls.push('Mason '+f.mason+(f.triad?' – terrible triad':''));
  if(f.mason==='I')opt(R,'Sling 2–3 days, early active movement','ind','Undisplaced: excellent outcome.');
  if(f.mason==='II')opt(R,f.block?'ORIF with screws / small plate in the safe zone':'Early movement (non-operative)','ind',f.block?'Mechanical block to rotation.':'No block: non-operative results are as good as fixation.');
  if(f.mason==='III'||f.mason==='IV'){if(f.frags!=='4')opt(R,'ORIF','consider','≤ 3 large fragments and good bone.');opt(R,'Radial head arthroplasty','ind','Comminuted (> 3 fragments) or unstable elbow – the radial head is an important stabiliser; do not excise in an unstable elbow.',[],['Overstuffing – check lateral ulnohumeral joint space'])}
  if(f.triad)R.notes.push('Terrible triad: fix/replace the radial head, fix the coronoid (or anterior capsule), repair the LCL; add MCL repair or hinged external fixator if still unstable.');
  if(f.essex)R.notes.push('Essex-Lopresti injury: never excise the radial head – fix or replace, assess the DRUJ and interosseous membrane.');
  R.timing.push('Non-operative: movement now. Surgery within 1–2 weeks (urgent if dislocated / unstable).');R.approach.push('Kocher (anconeus–ECU) or EDC-split lateral approach; forearm pronated to protect the PIN');R.implant.push('Headless compression screws / mini-plate in the safe zone','Modular metal radial head arthroplasty');
  R.fu.push('Active movement from day 1–3','X-rays at 1, 2 and 6 weeks');R.comp.push('Stiffness','PIN injury','Instability if under-treated');R.img.push('AP, lateral and radiocapitellar views; CT for comminuted / associated injuries')}});

defFx({id:'forearm',reg:'upper',name:'Forearm shaft (both bone / Monteggia / Galeazzi)',ao:'AO/OTA 2R2 / 2U2',meas:['angle','len'],
 fields:[{k:'pat',l:'Pattern',t:'sel',o:[['both','Both-bone fracture'],['ulna','Isolated ulna (nightstick)'],['radius','Isolated radius'],['monteggia','Monteggia (ulna + radial head dislocation)'],['galeazzi','Galeazzi (radius + DRUJ disruption)']]},
  {k:'ang',l:'Angulation',t:'num',u:'°',m:'angle'},{k:'disp50',l:'Displacement > 50 % of the shaft width',t:'chk'}],
 decide(f,P,R){const a=num(f.ang);R.cls.push({both:'Both-bone forearm fracture',ulna:'Isolated ulnar shaft',radius:'Isolated radial shaft',monteggia:'Monteggia (Bado classification by radial head direction)',galeazzi:'Galeazzi'}[f.pat]);
  if(a!=null)accept(R,'Angulation',a,'°',P.child?a<=15:a<=10,P.child?'≤ 10–15° (age-dependent)':'≤ 10°');
  if(P.child){opt(R,'Closed reduction and above-elbow cast','ind','Children remodel well; accept angulation per age.');opt(R,'Elastic stable intramedullary nails','consider','Unstable, older child, or unacceptable alignment.');if(f.pat==='monteggia')R.notes.push('Paediatric Monteggia: reduce the ulna (length + alignment) and the radial head reduces; plate if unstable.')}
  else if(f.pat==='ulna'&&!f.disp50&&(a==null||a<=10))opt(R,'Functional brace / short splint','ind','Isolated ulna with < 50 % displacement and < 10° angulation.');
  else opt(R,'ORIF with compression plates','ind',f.pat==='monteggia'?'Anatomical ulnar fixation reduces the radial head; check radiocapitellar line.':f.pat==='galeazzi'?'Anatomical radius fixation, then assess DRUJ stability; pin in supination if unstable.':'Adult forearm fractures need anatomical length, alignment and radial bow for rotation.',['Restores rotation'],['Refracture after plate removal; synostosis']);
  R.timing.push('Within 24 h if open; otherwise within the first week.');R.approach.push('Radius: volar Henry (distal/middle) or dorsal Thompson (proximal)','Ulna: subcutaneous border between ECU and FCU','Separate incisions to reduce synostosis');
  R.implant.push('3.5 mm compression plates (LC-DCP), ≥ 6 cortices each side','Elastic nails in children');R.fu.push('Early wrist/elbow movement after stable fixation','X-rays at 2, 6, 12 weeks','Avoid contact sport 3 months; plate removal not routine');
  R.comp.push('Non-union','Synostosis','Compartment syndrome','PIN / AIN injury','Refracture');R.img.push('AP and lateral of the whole forearm including elbow and wrist')}});

defFx({id:'drad',reg:'upper',name:'Distal radius',ao:'AO/OTA 2R3 · Frykman',meas:['dr_ap','dr_lat'],
 fields:[{k:'ao',l:'AO type',t:'sel',o:[['A','A – extra-articular'],['B','B – partial articular (Barton / radial styloid / die-punch)'],['C','C – complete articular']]},
  {k:'dir',l:'Displacement',t:'seg',o:[['dorsal','Dorsal (Colles)'],['volar','Volar (Smith)'],['none','Minimal']]},
  {k:'tilt',l:'Volar tilt (+) / dorsal tilt (−)',t:'num',u:'°',m:'tilt'},{k:'incl',l:'Radial inclination',t:'num',u:'°',m:'incl'},{k:'rheight',l:'Radial height',t:'num',u:'mm',m:'rheight'},
  {k:'uv',l:'Ulnar variance (+ = ulna longer)',t:'num',u:'mm',m:'uv'},{k:'step',l:'Articular step-off',t:'num',u:'mm'},
  {k:'dcomm',l:'Dorsal metaphyseal comminution',t:'chk'},{k:'ulnar',l:'Ulnar styloid base / neck fracture',t:'chk'},{k:'postred',l:'Values are after reduction',t:'chk'}],
 decide(f,P,R){const t=num(f.tilt),inc=num(f.incl),h=num(f.rheight),uv=num(f.uv),st=num(f.step);
  R.cls.push(`AO 2R3-${f.ao}, ${({dorsal:'dorsally displaced (Colles type)',volar:'volarly displaced (Smith type)',none:'minimally displaced'})[f.dir]}`);
  if(t!=null)accept(R,'Tilt',t,'°',t>=-10&&t<=20,'dorsal tilt ≤ 10° (normal volar ≈ 11°)');if(inc!=null)accept(R,'Radial inclination',inc,'°',inc>=15,'≥ 15° (normal ≈ 22°)');
  if(h!=null)accept(R,'Radial height',h,'mm',h>=8,'shortening ≤ 3 mm (normal ≈ 11–12 mm)');if(uv!=null)accept(R,'Ulnar variance',uv,'mm',uv<=2,'≤ +2 mm / ≤ 3 mm vs other side');if(st!=null)accept(R,'Articular step-off',st,'mm',st<2,'< 2 mm');
  const bad=(t!=null&&t<-10)||(st!=null&&st>=2)||(uv!=null&&uv>3)||(inc!=null&&inc<15)||f.dir==='volar'||f.ao==='B';
  const lafon=[f.dcomm,t!=null&&t<-20,f.ao==='C',f.ulnar,old(P,60)].filter(Boolean).length;
  if(lafon>=3)R.notes.push(`Lafontaine instability factors: ${lafon} – high risk of re-displacement in a cast.`);
  if(old(P,65)&&(lowDemand(P)||P.demand==='mod')&&f.ao!=='B'){opt(R,'Closed reduction and cast (or splint)','ind','Over 65: functional results of non-operative care are similar to fixation for most fractures, despite worse X-ray alignment.');if(bad)opt(R,'Volar locking plate','consider','Active older patient with marked deformity, articular step or volar displacement.')}
  else if(bad){opt(R,'Volar locking plate','ind',f.ao==='B'?'Shear (Barton) fractures are unstable and need buttress plating.':'Unacceptable alignment or articular step after reduction.',['Early movement'],['Tendon irritation / EPL or FPL rupture']);opt(R,'K-wires (± cast) / external fixator','consider','Extra-articular in children / young bone, or as temporary fixation in severe soft tissue injury.')}
  else opt(R,'Closed reduction and below-elbow cast','ind','Acceptable alignment.'+(lafon>=3?' Re-check X-rays at 1 and 2 weeks – re-displacement likely.':''));
  if(!f.postred&&f.dir!=='none')R.notes.push('Measure again after closed reduction – decisions are based on post-reduction alignment.');
  R.timing.push('Reduce now under haematoma block; surgery within 1–2 weeks (before early union, ideally < 10 days).');R.approach.push('Volar FCR (modified Henry) approach – pronator quadratus elevated','Dorsal approach for dorsal shear / die-punch fragments');
  R.implant.push('Volar locking plate (distal screws just short of the dorsal cortex; plate proximal to the watershed line)','K-wires (Kapandji / radial styloid)','Bridging external fixator or dorsal spanning plate for comminuted / polytrauma','Fragment-specific fixation');
  R.fu.push('Cast 5–6 weeks (or splint 2 weeks after plating, then movement)','Finger movement immediately; elevation','X-rays at 1 and 2 weeks if non-operative (re-displacement), then at 6 weeks','Fragility fracture → bone health (DEXA, osteoporosis treatment)');
  R.comp.push('Re-displacement / malunion','Median nerve compression / acute carpal tunnel','EPL rupture (after undisplaced fractures too)','CRPS','Tendon irritation from screws');R.img.push('PA and true lateral wrist','CT for intra-articular (AO C) fractures before fixation')}});

defFx({id:'scaph',reg:'upper',name:'Scaphoid',ao:'Herbert / Russe',meas:['len','angle'],
 fields:[{k:'site',l:'Location',t:'seg',o:[['tub','Tubercle / distal'],['waist','Waist'],['prox','Proximal pole']]},
  {k:'disp',l:'Displacement',t:'num',u:'mm',m:'dist'},{k:'hump',l:'Humpback / intrascaphoid angle > 35°',t:'chk'},{k:'occult',l:'Clinically suspected, X-ray negative',t:'chk'},
  {k:'weeks',l:'Weeks since injury',t:'num',u:'wk'},{k:'athlete',l:'Wants early return (athlete / manual)',t:'chk'}],
 decide(f,P,R){const d=num(f.disp),w=num(f.weeks);R.cls.push((f.occult?'Suspected ':'')+{tub:'distal / tubercle',waist:'waist',prox:'proximal pole'}[f.site]+' scaphoid fracture');
  if(d!=null)accept(R,'Displacement',d,'mm',d<=1,'≤ 1 mm');
  if(f.occult){opt(R,'Splint and MRI (or CT) within ~1 week','ind','Do not cast everyone for weeks: MRI confirms or excludes fracture early.');R.img.push('MRI is most sensitive; CT if MRI unavailable')}
  else if(f.site==='prox'||(d!=null&&d>1)||f.hump||(w!=null&&w>4))opt(R,'Headless compression screw fixation','ind',f.site==='prox'?'Proximal pole: high non-union and AVN risk.':'Displaced, humpback or late-presenting fracture.');
  else{opt(R,'Below-elbow cast 6 (–8) weeks','ind','Undisplaced waist / distal fracture: thumb immobilisation not required.');if(f.athlete&&f.site==='waist')opt(R,'Percutaneous screw fixation','consider','Faster return to sport/work; similar union.')}
  R.timing.push('Fix acute displaced fractures within 1–2 weeks.');R.approach.push('Waist: percutaneous volar (or dorsal) approach','Proximal pole: dorsal approach');R.implant.push('Headless compression screw along the central axis','Vascularised bone graft for non-union with AVN');
  R.fu.push('CT at 6–8 weeks to confirm union before stopping immobilisation / returning to contact sport','Non-union risk: proximal pole, displacement, smoking, delayed treatment');R.comp.push('Non-union → SNAC wrist','AVN of the proximal pole');if(!f.occult)R.img.push('Scaphoid series (PA ulnar deviation, lateral, obliques); CT to assess displacement')}});
