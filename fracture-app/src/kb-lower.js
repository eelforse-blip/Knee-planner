
/* ================= LOWER LIMB ================= */
defFx({id:'fshaft',reg:'lower',name:'Femoral shaft',ao:'AO/OTA 32 · Winquist',meas:['angle','len'],
 fields:[{k:'pat',l:'AO pattern',t:'sel',o:[['A','A – simple'],['B','B – wedge'],['C','C – multifragmentary / segmental']]},
  {k:'ipsineck',l:'Ipsilateral femoral neck fracture (check CT)',t:'chk'},{k:'floatk',l:'Floating knee (ipsilateral tibia)',t:'chk'}],
 decide(f,P,R){R.cls.push('AO 32-'+f.pat);const age=P.age;
  if(P.child&&age!=null){if(age<0.5)opt(R,'Pavlik harness','ind','Infant.');else if(age<6)opt(R,'Hip spica cast','ind','Under 5–6 years: early spica.');else if(age<=11)opt(R,'Elastic stable intramedullary nails','ind','5–11 years, length-stable pattern, weight < 45–50 kg.');else opt(R,'Rigid lateral-entry nail or submuscular plate','ind','Adolescent or heavy child (avoid piriformis entry – AVN risk).')}
  else{if(P.poly==='unstable'||P.poly==='border')opt(R,'Damage-control external fixation, nail at day 4–14','ind','Unstable / borderline polytrauma: avoid the “second hit” of reaming.');
    opt(R,'Reamed antegrade (or retrograde) intramedullary nail',P.poly==='unstable'?'consider':'ind','Gold standard: union > 95 %, early mobilisation; fix within 24 h in stable patients (early total care reduces pulmonary complications).',[],['Fat embolism','Malrotation – check against the other side']);
    if(f.ipsineck)R.notes.push('Ipsilateral neck fracture: fix the neck first (screws / SHS) then the shaft (retrograde nail or plate) – neck takes priority.');if(f.floatk)R.notes.push('Floating knee: retrograde femoral nail + tibial nail through one knee incision.')}
  R.timing.push('Stable patient: within 24 h. Skin/Thomas splint traction until then.');R.approach.push('Antegrade: piriformis or trochanteric entry','Retrograde: intercondylar notch entry (useful in obesity, pregnancy, floating knee, bilateral)');R.implant.push('Locked reamed IM nail (static locking)','Submuscular bridge plate if nailing is impossible');
  R.fu.push('Weight-bearing as tolerated (length-stable) or protected (comminuted)','X-rays at 2, 6, 12 weeks; union ≈ 3–6 months','Check rotation clinically / CT if in doubt');R.comp.push('Fat embolism','Malrotation','Non-union','Infection','Pudendal nerve (traction)');R.img.push('AP/lateral femur incl. hip and knee; CT femoral neck in high-energy trauma')}});

defFx({id:'dfem',reg:'lower',name:'Distal femur',ao:'AO/OTA 33',meas:['angle','len'],
 fields:[{k:'type',l:'AO type',t:'sel',o:[['A','A – extra-articular'],['B','B – partial articular (unicondylar, Hoffa)'],['C','C – complete articular']]},{k:'peri',l:'Above a knee replacement',t:'chk'},{k:'low',l:'Very distal / short distal segment',t:'chk'}],
 decide(f,P,R){R.cls.push('AO 33-'+f.type+(f.peri||P.peri?' – periprosthetic':''));const elderly=old(P,70);
  if(lowDemand(P)&&P.demand==='frail')opt(R,'Non-operative (brace / traction)','consider','Only for non-ambulant or unfit patients – high complication rate.');
  if((f.peri||P.peri)&&elderly&&f.low)opt(R,'Distal femoral replacement','consider','Very distal / osteoporotic periprosthetic fracture or loose implant – immediate weight-bearing.');
  if(f.type==='C'||f.type==='B')opt(R,'ORIF: articular reduction + lateral locking plate (± medial plate)','ind','Anatomical joint, then relative stability for the metaphysis.');
  else{opt(R,'Retrograde intramedullary nail','ind','Extra-articular (or simple articular after lag screws); also through open-box knee replacements.');opt(R,'Lateral locking plate (bridging)','ind','Alternative – especially very distal or around implants.')}
  if(elderly&&P.osteo)R.notes.push('Elderly osteoporotic: nail-plate combination or dual plating allows early full weight-bearing.');
  R.timing.push('Within 24–48 h (elderly like a hip fracture); spanning ex-fix first if open / soft tissues poor.');R.approach.push('Lateral (sub-vastus) MIPO for A types','Lateral parapatellar / swashbuckler for C types','Posteromedial / posterolateral for Hoffa fragments');
  R.implant.push('Distal femoral locking plate (long working length)','Retrograde nail','Medial plate augmentation','Distal femoral replacement');R.fu.push('Touch / partial weight-bearing 6–12 weeks (unless nail-plate / DFR)','Early knee movement','X-rays at 2, 6, 12 weeks');
  R.comp.push('Non-union (stiff constructs)','Malalignment','Knee stiffness');R.img.push('AP / lateral knee and femur','CT for all intra-articular (Hoffa fractures are easily missed)')}});

