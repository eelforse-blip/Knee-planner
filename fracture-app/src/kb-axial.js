
/* ================= PELVIS, ACETABULUM, HIP ================= */
defFx({id:'pelvis',reg:'axial',name:'Pelvic ring',ao:'Young–Burgess · Tile · FFP',meas:['len'],
 fields:[{k:'yb',l:'Young–Burgess',t:'sel',o:[['APC1','APC I – symphysis < 2.5 cm'],['APC2','APC II – symphysis > 2.5 cm, anterior SI open'],['APC3','APC III – complete SI disruption'],['LC1','LC I – sacral buckle + rami'],['LC2','LC II – crescent fracture'],['LC3','LC III – windswept'],['VS','Vertical shear'],['CM','Combined mechanism']]},
  {k:'haem',l:'Haemodynamically unstable',t:'chk'},{k:'sym',l:'Symphyseal diastasis',t:'num',u:'mm',m:'dist'},{k:'fragility',l:'Elderly low-energy fragility fracture (FFP)',t:'chk'},
  {k:'mobil',l:'Unable to mobilise after 3–5 days of analgesia',t:'chk'},{k:'uro',l:'Urethral / bladder injury',t:'chk'}],
 decide(f,P,R){R.cls.push('Young–Burgess '+f.yb+' – Tile '+({APC1:'A',APC2:'B1',APC3:'C',LC1:'B2 (stable if minimally displaced)',LC2:'B2',LC3:'B3',VS:'C',CM:'C'})[f.yb]);
  if(f.haem){opt(R,'Resuscitation: pelvic binder at the greater trochanters, massive transfusion protocol','ind','ATLS: then pre-peritoneal packing and/or angioembolisation; anterior external fixator / C-clamp.');R.timing.push('Immediate – binder in the field / ED; do not remove until mechanically stabilised.')}
  const unst=['APC2','APC3','LC2','LC3','VS','CM'].includes(f.yb);
  if(f.fragility){const fail=f.mobil;opt(R,'Mobilise as pain allows with analgesia',fail?'consider':'ind','FFP I–II usually heal; check the posterior ring on CT.');opt(R,'Percutaneous sacroiliac / transsacral screws (± anterior fixation)',fail?'ind':'consider',fail?'Failure to mobilise after a few days of adequate analgesia – fixation restores mobility and avoids complications of bed rest.':'FFP III–IV, progressive displacement or failure to mobilise.');if(fail)R.img.push('CT pelvis (± MRI) to detect occult posterior ring / sacral fractures');R.notes.push('Fragility pelvis: treat osteoporosis; re-image if pain persists (progression to FFP III/IV).')}
  else if(f.yb==='APC1'||f.yb==='LC1'){opt(R,'Weight bearing as tolerated','ind','Stable injury.');if(f.mobil)opt(R,'Fixation (e.g. iliosacral screw)','consider','Persistent pain preventing mobilisation; examination under anaesthesia may reveal instability.')}
  else{const post=['APC3','VS','CM','LC3','LC2'].includes(f.yb);opt(R,'Anterior fixation (symphyseal plate / ramus screws / INFIX / ex-fix)','ind','Rotationally unstable ring.');if(post)opt(R,'Posterior fixation (iliosacral / transsacral screws or plates)','ind','Posterior ring disruption – vertically / completely unstable.')}
  if(f.uro)R.notes.push('Urethral injury: suprapubic catheter (not transurethral); coordinate with urology; symphyseal plating soon after repair.');
  R.timing.push('Definitive fixation when physiologically stable (typically day 2–5).');R.approach.push('Pfannenstiel / modified Stoppa for symphysis and anterior ring','Percutaneous iliosacral / transsacral screws under fluoroscopy (requires good sacral imaging)','Posterior approach for sacral fractures / SI dislocation if closed reduction fails');
  R.implant.push('Symphyseal 3.5 mm plate','Cannulated 7.0–7.3 mm iliosacral / transsacral screws','Supra-acetabular external fixator / INFIX','Lumbopelvic fixation for unstable sacral U-type');
  R.fu.push('Touch / partial weight-bearing on the injured side 6–8 weeks after posterior fixation','X-rays (AP, inlet, outlet) at 2, 6, 12 weeks','VTE prophylaxis');R.comp.push('Haemorrhage','VTE','Loss of fixation','Sexual / urinary dysfunction','L5 nerve injury (screws)');
  R.img.push('AP pelvis (+ inlet/outlet views)','CT pelvis with reconstructions for all ring injuries')}});

