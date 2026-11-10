/* عيادة — إدارة العيادة بالعربي: الحجز بالواتساب، ملف المريض، الروشتات، الأشعة والتحاليل، الملاحظات الصوتية، متابعة العمليات والكسور، الحسابات.
   البيانات: Firebase (مشتركة بين الطبيب والمساعدين وتعمل بدون إنترنت) أو على هذا الجهاز فقط. */
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isNative=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
const diffDays=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
const fmt=s=>s?new Date(s+'T12:00:00').toLocaleDateString('ar-EG',{day:'numeric',month:'short',year:'numeric'}):'—';
const fmtLong=s=>s?new Date(s+'T12:00:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
const fmtDay=s=>s?new Date(s+'T12:00:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'}):'';
const fmtShort=s=>s?new Date(s+'T12:00:00').toLocaleDateString('ar-EG',{day:'numeric',month:'short'}):'';
const t12=t=>{if(!t)return'';const [h,m]=t.split(':').map(Number);const ap=h<12?'ص':'م';const hh=((h+11)%12)+1;return `${hh}:${pad(m)} ${ap}`};
const money=n=>(Math.round((+n||0)*100)/100).toLocaleString('en-US')+' ج';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const ageOf=p=>p&&p.birthYear?new Date().getFullYear()-(+p.birthYear):null;
const initials=p=>(((p&&p.name)||'؟').trim()[0]||'؟');
const nrm=s=>String(s||'').toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ً-ْ]/g,'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
let toastT;function toast(m){let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2800)}

const I={
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg>',
 today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M7 14h3M7 17h3M14 14h3"/></svg>',
 pts:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/></svg>',
 fu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 1014.9-4"/><path d="M19 3v5h-5"/><path d="M12 8v4l3 2"/></svg>',
 acc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 15h4"/></svg>',
 more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 print:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 8V3h10v5M7 17H4v-7a2 2 0 012-2h12a2 2 0 012 2v7h-3M7 14h10v7H7z"/></svg>',
 wa:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 000-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.3 2.2 2.2 0 00.2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>',
 edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
 cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
 rx:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 20V4h6a4 4 0 010 8H6M10 12l8 8M18 12l-8 8"/></svg>',
 file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>',
};

/* ================= ثوابت ================= */
const ST={booked:'محجوز',arrived:'وصل',in:'بالداخل',done:'انتهى',noshow:'لم يحضر',cancelled:'ملغي'};
const VT=[['kashf','كشف'],['reexam','استشارة / إعادة'],['fu','متابعة عملية / كسر'],['dress','غيار'],['sut','فك غرز'],['cast','جبس / فك جبس'],['inj','حقن'],['session','جلسة'],['other','أخرى']];
const VTN=Object.fromEntries(VT);
const PM=[['cash','نقدي'],['instapay','إنستاباي'],['vcash','فودافون كاش'],['card','فيزا'],['bank','تحويل بنكي']];
const PMN=Object.fromEntries(PM);
const EXPC=[['rent','إيجار'],['salary','مرتبات'],['util','كهرباء ومياه وإنترنت'],['supply','مستلزمات طبية'],['maint','صيانة'],['market','دعاية وتسويق'],['tax','ضرائب ورسوم'],['other','أخرى']];
const EXPN=Object.fromEntries(EXPC);
const FCAT=[['xray','أشعة عادية'],['mri','رنين مغناطيسي'],['ct','أشعة مقطعية'],['us','سونار'],['lab','تحاليل'],['rx','روشتة'],['report','تقرير'],['op','صور العملية'],['other','أخرى']];
const FCATN=Object.fromEntries(FCAT);