defFx({id:'pat',reg:'lower',name:'Patella',ao:'AO/OTA 34',meas:['len'],
 fields:[{k:'type',l:'Pattern',t:'sel',o:[['trans','Transverse'],['comm','Comminuted / stellate'],['pole','Inferior pole'],['vert','Vertical'],['osteo','Osteochondral']]},
  {k:'gap',l:'Fracture gap',t:'num',u:'mm',m:'dist'},{k:'step',l:'Articular step',t:'num',u:'mm'},{k:'slr',l:'Cannot straight-leg raise (extensor mechanism disrupted)',t:'chk'}],
 decide(f,P,R){const g=num(f.gap),st=num(f.step);R.cls.push({trans:'Transverse',comm:'Comminuted',pole:'Inferior pole',vert:'Vertical',osteo:'Osteochondral'}[f.type]+' patellar fracture');
  if(g!=null)accept(R,'Gap',g,'mm',g<3,'< 3 mm');if(st!=null)accept(R,'Articular step',st,'mm',st<2,'< 2 mm');
  const op=f.slr||(g!=null&&g>=3)||(st!=null&&st>=2);
  if(!op||f.type==='vert'&&!f.slr)opt(R,'Knee brace / cylinder cast in extension, full weight-bearing','ind','Intact extensor mechanism and minimal displacement.');
  else if(f.type==='pole')opt(R,'Partial patellectomy + tendon reattachment, or basket plate','ind','Comminuted inferior pole.');
  else opt(R,'ORIF','ind','Extensor mechanism disrupted or articular step / gap.',[],['Symptomatic hardware (common)']);
  R.timing.push('Within 1–2 weeks (urgent if open).');R.approach.push('Longitudinal midline incision; repair retinacular tears');R.implant.push('Cannulated screws + tension band (anterior figure-of-eight)','Anterior fixed-angle / mesh plate for comminution','Suture / wire cerclage');
  R.fu.push('Brace locked in extension for walking; range limits increased progressively (e.g. 0–30° → 90° by 6 weeks)','X-rays at 2 and 6 weeks');R.comp.push('Symptomatic hardware','Loss of fixation','Patellofemoral arthritis');R.img.push('AP, lateral and skyline views; CT for comminution')}});