defFx({id:'acet',reg:'axial',name:'Acetabulum',ao:'Letournel–Judet',meas:['angle','len'],
 fields:[{k:'let',l:'Letournel type',t:'sel',o:[['PW','Posterior wall'],['PC','Posterior column'],['AW','Anterior wall'],['AC','Anterior column'],['T','Transverse'],['PCPW','Posterior column + wall'],['TPW','Transverse + posterior wall'],['TT','T-type'],['ACPHT','Anterior column + posterior hemitransverse'],['BC','Both column']]},
  {k:'gap',l:'Displacement in the weight-bearing dome',t:'num',u:'mm',m:'dist'},{k:'roof',l:'Roof arc angles all > 45° (dome intact)',t:'chk'},
  {k:'pwsize',l:'Posterior wall size > 40–50 % (CT)',t:'chk',show:f=>['PW','PCPW','TPW'].includes(f.let)},{k:'disl',l:'Hip dislocation',t:'chk'},
  {k:'impact',l:'Marginal impaction / femoral head damage',t:'chk'},{k:'gull',l:'Gull-wing sign (superomedial dome impaction)',t:'chk'},{k:'sciatic',l:'Sciatic nerve palsy',t:'chk'},{k:'sec',l:'Secondary congruence (both column)',t:'chk',show:f=>f.let==='BC'}],
 decide(f,P,R){const g=num(f.gap);R.cls.push('Letournel '+f.let);if(g!=null)accept(R,'Dome displacement',g,'mm',g<2,'< 2 mm');
  const nonop=(g!=null&&g<2&&f.roof&&!f.disl&&!f.pwsize)||(f.let==='BC'&&f.sec);
  if(f.disl){opt(R,'Emergency closed reduction of the hip','ind','Reduce within 6 h to reduce AVN risk; skeletal traction if unstable after reduction.');R.timing.push('Hip dislocation: reduce within 6 hours.')}
  if(old(P,65)&&(f.gull||f.impact)&&f.let!=='PW'){opt(R,'Acute total hip arthroplasty ± column fixation ("fix and replace")','ind','Elderly with dome impaction / head damage: high failure of ORIF alone.');opt(R,'ORIF','consider','If good bone and reconstructable joint.')}
  else if(nonop||lowDemand(P)&&P.demand==='frail')opt(R,'Non-operative – protected weight-bearing','ind',nonop?'Dome intact (roof arc > 45°), displacement < 2 mm, stable, congruent hip.':'Unfit for major surgery.');
  else opt(R,'Open reduction and internal fixation','ind','Displaced dome, unstable hip or incongruence – anatomical reduction is the main determinant of outcome.',[],['Heterotopic ossification (Kocher–Langenbeck)','Sciatic nerve injury']);
  R.timing.push('Definitive fixation ideally within 5–10 days (by 2–3 weeks at most – reduction becomes much harder).');
  R.approach.push(['PW','PC','PCPW','TPW'].includes(f.let)?'Kocher–Langenbeck (posterior), lateral decubitus or prone':['AW','AC','ACPHT','BC'].includes(f.let)?'Anterior intrapelvic (modified Stoppa) ± lateral window, or ilioinguinal':'Transverse / T-type: Kocher–Langenbeck ± anterior approach (based on displacement)');
  R.implant.push('3.5 mm reconstruction plates, lag screws, spring plates for small wall fragments','Column screws (percutaneous for minimally displaced)','Acetabular cup with cage / augments for acute THA');
  R.fu.push('Touch-down weight-bearing 6–12 weeks','HO prophylaxis (indomethacin or radiotherapy) after posterior approach – consider','VTE prophylaxis','X-rays at 2, 6, 12 weeks; long-term for post-traumatic arthritis / AVN');R.comp.push('Post-traumatic arthritis','AVN','Heterotopic ossification','Sciatic nerve palsy','VTE');
  R.img.push('AP pelvis + Judet (iliac and obturator oblique) views','CT with 3D reconstructions (femoral head subtraction)')}});

