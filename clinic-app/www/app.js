/* Knee & Shoulder Clinic — documentation and follow-up.
   Data: Firebase (shared, offline-capable) or local demo (this device only). */
(()=>{
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const fmt=s=>s?new Date(s+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtAr=s=>s?new Date(s+'T12:00:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
const dayName=s=>new Date(s+'T12:00:00').toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
const ageOf=p=>p&&p.birthYear?new Date().getFullYear()-(+p.birthYear):null;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const initials=p=>((p.nameEn||p.nameAr||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('')).toUpperCase();
let toastT;function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
const I={
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>',
 today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/></svg>',
 pts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h3M14 14h3"/></svg>',
 stats:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 8V3h10v5M7 17H4v-7a2 2 0 012-2h12a2 2 0 012 2v7h-3M7 14h10v7H7z"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 000-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>',
 edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
};

/* ================= clinical content ================= */
const EXAM={
 knee:[['eff','Effusion'],['mjlt','Medial joint-line tenderness'],['ljlt','Lateral joint-line tenderness'],['mcm','McMurray'],['thes','Thessaly'],['lach','Lachman'],['adr','Anterior drawer'],['piv','Pivot shift'],['pdr','Posterior drawer / sag'],['vals','Valgus stress 30°'],['vars','Varus stress 30°'],['dial','Dial test'],['papp','Patellar apprehension'],['jsg','J-sign'],['pgr','Patellar grind'],['ober','Ober test']],
 shoulder:[['acjt','ACJ tenderness'],['bgt','Bicipital groove tenderness'],['neer','Neer'],['hawk','Hawkins–Kennedy'],['jobe','Jobe (empty can)'],['drop','Drop arm'],['erlag','ER lag sign'],['horn','Hornblower'],['belly','Belly press'],['lift','Lift-off'],['bear','Bear hug'],['speed','Speed'],['obr','O’Brien'],['appr','Apprehension'],['reloc','Relocation'],['sulc','Sulcus sign'],['xbod','Cross-body adduction']]};
const DX={
 knee:['ACL tear','PCL tear','MCL injury','LCL / posterolateral corner injury','Medial meniscal tear','Lateral meniscal tear','Meniscal root tear','Chondral / osteochondral lesion','Knee osteoarthritis – medial','Knee osteoarthritis – lateral','Knee osteoarthritis – patellofemoral','Knee osteoarthritis – tricompartmental','Patellofemoral instability','Patellofemoral pain','Patellar tendinopathy','Varus malalignment','Valgus malalignment','Loose body','Baker cyst','SONK / bone marrow lesion','Painful knee arthroplasty'],
 shoulder:['Rotator cuff tear – partial','Rotator cuff tear – full thickness','Massive rotator cuff tear','Subacromial impingement / bursitis','Calcific tendinitis','Frozen shoulder','Anterior instability (Bankart)','Glenoid bone loss','Posterior instability','SLAP lesion','Long head of biceps tendinopathy','ACJ arthritis','ACJ dislocation','Glenohumeral osteoarthritis','Cuff tear arthropathy','Proximal humerus fracture','Clavicle fracture']};
const PLAN=['Advice / activity modification','Physiotherapy','Analgesics / NSAIDs','Brace','Sling','Steroid injection','PRP injection','Hyaluronic acid injection','X-ray requested','MRI requested','CT requested','Surgery recommended','Referral'];
const PROC={
 knee:[['ACL reconstruction','acl'],['PCL reconstruction','lig'],['Multiligament reconstruction','lig'],['Meniscal repair','menr'],['Meniscal root repair','menr'],['Partial meniscectomy','scope'],['Arthroscopic debridement / chondroplasty','scope'],['Cartilage repair (microfracture / graft)','menr'],['Loose body removal','scope'],['MPFL reconstruction','mpfl'],['Tibial tubercle osteotomy','osteo'],['High tibial osteotomy','osteo'],['Distal femoral osteotomy','osteo'],['Total knee arthroplasty','arth'],['Unicompartmental knee arthroplasty','arth'],['Removal of hardware','scope'],['Other knee procedure','scope']],
 shoulder:[['Arthroscopic rotator cuff repair','rcr'],['Arthroscopic Bankart repair','inst'],['Latarjet','inst'],['Remplissage','inst'],['SLAP repair','inst'],['Biceps tenodesis / tenotomy','scope'],['Subacromial decompression','scope'],['Calcific deposit excision','scope'],['Capsular release / MUA','rel'],['ACJ excision','scope'],['ACJ reconstruction','frac'],['Reverse shoulder arthroplasty','arth'],['Anatomic shoulder arthroplasty','arth'],['ORIF proximal humerus','frac'],['Clavicle fixation','frac'],['Other shoulder procedure','scope']]};
const COMMON={
 en:['Keep the wound clean and dry; change the dressing only as instructed.','Apply ice for 15–20 minutes several times a day (with a cloth between ice and skin).','Take the prescribed medicines regularly.','Contact the clinic at once for: fever above 38 °C, redness or discharge from the wound, calf pain or swelling, or shortness of breath.'],
 ar:['حافظ على الجرح نظيفاً وجافاً، ولا تغيّر الضماد إلا حسب تعليمات الطبيب.','استخدم كمادات الثلج ١٥–٢٠ دقيقة عدة مرات يومياً (مع وضع قطعة قماش بين الثلج والجلد).','تناول الأدوية الموصوفة بانتظام في مواعيدها.','تواصل مع العيادة فوراً في حالة: ارتفاع الحرارة فوق ٣٨ درجة، احمرار أو إفرازات من الجرح، ألم أو تورم في سمانة الساق، أو ضيق في التنفس.']};
const PROTO={
 acl:{name:'ACL reconstruction',days:[14,42,90,180,270,365],
  en:['Walk with crutches, weight-bearing as pain allows; wear the brace as instructed.','Start quadriceps sets and straight-leg raises from day one.','Aim for full knee extension within two weeks; flexion increases with physiotherapy.','No return to sport until cleared by the surgeon (usually at least 9 months).'],
  ar:['المشي بالعكازين مع التحميل على الساق حسب تحمّل الألم، وارتداء الدعامة حسب التعليمات.','ابدأ تمارين شد عضلة الفخذ الأمامية ورفع الساق مستقيمة من اليوم الأول.','الهدف فرد الركبة بالكامل خلال أول أسبوعين، وزيادة الثني تدريجياً مع العلاج الطبيعي.','لا عودة للرياضة إلا بعد تقييم الطبيب واجتياز اختبارات العودة (عادةً بعد ٩ أشهر على الأقل).']},
 lig:{name:'Ligament reconstruction',days:[14,42,90,180,270,365],
  en:['Crutches and brace as instructed; follow the weight-bearing limits you were given.','Quadriceps exercises daily; avoid resisted knee bending until allowed.','No return to sport until cleared by the surgeon.'],
  ar:['المشي بالعكازين وارتداء الدعامة حسب التعليمات، مع الالتزام بحدود التحميل المحددة لك.','تمارين عضلة الفخذ يومياً، وتجنّب ثني الركبة ضد مقاومة حتى يسمح الطبيب.','لا عودة للرياضة إلا بعد تقييم الطبيب.']},
 menr:{name:'Meniscal repair / cartilage repair',days:[14,42,90,180],
  en:['Weight-bearing and knee bending limits as instructed (commonly no more than 90° for six weeks).','Avoid squatting and sitting on the floor for at least four months.','Quadriceps exercises daily and physiotherapy as planned.'],
  ar:['التحميل على الساق وحدود ثني الركبة حسب تعليمات الطبيب (عادةً عدم تجاوز ٩٠ درجة لأول ٦ أسابيع).','تجنّب القرفصاء والجلوس على الأرض لمدة ٤ أشهر على الأقل.','تمارين عضلة الفخذ يومياً والعلاج الطبيعي حسب البرنامج.']},
 scope:{name:'Arthroscopy',days:[14,42,90],
  en:['Walk with full weight as pain allows; a crutch can help for a few days.','Start muscle exercises and joint movement from day one.','Desk work usually after about a week; sport when the surgeon advises.'],
  ar:['يمكنك المشي بالتحميل الكامل حسب تحمّل الألم، ويمكن استخدام العكاز لأيام قليلة.','ابدأ تمارين العضلات وتحريك المفصل من اليوم الأول.','العودة للعمل المكتبي عادةً خلال أسبوع، والرياضة حسب تقييم الطبيب.']},
 mpfl:{name:'Patellar stabilisation',days:[14,42,90,180],
  en:['Brace and crutches as instructed.','Quadriceps exercises from day one; bending increases gradually with physiotherapy.','No return to sport before the surgeon clears you (usually 4–6 months).'],
  ar:['ارتداء الدعامة والمشي بالعكازين حسب التعليمات.','تمارين عضلة الفخذ من اليوم الأول، وزيادة الثني تدريجياً مع العلاج الطبيعي.','لا عودة للرياضة قبل تقييم الطبيب (عادةً ٤–٦ أشهر).']},
 osteo:{name:'Osteotomy',days:[14,42,90,180,365],
  en:['Partial weight-bearing with crutches as instructed until the follow-up X-ray.','Follow-up X-rays at 6 weeks and 3 months to check healing.','Do not smoke: it delays bone healing.','Knee movement and thigh-muscle exercises daily.'],
  ar:['المشي بالعكازين مع تحميل جزئي حسب التعليمات حتى أشعة المتابعة.','أشعة متابعة عند ٦ أسابيع و٣ أشهر للتأكد من التئام العظم.','الامتناع عن التدخين لأنه يؤخر التئام العظم.','تمارين تحريك الركبة وعضلة الفخذ يومياً.']},
 arth:{name:'Joint replacement',days:[14,42,90,365],
  en:['Walk with a frame, then a stick, as you progress.','Bending and straightening exercises several times a day with physiotherapy.','Take the blood-clot prevention medicine exactly as prescribed.','Tell any doctor or dentist that you have a joint replacement before any procedure.'],
  ar:['المشي بالمشاية ثم بالعكاز حسب تقدّمك.','تمارين الفرد والثني عدة مرات يومياً مع العلاج الطبيعي.','الالتزام بدواء الوقاية من الجلطات حسب الوصفة.','إبلاغ أي طبيب أو طبيب أسنان بوجود مفصل صناعي قبل أي إجراء.']},
 rcr:{name:'Rotator cuff repair',days:[14,42,90,180,365],
  en:['Wear the sling at all times for 4–6 weeks, including at night; remove only for washing and exercises.','No active lifting of the arm and no carrying until allowed.','Move the elbow, wrist and fingers several times a day.','Sleeping half-sitting eases pain in the first weeks.'],
  ar:['ارتداء حمالة الكتف طوال الوقت لمدة ٤–٦ أسابيع حتى أثناء النوم، ولا تخلعها إلا للاستحمام والتمارين.','ممنوع رفع الذراع بشكل نشط أو حمل أي أوزان حتى يسمح الطبيب.','حرّك الكوع والرسغ والأصابع عدة مرات يومياً.','النوم في وضع نصف جالس يخفف الألم في الأسابيع الأولى.']},
 inst:{name:'Shoulder stabilisation',days:[14,42,90,180],
  en:['Wear the sling for 3–4 weeks as instructed.','Avoid raising the arm to the side while turning it outwards (the dislocation position).','Move the elbow, wrist and fingers daily.','No contact or throwing sports before the surgeon clears you (usually 4–6 months).'],
  ar:['ارتداء حمالة الكتف لمدة ٣–٤ أسابيع حسب التعليمات.','تجنّب رفع الذراع للجانب مع لفّها للخارج (وضع الخلع).','حرّك الكوع والرسغ والأصابع يومياً.','لا رياضات احتكاك أو رمي قبل تقييم الطبيب (عادةً ٤–٦ أشهر).']},
 rel:{name:'Capsular release / MUA',days:[7,21,42,90],
  en:['Start physiotherapy the day after surgery, daily in the first weeks.','Stretching exercises several times a day, even with some discomfort.','Take painkillers before physiotherapy sessions.'],
  ar:['ابدأ العلاج الطبيعي من اليوم التالي للعملية وبشكل يومي في الأسابيع الأولى.','تمارين الإطالة عدة مرات يومياً حتى مع وجود بعض الألم.','استخدم المسكنات قبل جلسات العلاج الطبيعي.']},
 frac:{name:'Fracture / fixation',days:[14,42,90,180],
  en:['Sling or splint as instructed.','Follow-up X-rays to check healing.','Move the uninjured joints daily.'],
  ar:['ارتداء الحمالة أو الجبيرة حسب التعليمات.','أشعة متابعة للتأكد من التئام الكسر.','حرّك المفاصل غير المصابة يومياً.']},
};
const VISIT_INSTR={
 none:{name:'No instructions',en:[],ar:[]},
 inj:{name:'After injection',en:['Relative rest of the joint for 24–48 hours.','Ice if painful.','Pain may increase slightly for two days, then settle.','Contact the clinic for fever, redness or marked swelling of the joint.'],
  ar:['راحة نسبية للمفصل لمدة ٢٤–٤٨ ساعة بعد الحقن.','يمكن استخدام الثلج عند الألم.','قد يزيد الألم قليلاً في أول يومين ثم يتحسن.','تواصل مع العيادة عند: ارتفاع الحرارة، أو احمرار أو تورم شديد بالمفصل.']},
 physio:{name:'Physiotherapy programme',en:['Attend physiotherapy and do the home exercises every day.','Increase activity gradually; avoid activities that cause severe pain.','Come to the follow-up visit to review progress.'],
  ar:['الالتزام بجلسات العلاج الطبيعي والتمارين المنزلية يومياً.','زيادة النشاط تدريجياً وتجنّب الأنشطة التي تسبب ألماً شديداً.','المتابعة في الموعد المحدد لتقييم التحسن.']},
 kneeoa:{name:'Knee osteoarthritis advice',en:['Losing excess weight greatly reduces the load on the knee.','Thigh-strengthening exercises and walking or a static bike daily.','Avoid squatting, sitting on the floor and frequent stairs.','Painkillers when needed as prescribed.'],
  ar:['إنقاص الوزن الزائد يخفف الحمل على الركبة بشكل كبير.','تمارين تقوية عضلة الفخذ والمشي أو الدراجة الثابتة يومياً.','تجنّب القرفصاء والجلوس على الأرض وصعود السلالم بكثرة.','استخدام المسكنات عند الحاجة حسب الوصفة.']},
 frozen:{name:'Frozen shoulder advice',en:['Shoulder stretching several times a day (pendulum, wall climb).','Heat before exercises; painkillers when needed.','Recovery usually takes months; regular exercise matters.'],
  ar:['تمارين إطالة الكتف عدة مرات يومياً (مثل تمرين البندول والزحف على الحائط).','استخدام الحرارة قبل التمارين والمسكنات عند الحاجة.','التحسّن يأخذ عادةً عدة أشهر، والالتزام بالتمارين مهم.']},
 acute:{name:'Acute injury (rest, ice, elevation)',en:['Rest, ice and elevate the limb to reduce swelling.','Use the brace or sling and crutches as instructed.','Return after the requested investigations (X-ray or MRI).'],
  ar:['راحة واستخدام الثلج ورفع الطرف لتقليل التورم.','استخدام الدعامة أو الحمالة والعكاز حسب التعليمات.','المتابعة بعد الفحوصات المطلوبة (أشعة أو رنين).']},
};
const TIMEPOINTS=['Pre-op','2 weeks','6 weeks','3 months','6 months','1 year','2 years','Other'];
const SCORES={
 lysholm:{name:'Lysholm',joint:'knee',max:100,items:[
  ['Limp',[['None',5],['Slight or periodic',3],['Severe and constant',0]]],
  ['Support',[['None',5],['Cane or crutch',2],['Weight-bearing impossible',0]]],
  ['Locking',[['No locking or catching',15],['Catching but no locking',10],['Locking occasionally',6],['Locking frequently',2],['Locked joint on examination',0]]],
  ['Instability',[['Never gives way',25],['Rarely, during athletics or severe exertion',20],['Frequently during athletics',15],['Occasionally in daily activities',10],['Often in daily activities',5],['Every step',0]]],
  ['Pain',[['None',25],['Inconstant and slight during severe exertion',20],['Marked during severe exertion',15],['Marked on or after walking more than 2 km',10],['Marked on or after walking less than 2 km',5],['Constant',0]]],
  ['Swelling',[['None',10],['On severe exertion',6],['On ordinary exertion',2],['Constant',0]]],
  ['Stair climbing',[['No problems',10],['Slightly impaired',6],['One step at a time',2],['Impossible',0]]],
  ['Squatting',[['No problems',5],['Slightly impaired',4],['Not beyond 90°',2],['Impossible',0]]]],
  interp:v=>v>=95?'Excellent':v>=84?'Good':v>=65?'Fair':'Poor'},
 tegner:{name:'Tegner activity',joint:'knee',max:10,single:[['0 – Sick leave or disability',0],['1 – Sedentary work, walking on even ground',1],['2 – Light labour, walking on uneven ground',2],['3 – Light labour, recreational swimming',3],['4 – Moderately heavy labour, cycling, jogging on even ground',4],['5 – Heavy labour, recreational jogging on uneven ground',5],['6 – Recreational tennis, basketball, handball, jogging 5×/week',6],['7 – Competitive tennis, running; recreational football',7],['8 – Competitive skiing, squash, badminton',8],['9 – Competitive sports at lower level (football, handball)',9],['10 – National or international level football',10]]},
 ases:{name:'ASES',joint:'shoulder',max:100,vas:true,items:[['Put on a coat'],['Sleep on the painful side'],['Wash back / do up bra'],['Manage toileting'],['Comb hair'],['Reach a high shelf'],['Lift 10 lb (4.5 kg) above shoulder'],['Throw a ball overhand'],['Do usual work'],['Do usual sport']].map(([l])=>[l,[['Unable',0],['Very difficult',1],['Somewhat difficult',2],['Not difficult',3]]])},
 rowe:{name:'Rowe (instability)',joint:'shoulder',max:100,items:[
  ['Stability',[['No recurrence, subluxation or apprehension',50],['Apprehension in certain positions',30],['Subluxation (not requiring reduction)',10],['Recurrent dislocation',0]]],
  ['Motion',[['Full external rotation, internal rotation and elevation',20],['75% of external rotation; normal elevation and internal rotation',15],['50% of external rotation; 75% of elevation and internal rotation',5],['50% of elevation and internal rotation; no external rotation',0]]],
  ['Function',[['No limitation in work or sport; little or no discomfort',30],['Mild limitation and minimal discomfort',25],['Moderate limitation and discomfort',10],['Marked limitation and pain',0]]]],
  interp:v=>v>=90?'Excellent':v>=75?'Good':v>=51?'Fair':'Poor'},
 vas:{name:'Pain VAS',joint:'any',max:10,num:[0,10,1],lower:true},
 sane:{name:'SANE',joint:'any',max:100,num:[0,100,5]},
};
function scoreValue(type,a){const d=SCORES[type];if(!d)return null;
  if(d.single)return a.v!=null&&a.v!==''?+a.v:null;
  if(d.num)return a.v!=null&&a.v!==''?+a.v:null;
  if(type==='ases'){if(a.vas==null||a.vas==='')return null;let sum=0;for(let i=0;i<d.items.length;i++){if(a['i'+i]==null)return null;sum+=+a['i'+i]}return Math.round(((10-(+a.vas))*5+sum*5/3)*10)/10}
  let sum=0;for(let i=0;i<d.items.length;i++){if(a['i'+i]==null)return null;sum+=+a['i'+i]}return sum}

/* ================= data layer ================= */
const LocalDB=(()=>{let dbp=null;const subs={};
  const open=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('clinic-local',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('docs',{keyPath:'p'});s.createIndex('c','c')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  const tx=async(mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction('docs',mode);const st=t.objectStore('docs');const out=fn(st);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)})};
  const colOf=p=>p.split('/').slice(0,-1).join('/');
  const notify=c=>{(subs[c]||[]).forEach(async s=>s.cb(await api.list(c,s.f)))};
  const match=(d,f)=>!f||f.every(([k,op,v])=>op==='=='?d[k]===v:op==='<'?d[k]<v:op==='>='?d[k]>=v:true);
  const api={
   get:async p=>{const r=await tx('readonly',s=>s.get(p));return r?r.d:null},
   set:(p,d)=>tx('readwrite',s=>s.put({p,c:colOf(p),d:{...d}})).then(()=>notify(colOf(p))),
   update:async(p,d)=>{const cur=await api.get(p)||{};return api.set(p,{...cur,...d})},
   add:(c,d)=>{const id=uid();api.set(c+'/'+id,d);return id},
   del:p=>tx('readwrite',s=>s.delete(p)).then(()=>notify(colOf(p))),
   list:async(c,f)=>{const all=await tx('readonly',s=>s.index('c').getAll(c));return all.map(r=>({id:r.p.split('/').pop(),...r.d})).filter(d=>match(d,f))},
   watch:(c,f,cb)=>{(subs[c]=subs[c]||[]).push({f,cb});api.list(c,f).then(cb)},
  };return api})();
let db=null,auth=null;
const CloudDB={
 get:async p=>{const s=await FB.getDoc(FB.doc(db,p));return s.exists()?s.data():null},
 set:(p,d)=>{FB.setDoc(FB.doc(db,p),d).catch(err);return Promise.resolve()},
 update:(p,d)=>{FB.setDoc(FB.doc(db,p),d,{merge:true}).catch(err);return Promise.resolve()},
 add:(c,d)=>{const ref=FB.doc(FB.collection(db,c));FB.setDoc(ref,d).catch(err);return ref.id},
 del:p=>{FB.deleteDoc(FB.doc(db,p)).catch(err);return Promise.resolve()},
 list:async(c,f)=>{const q=f&&f.length?FB.query(FB.collection(db,c),...f.map(([k,op,v])=>FB.where(k,op,v))):FB.collection(db,c);const s=await FB.getDocs(q);return s.docs.map(d=>({id:d.id,...d.data()}))},
 watch:(c,f,cb)=>{const q=f&&f.length?FB.query(FB.collection(db,c),...f.map(([k,op,v])=>FB.where(k,op,v))):FB.collection(db,c);return FB.onSnapshot(q,s=>cb(s.docs.map(d=>({id:d.id,...d.data()}))),err)},
};
function err(e){console.error(e);toast(e&&e.code==='permission-denied'?'Not allowed for your role':(e&&e.message)||'Something went wrong')}
let D=null;const S={mode:null,cid:null,role:null,email:'',name:'',clinic:{},patients:[],appts:[],ready:false,lang:'ar'};
const C=n=>`clinics/${S.cid}/${n}`;
const isDoc=()=>S.role==='doctor';

/* ================= boot & auth ================= */
function getConfig(){if(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)return window.FIREBASE_CONFIG;try{const c=localStorage.getItem('fbconfig');return c?JSON.parse(c):null}catch{return null}}
async function boot(){let mode=null;try{mode=localStorage.getItem('mode')}catch{}
  S.lang=(()=>{try{return localStorage.getItem('lang')||'ar'}catch{return'ar'}})();
  if(mode==='local')return startLocal();
  const cfg=getConfig();if(!cfg)return screenWelcome();
  try{const app=FB.initializeApp(cfg);auth=FB.initializeAuth(app,{persistence:[FB.indexedDBLocalPersistence,FB.browserLocalPersistence]});
    db=FB.initializeFirestore(app,{localCache:FB.persistentLocalCache({tabManager:FB.persistentSingleTabManager()})});}
  catch(e){err(e);return screenWelcome()}
  D=CloudDB;S.mode='cloud';
  FB.onAuthStateChanged(auth,async u=>{if(!u)return screenLogin();if(!u.emailVerified)return screenVerify(u);
    S.email=u.email.toLowerCase();
    try{const m=await CloudDB.get('memberships/'+S.email);if(!m)return screenNoClinic();
      S.cid=m.clinicId;const me=await CloudDB.get(C('members/'+S.email));if(!me)return screenNoClinic();S.role=me.role;S.name=me.name||'';
      S.clinic=await CloudDB.get('clinics/'+S.cid)||{};startWatch()}catch(e){err(e);screenNoClinic()}})}
async function startLocal(){D=LocalDB;S.mode='local';S.cid='local';S.role='doctor';S.email='demo@local';S.name='Doctor';
  S.clinic=await D.get('clinics/local')||null;if(!S.clinic){await seedDemo();S.clinic=await D.get('clinics/local')}startWatch()}
function startWatch(){D.watch(C('patients'),null,l=>{S.patients=l.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));if(S.ready)softRefresh()});
  D.watch(C('appointments'),[['status','==','scheduled']],l=>{S.appts=l;if(S.ready)softRefresh()});
  S.ready=true;if(!location.hash||location.hash==='#/login')location.hash='#/today';else render()}
let refreshT;function softRefresh(){clearTimeout(refreshT);refreshT=setTimeout(()=>{const r=route()[0];if(['today','patients','schedule','stats'].includes(r))render()},250)}

function shell(title,body,{back=false,action=''}={}){
  const r=route()[0];const navOn=k=>({today:['today'],patients:['patients','p','pe','new-patient','visit','surgery','score','file'],schedule:['schedule','appt'],stats:['stats'],more:['more','clinic','team','setup-code','backup']}[k]||[]).includes(r)?'on':'';
  $('#app').innerHTML=`<header class="top">${back?`<button class="ib" id="backBtn" aria-label="Back">${I.back}</button>`:''}<h1>${esc(title)}</h1>${action}</header>
  <main id="main">${body}</main>
  <nav class="nav"><a href="#/today" class="${navOn('today')}">${I.today}Today</a><a href="#/patients" class="${navOn('patients')}">${I.pts}Patients</a><a href="#/schedule" class="${navOn('schedule')}">${I.cal}Schedule</a><a href="#/stats" class="${navOn('stats')}">${I.stats}Stats</a><a href="#/more" class="${navOn('more')}">${I.more}More</a></nav>`;
  const b=$('#backBtn');if(b)b.onclick=()=>history.length>1?history.back():(location.hash='#/today');window.scrollTo(0,0)}
function screen(html){$('#app').innerHTML=`<div class="login">${html}</div>`}
function screenWelcome(){screen(`<div class="logo">Knee &amp; Shoulder Clinic</div><div class="sub">Patient records, surgery notes, outcome scores and follow-up for a knee and shoulder practice.</div>
  <div class="card form"><b>Connect the clinic database</b><p class="fine">Paste the clinic setup code (from the doctor's phone: More → Clinic setup code) or the Firebase web config JSON.</p>
  <textarea class="in" id="cfg" placeholder="Setup code or { &quot;apiKey&quot;: … }"></textarea><button class="btn primary" id="cfgGo">Connect</button></div>
  <div class="card form"><b>Try it first</b><p class="fine">Demo mode keeps records on this phone only, with sample patients. You can connect the clinic database later from More.</p><button class="btn" id="demoGo">Open demo</button></div>`);
  $('#cfgGo').onclick=()=>{const t=$('#cfg').value.trim();let c=null;try{c=JSON.parse(t)}catch{try{c=JSON.parse(decodeURIComponent(escape(atob(t))))}catch{}}
    if(!c||!c.apiKey||!c.projectId)return toast('That is not a valid setup code');try{localStorage.setItem('fbconfig',JSON.stringify(c));localStorage.removeItem('mode')}catch{}location.reload()};
  $('#demoGo').onclick=()=>{try{localStorage.setItem('mode','local')}catch{}location.hash='#/today';location.reload()}}
function screenLogin(){let mode='in';const draw=()=>{screen(`<div class="logo">Knee &amp; Shoulder Clinic</div><div class="sub">${mode==='in'?'Sign in to the clinic':'Create your account'}</div>
  <div class="card form"><label class="f">Email<input class="in" id="em" type="email" autocomplete="email"></label><label class="f">Password<input class="in" id="pw" type="password" autocomplete="${mode==='in'?'current-password':'new-password'}"></label>
  <button class="btn primary" id="go">${mode==='in'?'Sign in':'Create account'}</button>
  <div class="row"><button class="btn sm" id="sw">${mode==='in'?'New here? Create account':'Have an account? Sign in'}</button>${mode==='in'?'<button class="btn sm" id="fp">Forgot password</button>':''}</div></div>
  <p class="fine">Assistants: ask the doctor to add your email under More → Team first, then create your account with that email.</p>
  <div class="row"><button class="btn sm" id="demo">Use demo on this phone instead</button><button class="btn sm" id="chdb">Change clinic database</button></div>`);
  $('#chdb').onclick=()=>{try{localStorage.removeItem('fbconfig')}catch{}location.reload()};
  $('#sw').onclick=()=>{mode=mode==='in'?'up':'in';draw()};
  $('#go').onclick=async()=>{const e=$('#em').value.trim(),p=$('#pw').value;if(!e||!p)return toast('Enter email and password');
    try{if(mode==='in')await FB.signInWithEmailAndPassword(auth,e,p);else{const c=await FB.createUserWithEmailAndPassword(auth,e,p);await FB.sendEmailVerification(c.user)}}catch(x){toast(x.code==='auth/invalid-credential'?'Wrong email or password':x.code==='auth/email-already-in-use'?'That email already has an account; sign in':x.code==='auth/weak-password'?'Use at least 6 characters':x.message)}};
  const fp=$('#fp');if(fp)fp.onclick=async()=>{const e=$('#em').value.trim();if(!e)return toast('Type your email first');try{await FB.sendPasswordResetEmail(auth,e);toast('Password reset email sent')}catch(x){toast(x.message)}};
  $('#demo').onclick=()=>{try{localStorage.setItem('mode','local')}catch{}location.reload()}};draw()}
function screenVerify(u){screen(`<div class="logo">Verify your email</div><div class="sub">We sent a link to <b>${esc(u.email)}</b>. Open it, then come back and tap Continue.</div>
  <button class="btn primary" id="cont">Continue</button><button class="btn" id="resend">Send the link again</button><button class="btn" id="out">Sign out</button>`);
  $('#cont').onclick=async()=>{await u.reload();if(auth.currentUser.emailVerified){await auth.currentUser.getIdToken(true);location.reload()}else toast('Not verified yet')};
  $('#resend').onclick=()=>FB.sendEmailVerification(u).then(()=>toast('Sent')).catch(e=>toast(e.message));$('#out').onclick=()=>FB.signOut(auth)}
function screenNoClinic(){screen(`<div class="logo">No clinic yet</div><div class="sub">Signed in as <b>${esc(auth.currentUser.email)}</b>.</div>
  <div class="card form"><b>I am the doctor: create the clinic</b><label class="f">Clinic name<input class="in" id="cn" value="Knee &amp; Shoulder Clinic"></label><label class="f">Doctor name<input class="in" id="dn" value="Dr. Elsayed Elforse"></label><button class="btn primary" id="mk">Create clinic</button></div>
  <div class="card"><b>I am an assistant</b><p class="fine">Ask the doctor to add <b>${esc(auth.currentUser.email)}</b> under More → Team, then tap Check again.</p><button class="btn" id="chk">Check again</button></div>
  <button class="btn" id="out">Sign out</button>`);
  $('#mk').onclick=async()=>{const u=auth.currentUser,email=u.email.toLowerCase();try{
    const ref=FB.doc(FB.collection(db,'clinics'));const cid=ref.id;
    await FB.setDoc(ref,{ownerUid:u.uid,nameEn:$('#cn').value,doctorEn:$('#dn').value,createdAt:Date.now()});
    await FB.setDoc(FB.doc(db,`clinics/${cid}/members/${email}`),{role:'doctor',name:$('#dn').value,email});
    await FB.setDoc(FB.doc(db,'memberships/'+email),{clinicId:cid,role:'doctor'});location.reload()}catch(e){err(e)}};
  $('#chk').onclick=()=>location.reload();$('#out').onclick=()=>FB.signOut(auth)}

/* ================= router ================= */
function route(){return(location.hash.replace(/^#\/?/,'')||'today').split('/').map(decodeURIComponent)}
window.addEventListener('hashchange',()=>{if(S.ready)render()});
function render(){const [r,a,b]=route();
  try{({today:vToday,patients:vPatients,'new-patient':()=>vPatientForm(null),pe:()=>vPatientForm(a),p:()=>vPatient(a,b||'timeline'),visit:()=>vVisit(a,b),surgery:()=>vSurgery(a,b),score:()=>vScore(a,b),file:()=>vFile(a),appt:()=>vAppt(a,b),schedule:()=>vSchedule(a),stats:vStats,more:vMore,clinic:vClinic,team:vTeam,'setup-code':vSetupCode,backup:vBackup}[r]||vToday)()}catch(e){console.error(e);toast(e.message)}}
const patient=id=>S.patients.find(p=>p.id===id);
async function getPatient(id){return patient(id)||(await D.get(C('patients/'+id))&&{id,...await D.get(C('patients/'+id))})}
const jointTag=j=>j?`<span class="tag ${j}">${j==='knee'?'Knee':'Shoulder'}</span>`:'';
const sideTxt=s=>({R:'Right',L:'Left',B:'Bilateral'}[s]||'');
function pItem(p,right=''){return`<a class="item" href="#/p/${p.id}"><span class="av">${esc(initials(p))}</span><span class="m"><span class="t">${esc(p.nameEn||p.nameAr)}</span><span class="s">${p.nameAr&&p.nameEn?`<span class="ar" dir="rtl">${esc(p.nameAr)}</span> · `:''}${ageOf(p)!=null?ageOf(p)+' y · ':''}${p.sex||''} · ${esc(p.fileNo||'')}</span></span>${right}</a>`}

/* ================= today ================= */
function vToday(){const t=today();const td=S.appts.filter(a=>a.date===t).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const overdue=S.appts.filter(a=>a.date<t).sort((a,b)=>a.date.localeCompare(b.date));
  const week=S.appts.filter(a=>a.date>t&&a.date<=addDays(t,7)).length;
  shell(S.clinic.nameEn||'Clinic',`
  <div class="stats"><div class="stat"><div class="k">Today</div><div class="v">${td.length}</div></div><div class="stat"><div class="k">Next 7 days</div><div class="v">${week}</div></div><div class="stat"><div class="k">Overdue follow-up</div><div class="v" style="color:${overdue.length?'var(--bad)':'inherit'}">${overdue.length}</div></div><div class="stat"><div class="k">Patients</div><div class="v">${S.patients.length}</div></div></div>
  <div class="row" style="margin-top:12px"><a class="btn primary" href="#/new-patient">${I.plus}New patient</a><a class="btn" href="#/appt/new">${I.cal}New appointment</a></div>
  <h3>Today · ${esc(dayName(t))}</h3>${apptList(td)||'<div class="empty">No appointments today.</div>'}
  <h3>Overdue follow-up</h3>${apptList(overdue,true)||'<div class="empty">Nothing overdue.</div>'}
  <h3>Recently updated</h3><div class="list">${S.patients.slice(0,5).map(p=>pItem(p)).join('')||'<div class="empty">No patients yet.</div>'}</div>`,
  {action:S.mode==='local'?'<span class="tag warn">Demo</span>':''});bindAppt()}
function apptList(list,showDate){if(!list.length)return'';return`<div class="list">${list.map(a=>{const p=patient(a.patientId)||{nameEn:a.patientName};return`<div class="item" data-appt="${a.id}"><span class="av">${esc(a.time||'—')}</span><span class="m"><span class="t">${esc(p.nameEn||p.nameAr||a.patientName)}</span><span class="s">${showDate?fmt(a.date)+' · ':''}${esc(a.type||'Follow-up')}${a.note?' · '+esc(a.note):''}</span></span>
  <span class="row" style="flex-wrap:nowrap"><button class="btn sm" data-wa="${a.id}" aria-label="WhatsApp reminder">${I.wa}</button><button class="btn sm" data-done="${a.id}">Seen</button><button class="btn sm danger" data-miss="${a.id}">Missed</button></span></div>`}).join('')}</div>`}
function bindAppt(){$$('[data-appt]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))return;const a=[...S.appts,...(window._dayAppts||[])].find(x=>x.id===el.dataset.appt);if(a)location.hash='#/p/'+a.patientId}));
  $$('[data-done]').forEach(b=>b.onclick=()=>{D.update(C('appointments/'+b.dataset.done),{status:'attended',doneAt:Date.now()});toast('Marked as seen');setTimeout(render,300)});
  $$('[data-miss]').forEach(b=>b.onclick=()=>{D.update(C('appointments/'+b.dataset.miss),{status:'missed'});toast('Marked as missed');setTimeout(render,300)});
  $$('[data-wa]').forEach(b=>b.onclick=()=>{const a=[...S.appts,...(window._dayAppts||[])].find(x=>x.id===b.dataset.wa);if(a)waReminder(a)})}
function waPhone(ph){let n=String(ph||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0')&&n.length===11)n='20'+n.slice(1);return n}
function openUrl(u){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
function waReminder(a){const p=patient(a.patientId)||{};const n=waPhone(p.phone);if(!n)return toast('No phone number for this patient');
  const cl=S.clinic;const msg=S.lang==='en'?`Hello ${p.nameEn||''}, a reminder of your ${a.type||'follow-up'} appointment at ${cl.nameEn||'the clinic'} on ${dayName(a.date)}${a.time?' at '+a.time:''}.${cl.phone?' For enquiries: '+cl.phone:''}`
   :`مرحباً ${p.nameAr||p.nameEn||''}، نذكّركم بموعد ${a.type==='Post-op follow-up'?'متابعة ما بعد العملية':'المتابعة'} في ${cl.nameAr||cl.nameEn||'العيادة'} يوم ${fmtAr(a.date)}${a.time?' الساعة '+a.time:''}.${cl.phone?' للاستفسار: '+cl.phone:''}`;
  openUrl(`https://wa.me/${n}?text=${encodeURIComponent(msg)}`)}

/* ================= patients ================= */
function vPatients(){shell('Patients',`<input class="in" id="q" placeholder="Search name, phone or file number" autocomplete="off">
  <div class="row" style="margin:10px 0"><a class="btn primary" href="#/new-patient">${I.plus}New patient</a><span class="fine" id="cnt"></span></div><div class="list" id="pl"></div>`);
  const draw=()=>{const q=$('#q').value.trim().toLowerCase();const l=S.patients.filter(p=>!q||[p.nameEn,p.nameAr,p.phone,p.fileNo].some(x=>String(x||'').toLowerCase().includes(q)));
    $('#pl').innerHTML=l.slice(0,200).map(p=>pItem(p,`<span class="r">${p.lastJoint?jointTag(p.lastJoint):''}</span>`)).join('')||'<div class="empty">No matching patients.</div>';$('#cnt').textContent=`${l.length} patient${l.length===1?'':'s'}`};
  $('#q').addEventListener('input',draw);draw();setTimeout(()=>$('#q').focus(),50)}
async function vPatientForm(id){const p=id?await getPatient(id):{};const fileNo=p.fileNo||(new Date().getFullYear().toString().slice(2)+'-'+String(S.patients.length+1).padStart(4,'0'));
  shell(id?'Edit patient':'New patient',`<div class="form" id="f">
  <label class="f">Name (English)<input class="in" data-k="nameEn" value="${esc(p.nameEn)}"></label>
  <label class="f">الاسم بالعربية<input class="in ar" dir="rtl" data-k="nameAr" value="${esc(p.nameAr)}"></label>
  <div class="grid2"><label class="f">Sex<select class="in" data-k="sex"><option ${p.sex==='M'?'selected':''} value="M">Male</option><option ${p.sex==='F'?'selected':''} value="F">Female</option></select></label>
  <label class="f">Age (years)<input class="in" type="number" inputmode="numeric" id="age" value="${ageOf(p)??''}"></label></div>
  <div class="grid2"><label class="f">Mobile<input class="in" type="tel" data-k="phone" value="${esc(p.phone)}" placeholder="01xxxxxxxxx"></label><label class="f">File number<input class="in" data-k="fileNo" value="${esc(fileNo)}"></label></div>
  <div class="grid2"><label class="f">Occupation<input class="in" data-k="occupation" value="${esc(p.occupation)}"></label><label class="f">Sport / activity<input class="in" data-k="sport" value="${esc(p.sport)}"></label></div>
  <label class="f">Referred by<input class="in" data-k="referral" value="${esc(p.referral)}"></label>
  <label class="f">Medical history, allergies, medications<textarea class="in" data-k="history">${esc(p.history)}</textarea></label>
  <button class="btn primary" id="save">Save patient</button>${id&&isDoc()?'<button class="btn danger" id="del">Delete patient</button>':''}</div>`,{back:true});
  $('#save').onclick=()=>{const d=readForm($('#f'));if(!d.nameEn&&!d.nameAr)return toast('Enter the patient name');const age=+$('#age').value;if(age)d.birthYear=new Date().getFullYear()-age;d.updatedAt=Date.now();
    if(id){D.update(C('patients/'+id),d);toast('Saved');location.replace('#/p/'+id)}else{d.createdAt=Date.now();const nid=D.add(C('patients'),d);toast('Patient added');location.replace('#/p/'+nid)}};
  const del=$('#del');if(del)del.onclick=()=>{if(del.dataset.armed){D.del(C('patients/'+id));toast('Patient deleted');location.replace('#/patients')}else{del.dataset.armed=1;del.textContent='Tap again to delete'}}}
function readForm(root){const d={};root.querySelectorAll('[data-k]').forEach(i=>{const k=i.dataset.k;if(i.type==='checkbox')d[k]=i.checked;else if(i.type==='number')d[k]=i.value===''?'':+i.value;else d[k]=i.value});return d}

async function vPatient(id,tab){const p=await getPatient(id);if(!p)return shell('Patient','<div class="empty">Patient not found.</div>',{back:true});
  const [visits,surg,scores,appts]=await Promise.all([D.list(C('visits'),[['patientId','==',id]]),D.list(C('surgeries'),[['patientId','==',id]]),D.list(C('scores'),[['patientId','==',id]]),D.list(C('appointments'),[['patientId','==',id]])]);
  const tabs=[['timeline','Timeline'],['scores','Scores'],['files','Files'],['appts','Appointments']];
  const head=`<div class="phead"><span class="av">${esc(initials(p))}</span><div style="min-width:0"><div class="n">${esc(p.nameEn||p.nameAr)}</div>${p.nameAr&&p.nameEn?`<div class="ar" dir="rtl">${esc(p.nameAr)}</div>`:''}<div class="meta">${ageOf(p)!=null?ageOf(p)+' y · ':''}${p.sex==='F'?'Female':'Male'} · File ${esc(p.fileNo||'—')}</div></div></div>
  <div class="row" style="margin-top:10px">${p.phone?`<a class="btn sm" href="tel:${esc(p.phone)}">${I.phone}Call</a><button class="btn sm" id="wa">${I.wa}WhatsApp</button>`:''}<a class="btn sm" href="#/pe/${id}">${I.edit}Edit</a><button class="btn sm" id="pr">${I.print}Print</button></div>
  <div class="row" style="margin-top:8px">${isDoc()?`<a class="btn sm primary" href="#/visit/${id}/new">${I.plus}Visit</a><a class="btn sm primary" href="#/surgery/${id}/new">${I.plus}Surgery</a>`:''}<a class="btn sm" href="#/score/${id}/new">${I.plus}Score</a><a class="btn sm" href="#/file/${id}">${I.plus}File</a><a class="btn sm" href="#/appt/new/${id}">${I.plus}Appointment</a></div>
  <nav class="tabs">${tabs.map(([k,l])=>`<a href="#/p/${id}/${k}" class="${tab===k?'on':''}">${l}</a>`).join('')}</nav>`;
  let body='';
  if(tab==='timeline'){const ev=[...visits.map(v=>({d:v.date,k:'v',o:v})),...surg.map(s=>({d:s.date,k:'s',o:s})),...scores.map(s=>({d:s.date,k:'sc',o:s}))].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
    body=(p.history?`<div class="card" style="margin-bottom:10px"><div class="fine">History</div>${esc(p.history)}</div>`:'')+(ev.length?`<div class="tl">${ev.map(e=>{
      if(e.k==='v')return`<a class="item" href="#/visit/${id}/${e.o.id}"><span class="when">${fmt(e.d)}</span><span class="m"><span class="t">${jointTag(e.o.joint)} ${esc(sideTxt(e.o.side))} · ${esc(e.o.vtype||'Visit')}</span><span class="s" style="white-space:normal">${esc((e.o.dx||[]).join(', ')||e.o.complaint||'')}</span></span></a>`;
      if(e.k==='s')return`<a class="item" href="#/surgery/${id}/${e.o.id}"><span class="when">${fmt(e.d)}</span><span class="m"><span class="t">${jointTag(e.o.joint)} <b>Surgery</b> · ${esc(e.o.procedure)}</span><span class="s">${esc(sideTxt(e.o.side))}${e.o.details?' · '+esc(e.o.details):''}</span></span></a>`;
      const d=SCORES[e.o.type]||{};return`<a class="item" href="#/score/${id}/${e.o.id}"><span class="when">${fmt(e.d)}</span><span class="m"><span class="t">${esc(d.name)} <span class="meta">${e.o.value}</span></span><span class="s">${esc(e.o.timepoint||'')}</span></span></a>`}).join('')}</div>`:'<div class="empty">No visits yet.</div>')}
  if(tab==='scores'){const types=[...new Set(scores.map(s=>s.type))];body=types.length?types.map(t=>{const l=scores.filter(s=>s.type===t).sort((a,b)=>(a.date||'').localeCompare(b.date||''));return`<h3>${esc(SCORES[t].name)}</h3><div class="card">${chart(l,SCORES[t])}<div class="list" style="margin-top:8px">${l.map(s=>`<a class="item" href="#/score/${id}/${s.id}"><span class="when">${fmt(s.date)}</span><span class="m"><span class="t">${s.value}${SCORES[t].interp?` <span class="tag mut">${SCORES[t].interp(s.value)}</span>`:''}</span><span class="s">${esc(s.timepoint||'')}</span></span></a>`).join('')}</div></div>`}).join(''):'<div class="empty">No scores recorded.</div>'}
  if(tab==='files'){const files=await D.list(C('files'),[['patientId','==',id]]);files.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    body=files.length?`<div class="thumbs">${files.map(f=>`<figure data-f="${f.id}"><img src="${f.data}" alt="${esc(f.caption||f.kind)}"><figcaption>${esc(f.kind)} · ${fmt(f.date)}${f.caption?'<br>'+esc(f.caption):''}</figcaption></figure>`).join('')}</div>`:'<div class="empty">No files. Add X-rays, MRI images or wound photos.</div>';window._files=files}
  if(tab==='appts'){appts.sort((a,b)=>(b.date||'').localeCompare(a.date||''));window._dayAppts=appts;
    body=appts.length?`<div class="list">${appts.map(a=>`<div class="item"><span class="when">${fmt(a.date)}<br>${esc(a.time||'')}</span><span class="m"><span class="t">${esc(a.type||'Follow-up')}</span><span class="s">${esc(a.note||'')}</span></span><span class="tag ${a.status==='attended'?'ok':a.status==='missed'?'bad':a.date<today()?'warn':'mut'}">${a.status==='scheduled'&&a.date<today()?'overdue':esc(a.status)}</span>${a.status==='scheduled'?`<button class="btn sm" data-wa="${a.id}">${I.wa}</button><button class="btn sm" data-done="${a.id}">Seen</button>`:''}</div>`).join('')}</div>`:'<div class="empty">No appointments.</div>'}
  shell(p.nameEn||p.nameAr,head+body,{back:true});
  const w=$('#wa');if(w)w.onclick=()=>openUrl(`https://wa.me/${waPhone(p.phone)}`);
  $('#pr').onclick=()=>printMenu(p,visits,surg);
  $$('[data-f]').forEach(el=>el.onclick=()=>fileSheet(window._files.find(f=>f.id===el.dataset.f),p));bindAppt()}
function chart(l,def){if(l.length<1)return'';const W=320,H=120,pl=30,pb=18;const max=def.max||100;const xs=i=>pl+(l.length===1?(W-pl)/2:i*(W-pl-10)/(l.length-1));const ys=v=>H-pb-(v/max)*(H-pb-8);
  const pts=l.map((s,i)=>`${xs(i)},${ys(s.value)}`).join(' ');
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(def.name)} over time">${[0,max/2,max].map(v=>`<line x1="${pl}" x2="${W}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)"/><text x="0" y="${ys(v)+4}">${v}</text>`).join('')}
  <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>${l.map((s,i)=>`<circle cx="${xs(i)}" cy="${ys(s.value)}" r="4" fill="var(--accent)"/><text x="${xs(i)-10}" y="${H-2}">${esc((s.timepoint||'').replace(' weeks','w').replace(' months','m').replace(' year','y').replace('Pre-op','pre'))}</text>`).join('')}</svg>`}

/* ================= visit ================= */
async function vVisit(pid,vid){const p=await getPatient(pid);const isNew=vid==='new';const v=isNew?{date:today(),joint:p.lastJoint||'knee',side:'R',vtype:'New',exam:{},dx:[],plan:[],instr:'none'}:await D.get(C('visits/'+vid));if(!v)return shell('Visit','<div class="empty">Not found.</div>',{back:true});
  if(!isDoc()&&!isNew)return vVisitView(p,v,vid);
  const st={joint:v.joint,side:v.side,vtype:v.vtype,exam:{...(v.exam||{})},dx:[...(v.dx||[])],plan:[...(v.plan||[])]};
  const segH=(k,opts)=>`<div class="seg" data-seg="${k}">${opts.map(([val,l])=>`<button type="button" data-v="${val}" class="${st[k]===val?'on':''}">${l}</button>`).join('')}</div>`;
  const draw=()=>{shell(isNew?'New visit':'Visit '+fmt(v.date),`<div class="form" id="f">
   <div class="grid2"><label class="f">Date<input class="in" type="date" data-k="date" value="${esc(v.date)}"></label><label class="f">Visit type<select class="in" id="vtype">${['New','Follow-up','Post-op','Injection'].map(x=>`<option ${st.vtype===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
   ${segH('joint',[['knee','Knee'],['shoulder','Shoulder']])}${segH('side',[['R','Right'],['L','Left'],['B','Bilateral']])}
   <label class="f">Chief complaint<input class="in" data-k="complaint" value="${esc(v.complaint)}" placeholder="e.g. Medial knee pain and locking"></label>
   <div class="grid2"><label class="f">Duration<input class="in" data-k="duration" value="${esc(v.duration)}"></label><label class="f">Mechanism<input class="in" data-k="mechanism" value="${esc(v.mechanism)}" placeholder="Twisting, fall, overuse…"></label></div>
   <label class="f">History<textarea class="in" data-k="hx">${esc(v.hx)}</textarea></label>
   <h3>Examination <span class="fine">tap once = positive (+), twice = negative (−)</span></h3>
   <div class="tri" id="tri">${EXAM[st.joint].map(([k,l])=>{const s=st.exam[k]||'';return`<button type="button" data-t="${k}" class="${s==='+'?'pos':s==='-'?'neg':''}">${l}<b>${s==='+'?'+':s==='-'?'−':''}</b></button>`}).join('')}</div>
   ${st.joint==='knee'?`<div class="grid2"><label class="f">Extension deficit (°)<input class="in" type="number" data-k="romExt" value="${v.romExt??''}"></label><label class="f">Flexion (°)<input class="in" type="number" data-k="romFlex" value="${v.romFlex??''}"></label></div>
     <div class="grid2"><label class="f">Alignment<select class="in" data-k="align">${['','Neutral','Varus','Valgus'].map(x=>`<option ${v.align===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="f">Gait<select class="in" data-k="gait">${['','Normal','Antalgic','Using support'].map(x=>`<option ${v.gait===x?'selected':''}>${x}</option>`).join('')}</select></label></div>`
    :`<div class="grid2"><label class="f">Forward flexion (°)<input class="in" type="number" data-k="romFF" value="${v.romFF??''}"></label><label class="f">Abduction (°)<input class="in" type="number" data-k="romAbd" value="${v.romAbd??''}"></label></div>
     <div class="grid2"><label class="f">External rotation at side (°)<input class="in" type="number" data-k="romER" value="${v.romER??''}"></label><label class="f">Internal rotation<select class="in" data-k="romIR">${['','Buttock','Sacrum','L5','L3','L1','T12','T10','T7'].map(x=>`<option ${v.romIR===x?'selected':''}>${x}</option>`).join('')}</select></label></div>`}
   <label class="f">Other findings<textarea class="in" data-k="examNote">${esc(v.examNote)}</textarea></label>
   <label class="f">Imaging<textarea class="in" data-k="imaging" placeholder="X-ray, MRI findings">${esc(v.imaging)}</textarea></label>
   <h3>Diagnosis</h3><div class="chips" data-multi="dx">${DX[st.joint].map(x=>`<button type="button" class="chip ${st.dx.includes(x)?'on':''}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
   <input class="in" data-k="dxOther" value="${esc(v.dxOther)}" placeholder="Other diagnosis">
   <h3>Plan</h3><div class="chips" data-multi="plan">${PLAN.map(x=>`<button type="button" class="chip ${st.plan.includes(x)?'on':''}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>
   <label class="f">Plan details<textarea class="in" data-k="planNote">${esc(v.planNote)}</textarea></label>
   <label class="f">Prescription (one medicine per line)<textarea class="in" dir="auto" data-k="rx" placeholder="Tab. … 1×2 for 7 days">${esc(v.rx)}</textarea></label>
   <label class="f">Patient instructions<select class="in" data-k="instr">${Object.entries(VISIT_INSTR).map(([k,o])=>`<option value="${k}" ${v.instr===k?'selected':''}>${o.name}</option>`).join('')}</select></label>
   <h3>Next follow-up</h3><div class="row">${[['1 w',7],['2 w',14],['4 w',28],['6 w',42],['3 m',90],['6 m',180]].map(([l,d])=>`<button type="button" class="chip" data-fu="${d}">${l}</button>`).join('')}</div>
   <div class="grid2"><label class="f">Date<input class="in" type="date" data-k="nextDate" value="${esc(v.nextDate||'')}"></label><label class="f">Time<input class="in" type="time" data-k="nextTime" value="${esc(v.nextTime||'')}"></label></div>
   <button class="btn primary" id="save">Save visit</button>${!isNew?`<button class="btn" id="prv">${I.print}Print</button><button class="btn danger" id="del">Delete visit</button>`:''}</div>`,{back:true});
   $$('[data-seg]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{Object.assign(v,readForm($('#f')));st[g.dataset.seg]=b.dataset.v;if(g.dataset.seg==='joint'){st.exam={};st.dx=[]}draw()}));
   $$('#tri button').forEach(b=>b.onclick=()=>{const k=b.dataset.t;const s=st.exam[k]||'';st.exam[k]=s===''?'+':s==='+'?'-':'';if(!st.exam[k])delete st.exam[k];const n=st.exam[k]||'';b.className=n==='+'?'pos':n==='-'?'neg':'';b.querySelector('b').textContent=n==='+'?'+':n==='-'?'−':''});
   $$('[data-multi]').forEach(g=>g.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{const arr=st[g.dataset.multi];const x=c.dataset.v;const i=arr.indexOf(x);if(i>=0)arr.splice(i,1);else arr.push(x);c.classList.toggle('on')}));
   $$('[data-fu]').forEach(c=>c.onclick=()=>{const d=$('[data-k="date"]').value||today();$('[data-k="nextDate"]').value=addDays(d,+c.dataset.fu)});
   $('#save').onclick=()=>{const d={...readForm($('#f')),joint:st.joint,side:st.side,vtype:$('#vtype').value,exam:st.exam,dx:st.dx,plan:st.plan,patientId:pid,updatedAt:Date.now()};
     let id=vid;if(isNew){d.createdAt=Date.now();d.by=S.email;id=D.add(C('visits'),d)}else D.update(C('visits/'+vid),d);
     D.update(C('patients/'+pid),{updatedAt:Date.now(),lastJoint:st.joint,lastVisit:d.date});
     if(d.nextDate&&(isNew||d.nextDate!==v.nextDate))D.add(C('appointments'),{patientId:pid,patientName:p.nameEn||p.nameAr,date:d.nextDate,time:d.nextTime||'',type:'Follow-up',status:'scheduled',createdAt:Date.now(),fromVisit:id});
     toast('Visit saved'+(d.nextDate?' · follow-up booked':''));location.replace('#/visit/'+pid+'/'+id)};
   const pv=$('#prv');if(pv)pv.onclick=()=>visitPrintMenu(p,{...v,id:vid});
   const del=$('#del');if(del)del.onclick=()=>{if(del.dataset.armed){D.del(C('visits/'+vid));location.replace('#/p/'+pid)}else{del.dataset.armed=1;del.textContent='Tap again to delete'}}};
  draw();if(!isNew&&!isDoc())return}
function vVisitView(p,v,vid){shell('Visit '+fmt(v.date),`<div class="card">${visitSummaryHtml(v,false)}</div><div class="row" style="margin-top:10px"><button class="btn" id="prv">${I.print}Print</button></div>`,{back:true});$('#prv').onclick=()=>visitPrintMenu(p,v)}
function examLines(v){return EXAM[v.joint||'knee'].filter(([k])=>v.exam&&v.exam[k]).map(([k,l])=>`${l} ${v.exam[k]==='+'?'positive':'negative'}`)}
function romLine(v){return v.joint==='knee'?[v.romExt!==''&&v.romExt!=null?`extension deficit ${v.romExt}°`:'',v.romFlex?`flexion ${v.romFlex}°`:'',v.align?`alignment ${v.align.toLowerCase()}`:'',v.gait?`gait ${v.gait.toLowerCase()}`:''].filter(Boolean).join(', '):[v.romFF?`FF ${v.romFF}°`:'',v.romAbd?`ABD ${v.romAbd}°`:'',v.romER!==''&&v.romER!=null?`ER ${v.romER}°`:'',v.romIR?`IR ${v.romIR}`:''].filter(Boolean).join(', ')}
function visitSummaryHtml(v,forPrint){const dx=[...(v.dx||[]),v.dxOther].filter(Boolean);const ex=examLines(v);const rom=romLine(v);
  const row=(k,x)=>x?`<tr><th style="width:150px">${k}</th><td>${x}</td></tr>`:'';
  return`<table class="${forPrint?'':'mt'}" style="width:100%;border-collapse:collapse">${row('Joint',`${v.joint==='knee'?'Knee':'Shoulder'} – ${sideTxt(v.side)} · ${esc(v.vtype||'')}`)}${row('Complaint',esc(v.complaint)+(v.duration?' · '+esc(v.duration):''))}${row('Mechanism',esc(v.mechanism))}${row('History',esc(v.hx).replace(/\n/g,'<br>'))}
  ${row('Examination',[rom,ex.join('; '),esc(v.examNote)].filter(Boolean).join('<br>'))}${row('Imaging',esc(v.imaging).replace(/\n/g,'<br>'))}${row('Diagnosis',dx.map(esc).join('<br>'))}${row('Plan',[...(v.plan||[])].map(esc).join(', ')+(v.planNote?'<br>'+esc(v.planNote).replace(/\n/g,'<br>'):''))}${row('Next visit',v.nextDate?fmt(v.nextDate)+(v.nextTime?' '+esc(v.nextTime):''):'')}</table>`}

/* ================= surgery ================= */
async function vSurgery(pid,sid){const p=await getPatient(pid);const isNew=sid==='new';const s=isNew?{date:today(),joint:p.lastJoint||'knee',side:'R',anaes:'General',cart:{},createFU:true}:await D.get(C('surgeries/'+sid));if(!s)return shell('Surgery','<div class="empty">Not found.</div>',{back:true});
  const st={joint:s.joint,side:s.side};
  if(!isDoc())return shell(s.procedure,`<div class="card">${opNoteHtml(s)}</div><div class="row" style="margin-top:10px"><button class="btn" id="pro">${I.print}Operative note</button><button class="btn" id="pri">${I.print}Instructions</button></div>`,{back:true}),bindSurgPrint(p,s);
  const draw=()=>{const procs=PROC[st.joint];const cur=s.procedure&&procs.find(x=>x[0]===s.procedure)?s.procedure:procs[0][0];const pk=(procs.find(x=>x[0]===cur)||procs[0])[1];const pr=PROTO[pk];
   shell(isNew?'New surgery':s.procedure,`<div class="form" id="f">
   <div class="grid2"><label class="f">Date<input class="in" type="date" data-k="date" value="${esc(s.date)}"></label><label class="f">Anaesthesia<select class="in" data-k="anaes">${['General','Spinal','Regional block','General + block'].map(x=>`<option ${s.anaes===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
   <div class="seg" data-seg="joint">${[['knee','Knee'],['shoulder','Shoulder']].map(([v,l])=>`<button type="button" data-v="${v}" class="${st.joint===v?'on':''}">${l}</button>`).join('')}</div>
   <div class="seg" data-seg="side">${[['R','Right'],['L','Left'],['B','Bilateral']].map(([v,l])=>`<button type="button" data-v="${v}" class="${st.side===v?'on':''}">${l}</button>`).join('')}</div>
   <label class="f">Procedure<select class="in" id="proc">${procs.map(([n])=>`<option ${n===cur?'selected':''}>${esc(n)}</option>`).join('')}</select></label>
   <label class="f">Graft / implants / details<input class="in" data-k="details" value="${esc(s.details)}" placeholder="e.g. Hamstring graft 8.5 mm, 2 anchors 2.9 mm"></label>
   <div class="grid2"><label class="f">Position<input class="in" data-k="position" value="${esc(s.position||(st.joint==='knee'?'Supine':'Beach chair'))}"></label><label class="f">Tourniquet (min)<input class="in" type="number" data-k="tq" value="${s.tq??''}"></label></div>
   ${st.joint==='knee'?`<h3>Cartilage (Outerbridge)</h3><div class="grid2">${['MFC','MTP','LFC','LTP','Patella','Trochlea'].map(x=>`<label class="f">${x}<select class="in" data-c="${x}">${['','0','1','2','3','4'].map(g=>`<option ${String((s.cart||{})[x]??'')===g?'selected':''}>${g}</option>`).join('')}</select></label>`).join('')}</div>`
    :`<h3>Cuff</h3><div class="grid2"><label class="f">Tear size<select class="in" data-k="tearSize">${['','None','Partial','Small (<1 cm)','Medium (1–3 cm)','Large (3–5 cm)','Massive (>5 cm)'].map(x=>`<option ${s.tearSize===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="f">Retraction (Patte)<select class="in" data-k="patte">${['','1','2','3'].map(x=>`<option ${s.patte===x?'selected':''}>${x}</option>`).join('')}</select></label></div>`}
   <label class="f">Findings<textarea class="in" data-k="findings">${esc(s.findings)}</textarea></label>
   <label class="f">Procedure details<textarea class="in" data-k="steps" style="min-height:120px">${esc(s.steps)}</textarea></label>
   <label class="f">Closure / dressing<input class="in" data-k="closure" value="${esc(s.closure)}"></label>
   <label class="f">Complications<input class="in" data-k="complications" value="${esc(s.complications||'None')}"></label>
   <div class="card"><b>Post-op protocol: ${esc(pr.name)}</b><div class="fine">Follow-up at ${pr.days.map(d=>d<28?d/7+' w':d<365?Math.round(d/30)+' m':'1 y').join(', ')}: ${pr.days.map(d=>fmt(addDays(s.date,d))).join(' · ')}</div>
   ${isNew?`<label class="row" style="margin-top:8px"><input type="checkbox" data-k="createFU" ${s.createFU?'checked':''}> Book these follow-up appointments</label>`:''}</div>
   <button class="btn primary" id="save">Save surgery</button>${!isNew?`<button class="btn" id="pro">${I.print}Operative note</button><button class="btn" id="pri">${I.print}Patient instructions</button><button class="btn danger" id="del">Delete</button>`:''}</div>`,{back:true});
   $$('[data-seg]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{Object.assign(s,readForm($('#f')));st[g.dataset.seg]=b.dataset.v;if(g.dataset.seg==='joint')s.procedure=null;draw()}));
   $('#proc').onchange=()=>{Object.assign(s,readForm($('#f')));s.procedure=$('#proc').value;draw()};
   $('[data-k=date]').onchange=()=>{Object.assign(s,readForm($('#f')));s.procedure=$('#proc').value;draw()};
   $('#save').onclick=()=>{const d={...readForm($('#f')),joint:st.joint,side:st.side,procedure:$('#proc').value,protocol:pk,patientId:pid,updatedAt:Date.now(),cart:{}};
     $$('[data-c]').forEach(x=>{if(x.value!=='')d.cart[x.dataset.c]=x.value});
     let id=sid;if(isNew){d.createdAt=Date.now();d.by=S.email;id=D.add(C('surgeries'),d);
       if(d.createFU)pr.days.forEach((dd,i)=>D.add(C('appointments'),{patientId:pid,patientName:p.nameEn||p.nameAr,date:addDays(d.date,dd),time:'',type:'Post-op follow-up',note:`${d.procedure} · visit ${i+1}`,status:'scheduled',surgeryId:id,createdAt:Date.now()}))}
     else D.update(C('surgeries/'+sid),d);
     D.update(C('patients/'+pid),{updatedAt:Date.now(),lastJoint:st.joint});toast('Surgery saved'+(isNew&&d.createFU?` · ${pr.days.length} follow-ups booked`:''));location.replace('#/surgery/'+pid+'/'+id)};
   if(!isNew){bindSurgPrint(p,{...s,id:sid});const del=$('#del');del.onclick=()=>{if(del.dataset.armed){D.del(C('surgeries/'+sid));location.replace('#/p/'+pid)}else{del.dataset.armed=1;del.textContent='Tap again to delete'}}}};
  draw()}
function bindSurgPrint(p,s){const a=$('#pro'),b=$('#pri');if(a)a.onclick=()=>printDoc('op',p,{s});if(b)b.onclick=()=>langSheet(l=>printDoc('instr',p,{s,lang:l}))}
function opNoteHtml(s){const pr=PROTO[s.protocol]||{};const cart=Object.entries(s.cart||{}).map(([k,v])=>`${k} ${v}`).join(', ');
  const row=(k,x)=>x?`<tr><th style="width:150px">${k}</th><td>${x}</td></tr>`:'';
  return`<table style="width:100%;border-collapse:collapse">${row('Procedure',`<b>${esc(s.procedure)}</b> – ${sideTxt(s.side)} ${s.joint}`)}${row('Date',fmt(s.date))}${row('Anaesthesia',esc(s.anaes))}${row('Position',esc(s.position))}${row('Tourniquet',s.tq?s.tq+' min':'')}${row('Graft / implants',esc(s.details))}
  ${row('Cartilage (Outerbridge)',cart)}${row('Cuff tear',[s.tearSize,s.patte?'Patte '+s.patte:''].filter(Boolean).join(', '))}${row('Findings',esc(s.findings).replace(/\n/g,'<br>'))}${row('Procedure',esc(s.steps).replace(/\n/g,'<br>'))}${row('Closure',esc(s.closure))}${row('Complications',esc(s.complications))}
  ${row('Post-op protocol',pr.name?`${pr.name}; follow-up ${pr.days.map(d=>fmt(addDays(s.date,d))).join(', ')}`:'')}</table>`}

/* ================= scores ================= */
async function vScore(pid,scid){const p=await getPatient(pid);const isNew=scid==='new';const sc=isNew?{type:(p.lastJoint==='shoulder'?'ases':'lysholm'),date:today(),timepoint:'Pre-op',answers:{}}:await D.get(C('scores/'+scid));
  const draw=()=>{const d=SCORES[sc.type];const a=sc.answers;
   const qs=d.single?`<div class="q"><div class="opts">${d.single.map(([l,v])=>`<label><input type="radio" name="v" value="${v}" ${String(a.v)===String(v)?'checked':''}> ${esc(l)}</label>`).join('')}</div></div>`
    :d.num?`<div class="q"><div class="ql">${sc.type==='vas'?'Pain now (0 = none, 10 = worst)':'How would you rate your joint today as a percentage of normal?'}</div><input class="in" type="number" inputmode="numeric" min="${d.num[0]}" max="${d.num[1]}" step="${d.num[2]}" id="nv" value="${a.v??''}"></div>`
    :(d.vas?`<div class="q"><div class="ql">Pain on a scale of 0 (none) to 10 (worst)</div><input class="in" type="number" inputmode="numeric" min="0" max="10" id="vasv" value="${a.vas??''}"></div>`:'')+d.items.map(([l,opts],i)=>`<div class="q"><div class="ql">${i+1}. ${esc(l)}</div><div class="opts">${opts.map(([ol,v])=>`<label><input type="radio" name="i${i}" value="${v}" ${String(a['i'+i])===String(v)?'checked':''}> ${esc(ol)}${d.items.length>3&&!d.vas?` <span class="fine">(${v})</span>`:''}</label>`).join('')}</div></div>`).join('');
   const val=scoreValue(sc.type,a);
   shell(isNew?'New score':d.name,`<div class="form"><div class="grid2"><label class="f">Score<select class="in" id="type">${Object.entries(SCORES).map(([k,o])=>`<option value="${k}" ${sc.type===k?'selected':''}>${o.name}${o.joint!=='any'?' ('+o.joint+')':''}</option>`).join('')}</select></label><label class="f">Date<input class="in" type="date" id="dt" value="${esc(sc.date)}"></label></div>
   <label class="f">Time point<select class="in" id="tp">${TIMEPOINTS.map(x=>`<option ${sc.timepoint===x?'selected':''}>${x}</option>`).join('')}</select></label></div>
   <div id="qs">${qs}</div><div class="total"><span>${esc(d.name)}${val!=null&&d.interp?' · '+d.interp(val):''}</span><span class="v">${val??'—'}${d.max?` / ${d.max}`:''}</span></div>
   <div class="row" style="margin-top:12px"><button class="btn primary" id="save">Save score</button>${!isNew?'<button class="btn danger" id="del">Delete</button>':''}</div>`,{back:true});
   $('#type').onchange=()=>{sc.type=$('#type').value;sc.answers={};draw()};$('#dt').onchange=()=>sc.date=$('#dt').value;$('#tp').onchange=()=>sc.timepoint=$('#tp').value;
   $$('#qs input[type=radio]').forEach(r=>r.onchange=()=>{if(r.name==='v')a.v=+r.value;else a[r.name]=+r.value;const y=window.scrollY;draw();window.scrollTo(0,y)});
   const nv=$('#nv');if(nv)nv.oninput=()=>{a.v=nv.value===''?'':+nv.value;updTotal()};const vv=$('#vasv');if(vv)vv.oninput=()=>{a.vas=vv.value===''?'':+vv.value;updTotal()};
   function updTotal(){const x=scoreValue(sc.type,a);$('.total .v').textContent=`${x??'—'}${d.max?` / ${d.max}`:''}`}
   $('#save').onclick=()=>{const x=scoreValue(sc.type,a);if(x==null)return toast('Answer all the questions first');const doc={type:sc.type,date:sc.date,timepoint:sc.timepoint,answers:a,value:x,patientId:pid,updatedAt:Date.now(),by:S.email};
     if(isNew)D.add(C('scores'),{...doc,createdAt:Date.now()});else D.update(C('scores/'+scid),doc);D.update(C('patients/'+pid),{updatedAt:Date.now()});toast(`${SCORES[sc.type].name} ${x} saved`);location.replace('#/p/'+pid+'/scores')};
   const del=$('#del');if(del)del.onclick=()=>{if(del.dataset.armed){D.del(C('scores/'+scid));location.replace('#/p/'+pid+'/scores')}else{del.dataset.armed=1;del.textContent='Tap again to delete'}}};
  draw()}

/* ================= files ================= */
async function vFile(pid){const p=await getPatient(pid);shell('Add file',`<div class="form">
  <label class="f">Type<select class="in" id="kind">${['X-ray','MRI','CT','Clinical photo','Wound photo','Report','Other'].map(x=>`<option>${x}</option>`).join('')}</select></label>
  <label class="f">Date<input class="in" type="date" id="dt" value="${today()}"></label><label class="f">Caption<input class="in" id="cap" placeholder="e.g. Standing AP both knees"></label>
  <label class="btn primary" for="fi">${I.plus}Take photo or choose image</label><input id="fi" type="file" accept="image/*" hidden>
  <p class="fine">Images are compressed to about 300 KB and stored with the patient record.</p></div>`,{back:true});
  $('#fi').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=await compress(f,1600,.75);D.add(C('files'),{patientId:pid,kind:$('#kind').value,date:$('#dt').value,caption:$('#cap').value,data,createdAt:Date.now(),by:S.email});D.update(C('patients/'+pid),{updatedAt:Date.now()});toast('File saved');location.replace('#/p/'+pid+'/files')}catch{toast('Could not read that image')}}}
function compress(file,max,q){return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);let d=c.toDataURL('image/jpeg',q);if(d.length>900000)d=c.toDataURL('image/jpeg',.5);res(d)};im.onerror=rej;im.src=url})}
function fileSheet(f,p){if(!f)return;sheet(`<img src="${f.data}" style="width:100%;border-radius:8px" alt=""><p><b>${esc(f.kind)}</b> · ${fmt(f.date)}<br>${esc(f.caption||'')}</p><div class="row"><button class="btn" data-close>Close</button><button class="btn" id="shf">Share</button>${isDoc()?'<button class="btn danger" id="delf">Delete</button>':''}</div>`);
  $('#shf').onclick=()=>shareDataUrl(f.data,`${(p.nameEn||'patient').replace(/\W+/g,'_')}_${f.kind}.jpg`,'image/jpeg');
  const d=$('#delf');if(d)d.onclick=()=>{if(d.dataset.armed){D.del(C('files/'+f.id));closeSheet();render()}else{d.dataset.armed=1;d.textContent='Tap again to delete'}}}
function sheet(html){closeSheet();const s=document.createElement('div');s.className='sheet';s.innerHTML=`<div class="box">${html}</div>`;s.onclick=e=>{if(e.target===s||e.target.hasAttribute('data-close'))closeSheet()};document.body.appendChild(s)}
function closeSheet(){const s=$('.sheet');if(s)s.remove()}

/* ================= appointments & schedule ================= */
async function vAppt(a,pid){const pre=a==='new'?pid:null;let picked=pre?await getPatient(pre):null;
  const draw=()=>{shell('New appointment',`<div class="form">${picked?`<div class="item">${esc(picked.nameEn||picked.nameAr)}<span class="m"></span><button class="btn sm" id="chg">Change</button></div>`:`<input class="in" id="q" placeholder="Search patient"><div class="list" id="pl"></div>`}
   <div class="grid2"><label class="f">Date<input class="in" type="date" id="dt" value="${addDays(today(),1)}"></label><label class="f">Time<input class="in" type="time" id="tm"></label></div>
   <label class="f">Type<select class="in" id="ty">${['Follow-up','New visit','Post-op follow-up','Injection','Dressing / stitches','Physiotherapy review'].map(x=>`<option>${x}</option>`).join('')}</select></label>
   <label class="f">Note<input class="in" id="nt"></label><button class="btn primary" id="save">Book appointment</button></div>`,{back:true});
   const ch=$('#chg');if(ch)ch.onclick=()=>{picked=null;draw()};
   const q=$('#q');if(q){const f=()=>{const s=q.value.trim().toLowerCase();$('#pl').innerHTML=S.patients.filter(p=>!s||[p.nameEn,p.nameAr,p.phone,p.fileNo].some(x=>String(x||'').toLowerCase().includes(s))).slice(0,8).map(p=>`<button class="item" data-pick="${p.id}">${esc(p.nameEn||p.nameAr)}<span class="m"></span><span class="r">${esc(p.fileNo||'')}</span></button>`).join('');$$('[data-pick]').forEach(b=>b.onclick=()=>{picked=patient(b.dataset.pick);draw()})};q.oninput=f;f()}
   $('#save').onclick=()=>{if(!picked)return toast('Choose a patient');D.add(C('appointments'),{patientId:picked.id,patientName:picked.nameEn||picked.nameAr,date:$('#dt').value,time:$('#tm').value,type:$('#ty').value,note:$('#nt').value,status:'scheduled',createdAt:Date.now(),by:S.email});toast('Appointment booked');history.back()}};draw()}
async function vSchedule(date){const d=date||today();const l=await D.list(C('appointments'),[['date','==',d]]);l.sort((a,b)=>(a.time||'99').localeCompare(b.time||'99'));window._dayAppts=l;
  const sched=l.filter(a=>a.status==='scheduled'),done=l.filter(a=>a.status!=='scheduled');
  shell('Schedule',`<div class="row" style="justify-content:space-between"><a class="btn sm" href="#/schedule/${addDays(d,-1)}">${I.back}</a><input class="in" type="date" id="dp" value="${d}" style="max-width:190px"><a class="btn sm" href="#/schedule/${addDays(d,1)}" style="transform:scaleX(-1)">${I.back}</a></div>
  <h3>${esc(dayName(d))}${d===today()?' · today':''}</h3>${apptList(sched)||'<div class="empty">No scheduled appointments.</div>'}
  ${done.length?`<h3>Done</h3><div class="list">${done.map(a=>{const p=patient(a.patientId)||{};return`<a class="item" href="#/p/${a.patientId}"><span class="av">${esc(a.time||'—')}</span><span class="m"><span class="t">${esc(p.nameEn||a.patientName)}</span><span class="s">${esc(a.type)}</span></span><span class="tag ${a.status==='attended'?'ok':'bad'}">${esc(a.status)}</span></a>`}).join('')}</div>`:''}
  <div class="row" style="margin-top:12px"><a class="btn primary" href="#/appt/new">${I.plus}New appointment</a><button class="btn" id="waAll">${I.wa}Remind all</button></div>`);
  $('#dp').onchange=e=>location.hash='#/schedule/'+e.target.value;bindAppt();
  $('#waAll').onclick=()=>{if(!sched.length)return toast('No one to remind');sheet(`<b>Send reminders</b><p class="fine">WhatsApp opens once per patient; send, then come back and tap the next one.</p><div class="list">${sched.map(a=>{const p=patient(a.patientId)||{};return`<button class="item" data-wa="${a.id}">${I.wa}<span class="m">${esc(p.nameEn||a.patientName)}</span><span class="r">${esc(a.time||'')}</span></button>`}).join('')}</div><button class="btn" data-close style="margin-top:10px">Close</button>`);$$('.sheet [data-wa]').forEach(b=>b.onclick=()=>{const a=sched.find(x=>x.id===b.dataset.wa);waReminder(a);b.style.opacity=.5})}}

/* ================= stats ================= */
async function vStats(){shell('Statistics','<div class="empty">Loading…</div>');
  const [visits,surg,scores,appts]=await Promise.all([D.list(C('visits')),D.list(C('surgeries')),D.list(C('scores')),D.list(C('appointments'))]);
  const y=String(new Date().getFullYear()),m=today().slice(0,7);
  const byProc={};surg.forEach(s=>{byProc[s.procedure]=(byProc[s.procedure]||0)+1});const procs=Object.entries(byProc).sort((a,b)=>b[1]-a[1]);const maxP=procs.length?procs[0][1]:1;
  const byDx={};visits.forEach(v=>(v.dx||[]).forEach(x=>byDx[x]=(byDx[x]||0)+1));const dxs=Object.entries(byDx).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const past=appts.filter(a=>a.date<today()||a.status!=='scheduled');const att=past.filter(a=>a.status==='attended').length,miss=past.filter(a=>a.status==='missed').length;
  const imp=Object.keys(SCORES).map(t=>{const pts={};scores.filter(s=>s.type===t).forEach(s=>{(pts[s.patientId]=pts[s.patientId]||[]).push(s)});const pairs=Object.values(pts).map(l=>{l.sort((a,b)=>a.date.localeCompare(b.date));const pre=l.find(s=>s.timepoint==='Pre-op')||l[0];const last=l[l.length-1];return pre!==last?[pre.value,last.value]:null}).filter(Boolean);
    if(!pairs.length)return null;const mean=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10;return[t,pairs.length,mean(pairs.map(p=>p[0])),mean(pairs.map(p=>p[1]))]}).filter(Boolean);
  shell('Statistics',`<div class="stats"><div class="stat"><div class="k">Patients</div><div class="v">${S.patients.length}</div></div><div class="stat"><div class="k">Visits this month</div><div class="v">${visits.filter(v=>(v.date||'').startsWith(m)).length}</div></div><div class="stat"><div class="k">Surgeries ${y}</div><div class="v">${surg.filter(s=>(s.date||'').startsWith(y)).length}</div></div><div class="stat"><div class="k">Attendance</div><div class="v">${att+miss?Math.round(att/(att+miss)*100)+'%':'—'}</div></div></div>
  <h3>Surgeries by procedure</h3>${procs.length?`<div class="card list">${procs.map(([k,n])=>`<div><div class="row" style="justify-content:space-between"><span>${esc(k)}</span><b class="meta">${n}</b></div><div class="bar"><i style="width:${n/maxP*100}%"></i></div></div>`).join('')}</div>`:'<div class="empty">No surgeries recorded.</div>'}
  <h3>Outcome scores: first vs latest</h3>${imp.length?`<div class="card"><table style="width:100%;border-collapse:collapse;font-size:14px"><tr><th style="text-align:left">Score</th><th>Patients</th><th>Pre / first</th><th>Latest</th></tr>${imp.map(([t,n,a,b])=>`<tr><td>${esc(SCORES[t].name)}</td><td class="meta" style="text-align:center">${n}</td><td class="meta" style="text-align:center">${a}</td><td class="meta" style="text-align:center"><b>${b}</b></td></tr>`).join('')}</table></div>`:'<div class="empty">Needs at least two scores of the same type for a patient.</div>'}
  <h3>Common diagnoses</h3>${dxs.length?`<div class="card list">${dxs.map(([k,n])=>`<div class="row" style="justify-content:space-between"><span>${esc(k)}</span><b class="meta">${n}</b></div>`).join('')}</div>`:'<div class="empty">No diagnoses yet.</div>'}
  <h3>Follow-up</h3><div class="card">Attended <b>${att}</b> · Missed <b>${miss}</b> · Overdue now <b>${S.appts.filter(a=>a.date<today()).length}</b></div>`)}

/* ================= more / settings ================= */
function vMore(){shell('More',`<div class="card"><b>${esc(S.name||S.email)}</b><div class="fine">${esc(S.email)} · ${S.role==='doctor'?'Doctor':'Assistant'} · ${S.mode==='local'?'Demo on this phone':'Clinic database'}</div></div>
  <div class="list" style="margin-top:12px">
  ${isDoc()?'<a class="item" href="#/clinic"><span class="m"><span class="t">Clinic details and letterhead</span><span class="s">Names in English and Arabic, address, phone</span></span></a>':''}
  ${isDoc()&&S.mode==='cloud'?'<a class="item" href="#/team"><span class="m"><span class="t">Team</span><span class="s">Add assistants and doctors</span></span></a><a class="item" href="#/setup-code"><span class="m"><span class="t">Clinic setup code</span><span class="s">For installing the app on an assistant’s phone</span></span></a>':''}
  ${isDoc()?'<a class="item" href="#/backup"><span class="m"><span class="t">Backup</span><span class="s">Export all records to a file</span></span></a>':''}
  <div class="item"><span class="m"><span class="t">Patient documents language</span><span class="s">Instructions and WhatsApp reminders</span></span><div class="seg" id="lang" style="width:150px"><button data-v="ar" class="${S.lang==='ar'?'on':''}">عربي</button><button data-v="en" class="${S.lang==='en'?'on':''}">English</button></div></div>
  ${S.mode==='local'?'<button class="item" id="connect"><span class="m"><span class="t">Connect clinic database</span><span class="s">Leave demo mode</span></span></button>':'<button class="item" id="out"><span class="m"><span class="t">Sign out</span></span></button>'}
  </div><p class="fine" style="margin-top:16px">Records stay private to your clinic team. Follow your local rules on storing patient data, and keep regular backups. Version 1.0</p>`);
  $$('#lang button').forEach(b=>b.onclick=()=>{S.lang=b.dataset.v;try{localStorage.setItem('lang',S.lang)}catch{}vMore()});
  const o=$('#out');if(o)o.onclick=()=>FB.signOut(auth).then(()=>location.reload());
  const c=$('#connect');if(c)c.onclick=()=>{try{localStorage.removeItem('mode')}catch{}location.reload()}}
function vClinic(){const c=S.clinic||{};shell('Clinic details',`<div class="form" id="f">
  <p class="fine">Shown on the letterhead of every printed document and in WhatsApp reminders.</p>
  <label class="f">Clinic name (English)<input class="in" data-k="nameEn" value="${esc(c.nameEn)}"></label><label class="f">اسم العيادة<input class="in ar" dir="rtl" data-k="nameAr" value="${esc(c.nameAr)}"></label>
  <label class="f">Doctor (English)<input class="in" data-k="doctorEn" value="${esc(c.doctorEn)}"></label><label class="f">اسم الطبيب<input class="in ar" dir="rtl" data-k="doctorAr" value="${esc(c.doctorAr)}"></label>
  <label class="f">Title (English)<input class="in" data-k="titleEn" value="${esc(c.titleEn||'Consultant Orthopaedic Surgeon · Knee & Shoulder Arthroscopy')}"></label><label class="f">اللقب<input class="in ar" dir="rtl" data-k="titleAr" value="${esc(c.titleAr||'استشاري جراحة العظام · مناظير الركبة والكتف')}"></label>
  <label class="f">Address (English)<input class="in" data-k="addressEn" value="${esc(c.addressEn)}"></label><label class="f">العنوان<input class="in ar" dir="rtl" data-k="addressAr" value="${esc(c.addressAr)}"></label>
  <label class="f">Phone<input class="in" data-k="phone" value="${esc(c.phone)}"></label><button class="btn primary" id="save">Save</button></div>`,{back:true});
  $('#save').onclick=()=>{const d=readForm($('#f'));S.clinic={...S.clinic,...d};D.update('clinics/'+S.cid,d);toast('Saved');history.back()}}
async function vTeam(){const mem=await D.list(C('members'));shell('Team',`<div class="list">${mem.map(m=>`<div class="item"><span class="m"><span class="t">${esc(m.name||m.id)}</span><span class="s">${esc(m.id)}</span></span><span class="tag ${m.role==='doctor'?'ok':'mut'}">${esc(m.role)}</span>${m.id!==S.email?`<button class="btn sm danger" data-rm="${esc(m.id)}">Remove</button>`:''}</div>`).join('')}</div>
  <h3>Add a team member</h3><div class="form" id="f"><label class="f">Name<input class="in" id="nm"></label><label class="f">Email (they sign up with this)<input class="in" type="email" id="em"></label>
  <label class="f">Role<select class="in" id="rl"><option value="assistant">Assistant: registration, appointments, scores, files</option><option value="doctor">Doctor: everything, including visits and surgeries</option></select></label><button class="btn primary" id="add">Add</button></div>`,{back:true});
  $('#add').onclick=()=>{const e=$('#em').value.trim().toLowerCase();if(!e.includes('@'))return toast('Enter an email');D.set(C('members/'+e),{role:$('#rl').value,name:$('#nm').value,email:e});D.set('memberships/'+e,{clinicId:S.cid,role:$('#rl').value});toast('Added. They can now create an account with '+e);setTimeout(vTeam,400)};
  $$('[data-rm]').forEach(b=>b.onclick=()=>{if(b.dataset.armed){D.del(C('members/'+b.dataset.rm));D.del('memberships/'+b.dataset.rm);setTimeout(vTeam,300)}else{b.dataset.armed=1;b.textContent='Confirm'}})}
function vSetupCode(){const code=btoa(unescape(encodeURIComponent(JSON.stringify(getConfig()))));shell('Clinic setup code',`<p>On the assistant’s phone: install the app, paste this code on the first screen, then sign in.</p><textarea class="in" readonly id="code" style="min-height:140px;font-family:var(--f-num);font-size:12px">${code}</textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cp">Copy</button><button class="btn" id="sh">${I.wa}Send</button></div><p class="fine">The code only tells the app which database to use. Access still needs an account you added under Team.</p>`,{back:true});
  $('#cp').onclick=()=>navigator.clipboard.writeText(code).then(()=>toast('Copied')).catch(()=>{$('#code').select()});$('#sh').onclick=()=>shareText(code)}
async function vBackup(){shell('Backup',`<p>Exports every record (patients, visits, surgeries, scores, appointments and files) to one JSON file you can keep on Google Drive or a computer.</p><button class="btn primary" id="go">Export backup</button><p class="fine" id="st"></p>`,{back:true});
  $('#go').onclick=async()=>{$('#st').textContent='Collecting records…';const out={exportedAt:new Date().toISOString(),clinic:S.clinic};for(const c of ['patients','visits','surgeries','scores','appointments','files'])out[c]=await D.list(C(c));
    const blob=new Blob([JSON.stringify(out)],{type:'application/json'});$('#st').textContent=`${out.patients.length} patients, ${out.visits.length} visits, ${out.surgeries.length} surgeries.`;await shareBlob(blob,`clinic-backup-${today()}.json`,'application/json')}}

/* ================= printing (PDF) ================= */
function printMenu(p,visits,surg){const vs=[...visits].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5),ss=[...surg].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,5);
  sheet(`<b>Print or share</b><div class="list" style="margin-top:10px">
   ${vs.map(v=>`<button class="item" data-pv="${v.id}"><span class="m"><span class="t">Visit ${fmt(v.date)}</span><span class="s">Report, prescription or instructions</span></span></button>`).join('')}
   ${ss.map(s=>`<button class="item" data-op="${s.id}"><span class="m"><span class="t">Operative note · ${esc(s.procedure)}</span><span class="s">${fmt(s.date)}</span></span></button><button class="item" data-pi="${s.id}"><span class="m"><span class="t">Post-op instructions · ${esc(s.procedure)}</span><span class="s">With follow-up dates</span></span></button>`).join('')}
   <button class="item" id="psum"><span class="m"><span class="t">Patient summary</span><span class="s">All visits, surgeries and scores</span></span></button></div><button class="btn" data-close style="margin-top:10px">Close</button>`);
  $$('[data-pv]').forEach(b=>b.onclick=()=>{closeSheet();visitPrintMenu(p,visits.find(v=>v.id===b.dataset.pv))});
  $$('[data-op]').forEach(b=>b.onclick=()=>{closeSheet();printDoc('op',p,{s:surg.find(s=>s.id===b.dataset.op)})});
  $$('[data-pi]').forEach(b=>b.onclick=()=>{closeSheet();langSheet(l=>printDoc('instr',p,{s:surg.find(s=>s.id===b.dataset.pi),lang:l}))});
  $('#psum').onclick=()=>{closeSheet();printDoc('summary',p,{visits,surg})}}
function visitPrintMenu(p,v){sheet(`<b>Visit ${fmt(v.date)}</b><div class="list" style="margin-top:10px"><button class="item" id="a"><span class="m"><span class="t">Visit report</span></span></button>${v.rx?'<button class="item" id="b"><span class="m"><span class="t">Prescription</span></span></button>':''}${v.instr&&v.instr!=='none'?'<button class="item" id="c"><span class="m"><span class="t">Patient instructions</span></span></button>':''}</div><button class="btn" data-close style="margin-top:10px">Close</button>`);
  $('#a').onclick=()=>{closeSheet();printDoc('visit',p,{v})};const b=$('#b');if(b)b.onclick=()=>{closeSheet();printDoc('rx',p,{v})};const c=$('#c');if(c)c.onclick=()=>{closeSheet();langSheet(l=>printDoc('vinstr',p,{v,lang:l}))}}
function langSheet(cb){sheet(`<b>Instructions language</b><div class="row" style="margin-top:10px"><button class="btn primary" data-l="ar">عربي</button><button class="btn" data-l="en">English</button><button class="btn" data-l="both">Both</button></div>`);$$('[data-l]').forEach(b=>b.onclick=()=>{closeSheet();cb(b.dataset.l)})}
function letterhead(){const c=S.clinic||{};return`<div class="lh"><div class="en"><b>${esc(c.doctorEn||'')}</b>${esc(c.titleEn||'')}<br>${esc(c.nameEn||'')}${c.addressEn?'<br>'+esc(c.addressEn):''}${c.phone?' · '+esc(c.phone):''}</div><div class="arb" dir="rtl"><b>${esc(c.doctorAr||'')}</b>${esc(c.titleAr||'')}<br>${esc(c.nameAr||'')}${c.addressAr?'<br>'+esc(c.addressAr):''}</div></div>`}
function ptBar(p,date,extra=''){return`<div class="pt"><span><b>Patient:</b> ${esc(p.nameEn||'')}${p.nameAr?` <span dir="rtl">${esc(p.nameAr)}</span>`:''}</span><span><b>File:</b> ${esc(p.fileNo||'—')}</span><span><b>Age/Sex:</b> ${ageOf(p)??'—'} / ${p.sex||'—'}</span><span><b>Date:</b> ${fmt(date)}</span>${extra}</div>`}
function instrBlock(lines,lang,title,titleAr,sched){const en=`<h4>${esc(title)}</h4><ol>${lines.en.map(l=>`<li>${esc(l)}</li>`).join('')}</ol>${sched?`<h4>Follow-up appointments</h4><table>${sched.map((d,i)=>`<tr><td>${i+1}</td><td>${fmt(d)}</td><td>${esc(dayName(d))}</td></tr>`).join('')}</table>`:''}`;
  const ar=`<div class="rtl" dir="rtl"><h4 style="text-align:right;letter-spacing:0">${esc(titleAr)}</h4>${lines.ar.map((l,i)=>`<p style="margin:0 0 6px"><b>${(i+1).toLocaleString('ar-EG')}.</b> ${esc(l)}</p>`).join('')}${sched?`<h4 style="text-align:right;letter-spacing:0">مواعيد المتابعة</h4><table>${sched.map((d,i)=>`<tr><td>${i+1}</td><td>${esc(fmtAr(d))}</td></tr>`).join('')}</table>`:''}</div>`;
  return lang==='en'?en:lang==='ar'?ar:ar+'<div style="height:14px"></div>'+en}
async function printDoc(kind,p,o){toast('Preparing PDF…');let title='',body='',date=today(),fname='';
  const sig=`<div class="sig"><span>Signature: ____________________</span><span>${esc((S.clinic||{}).doctorEn||'')}</span></div>`;
  if(kind==='visit'){const v=o.v;date=v.date;title='Clinic visit report';body=`<div class="ttl">Clinic visit report</div>${visitSummaryHtml(v,true)}${v.rx?`<h4>Prescription</h4><div dir="auto" style="white-space:pre-line">${esc(v.rx)}</div>`:''}${sig}`;fname='visit'}
  if(kind==='rx'){const v=o.v;date=v.date;title='Prescription';body=`<div class="rx">℞</div><div dir="auto" style="white-space:pre-line;font-size:15px;line-height:2">${esc(v.rx)}</div>${v.nextDate?`<p style="margin-top:20px"><b>Next visit:</b> ${fmt(v.nextDate)} · <span dir="rtl">موعد المتابعة: ${esc(fmtAr(v.nextDate))}</span></p>`:''}${sig}`;fname='prescription'}
  if(kind==='op'){const s=o.s;date=s.date;title='Operative note';body=`<div class="ttl">Operative note</div>${opNoteHtml(s)}${sig}`;fname='operative-note'}
  if(kind==='instr'){const s=o.s;date=s.date;const pr=PROTO[s.protocol]||PROTO.scope;const lines={en:[...pr.en,...COMMON.en],ar:[...pr.ar,...COMMON.ar]};
    const sched=pr.days.map(d=>addDays(s.date,d));body=`<div class="ttl">${o.lang==='en'?'After your operation':o.lang==='ar'?'<span dir="rtl" style="display:block;text-align:right">تعليمات ما بعد العملية</span>':'Post-operative instructions · تعليمات ما بعد العملية'}</div><p>${esc(s.procedure)} · ${sideTxt(s.side)} ${esc(s.joint)} · ${fmt(s.date)}</p>${instrBlock(lines,o.lang,'Instructions','التعليمات',sched)}`;title='Post-operative instructions';fname='instructions'}
  if(kind==='vinstr'){const v=o.v;date=v.date;const t=VISIT_INSTR[v.instr]||VISIT_INSTR.none;body=`<div class="ttl">${esc(t.name)}</div>${instrBlock(t,o.lang,'Instructions','التعليمات',null)}${v.nextDate?`<p style="margin-top:14px"><b>Next visit:</b> ${fmt(v.nextDate)} · <span dir="rtl">موعد المتابعة: ${esc(fmtAr(v.nextDate))}</span></p>`:''}`;title='Instructions';fname='instructions'}
  if(kind==='summary'){const scores=await D.list(C('scores'),[['patientId','==',p.id]]);title='Patient summary';fname='summary';
    body=`<div class="ttl">Patient summary</div>${p.history?`<h4>History</h4><p>${esc(p.history)}</p>`:''}<h4>Surgeries</h4>${o.surg.length?`<table>${o.surg.sort((a,b)=>a.date.localeCompare(b.date)).map(s=>`<tr><td style="width:100px">${fmt(s.date)}</td><td>${esc(s.procedure)} – ${sideTxt(s.side)}</td><td>${esc(s.details||'')}</td></tr>`).join('')}</table>`:'<p>None</p>'}
    <h4>Visits</h4>${o.visits.length?`<table>${o.visits.sort((a,b)=>a.date.localeCompare(b.date)).map(v=>`<tr><td style="width:100px">${fmt(v.date)}</td><td>${v.joint} ${sideTxt(v.side)}</td><td>${esc([...(v.dx||[]),v.dxOther].filter(Boolean).join(', '))}</td><td>${esc((v.plan||[]).join(', '))}</td></tr>`).join('')}</table>`:'<p>None</p>'}
    <h4>Outcome scores</h4>${scores.length?`<table>${scores.sort((a,b)=>a.date.localeCompare(b.date)).map(s=>`<tr><td style="width:100px">${fmt(s.date)}</td><td>${esc(SCORES[s.type].name)}</td><td>${esc(s.timepoint)}</td><td><b>${s.value}</b></td></tr>`).join('')}</table>`:'<p>None</p>'}${sig}`}
  const html=`<div class="page">${letterhead()}${ptBar(p,date)}${body}<div class="foot">${esc((S.clinic||{}).nameEn||'')} · Printed ${fmt(today())}</div></div>`;
  try{const blob=await htmlToPdf(html);await shareBlob(blob,`${(p.nameEn||'patient').replace(/\W+/g,'_')}_${fname}_${date}.pdf`,'application/pdf')}catch(e){console.error(e);toast('Could not create the PDF')}}
async function htmlToPdf(html){const root=$('#printRoot');root.innerHTML=html;await document.fonts.ready;const el=root.firstElementChild;
  const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff',useCORS:true});root.innerHTML='';
  const pdf=new jsPDF({unit:'pt',format:'a4'});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
  const pxPerPage=Math.floor(canvas.width*ph/pw);let y=0,first=true;
  while(y<canvas.height){const h=Math.min(pxPerPage,canvas.height-y);const c=document.createElement('canvas');c.width=canvas.width;c.height=h;c.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
    if(!first)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,pw,h*pw/canvas.width);first=false;y+=h}
  return pdf.output('blob')}
async function blobToB64(b){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(b)})}
async function shareBlob(blob,name,type){
  if(isNative&&window.Capacitor.Plugins.Filesystem){try{const {Filesystem,Share}=window.Capacitor.Plugins;const w=await Filesystem.writeFile({path:name,data:await blobToB64(blob),directory:'CACHE'});await Share.share({title:name,files:[w.uri]});return}catch(e){if(String(e).includes('cancel'))return;console.error(e)}}
  const file=new File([blob],name,{type});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
  const url=URL.createObjectURL(blob);if(type==='application/pdf'){const w=window.open(url,'_blank');if(w)return}const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Saved '+name)}
async function shareDataUrl(d,name,type){const b=await (await fetch(d)).blob();shareBlob(b,name,type)}
async function shareText(t){if(isNative&&window.Capacitor.Plugins.Share)return window.Capacitor.Plugins.Share.share({text:t});if(navigator.share)return navigator.share({text:t}).catch(()=>{});navigator.clipboard.writeText(t).then(()=>toast('Copied'))}

/* ================= demo data ================= */
async function seedDemo(){const t=today();await LocalDB.set('clinics/local',{nameEn:'Knee & Shoulder Clinic',nameAr:'عيادة الركبة والكتف',doctorEn:'Dr. Elsayed Elforse',doctorAr:'',titleEn:'Consultant Orthopaedic Surgeon · Knee & Shoulder Arthroscopy',titleAr:'استشاري جراحة العظام · مناظير الركبة والكتف',phone:'',addressEn:'',addressAr:''});
  const P=[['Ahmed Samir','أحمد سمير','M',24,'01001234567','Footballer'],['Mona Adel','منى عادل','F',58,'01112345678','Teacher'],['Omar Khaled','عمر خالد','M',19,'01223456789','Student, handball'],['Hoda Mahmoud','هدى محمود','F',51,'01098765432','Office work']];
  const ids=[];for(const [n,a,s,age,ph,occ] of P){const id=LocalDB.add('clinics/local/patients',{nameEn:n,nameAr:a,sex:s,birthYear:new Date().getFullYear()-age,phone:ph,occupation:occ,fileNo:'26-'+String(ids.length+1).padStart(4,'0'),createdAt:Date.now(),updatedAt:Date.now()-ids.length*1000,lastJoint:ids.length===3?'shoulder':'knee'});ids.push(id)}
  const V=(i,o)=>LocalDB.add('clinics/local/visits',{patientId:ids[i],createdAt:Date.now(),...o});
  V(0,{date:addDays(t,-70),joint:'knee',side:'R',vtype:'New',complaint:'Right knee giving way after football twist',duration:'3 weeks',mechanism:'Non-contact pivoting',exam:{eff:'+',lach:'+',piv:'+',mcm:'-'},romExt:0,romFlex:130,imaging:'MRI: complete ACL tear, intact menisci',dx:['ACL tear'],plan:['Physiotherapy','Surgery recommended'],planNote:'Prehab 3–4 weeks then ACL reconstruction',instr:'acute'});
  const s0=LocalDB.add('clinics/local/surgeries',{patientId:ids[0],date:addDays(t,-42),joint:'knee',side:'R',procedure:'ACL reconstruction',protocol:'acl',anaes:'Spinal',details:'Hamstring autograft 8.5 mm, suspensory femoral, interference screw tibia',position:'Supine',tq:65,cart:{MFC:'0',MTP:'0',LFC:'1',LTP:'0'},findings:'Complete ACL tear; menisci intact',steps:'Standard AL/AM portals. Graft harvested, prepared as quadrupled hamstring…',closure:'Layers, skin staples',complications:'None',createdAt:Date.now()});
  [14,42,90,180,270,365].forEach((d,i)=>LocalDB.add('clinics/local/appointments',{patientId:ids[0],patientName:P[0][0],date:addDays(addDays(t,-42),d),time:'',type:'Post-op follow-up',note:`ACL reconstruction · visit ${i+1}`,status:d<42?'attended':'scheduled',surgeryId:s0,createdAt:Date.now()}));
  LocalDB.add('clinics/local/scores',{patientId:ids[0],type:'lysholm',date:addDays(t,-70),timepoint:'Pre-op',value:52,answers:{},createdAt:Date.now()});
  LocalDB.add('clinics/local/scores',{patientId:ids[0],type:'lysholm',date:addDays(t,-1),timepoint:'6 weeks',value:71,answers:{},createdAt:Date.now()});
  V(1,{date:addDays(t,-20),joint:'knee',side:'L',vtype:'New',complaint:'Left knee medial pain on walking and stairs',duration:'2 years',exam:{mjlt:'+',eff:'-'},romExt:5,romFlex:115,align:'Varus',gait:'Antalgic',imaging:'Standing X-ray: medial joint-space narrowing, KL 3',dx:['Knee osteoarthritis – medial','Varus malalignment'],plan:['Physiotherapy','Hyaluronic acid injection','X-ray requested'],planNote:'Long-leg standing film to plan HTO if symptoms persist',rx:'Tab. Diclofenac 50 mg 1×2 after meals for 10 days\nGel topical 3×/day',instr:'kneeoa',nextDate:t,nextTime:'18:30'});
  LocalDB.add('clinics/local/appointments',{patientId:ids[1],patientName:P[1][0],date:t,time:'18:30',type:'Follow-up',status:'scheduled',createdAt:Date.now()});
  LocalDB.add('clinics/local/scores',{patientId:ids[1],type:'vas',date:addDays(t,-20),timepoint:'Pre-op',value:7,answers:{v:7},createdAt:Date.now()});
  V(2,{date:addDays(t,-5),joint:'knee',side:'L',vtype:'New',complaint:'Recurrent patellar dislocation (3 episodes)',exam:{papp:'+',jsg:'+'},dx:['Patellofemoral instability'],plan:['MRI requested','CT requested'],planNote:'CT for TT–TG and anteversion; plan in PF planner',nextDate:addDays(t,2),nextTime:'19:00'});
  LocalDB.add('clinics/local/appointments',{patientId:ids[2],patientName:P[2][0],date:addDays(t,2),time:'19:00',type:'Follow-up',note:'Review CT',status:'scheduled',createdAt:Date.now()});
  V(3,{date:addDays(t,-100),joint:'shoulder',side:'R',vtype:'New',complaint:'Right shoulder pain at night, weakness lifting',duration:'6 months',exam:{jobe:'+',hawk:'+',neer:'+',drop:'-',belly:'-'},romFF:150,romAbd:140,romER:45,romIR:'L3',imaging:'MRI: full-thickness supraspinatus tear 2 cm, minimal retraction',dx:['Rotator cuff tear – full thickness'],plan:['Surgery recommended']});
  const s3=LocalDB.add('clinics/local/surgeries',{patientId:ids[3],date:addDays(t,-90),joint:'shoulder',side:'R',procedure:'Arthroscopic rotator cuff repair',protocol:'rcr',anaes:'General + block',details:'2 medial anchors, suture-bridge',position:'Beach chair',tearSize:'Medium (1–3 cm)',patte:'1',findings:'Crescent-shaped supraspinatus tear',complications:'None',createdAt:Date.now()});
  [14,42,90,180,365].forEach((d,i)=>LocalDB.add('clinics/local/appointments',{patientId:ids[3],patientName:P[3][0],date:addDays(addDays(t,-90),d),time:'',type:'Post-op follow-up',note:`Rotator cuff repair · visit ${i+1}`,status:d<90?'attended':d===90?'scheduled':'scheduled',surgeryId:s3,createdAt:Date.now()}));
  LocalDB.add('clinics/local/scores',{patientId:ids[3],type:'ases',date:addDays(t,-100),timepoint:'Pre-op',value:38.3,answers:{},createdAt:Date.now()});
  LocalDB.add('clinics/local/scores',{patientId:ids[3],type:'ases',date:addDays(t,-48),timepoint:'6 weeks',value:55,answers:{},createdAt:Date.now()});
  await new Promise(r=>setTimeout(r,300))}

window.__clinic={S,render,printDoc,htmlToPdf,getPatient,D:()=>D,C};
boot();
if('serviceWorker' in navigator&&!isNative&&/^https?:$/.test(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