defFx({id:'plat',reg:'lower',name:'Tibial plateau',ao:'Schatzker · AO/OTA 41',meas:['plateau','angle'],
 fields:[{k:'sch',l:'Schatzker',t:'sel',o:[['I','I – lateral split'],['II','II – lateral split-depression'],['III','III – pure lateral depression'],['IV','IV – medial plateau'],['V','V – bicondylar'],['VI','VI – with metaphyseal–diaphyseal dissociation']]},
  {k:'step',l:'Articular step / depression',t:'num',u:'mm',m:'step'},{k:'widen',l:'Condylar widening',t:'num',u:'mm',m:'widen'},{k:'instab',l:'Varus / valgus instability > 10° in extension',t:'chk'},{k:'post',l:'Posterior (posteromedial / posterolateral) fragment',t:'chk'}],
 decide(f,P,R){const st=num(f.step),w=num(f.widen);const hi=['IV','V','VI'].includes(f.sch);R.cls.push('Schatzker '+f.sch+(f.post?', posterior column involved':''));
  if(st!=null)accept(R,'Articular step / depression',st,'mm',st<3,'< 2–3 mm');if(w!=null)accept(R,'Condylar widening',w,'mm',w<5,'< 5 mm');
  const op=(st!=null&&st>=3)||(w!=null&&w>=5)||f.instab||hi;
  if(!op)opt(R,'Hinged brace, early movement, touch weight-bearing','ind','Stable, minimally displaced.');
  else{if(hi&&(P.energy==='high'||P.skin!=='ok')){opt(R,'Spanning external fixator now, ORIF when soft tissues allow','ind','High-energy / swollen: staged treatment lowers wound complications.');R.timing.push('Ex-fix within 24 h; definitive ORIF typically at 7–14 days (wrinkle sign).')}
    opt(R,'ORIF with buttress / raft plating',hi&&P.skin!=='ok'?'consider':'ind','Restore articular surface, axis and stability.',[],['Infection','Post-traumatic arthritis']);
    if(old(P,70)&&P.osteo&&f.sch==='VI')opt(R,'Primary total knee arthroplasty','consider','Elderly with pre-existing OA / severe osteoporotic comminution.');
    if(f.sch==='VI')opt(R,'Circular (hybrid) external fixation','consider','Severe soft-tissue injury.')}
  if(hi)R.notes.push('Schatzker IV–VI: high risk of compartment syndrome and popliteal / peroneal injury – serial checks.');R.notes.push('Look for meniscal (lateral) and ligament injuries; repair the meniscus at ORIF.');
  if(!R.timing.length)R.timing.push('Within 1–2 weeks when skin allows.');
  R.approach.push('Anterolateral (sub-meniscal arthrotomy) for lateral plateau','Posteromedial (Lobenhoffer / Galla) for medial and posteromedial fragments','Dual incisions (skin bridge ≥ 7 cm) for bicondylar');
  R.implant.push('Lateral locking plate with subchondral raft screws','Medial / posteromedial buttress plate','Bone graft or substitute under elevated fragments','Percutaneous screws (Schatzker I–III, arthroscopic-assisted)');
  R.fu.push('Early ROM (0–90° by 6 weeks); touch weight-bearing 8–12 weeks','X-rays at 2, 6, 12 weeks (watch subsidence)');R.comp.push('Compartment syndrome','Wound breakdown / infection','Subsidence','Arthritis, stiffness');R.img.push('AP / lateral knee','CT with reconstructions (essential for planning); MRI if ligament / meniscus injury suspected')}});