defFx({id:'neck',reg:'axial',name:'Femoral neck',ao:'Garden · Pauwels',meas:['pauwels','angle'],
 fields:[{k:'garden',l:'Garden',t:'sel',o:[['I','I – incomplete / valgus impacted'],['II','II – complete, undisplaced'],['III','III – complete, partially displaced'],['IV','IV – completely displaced']]},
  {k:'pauwels',l:'Pauwels angle',t:'num',u:'°',m:'pauwels'},{k:'ptilt',l:'Posterior tilt on lateral',t:'num',u:'°',m:'angle'},
  {k:'walker',l:'Walks independently outdoors with ≤ 1 stick',t:'chk'},{k:'oa',l:'Pre-existing hip arthritis / inflammatory arthritis',t:'chk'}],
 decide(f,P,R){const disp=['III','IV'].includes(f.garden);const pw=num(f.pauwels),pt=num(f.ptilt);
  R.cls.push(`Garden ${f.garden} – ${disp?'displaced':'undisplaced'}`+(pw!=null?`; Pauwels ${pw<30?'I':pw<=50?'II':'III'} (${f0(pw)}°)`:''));
  if(pt!=null)accept(R,'Posterior tilt',pt,'°',pt<=20,'≤ 20° for fixation of undisplaced fractures');
  const yng=young(P,60)&&!lowDemand(P);
  if(yng){opt(R,'Urgent anatomical reduction and internal fixation','ind','Young patient: preserve the head – reduction quality is key.',[],['AVN','Non-union (higher in vertical Pauwels III)']);
    R.implant.push(pw!=null&&pw>50?'Pauwels III: sliding hip screw + anti-rotation screw, or femoral neck system (FNS)':'3 cannulated screws (inverted triangle) or femoral neck system');R.timing.push('Young displaced: urgent (as soon as safely possible, ideally < 12–24 h).')}
  else if(!disp){if(pt!=null&&pt>20&&old(P,60))opt(R,'Hemiarthroplasty / THA','consider','Posterior tilt > 20° increases fixation failure in older patients.');
    opt(R,'Internal fixation (cannulated screws or SHS)','ind','Undisplaced fracture in an older patient.');R.implant.push('3 parallel cannulated screws or sliding hip screw')}
  else{const tha=f.walker&&!P.cog&&+P.asa<=2||f.oa&&!P.cog;
    opt(R,'Total hip arthroplasty',tha?'ind':'consider','Displaced fracture in a patient who walks independently outdoors, is not cognitively impaired and is medically fit (NICE).');
    opt(R,'Cemented hemiarthroplasty',tha?'consider':'ind','Displaced fracture in less mobile, cognitively impaired or less fit patients.');
    R.implant.push('Cemented femoral stem (NICE), dual-mobility or standard THA','Cemented hemiarthroplasty (bipolar or unipolar)')}
  if(!yng)R.timing.push('Surgery on the day of, or the day after, admission (NICE / BOAST) – correct reversible problems quickly, do not wait for DOAC washout beyond ≈ 24–48 h.');
  R.approach.push('Fixation: lateral approach, closed reduction on traction table','Arthroplasty: lateral (Hardinge) or posterior approach (repair short external rotators)');
  R.fu.push('Full weight-bearing as tolerated immediately after arthroplasty or fixation in the elderly','Orthogeriatric care, delirium prevention, falls and bone health assessment','X-rays at 6 weeks and 3 months after fixation; AVN can appear up to 2 years');R.comp.push('AVN, non-union (fixation)','Dislocation, periprosthetic fracture (arthroplasty)','Delirium, VTE, pneumonia; 30-day mortality ≈ 6–7 %');
  R.img.push('AP pelvis + lateral hip','MRI (or CT) if suspected but X-ray negative')}});