/* بروتوكولات المتابعة: [يوم, اسم المتابعة] */
const PROTO={
 surgery:{
  acl:{n:'رباط صليبي أمامي',m:[[3,'غيار على الجرح'],[14,'فك الغرز ومراجعة الحركة'],[42,'تقييم الحركة وقوة العضلات'],[90,'متابعة ٣ شهور'],[180,'تقييم العودة للجري'],[270,'تقييم العودة للرياضة'],[365,'متابعة سنة']]},
  menisc:{n:'منظار ركبة – استئصال جزئي للغضروف',m:[[3,'غيار'],[14,'فك الغرز'],[42,'متابعة ٦ أسابيع'],[90,'متابعة ٣ شهور']]},
  mrep:{n:'خياطة غضروف الركبة',m:[[3,'غيار'],[14,'فك الغرز'],[42,'زيادة الثني والتحميل'],[90,'متابعة ٣ شهور'],[180,'العودة للرياضة']]},
  hto:{n:'قطع عظمة حول الركبة (Osteotomy)',m:[[14,'فك الغرز'],[42,'أشعة ٦ أسابيع'],[84,'أشعة ٣ شهور – تحميل كامل'],[180,'أشعة ٦ شهور'],[365,'متابعة سنة / قرار فك الشريحة']]},
  tkr:{n:'مفصل ركبة صناعي',m:[[14,'فك الغرز'],[42,'تقييم الحركة'],[90,'متابعة ٣ شهور'],[365,'أشعة سنة']]},
  mpfl:{n:'خلع الرضفة (MPFL)',m:[[14,'فك الغرز'],[42,'إيقاف الدعامة'],[90,'متابعة ٣ شهور'],[180,'العودة للرياضة']]},
  rcr:{n:'خياطة أوتار الكتف',m:[[14,'فك الغرز'],[42,'إيقاف الحمالة وبداية الحركة النشطة'],[90,'متابعة ٣ شهور'],[180,'متابعة ٦ شهور'],[365,'متابعة سنة']]},
  inst:{n:'خلع الكتف المتكرر (Bankart / Latarjet)',m:[[14,'فك الغرز'],[42,'إيقاف الحمالة / أشعة'],[90,'متابعة ٣ شهور'],[180,'العودة للرياضة']]},
  scope:{n:'منظار كتف / تنظيف',m:[[14,'فك الغرز'],[42,'متابعة ٦ أسابيع'],[90,'متابعة ٣ شهور']]},
  other:{n:'عملية أخرى',m:[[14,'فك الغرز'],[42,'متابعة ٦ أسابيع'],[90,'متابعة ٣ شهور']]},
 },
 fracture:{
  cast:{n:'كسر – علاج تحفظي بالجبس',m:[[7,'أشعة بعد أسبوع (التأكد من الرد)'],[14,'أشعة أسبوعين'],[42,'فك الجبس وأشعة'],[90,'أشعة ٣ شهور']]},
  kw:{n:'كسر – أسلاك (K-wires)',m:[[7,'غيار وأشعة'],[21,'أشعة ٣ أسابيع'],[28,'فك الأسلاك'],[42,'أشعة وبداية الحركة'],[90,'متابعة ٣ شهور']]},
  orif:{n:'كسر – شريحة ومسامير',m:[[3,'غيار'],[14,'فك الغرز'],[42,'أشعة ٦ أسابيع'],[84,'أشعة ٣ شهور'],[180,'أشعة ٦ شهور – التئام'],[365,'متابعة سنة']]},
  nail:{n:'كسر – مسمار نخاعي',m:[[14,'فك الغرز'],[42,'أشعة ٦ أسابيع'],[84,'أشعة ٣ شهور'],[180,'أشعة ٦ شهور'],[365,'متابعة سنة']]},
  exfix:{n:'كسر – مثبت خارجي',m:[[7,'العناية بالمسامير'],[14,'متابعة أسبوعين'],[42,'أشعة ٦ أسابيع'],[84,'قرار فك المثبت'],[180,'متابعة ٦ شهور']]},
  arth:{n:'كسر – مفصل صناعي جزئي / كلي',m:[[14,'فك الغرز'],[42,'تقييم المشي'],[90,'متابعة ٣ شهور'],[365,'أشعة سنة']]},
  peds:{n:'كسر أطفال (فوق اللقمتين / الساعد)',m:[[7,'أشعة بعد أسبوع'],[21,'فك الأسلاك والجبس'],[42,'تقييم الحركة'],[180,'تقييم انحراف المفصل']]},
  spine:{n:'كسر الفقرات',m:[[14,'فك الغرز / متابعة'],[42,'أشعة ٦ أسابيع'],[90,'أشعة ٣ شهور'],[180,'متابعة ٦ شهور']]},
 }};
const UNION=[['','—'],['none','لا يوجد التئام'],['early','بداية تكوّن الكالس'],['callus','كالس واضح'],['united','التئام كامل'],['delayed','تأخر التئام'],['non','عدم التئام']];
const WOUND=[['','—'],['ok','سليم'],['red','احمرار'],['disch','إفرازات'],['inf','التهاب / عدوى'],['open','مفتوح']];