defFx({id:'tshaft',reg:'lower',name:'Tibial shaft',ao:'AO/OTA 42',meas:['angle','len'],
 fields:[{k:'pat',l:'AO pattern',t:'sel',o:[['A','A – simple'],['B','B – wedge'],['C','C – multifragmentary / segmental']]},
  {k:'level',l:'Level',t:'seg',o:[['prox','Proximal third'],['mid','Middle'],['dist','Distal third']]},
  {k:'ang',l:'Angulation (varus/valgus)',t:'num',u:'°',m:'angle'},{k:'shortn',l:'Shortening',t:'num',u:'mm',m:'dist'},{k:'fibula',l:'Fibula intact',t:'chk'}],
 decide(f,P,R){const a=num(f.ang),s=num(f.shortn);R.cls.push(`AO 42-${f.pat}, ${({prox:'proximal',mid:'middle',dist:'distal'})[f.level]} third${P.open!=='no'?' – open Gustilo '+P.open:''}`);
  if(a!=null)accept(R,'Angulation',a,'°',a<=5,'≤ 5° varus/valgus, ≤ 10° sagittal');if(s!=null)accept(R,'Shortening',s,'mm',s<=10,'≤ 1 cm');
  const ok=(a==null||a<=5)&&(s==null||s<=10)&&P.open==='no'&&f.pat==='A'&&P.energy==='low';
  if(P.child)opt(R,'Long-leg cast','ind','Most paediatric tibial fractures are treated in a cast; elastic nails if unstable.');
  else{opt(R,'Reamed locked intramedullary nail','ind','Standard for displaced or unstable adult fractures (closed or open after debridement).',['Early weight-bearing'],['Anterior knee pain (infrapatellar)']);
    if(ok)opt(R,'Long-leg cast → functional (Sarmiento) brace','consider','Low-energy, stable, acceptable alignment – needs close follow-up.');
    if(f.level==='prox')R.notes.push('Proximal third: valgus and procurvatum malalignment is common – suprapatellar (semi-extended) nailing, blocking (Poller) screws or plate.');
    if(f.level==='dist')R.notes.push('Distal third: consider fibular fixation / blocking screws for alignment; plate (MIPO) is an alternative.')}
  if(f.fibula)R.notes.push('Intact fibula: risk of varus malunion and delayed union in non-operative care.');
  R.timing.push((P.open==='no'?'Closed fracture: nail within 24–48 h':'After debridement, definitive nailing as soon as the wound allows (≤ 72 h with cover)')+'; monitor for compartment syndrome (leg pain out of proportion, pain on passive stretch).');
  R.approach.push('Suprapatellar (semi-extended) or infrapatellar nail entry','MIPO medial plate for distal metaphyseal fractures');R.implant.push('Reamed locked tibial nail','Medial / anterolateral locking plate','External fixator (temporary or definitive circular frame)');
  R.fu.push('Weight-bearing as tolerated after nailing of stable patterns','X-rays at 2, 6, 12 weeks; RUST / mRUST to judge union (≈ 4–6 months)','Dynamisation or exchange nailing for delayed union');R.comp.push('Compartment syndrome','Non-union (open, smokers)','Malalignment','Infection');R.img.push('Full-length AP / lateral tibia including knee and ankle')}});

defFx({id:'pilon',reg:'lower',name:'Tibial pilon',ao:'AO/OTA 43 · Rüedi–Allgöwer',meas:['len','angle'],
 fields:[{k:'ra',l:'Rüedi–Allgöwer',t:'sel',o:[['I','I – undisplaced articular'],['II','II – displaced articular, little comminution'],['III','III – comminuted / impacted']]},{k:'fib',l:'Fibula fractured',t:'chk'},{k:'step',l:'Articular step',t:'num',u:'mm'}],
 decide(f,P,R){const st=num(f.step);R.cls.push('Rüedi–Allgöwer '+f.ra);if(st!=null)accept(R,'Articular step',st,'mm',st<2,'< 2 mm');
  if(f.ra==='I'&&P.energy==='low')opt(R,'Cast / boot, non-weight-bearing','ind','Undisplaced.');
  else{opt(R,'Staged: spanning external fixator (± fibular fixation) → CT → ORIF','ind','Soft tissues dictate timing; staged protocol reduces wound complications.');opt(R,'Definitive circular frame ± limited internal fixation','consider','Severe soft tissue injury or comminution.');if(lowDemand(P)||P.diab&&P.smoke)opt(R,'Ex-fix / hindfoot nail or primary arthrodesis','consider','Poor host.')}
  R.timing.push('Span within 24 h; definitive fixation when wrinkles return (≈ 7–21 days).');R.approach.push('Anterolateral, anteromedial or posterolateral – choose by fragment location on CT; respect skin bridges ≥ 7 cm');R.implant.push('Anterior / anterolateral / medial pre-contoured distal tibial plates','Fibular plate (restores length)','Circular frame');
  R.fu.push('Non-weight-bearing 8–12 weeks; early ankle movement','X-rays at 2, 6, 12 weeks');R.comp.push('Wound breakdown / infection','Post-traumatic arthritis','Malunion');R.img.push('AP / lateral / mortise ankle','CT after spanning ex-fix for planning')}});