defFx({id:'troch',reg:'axial',name:'Intertrochanteric',ao:'AO/OTA 31A',meas:['tad_ap','tad_lat','angle'],
 fields:[{k:'ao',l:'AO type',t:'sel',o:[['A1','A1 – simple pertrochanteric (stable)'],['A2','A2 – multifragmentary, lateral wall thin'],['A3','A3 – intertrochanteric / reverse oblique']]},
  {k:'lw',l:'Lateral wall thickness < 20.5 mm',t:'chk'},{k:'tad',l:'Tip–apex distance (post-op)',t:'num',u:'mm',m:'tad'}],
 decide(f,P,R){R.cls.push('AO 31'+f.ao+(f.ao==='A1'?' – stable':' – unstable'));const t=num(f.tad);if(t!=null)accept(R,'Tip–apex distance',t,'mm',t<=25,'≤ 25 mm (no cut-outs in Baumgaertner)');
  if(f.ao==='A1'&&!f.lw)opt(R,'Sliding hip screw','ind','Stable trochanteric fracture (NICE).');
  else opt(R,'Cephalomedullary nail','ind',f.ao==='A3'?'Reverse oblique / transverse: a sliding hip screw fails (fragment medialises).':'Unstable / thin lateral wall: nail controls collapse.',[],['Cut-out if TAD > 25 mm or varus reduction']);
  if(f.ao==='A2'&&!f.lw)opt(R,'Sliding hip screw','consider','NICE accepts SHS for A2 – many prefer a nail.');
  R.timing.push('Surgery on the day of, or the day after, admission.');R.approach.push('Closed reduction on traction table; lateral approach (SHS) or percutaneous nail entry at the trochanteric tip');
  R.implant.push('Sliding hip screw 135° ± trochanteric stabilising plate','Short or long cephalomedullary nail; lag screw / blade centre–centre or slightly inferior, TAD ≤ 25 mm');
  R.fu.push('Full weight-bearing as tolerated','X-rays at 6 and 12 weeks','Bone health and falls assessment');R.comp.push('Cut-out','Excessive collapse / medialisation','Periprosthetic (nail tip) fracture');R.img.push('AP pelvis, lateral hip; CT if fracture pattern unclear')}});

defFx({id:'subtroch',reg:'axial',name:'Subtrochanteric',ao:'AO/OTA 32 (proximal) · Russell–Taylor',meas:['angle','len'],
 fields:[{k:'piri',l:'Extends into the piriformis fossa',t:'chk'},{k:'aff',l:'Atypical femoral fracture (bisphosphonate, transverse lateral cortex, beaking)',t:'chk'},{k:'comm',l:'Comminuted',t:'chk'}],
 decide(f,P,R){R.cls.push('Subtrochanteric fracture'+(f.aff?' – atypical (bisphosphonate-associated)':'')+(f.piri?', piriformis extension':''));
  opt(R,'Long cephalomedullary nail','ind','Strong deforming forces (flexion, abduction, external rotation of the proximal fragment) – avoid varus; open/clamp-assisted reduction if needed.',[],['Varus malreduction → non-union']);
  if(f.piri)opt(R,'Proximal femoral locking plate','consider','If the entry point is compromised.');
  if(f.aff)R.notes.push('Atypical femoral fracture: stop bisphosphonate, image the other femur (prophylactic nail if prodromal pain / lucency), consider teriparatide; slow healing.');
  R.timing.push('Within 24–36 h.');R.approach.push('Trochanteric / piriformis entry; percutaneous or open clamp reduction');R.implant.push('Long cephalomedullary nail (reconstruction mode)');
  R.fu.push('Weight-bearing as tolerated (protected if comminuted / open reduction)','X-rays at 6, 12 weeks; union often slow');R.comp.push('Non-union / implant failure','Varus malunion');R.img.push('AP pelvis and full-length femur')}});