const DRUGS0=[
 {n:'Brufen 600 mg',f:'قرص مرتين يومياً بعد الأكل',u:'٥ أيام'},
 {n:'Cataflam 50 mg',f:'قرص ٣ مرات يومياً بعد الأكل',u:'٥ أيام'},
 {n:'Celebrex 200 mg',f:'كبسولة مرتين يومياً بعد الأكل',u:'أسبوع'},
 {n:'Arcoxia 90 mg',f:'قرص مرة يومياً بعد الأكل',u:'أسبوع'},
 {n:'Panadol Extra',f:'قرص عند اللزوم (حد أقصى ٦ يومياً)',u:'عند اللزوم'},
 {n:'Ketolac 10 mg',f:'قرص كل ٨ ساعات عند الألم',u:'٣ أيام'},
 {n:'Nexium 40 mg',f:'قرص مرة يومياً قبل الإفطار',u:'أسبوعين'},
 {n:'Muscadol',f:'قرص مرتين يومياً',u:'أسبوع'},
 {n:'Milga',f:'قرص مرتين يومياً',u:'شهر'},
 {n:'Calcium + Vitamin D',f:'قرص مرة يومياً بعد الغداء',u:'٣ شهور'},
 {n:'Clexane 40 mg',f:'حقنة تحت الجلد مرة يومياً',u:'أسبوعين'},
 {n:'Augmentin 1 g',f:'قرص كل ١٢ ساعة',u:'٥ أيام'},
 {n:'Fucidin cream',f:'دهان على الجرح مرتين يومياً',u:'أسبوع'},
 {n:'Voltaren Emulgel',f:'دهان موضعي ٣ مرات يومياً',u:'أسبوعين'},
];
const FREQ=['مرة يومياً','مرتين يومياً','٣ مرات يومياً','كل ٨ ساعات','عند اللزوم','قبل النوم','حقنة يومياً','حقنة أسبوعياً'];
const DUR=['٣ أيام','٥ أيام','أسبوع','١٠ أيام','أسبوعين','شهر','٣ شهور','مستمر'];
const WA_DEF={
 confirm:'مرحباً {الاسم} 🌿\nتم تأكيد حجزك في عيادة {الطبيب}\nيوم {التاريخ} الساعة {الوقت}\nالعنوان: {العنوان}\nللإلغاء أو التعديل يرجى الرد على هذه الرسالة.',
 remind:'تذكير بموعدك في عيادة {الطبيب} ⏰\n{التاريخ} الساعة {الوقت}\nبرجاء تأكيد الحضور بالرد بكلمة (تم).',
 follow:'مرحباً {الاسم}\nحان موعد المتابعة: {المتابعة}\n({الحالة})\nبرجاء الرد لتحديد موعد مناسب في عيادة {الطبيب}.',
 after:'مرحباً {الاسم}، نتمنى لك الشفاء العاجل 🌿\nإذا كان لديك أي استفسار عن العلاج يمكنك التواصل معنا هنا.\nعيادة {الطبيب}',
 dues:'مرحباً {الاسم}\nنذكّرك بأن المتبقي من حسابك في عيادة {الطبيب} هو {المبلغ}.\nشكراً لك.',
};