defFx({id:'ankle',reg:'lower',name:'Ankle (malleolar)',ao:'Weber · Lauge-Hansen · AO/OTA 44',meas:['ankle','len'],
 fields:[{k:'weber',l:'Weber',t:'seg',o:[['A','A – below syndesmosis'],['B','B – at syndesmosis'],['C','C – above syndesmosis']]},
  {k:'pattern',l:'Pattern',t:'sel',o:[['uni','Isolated lateral malleolus'],['bimal','Bimalleolar / bimalleolar equivalent'],['tri','Trimalleolar'],['medial','Isolated medial malleolus']]},
  {k:'mcs',l:'Medial clear space',t:'num',u:'mm',m:'mcs'},{k:'tfcs',l:'Tibiofibular clear space',t:'num',u:'mm',m:'tfcs'},{k:'ovl',l:'Tibiofibular overlap (AP)',t:'num',u:'mm',m:'ovl'},
  {k:'stress',l:'Stress / weight-bearing view',t:'sel',o:[['na','Not done'],['stable','Stable (MCS not widened)'],['unstable','Unstable (MCS widens)']]},
  {k:'pm',l:'Posterior malleolus > 25 % or displaced',t:'chk',show:f=>f.pattern==='tri'},{k:'disl',l:'Dislocated / talar shift',t:'chk'}],
 decide(f,P,R){const m=num(f.mcs),t=num(f.tfcs),o=num(f.ovl);R.cls.push(`Weber ${f.weber}, ${({uni:'isolated lateral malleolus',bimal:'bimalleolar',tri:'trimalleolar',medial:'isolated medial malleolus'})[f.pattern]}`);
  if(m!=null)accept(R,'Medial clear space',m,'mm',m<=4,'≤ 4 mm (and ≤ superior clear space)');if(t!=null)accept(R,'Tibiofibular clear space',t,'mm',t<6,'< 6 mm');if(o!=null)accept(R,'Tibiofibular overlap',o,'mm',o>=1,'≥ 1 mm on mortise (≥ 6 mm AP)');
  const unstable=f.pattern==='bimal'||f.pattern==='tri'||f.weber==='C'||f.stress==='unstable'||(m!=null&&m>4)||f.disl;
  if(f.disl){opt(R,'Immediate closed reduction and splint','ind','Dislocated ankle: reduce in ED to protect skin and neurovascular status.');R.timing.push('Reduce immediately.')}
  if(!unstable)opt(R,'Walking boot / cast, weight-bearing as tolerated','ind',f.weber==='A'?'Weber A is stable.':'Stable Weber B (no medial widening on stress / weight-bearing view).');
  else{const poor=old(P,60)&&(lowDemand(P)||P.diab||P.skin!=='ok');
    if(poor){opt(R,'Close contact casting','ind','Over 60: close contact casting gave equivalent function at 6 months to surgery with far fewer wound infections (AIM trial).');opt(R,'ORIF / hindfoot (TTC) nail','consider','If reduction cannot be held.')}
    else opt(R,'ORIF','ind','Unstable ankle: restore fibular length and rotation, medial malleolus and syndesmosis.',[],['Wound problems, especially diabetics and smokers']);
    if(f.weber==='C'||(t!=null&&t>=6)||(o!=null&&o<1))R.notes.push('Syndesmotic injury: test intra-operatively (Cotton / hook test); fix with screw(s) or suture button; reduce under direct vision.');
    if(f.pm)R.notes.push('Posterior malleolus > 25 % or displaced / incisural: fix it (posterolateral approach) – often stabilises the syndesmosis.');
    if(P.diab)R.notes.push('Diabetic (neuropathic) ankle: augmented fixation (syndesmotic screws, longer constructs), prolonged non-weight-bearing.')}
  R.timing.push('Operate within 24 h, or wait for swelling to settle (7–10 days) with elevation.');R.approach.push('Lateral approach to the fibula; medial approach to the malleolus','Posterolateral (between FHL and peroneals) for the posterior malleolus');
  R.implant.push('One-third tubular or pre-contoured lateral fibular plate + lag screw','Two 4.0 mm partially threaded screws / tension band for the medial malleolus','Syndesmotic screw or suture-button','Posterior antiglide plate / screws');
  R.fu.push('Boot; weight-bearing 2–6 weeks depending on fixation (early weight-bearing is safe after stable ORIF)','X-rays at 2 and 6 weeks','Removal of syndesmotic screws not routinely required');R.comp.push('Wound infection','Malreduction of the syndesmosis','Post-traumatic arthritis');R.img.push('AP, mortise and lateral; gravity / weight-bearing stress view for isolated Weber B','CT for trimalleolar / posterior malleolus')}});