/* ================= SPINE ================= */
defFx({id:'odont',reg:'spine',name:'Odontoid (dens)',ao:'Anderson–D’Alonzo · Grauer',meas:['len','angle'],
 fields:[{k:'type',l:'Type',t:'sel',o:[['I','I – tip avulsion'],['IIA','II A – undisplaced, transverse'],['IIB','II B – displaced, anterosuperior → posteroinferior line'],['IIC','II C – anteroinferior → posterosuperior line or comminuted'],['III','III – into the C2 body']]},
  {k:'disp',l:'Displacement',t:'num',u:'mm',m:'dist'},{k:'neuro',l:'Neurological deficit',t:'chk'}],
 decide(f,P,R){const d=num(f.disp);R.cls.push('Anderson–D’Alonzo '+f.type);if(d!=null)accept(R,'Displacement',d,'mm',d<5,'< 5 mm');const elder=old(P,65);
  if(f.type==='I'||f.type==='III')opt(R,'Rigid collar (8–12 weeks)','ind','Type I and III usually unite (exclude occipitocervical instability in type I).');
  else{const hi=(d!=null&&d>=5)||f.neuro||f.type==='IIC';
    if(elder&&lowDemand(P))opt(R,'Rigid collar','ind','Frail elderly: stable fibrous union is common and acceptable; halo poorly tolerated.');
    if(f.type==='IIB'&&!P.osteo)opt(R,'Anterior odontoid screw','ind','Fracture line suited to lag screw, good bone, reducible.',['Preserves C1–C2 rotation'],['Dysphagia in elderly']);
    if(f.type==='IIC'||P.osteo||(hi&&f.type!=='IIB'))opt(R,'Posterior C1–C2 fusion (Harms / Magerl)','ind','Comminuted / unfavourable obliquity, poor bone or irreducible.',['High fusion rate'],['Loss of ≈ 50 % neck rotation','Vertebral artery risk']);
    if(f.type==='IIA'&&!elder)opt(R,'Rigid collar or halo','consider','Undisplaced in younger patients; non-union risk rises with age > 50, displacement > 5 mm, delay.')}
  R.timing.push('Collar immediately; surgery electively within days when indicated.');R.approach.push('Anterior (submandibular) for odontoid screw','Posterior midline for C1–C2 fixation');R.implant.push('Cannulated lag screw(s)','C1 lateral mass + C2 pars / pedicle screws with rods, or transarticular screws');
  R.fu.push('Upright X-rays at 2, 6, 12 weeks; flexion–extension views at 3 months','CT if union uncertain');R.comp.push('Non-union','Dysphagia (elderly, anterior screw)');R.img.push('CT cervical spine (C1–C2); MRI if neurological signs; CT angiography if transverse foramen involved')}});

defFx({id:'cspine',reg:'spine',name:'Subaxial cervical spine (C3–C7)',ao:'SLIC · AOSpine',meas:['kyph','len'],
 fields:[{k:'morph',l:'Morphology',t:'sel',o:[['0','None'],['1','Compression'],['2','Burst'],['3','Distraction (facet perch, hyperextension)'],['4','Rotation / translation (facet dislocation, fracture-dislocation)']]},
  {k:'dlc',l:'Disco-ligamentous complex',t:'seg',o:[['0','Intact'],['1','Indeterminate'],['2','Disrupted']]},
  {k:'neuro',l:'Neurology',t:'sel',o:[['0','Intact'],['1','Root injury'],['2','Complete cord injury'],['3','Incomplete cord injury']]},
  {k:'comp',l:'Continuous cord compression with deficit (+1)',t:'chk'}],
 decide(f,P,R){const sc=+f.morph+ +f.dlc+ +f.neuro+(f.comp&&+f.neuro>0?1:0);R.cls.push(`SLIC ${sc} (morphology ${f.morph}, DLC ${f.dlc}, neurology ${f.neuro}${f.comp?', +1 compression':''})`);
  accept(R,'SLIC score',sc,'',sc<=3,'≤ 3 non-operative · 4 either · ≥ 5 surgery');
  if(sc<=3)opt(R,'Rigid collar','ind','SLIC ≤ 3.');else if(sc===4)opt(R,'Collar or surgery','consider','SLIC 4: individual decision (e.g. central cord syndrome).');
  if(sc>=4)opt(R,f.morph==='4'?'Posterior or combined anterior–posterior stabilisation':'Anterior decompression and fusion (ACDF / corpectomy)',sc>=5?'ind':'consider','Algorithm: burst/compression and distraction → usually anterior; translation/rotation → posterior or combined (Dvorak 2007).');
  if(+f.neuro>=2){R.notes.push('Spinal cord injury: early decompression (≤ 24 h) is suggested regardless of level (AOSpine 2017); keep MAP ≥ 85 mmHg for 5–7 days.');R.timing.push('Cord injury: decompression within 24 h.')}
  if(f.morph==='4')R.notes.push('Facet dislocation: awake, cooperative patient → closed traction reduction is acceptable; obtunded / failed reduction → MRI first to exclude a disc herniation.');
  R.timing.push('Without deficit: early surgery (within days) when indicated.');R.approach.push('Anterior Smith–Robinson','Posterior midline (lateral mass screws)');R.implant.push('Anterior cage/graft + plate','Posterior lateral mass / pedicle screws and rods');
  R.fu.push('Collar 6–12 weeks','Upright X-rays at 2, 6, 12 weeks; flexion–extension at 3 months for ligamentous injuries');R.comp.push('Neurological deterioration','Dysphagia','Adjacent instability');R.img.push('CT cervical spine; MRI for neurological deficit, DLC assessment or before reducing an obtunded patient')}});