/* ================= طبقة البيانات ================= */
const LocalDB=(()=>{let dbp=null;const subs={};
  const open=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('clinic-ar',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('docs',{keyPath:'p'});s.createIndex('c','c')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
  const tx=async(mode,fn)=>{const d=await open();return new Promise((res,rej)=>{const t=d.transaction('docs',mode);const st=t.objectStore('docs');const out=fn(st);t.oncomplete=()=>res(out&&out.result!==undefined?out.result:out);t.onerror=()=>rej(t.error)})};
  const colOf=p=>p.split('/').slice(0,-1).join('/');
  const notify=c=>{(subs[c]||[]).forEach(async s=>s.cb(await api.list(c,s.f)))};
  const match=(d,f)=>!f||f.every(([k,op,v])=>op==='=='?d[k]===v:op==='<'?d[k]<v:op==='>='?d[k]>=v:op==='<='?d[k]<=v:op==='in'?v.includes(d[k]):true);
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
function err(e){console.error(e);toast(e&&e.code==='permission-denied'?'غير مسموح لصلاحيتك':(e&&e.message)||'حدث خطأ')}
let D=null;
const S={mode:null,cid:null,role:null,email:'',name:'',clinic:{},patients:[],appts:[],cases:[],ready:false};
const C=n=>`clinics/${S.cid}/${n}`;
const isDoc=()=>S.role==='doctor';
const patient=id=>S.patients.find(p=>p.id===id);
async function getPatient(id){const c=patient(id);if(c)return c;const d=await D.get(C('patients/'+id));return d?{id,...d}:null}
const CL=()=>S.clinic||{};
const fees=()=>({kashf:300,reexam:150,fu:0,dress:100,sut:100,cast:300,inj:500,session:200,other:0,...(CL().fees||{})});
const waTpl=k=>(CL().wa&&CL().wa[k])||WA_DEF[k];
const drugs=()=>CL().drugs&&CL().drugs.length?CL().drugs:DRUGS0;

/* الملفات الكبيرة (صور، صوت) تُقسَّم إلى أجزاء ≤ ٧٠٠ ألف حرف حتى تناسب حدود Firestore */
const CH=700000;
async function putBlob(dataUrl){const id=uid();const n=Math.ceil(dataUrl.length/CH);
  for(let i=0;i<n;i++)await D.set(C(`blobs/${id}_${i}`),{b:id,i,n,d:dataUrl.slice(i*CH,(i+1)*CH)});return id}
async function getBlob(id){if(!id)return null;const first=await D.get(C(`blobs/${id}_0`));if(!first)return null;let s=first.d;for(let i=1;i<first.n;i++){const x=await D.get(C(`blobs/${id}_${i}`));if(!x)return null;s+=x.d}return s}
async function delBlob(id){if(!id)return;const first=await D.get(C(`blobs/${id}_0`));const n=first?first.n:1;for(let i=0;i<n;i++)D.del(C(`blobs/${id}_${i}`))}

/* ================= واتساب ================= */
function waPhone(ph){let n=String(ph||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0')&&n.length===11)n='20'+n.slice(1);if(n.length===10&&n.startsWith('1'))n='20'+n;return n}
function openUrl(u){if(isNative&&window.Capacitor.Plugins.App&&window.Capacitor.Plugins.App.openUrl){window.Capacitor.Plugins.App.openUrl({url:u}).catch(()=>location.href=u);return}const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
function fillTpl(t,v){return t.replace(/\{([^}]+)\}/g,(m,k)=>v[k]!=null?v[k]:m)}
function tplVars(p,extra={}){const c=CL();return{'الاسم':(p&&p.name||'').split(' ')[0]||'','الاسم الكامل':p&&p.name||'','الطبيب':c.doctor||'','العيادة':c.name||'','العنوان':c.address||'','تليفون العيادة':c.phone||'',...extra}}
function wa(phone,text){const n=waPhone(phone);if(!n){toast('لا يوجد رقم تليفون صحيح');return false}openUrl(`https://wa.me/${n}?text=${encodeURIComponent(text)}`);return true}
function waAppt(a,kind){const p=patient(a.patientId)||{name:a.name,phone:a.phone};const t=fillTpl(waTpl(kind),tplVars(p,{'التاريخ':fmtDay(a.date),'الوقت':t12(a.time)}));
  if(wa(p.phone||a.phone,t)){const k=kind==='confirm'?'confirmedAt':'remindedAt';D.update(C('appointments/'+a.id),{[k]:Date.now()})}}

/* ================= أدوات واجهة ================= */
function sheet(html){closeSheet();const s=document.createElement('div');s.className='sheet';s.innerHTML=`<div class="box">${html}</div>`;s.onclick=e=>{if(e.target===s||e.target.hasAttribute('data-close'))closeSheet()};document.body.appendChild(s);return s}
function closeSheet(){const s=$('.sheet');if(s)s.remove()}
function confirmBtn(b,fn,label='تأكيد'){b.onclick=()=>{if(b.dataset.armed)fn();else{b.dataset.armed=1;b.textContent=label}}}
const opts=(arr,v)=>arr.map(([k,l])=>`<option value="${esc(k)}" ${String(v??'')===String(k)?'selected':''}>${esc(l)}</option>`).join('');
const val=id=>{const e=$('#'+id);return e?e.value.trim():''};
function pItem(p,right='',href){const age=ageOf(p);return`<a class="item" href="${href||'#/p/'+p.id}"><span class="av">${esc(initials(p))}</span><span class="m"><span class="t">${esc(p.name||'بدون اسم')}</span><span class="s">${[p.fileNo?'ملف '+esc(p.fileNo):'',age!=null?age+' سنة':'',p.phone?`<span class="num">${esc(p.phone)}</span>`:''].filter(Boolean).join(' · ')}</span></span>${right}</a>`}