defFx({id:'calc',reg:'lower',name:'Calcaneus',ao:'Sanders · Essex-Lopresti',meas:['bohler'],
 fields:[{k:'sand',l:'Sanders (CT)',t:'sel',o:[['I','I – undisplaced'],['II','II – 2-part posterior facet'],['III','III – 3-part with depression'],['IV','IV – comminuted']]},
  {k:'el',l:'Essex-Lopresti',t:'seg',o:[['joint','Joint depression'],['tongue','Tongue type']]},{k:'bohler',l:'Böhler angle',t:'num',u:'°',m:'bohler'},{k:'skinthreat',l:'Posterior skin threatened by tuberosity',t:'chk'}],
 decide(f,P,R){const b=num(f.bohler);R.cls.push(`Sanders ${f.sand}, ${f.el==='tongue'?'tongue-type':'joint-depression'}`);if(b!=null)accept(R,'Böhler angle',b,'°',b>=20,'20–40°');
  if(f.skinthreat||f.el==='tongue'&&f.sand!=='I'){opt(R,'Emergency reduction of the tongue fragment (percutaneous Essex-Lopresti)','ind','Skin over the heel at risk of necrosis.');R.timing.push('Threatened skin: within hours.')}
  const poor=P.smoke||P.diab||old(P,65)||lowDemand(P);
  if(f.sand==='I')opt(R,'Non-operative – early movement, non-weight-bearing 6–8 weeks','ind','Undisplaced.');
  else{opt(R,'Non-operative (functional)',poor?'ind':'consider','UK HeFT trial: no functional benefit of ORIF over non-operative care at 2 years for typical displaced fractures, with more complications.');
    if(!poor)opt(R,'Reduction and fixation (sinus tarsi or percutaneous)','consider','Young, non-smoking patient with marked displacement / loss of height and width.',['Restores heel shape'],['Wound complications (extensile approach)']);
    if(f.sand==='IV'&&!poor)opt(R,'ORIF + primary subtalar arthrodesis','consider','Severe comminution.')}
  R.timing.push('Fixation after swelling subsides (wrinkle sign, ≈ 7–14 days); percutaneous earlier.');R.approach.push('Sinus tarsi (minimally invasive) approach – fewer wound problems than the extensile lateral','Percutaneous screw fixation');R.implant.push('Sinus tarsi plate / screws','Percutaneous cannulated screws','Subtalar fusion screws');
  R.fu.push('Non-weight-bearing 8–12 weeks; early ankle/subtalar movement','X-rays (lateral, axial) at 2, 6, 12 weeks');R.comp.push('Wound necrosis / infection','Subtalar arthritis','Heel widening, peroneal impingement','Compartment syndrome of the foot');
  R.img.push('Lateral, axial (Harris) and AP foot; CT (coronal / axial) for Sanders classification','Check the lumbar spine (associated fractures)')}});

defFx({id:'talus',reg:'lower',name:'Talar neck',ao:'Hawkins (Canale)',meas:['len'],
 fields:[{k:'hawk',l:'Hawkins',t:'sel',o:[['I','I – undisplaced'],['II','II – subtalar subluxation / dislocation'],['III','III – subtalar + tibiotalar dislocation'],['IV','IV – plus talonavicular dislocation']]}],
 decide(f,P,R){R.cls.push('Hawkins '+f.hawk+' – AVN risk '+({I:'0–15 %',II:'20–50 %',III:'20–100 %',IV:'70–100 %'})[f.hawk]);
  if(f.hawk==='I')opt(R,'Non-weight-bearing cast 6–8 weeks (or percutaneous screws for early movement)','ind','Confirm on CT that it is truly undisplaced.');
  else{opt(R,'Urgent reduction of dislocation; ORIF','ind','Displaced talar neck: anatomical reduction (avoid varus malunion).');R.timing.push('Dislocated: reduce emergently (skin, neurovascular); definitive ORIF can follow within days if reduced.')}
  R.approach.push('Dual anteromedial + anterolateral approaches to judge reduction');R.implant.push('Lag screws (anterior-to-posterior or posterior-to-anterior) + medial / lateral mini-fragment plates for comminution');
  R.fu.push('Non-weight-bearing 8–12 weeks','Hawkins sign (subchondral lucency of the dome at 6–8 weeks) indicates revascularisation','MRI if AVN suspected');R.comp.push('AVN','Post-traumatic arthritis','Varus malunion');R.img.push('AP / lateral ankle and Canale view; CT')}});