defFx({id:'tlspine',reg:'spine',name:'Thoracolumbar spine',ao:'TLICS · AOSpine TL',meas:['kyph'],
 fields:[{k:'morph',l:'Morphology',t:'sel',o:[['1','Compression (AO A1/A2)'],['2','Burst (AO A3/A4)'],['3','Translation / rotation (AO C)'],['4','Distraction (AO B)']]},
  {k:'plc',l:'Posterior ligamentous complex',t:'seg',o:[['0','Intact'],['2','Indeterminate'],['3','Injured']]},
  {k:'neuro',l:'Neurology',t:'sel',o:[['0','Intact'],['2','Nerve root'],['2c','Complete cord / conus'],['3i','Incomplete cord / conus'],['3ce','Cauda equina']]},
  {k:'kyph',l:'Segmental kyphosis',t:'num',u:'°',m:'kyph'},{k:'ahl',l:'Anterior height loss',t:'num',u:'%',m:'ahl'},{k:'canal',l:'Canal compromise',t:'num',u:'%'},
  {k:'osteo',l:'Osteoporotic low-energy fracture',t:'chk'},{k:'as',l:'Ankylosed spine (AS / DISH)',t:'chk'}],
 decide(f,P,R){const nv={'0':0,'2':2,'2c':2,'3i':3,'3ce':3}[f.neuro];const sc=+f.morph+ +f.plc+nv;const k=num(f.kyph),a=num(f.ahl);
  R.cls.push(`TLICS ${sc} (morphology ${f.morph}, PLC ${f.plc}, neurology ${nv})`);accept(R,'TLICS',sc,'',sc<=3,'≤ 3 non-operative · 4 either · ≥ 5 surgery');
  if(k!=null)accept(R,'Segmental kyphosis',k,'°',k<25,'< 25–30°');if(a!=null)accept(R,'Anterior height loss',a,'%',a<50,'< 50 %');
  if(f.as){opt(R,'Long posterior instrumentation (≥ 2–3 levels above and below)','ind','Ankylosed spine fractures behave like long-bone fractures – highly unstable, often missed; MRI/CT whole spine.');}
  else if(f.osteo&&sc<=3){opt(R,'Analgesia, early mobilisation ± brace; osteoporosis treatment','ind','Osteoporotic compression fracture.');opt(R,'Vertebral augmentation (kypho/vertebroplasty)','consider','Persistent severe pain after a trial of conservative care (evidence mixed).');}
  else if(sc<=3){opt(R,'Early mobilisation – brace optional','ind',f.morph==='2'?'Neurologically intact burst, PLC intact: no brace is equivalent to TLSO (Bailey 2014).':'Stable injury.');}
  else{opt(R,'Posterior instrumented stabilisation',sc>=5?'ind':'consider',sc>=5?'TLICS ≥ 5.':'TLICS 4 – individual decision.',['Percutaneous short-segment in neurologically intact'],[]);
    if(nv===3)opt(R,'Decompression (posterior or anterior) ± anterior column reconstruction','ind','Incomplete deficit with canal compromise.')}
  if(nv>=2)R.timing.push('Neurological deficit: decompression and stabilisation within 24 h.');R.timing.push('Unstable injury without deficit: within 24–72 h.');
  R.approach.push('Posterior midline or percutaneous pedicle screws','Anterior (thoracotomy / retroperitoneal) for corpectomy and reconstruction');R.implant.push('Short-segment (1 above/1 below, + index screws) or long-segment pedicle screw–rod constructs','Expandable cage for anterior column','PMMA cement augmentation in osteoporotic bone');
  R.fu.push('Upright X-rays before mobilising and at 6, 12 weeks (kyphosis progression)','Return to light work 6–12 weeks');R.comp.push('Progressive kyphosis','Neurological deterioration','Implant failure');R.img.push('CT of the injured region (whole spine if high energy)','MRI for neurology or to assess the PLC')}});