defFx({id:'lisfranc',reg:'lower',name:'Lisfranc (tarsometatarsal) injury',ao:'Myerson',meas:['len'],
 fields:[{k:'diast',l:'Diastasis between 1st and 2nd metatarsal bases (weight-bearing)',t:'num',u:'mm',m:'dist'},{k:'fleck',l:'Fleck sign',t:'chk'},{k:'lig',l:'Purely ligamentous',t:'chk'},{k:'stable',l:'Stable on weight-bearing / stress views',t:'chk'}],
 decide(f,P,R){const d=num(f.diast);R.cls.push('Tarsometatarsal injury'+(f.lig?' – purely ligamentous':'')+(f.fleck?' (fleck sign)':''));if(d!=null)accept(R,'1st–2nd metatarsal diastasis',d,'mm',d<2,'< 2 mm vs other foot');
  if(f.stable&&(d==null||d<2))opt(R,'Boot, non-weight-bearing 6 weeks','ind','Stable sprain on weight-bearing views.');
  else{opt(R,'Open reduction and screw / bridge-plate fixation','ind','Unstable TMT joint – anatomical reduction is essential.');if(f.lig)opt(R,'Primary partial arthrodesis (1st–3rd TMT)','consider','Purely ligamentous injuries: some evidence of fewer re-operations than ORIF.')}
  R.timing.push('After swelling settles (usually within 2 weeks); open / compartment syndrome urgently.');R.approach.push('Dorsal approaches (medial between EHL and EHB / lateral over 3rd–4th)');R.implant.push('Lisfranc screw (medial cuneiform → 2nd MT base)','Dorsal bridge plates','K-wires for 4th–5th TMT');
  R.fu.push('Non-weight-bearing 6–8 weeks','Hardware removal of transarticular screws at 4–6 months (not after fusion)');R.comp.push('Post-traumatic midfoot arthritis','Missed diagnosis');R.img.push('Weight-bearing AP, oblique and lateral foot (compare both feet)','CT for fracture pattern; MRI for subtle ligamentous injury')}});

defFx({id:'mt5',reg:'lower',name:'Fifth metatarsal base',ao:'Lawrence & Botte zones',meas:['len'],
 fields:[{k:'zone',l:'Zone',t:'sel',o:[['1','Zone 1 – tuberosity avulsion'],['2','Zone 2 – metaphyseal–diaphyseal junction (Jones)'],['3','Zone 3 – proximal diaphysis (stress)']]},{k:'ath',l:'Athlete',t:'chk'}],
 decide(f,P,R){R.cls.push('5th metatarsal base – zone '+f.zone);
  if(f.zone==='1')opt(R,'Supportive shoe / boot, weight-bearing as tolerated','ind','Avulsion: unites or forms a painless fibrous union.');
  else{opt(R,'Intramedullary screw fixation',f.ath||f.zone==='3'?'ind':'consider','Faster union and return to sport; stress fractures heal poorly without surgery.');opt(R,'Non-weight-bearing cast 6–8 weeks',f.ath?'consider':'ind','Non-athlete acute Jones fracture.')}
  R.timing.push('Elective.');R.approach.push('Percutaneous proximal approach');R.implant.push('Solid / cannulated intramedullary screw (4.5–6.5 mm)');R.fu.push('X-rays at 6 and 12 weeks; return to sport after radiological union');R.comp.push('Non-union / refracture (zones 2–3)');R.img.push('AP, oblique and lateral foot')}});
