(()=>{
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


/* ================= التشغيل وتسجيل الدخول ================= */
function getConfig(){if(window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey)return window.FIREBASE_CONFIG;try{const c=localStorage.getItem('fbconfig');return c?JSON.parse(c):null}catch{return null}}
async function boot(){let mode=null;try{mode=localStorage.getItem('mode')}catch{}
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
async function startLocal(){D=LocalDB;S.mode='local';S.cid='local';S.role='doctor';S.email='local';S.name='الطبيب';
  S.clinic=await D.get('clinics/local');if(!S.clinic){S.clinic={name:'عيادة العظام',doctor:'د. ',createdAt:Date.now()};await D.set('clinics/local',S.clinic)}startWatch()}
function startWatch(){
  D.watch(C('patients'),null,l=>{S.patients=l.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));if(S.ready)softRefresh()});
  D.watch(C('appointments'),[['date','>=',addDays(today(),-1)]],l=>{S.appts=l;if(S.ready)softRefresh()});
  D.watch(C('cases'),[['status','==','open']],l=>{S.cases=l;if(S.ready)softRefresh()});
  if(S.mode==='cloud')FB.onSnapshot(FB.doc(db,'clinics/'+S.cid),s=>{if(s.exists())S.clinic=s.data()});
  S.ready=true;if(!location.hash||location.hash==='#/login')location.hash='#/today';else render()}
let refreshT;function softRefresh(){clearTimeout(refreshT);refreshT=setTimeout(()=>{if($('.sheet')||document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const r=route()[0];if(['today','schedule','patients','fu'].includes(r))render()},300)}

function screen(html){$('#app').innerHTML=`<div class="login">${html}</div>`}
function screenWelcome(){screen(`<div class="logo">العيادة</div><div class="sub">الحجز بالواتساب، ملف المريض، الروشتات، الأشعة والتحاليل، الملاحظات الصوتية، متابعة العمليات والكسور، والحسابات.</div>
  <div class="card form"><b>ابدأ على هذا الجهاز</b><p class="fine">البيانات تتحفظ على هذا الجهاز فقط. تقدر تربط قاعدة بيانات العيادة بعدين عشان المساعدين يشتغلوا معاك من أجهزتهم.</p><button class="btn primary" id="localGo">ابدأ الآن</button><button class="btn" id="demoGo">جرّب ببيانات تجريبية</button></div>
  <div class="card form"><b>ربط قاعدة بيانات العيادة (Firebase)</b><p class="fine">الصق كود إعداد العيادة (من جهاز الطبيب: المزيد ← كود الإعداد) أو إعدادات Firebase.</p>
  <textarea class="in ltr" id="cfg" placeholder="كود الإعداد أو { &quot;apiKey&quot;: … }"></textarea><button class="btn" id="cfgGo">ربط</button></div>`);
  $('#cfgGo').onclick=()=>{const c=parseCfg($('#cfg').value);if(!c)return toast('الكود غير صحيح');try{localStorage.setItem('fbconfig',JSON.stringify(c));localStorage.removeItem('mode')}catch{}location.reload()};
  $('#localGo').onclick=()=>{try{localStorage.setItem('mode','local')}catch{}location.hash='#/more/clinic';location.reload()};
  $('#demoGo').onclick=async()=>{try{localStorage.setItem('mode','local')}catch{}await seedDemoLocal();location.hash='#/today';location.reload()}}
function parseCfg(t){t=String(t||'').trim();let c=null;try{c=JSON.parse(t)}catch{try{c=JSON.parse(decodeURIComponent(escape(atob(t))))}catch{}}
  if(!c){const m=t.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\})/);if(m){try{c=Function('return '+m[1])()}catch{}}}
  return c&&c.apiKey&&c.projectId?c:null}
function screenLogin(){let mode='in';const draw=()=>{screen(`<div class="logo">العيادة</div><div class="sub">${mode==='in'?'تسجيل الدخول':'إنشاء حساب جديد'}</div>
  <div class="card form"><label class="f">البريد الإلكتروني<input class="in ltr" id="em" type="email" autocomplete="email"></label><label class="f">كلمة المرور<input class="in ltr" id="pw" type="password" autocomplete="${mode==='in'?'current-password':'new-password'}"></label>
  <button class="btn primary" id="go">${mode==='in'?'دخول':'إنشاء الحساب'}</button>
  <div class="row"><button class="btn sm" id="sw">${mode==='in'?'حساب جديد':'عندي حساب'}</button>${mode==='in'?'<button class="btn sm" id="fp">نسيت كلمة المرور</button>':''}</div></div>
  <p class="fine">المساعدين: اطلبوا من الطبيب يضيف بريدكم من المزيد ← الفريق، وبعدين اعملوا حساب بنفس البريد.</p>
  <div class="row"><button class="btn sm" id="chdb">تغيير قاعدة البيانات</button></div>`);
  $('#chdb').onclick=()=>{try{localStorage.removeItem('fbconfig')}catch{}location.reload()};
  $('#sw').onclick=()=>{mode=mode==='in'?'up':'in';draw()};
  $('#go').onclick=async()=>{const e=$('#em').value.trim(),p=$('#pw').value;if(!e||!p)return toast('اكتب البريد وكلمة المرور');
    try{if(mode==='in')await FB.signInWithEmailAndPassword(auth,e,p);else{const c=await FB.createUserWithEmailAndPassword(auth,e,p);await FB.sendEmailVerification(c.user)}}catch(x){toast(x.code==='auth/invalid-credential'?'البريد أو كلمة المرور غير صحيحة':x.code==='auth/email-already-in-use'?'البريد ده عليه حساب بالفعل، سجّل دخول':x.code==='auth/weak-password'?'كلمة المرور ٦ حروف على الأقل':x.message)}};
  const fp=$('#fp');if(fp)fp.onclick=async()=>{const e=$('#em').value.trim();if(!e)return toast('اكتب بريدك الأول');try{await FB.sendPasswordResetEmail(auth,e);toast('اتبعت رابط تغيير كلمة المرور')}catch(x){toast(x.message)}}};draw()}
function screenVerify(u){screen(`<div class="logo">تأكيد البريد</div><div class="sub">بعتنا رابط على <b class="ltr">${esc(u.email)}</b>. افتحه وارجع اضغط متابعة.</div>
  <button class="btn primary" id="cont">متابعة</button><button class="btn" id="resend">ابعت الرابط تاني</button><button class="btn" id="out">خروج</button>`);
  $('#cont').onclick=async()=>{await u.reload();if(auth.currentUser.emailVerified){await auth.currentUser.getIdToken(true);location.reload()}else toast('لسه ما اتأكدش')};
  $('#resend').onclick=()=>FB.sendEmailVerification(u).then(()=>toast('اتبعت')).catch(e=>toast(e.message));$('#out').onclick=()=>FB.signOut(auth)}
function screenNoClinic(){screen(`<div class="logo">لا توجد عيادة بعد</div><div class="sub">مسجّل باسم <b class="ltr">${esc(auth.currentUser.email)}</b></div>
  <div class="card form"><b>أنا الطبيب: إنشاء العيادة</b><label class="f">اسم العيادة<input class="in" id="cn" value="عيادة العظام"></label><label class="f">اسم الطبيب<input class="in" id="dn" value="د. "></label><button class="btn primary" id="mk">إنشاء العيادة</button></div>
  <div class="card"><b>أنا مساعد</b><p class="fine">اطلب من الطبيب يضيف <b class="ltr">${esc(auth.currentUser.email)}</b> من المزيد ← الفريق، وبعدين اضغط تحقق.</p><button class="btn" id="chk">تحقق</button></div>
  <button class="btn" id="out">خروج</button>`);
  $('#mk').onclick=async()=>{const u=auth.currentUser,email=u.email.toLowerCase();try{
    const ref=FB.doc(FB.collection(db,'clinics'));const cid=ref.id;
    await FB.setDoc(ref,{ownerUid:u.uid,name:$('#cn').value,doctor:$('#dn').value,createdAt:Date.now()});
    await FB.setDoc(FB.doc(db,`clinics/${cid}/members/${email}`),{role:'doctor',name:$('#dn').value,email});
    await FB.setDoc(FB.doc(db,'memberships/'+email),{clinicId:cid,role:'doctor'});location.reload()}catch(e){err(e)}};
  $('#chk').onclick=()=>location.reload();$('#out').onclick=()=>FB.signOut(auth)}

/* ================= الهيكل والتنقل ================= */
function route(){return (location.hash.replace(/^#\/?/,'')||'today').split('?')[0].split('/')}
function qs(){const q=location.hash.split('?')[1]||'';return Object.fromEntries(new URLSearchParams(q))}
function shell(title,body,{back=false,action='',fab=''}={}){
  const r=route()[0];const on=(...k)=>k.includes(r)?'on':'';
  $('#app').innerHTML=`<header class="top">${back?`<button class="ib" id="backBtn" aria-label="رجوع">${I.back}</button>`:''}<h1>${esc(title)}</h1>${action}</header>
  <main id="main">${body}</main>${fab}
  <nav class="nav"><a href="#/today" class="${on('today')}">${I.today}اليوم</a><a href="#/schedule" class="${on('schedule')}">${I.cal}المواعيد</a><a href="#/patients" class="${on('patients','p','pe','np')}">${I.pts}المرضى</a><a href="#/fu" class="${on('fu','case')}">${I.fu}المتابعة</a>${isDoc()?`<a href="#/acc" class="${on('acc')}">${I.acc}الحسابات</a>`:''}<a href="#/more" class="${on('more')}">${I.more}المزيد</a></nav>`;
  const b=$('#backBtn');if(b)b.onclick=()=>history.length>1?history.back():(location.hash='#/today');window.scrollTo(0,0)}
function render(){closeSheet();if(!S.ready)return;const [r,a,b]=route();
  const map={today:vToday,schedule:vSchedule,patients:vPatients,np:()=>vPatientForm(null),pe:()=>vPatientForm(a),p:()=>vPatient(a,b||'sum'),fu:vFollow,case:()=>vCase(a),acc:vAccounts,more:()=>a?vMoreSub(a):vMore()};
  (map[r]||vToday)()}
addEventListener('hashchange',render);

/* ================= اليوم ================= */
function dueMilestones(withinDays=0){const t=today(),lim=addDays(t,withinDays);const out=[];
  for(const c of S.cases)(c.ms||[]).forEach((m,i)=>{if(!m.done&&m.due<=lim)out.push({c,m,i,late:m.due<t})});
  return out.sort((x,y)=>x.m.due.localeCompare(y.m.due))}
function apptRow(a,{showDate=false}={}){const p=patient(a.patientId)||{name:a.name,phone:a.phone};const paid=a.paid!=null;
  return`<div class="item" style="flex-direction:column;align-items:stretch;gap:4px" data-aid="${a.id}">
   <div style="display:flex;gap:10px;align-items:center"><span class="av">${a.queue?`<b class="num">${a.queue}</b>`:esc(initials(p))}</span>
    <a class="m" href="${a.patientId?'#/p/'+a.patientId:'#'}" style="text-decoration:none;color:inherit"><span class="t">${esc(p.name||'—')}</span><span class="s">${esc(VTN[a.type]||'')}${a.note?' · '+esc(a.note):''}</span></a>
    <span style="text-align:end"><span class="num" style="font-size:13px;color:var(--muted)">${showDate?fmtShort(a.date)+' ':''}${t12(a.time)}</span><br><span class="st ${a.status}">${ST[a.status]||''}</span></span></div>
   <div class="acts">${a.status==='booked'?`<button class="btn sm" data-act="arrived">وصل</button>`:''}${a.status==='arrived'?`<button class="btn sm primary" data-act="in">دخول للطبيب</button>`:''}${['arrived','in'].includes(a.status)?`<button class="btn sm primary" data-act="done">انتهى${paid?'':' + تحصيل'}</button>`:''}
    ${a.status==='done'&&!paid?`<button class="btn sm" data-act="pay">تحصيل</button>`:''}${paid?`<span class="tag ok">مدفوع <span class="money">${money(a.paid)}</span></span>`:''}
    <button class="btn sm wa" data-act="${a.date===today()?'confirm':'remind'}">${I.wa}${a.confirmedAt||a.remindedAt?'✓ ':''}${a.date>today()?'تذكير':'تأكيد'}</button>
    <button class="btn sm" data-act="menu">⋯</button></div></div>`}
function bindAppts(){$$('[data-aid]').forEach(el=>{const a=S.appts.find(x=>x.id===el.dataset.aid);if(!a)return;
  el.querySelectorAll('[data-act]').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.act;
   if(k==='arrived'){const q=Math.max(0,...S.appts.filter(x=>x.date===a.date&&x.queue).map(x=>x.queue))+1;D.update(C('appointments/'+a.id),{status:'arrived',queue:q,arrivedAt:Date.now()})}
   else if(k==='in')D.update(C('appointments/'+a.id),{status:'in',inAt:Date.now()});
   else if(k==='done'){D.update(C('appointments/'+a.id),{status:'done',doneAt:Date.now()});if(a.paid==null)paySheet(a)}
   else if(k==='pay')paySheet(a);
   else if(k==='confirm'||k==='remind')waAppt(a,a.date>today()?'remind':'confirm');
   else if(k==='menu')apptMenu(a)})})}
function apptMenu(a){const p=patient(a.patientId)||{};sheet(`<b>${esc(p.name||a.name)}</b> <span class="fine">${fmtDay(a.date)} ${t12(a.time)}</span><div class="list" style="margin-top:10px">
  <button class="item" data-m="edit"><span class="m"><span class="t">تعديل الموعد</span></span></button>
  <button class="item" data-m="confirm"><span class="m"><span class="t">رسالة تأكيد واتساب</span></span></button>
  <button class="item" data-m="remind"><span class="m"><span class="t">رسالة تذكير واتساب</span></span></button>
  ${p.phone?`<a class="item" href="tel:${esc(p.phone)}"><span class="m"><span class="t">اتصال</span><span class="s num">${esc(p.phone)}</span></span></a>`:''}
  <button class="item" data-m="booked"><span class="m"><span class="t">إرجاع إلى محجوز</span></span></button>
  <button class="item" data-m="noshow"><span class="m"><span class="t">لم يحضر</span></span></button>
  <button class="item" data-m="cancelled"><span class="m"><span class="t" style="color:var(--bad)">إلغاء الموعد</span></span></button></div>`);
  $$('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;closeSheet();if(k==='edit')bookSheet({appt:a});else if(k==='confirm'||k==='remind')waAppt(a,k);else D.update(C('appointments/'+a.id),{status:k,...(k==='booked'?{queue:null}:{})})})}
function paySheet(a){const p=patient(a.patientId)||{name:a.name};const fee=a.fee!=null&&a.fee!==''?+a.fee:(fees()[a.type]||0);
  sheet(`<b>تحصيل – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">المطلوب<input class="in num" id="fee" type="number" inputmode="decimal" value="${fee}"></label><label class="f">خصم<input class="in num" id="disc" type="number" inputmode="decimal" value="0"></label></div>
   <label class="f">المدفوع<input class="in num" id="paid" type="number" inputmode="decimal" value="${fee}"></label>
   <div class="chips" id="pm">${PM.map(([k,l],i)=>`<button class="chip ${i===0?'on':''}" data-v="${k}">${l}</button>`).join('')}</div>
   <p class="fine" id="rem"></p>
   <div class="row"><button class="btn primary" id="ok">حفظ</button><button class="btn" data-close>لاحقاً</button></div></div>`);
  let pm='cash';$$('#pm .chip').forEach(b=>b.onclick=()=>{pm=b.dataset.v;$$('#pm .chip').forEach(x=>x.classList.toggle('on',x===b))});
  const upd=()=>{const due=(+val('fee')||0)-(+val('disc')||0),pd=+val('paid')||0;$('#rem').textContent=due-pd>0?`المتبقي على المريض: ${money(due-pd)}`:''};
  $('#fee').oninput=()=>{$('#paid').value=(+val('fee')||0)-(+val('disc')||0);upd()};$('#disc').oninput=$('#fee').oninput;$('#paid').oninput=upd;upd();
  $('#ok').onclick=()=>{const due=(+val('fee')||0)-(+val('disc')||0),pd=+val('paid')||0;const base={date:today(),patientId:a.patientId||null,name:p.name||'',apptId:a.id,cat:a.type,at:Date.now(),by:S.name||S.email};
    if(due>0)addTx({...base,kind:'charge',amount:due,note:VTN[a.type]||''});
    if(pd>0)addTx({...base,kind:'pay',amount:pd,method:pm});
    D.update(C('appointments/'+a.id),{paid:pd,fee:+val('fee')||0,disc:+val('disc')||0,method:pm});closeSheet();toast('اتسجل');if(a.patientId)D.update(C('patients/'+a.patientId),{updatedAt:Date.now()})}}

function vToday(){const t=today();const list=S.appts.filter(a=>a.date===t&&a.status!=='cancelled').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const waiting=list.filter(a=>a.status==='arrived').sort((a,b)=>(a.queue||0)-(b.queue||0)),inside=list.filter(a=>a.status==='in'),booked=list.filter(a=>a.status==='booked'),done=list.filter(a=>['done','noshow'].includes(a.status));
  const income=list.reduce((s,a)=>s+(+a.paid||0),0);const due=dueMilestones(0);const tmr=S.appts.filter(a=>a.date===addDays(t,1)&&a.status==='booked');
  const sec=(title,arr)=>arr.length?`<h3>${title} (${arr.length})</h3><div class="list queue">${arr.map(a=>apptRow(a)).join('')}</div>`:'';
  shell(CL().name||'العيادة',`<div class="fine" style="margin-bottom:8px">${fmtLong(t)}</div>
   <div class="stats"><a class="stat cl" href="#/schedule"><div class="k">مواعيد اليوم</div><div class="v">${list.length}</div></a><div class="stat"><div class="k">في الانتظار</div><div class="v">${waiting.length}</div></div><div class="stat"><div class="k">انتهى</div><div class="v">${done.length}</div></div>${isDoc()?`<a class="stat cl" href="#/acc?per=day"><div class="k">دخل اليوم</div><div class="v sm money" id="tinc">${money(income)}</div></a>`:''}</div>
   <div class="row" style="margin-top:12px"><button class="btn primary" id="book">${I.plus}حجز جديد</button><button class="btn" id="walk">مريض بدون حجز</button>${tmr.length?`<button class="btn wa" id="tmr">${I.wa}تذكيرات الغد (${tmr.length})</button>`:''}</div>
   ${sec('بالداخل',inside)}${sec('في الانتظار',waiting)}${sec('محجوز',booked)}
   ${due.length?`<h3>متابعات مستحقة (${due.length})</h3><div class="list">${due.slice(0,8).map(fuRow).join('')}</div>${due.length>8?'<a class="btn sm" href="#/fu">عرض الكل</a>':''}`:''}
   ${sec('انتهى',done)}
   ${!list.length&&!due.length?'<div class="empty" style="margin-top:14px">مفيش مواعيد النهارده. اضغط "حجز جديد".</div>':''}`);
  bindAppts();bindFu();if(isDoc())D.list(C('tx'),[['date','==',t]]).then(l=>{const e=$('#tinc');if(e)e.textContent=money(l.filter(x=>x.kind==='pay').reduce((s,x)=>s+ +x.amount,0))});$('#book').onclick=()=>bookSheet({});$('#walk').onclick=()=>bookSheet({walkin:true});const tb=$('#tmr');if(tb)tb.onclick=()=>remindersSheet(addDays(t,1))}
function remindersSheet(d){const arr=S.appts.filter(a=>a.date===d&&a.status==='booked').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const draw=()=>sheet(`<b>تذكيرات ${fmtDay(d)}</b><p class="fine">اضغط على كل مريض يفتح الواتساب برسالة التذكير جاهزة، ابعتها وارجع للتطبيق.</p><div class="list">${arr.map(a=>{const p=patient(a.patientId)||{name:a.name};return`<button class="item" data-r="${a.id}"><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${t12(a.time)} · ${esc(VTN[a.type]||'')}</span></span>${a.remindedAt?'<span class="tag ok">اتبعت</span>':`<span class="tag mut">لم يُرسل</span>`}</button>`}).join('')}</div>`);
  draw();const bind=()=>$$('[data-r]').forEach(b=>b.onclick=()=>{const a=arr.find(x=>x.id===b.dataset.r);waAppt(a,'remind');a.remindedAt=Date.now();draw();bind()});bind()}

/* ================= المواعيد ================= */
function slotsFor(d){const c=CL();const wd=new Date(d+'T12:00:00').getDay();const days=c.days||[6,0,1,2,3,4];if(!days.includes(wd))return[];
  const [fh,fm]=(c.from||'15:00').split(':').map(Number),[th,tm]=(c.to||'22:00').split(':').map(Number);const step=+c.slot||15;const out=[];
  for(let m=fh*60+fm;m<th*60+tm;m+=step)out.push(`${pad(Math.floor(m/60))}:${pad(m%60)}`);return out}
async function vSchedule(){const q=qs();const d=q.d||today();
  let list=S.appts.filter(a=>a.date===d);if(d<addDays(today(),-1))list=await D.list(C('appointments'),[['date','==',d]]);
  list=list.filter(a=>a.status!=='cancelled').sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const slots=slotsFor(d);const used=new Set(list.map(a=>a.time));
  const rows=[];const all=[...new Set([...slots,...list.map(a=>a.time).filter(Boolean)])].sort();
  for(const t of all){const here=list.filter(a=>a.time===t);rows.push(`<div class="slot"><div class="tm">${t12(t)}</div><div class="list">${here.length?here.map(a=>apptRow(a)).join(''):`<button class="free" data-t="${t}">متاح – احجز</button>`}</div></div>`)}
  const noTime=list.filter(a=>!a.time);
  const days=[...Array(7)].map((_,i)=>addDays(d,i-3));
  shell('المواعيد',`<div class="row" style="justify-content:space-between"><button class="btn sm" id="prev">‹ السابق</button><input type="date" class="in num" id="dpick" value="${d}" style="max-width:180px"><button class="btn sm" id="next">التالي ›</button></div>
   <div class="chips" style="margin:10px 0;flex-wrap:nowrap;overflow-x:auto">${days.map(x=>`<a class="chip ${x===d?'on':''}" href="#/schedule?d=${x}" style="text-decoration:none;white-space:nowrap">${fmtShort(x)}${x===today()?' (اليوم)':''}</a>`).join('')}</div>
   <div class="row" style="justify-content:space-between"><b>${fmtDay(d)}</b><span class="fine">${list.length} موعد</span></div>
   ${d>today()&&list.some(a=>a.status==='booked')?`<button class="btn wa sm" id="rem" style="margin-top:8px">${I.wa}إرسال التذكيرات</button>`:''}
   <div class="list" style="margin-top:10px">${rows.join('')||'<div class="empty">العيادة مقفولة اليوم ده (غيّر أيام العمل من المزيد ← بيانات العيادة).</div>'}${noTime.map(a=>apptRow(a)).join('')}</div>`,
   {fab:`<button class="fab" id="fab" aria-label="حجز">${I.plus}</button>`});
  bindAppts();$('#prev').onclick=()=>location.hash='#/schedule?d='+addDays(d,-1);$('#next').onclick=()=>location.hash='#/schedule?d='+addDays(d,1);$('#dpick').onchange=e=>location.hash='#/schedule?d='+e.target.value;
  $('#fab').onclick=()=>bookSheet({date:d});$$('[data-t]').forEach(b=>b.onclick=()=>bookSheet({date:d,time:b.dataset.t}));const r=$('#rem');if(r)r.onclick=()=>remindersSheet(d)}

function bookSheet({appt=null,date=null,time=null,pid=null,walkin=false,type=null,note=''}){
  const a=appt||{};let selP=a.patientId?patient(a.patientId):pid?patient(pid):null;const d=a.date||date||today();
  const draw=()=>{sheet(`<b>${appt?'تعديل الموعد':walkin?'مريض بدون حجز':'حجز جديد'}</b><div class="form" style="margin-top:10px">
   <div id="pbox">${selP?`<div class="bal"><span><b>${esc(selP.name)}</b> <span class="num fine">${esc(selP.phone||'')}</span></span><button class="btn sm" id="chg">تغيير</button></div>`:
    `<div class="search">${I.search}<input class="in" id="ps" placeholder="ابحث بالاسم أو التليفون أو رقم الملف" autocomplete="off"></div><div class="list" id="pres" style="margin-top:6px"></div>
     <div class="grid2" style="margin-top:6px"><label class="f">اسم مريض جديد<input class="in" id="nn"></label><label class="f">التليفون<input class="in num" id="np" type="tel" inputmode="tel"></label></div>`}</div>
   <div class="grid2"><label class="f">اليوم<input class="in num" type="date" id="bd" value="${d}"></label><label class="f">الساعة<select class="in num" id="bt"></select></label></div>
   <label class="f">نوع الزيارة<select class="in" id="bty">${opts(VT,a.type||type||'kashf')}</select></label>
   <div class="grid2"><label class="f">السعر<input class="in num" type="number" inputmode="decimal" id="bf" value="${a.fee??''}" placeholder="${fees()[a.type||type||'kashf']||0}"></label><label class="f">ملاحظة<input class="in" id="bn" value="${esc(a.note||note)}"></label></div>
   <label class="tog" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="bwa" ${appt?'':'checked'}> ابعت رسالة تأكيد على الواتساب بعد الحفظ</label>
   <div class="row"><button class="btn primary" id="bok">${appt?'حفظ':'حجز'}</button><button class="btn" data-close>إلغاء</button></div></div>`);
   const fillT=()=>{const dd=$('#bd').value;const sl=slotsFor(dd);const taken=new Set(S.appts.filter(x=>x.date===dd&&x.status!=='cancelled'&&x.id!==a.id).map(x=>x.time));
     const now=new Date();const cur=`${pad(now.getHours())}:${pad(now.getMinutes())}`;let want=a.time||time||(walkin?cur:'');
     const list=[...new Set([...sl,...(want?[want]:[])])].sort();
     if(!want){want=list.find(t=>!taken.has(t)&&(dd>today()||t>=cur))||list[0]||''}
     $('#bt').innerHTML=list.map(t=>`<option value="${t}" ${t===want?'selected':''}>${t12(t)}${taken.has(t)?' (محجوز)':''}</option>`).join('')||`<option value="${cur}">${t12(cur)}</option>`};
   fillT();$('#bd').onchange=fillT;$('#bty').onchange=()=>$('#bf').placeholder=fees()[$('#bty').value]||0;
   const chg=$('#chg');if(chg)chg.onclick=()=>{selP=null;draw()};
   const ps=$('#ps');if(ps){ps.oninput=()=>{const q=nrm(ps.value);if(!q){$('#pres').innerHTML='';return}const r=S.patients.filter(p=>nrm([p.name,p.phone,p.fileNo].join(' ')).includes(q)).slice(0,6);
     $('#pres').innerHTML=r.map(p=>`<button class="item" data-sp="${p.id}"><span class="m"><span class="t">${esc(p.name)}</span><span class="s num">${esc(p.phone||'')}</span></span></button>`).join('')||'<span class="fine">مفيش نتيجة – اكتب بيانات مريض جديد تحت</span>';
     $$('[data-sp]').forEach(b=>b.onclick=()=>{selP=patient(b.dataset.sp);draw()});if(/^[\d٠-٩+ ]+$/.test(ps.value))$('#np').value=ps.value;else $('#nn').value=ps.value};setTimeout(()=>ps.focus(),50)}
   $('#bok').onclick=async()=>{let p=selP;if(!p){const n=val('nn');if(!n)return toast('اختار مريض أو اكتب اسم مريض جديد');p=newPatient({name:n,phone:val('np')})}
     const doc={patientId:p.id,name:p.name,phone:p.phone||'',date:$('#bd').value,time:$('#bt').value,type:$('#bty').value,fee:val('bf')===''?null:+val('bf'),note:val('bn'),status:a.status||(walkin?'arrived':'booked'),updatedAt:Date.now()};
     if(walkin&&!appt)doc.queue=Math.max(0,...S.appts.filter(x=>x.date===doc.date&&x.queue).map(x=>x.queue))+1;
     let id=a.id;if(appt)await D.update(C('appointments/'+id),doc);else{doc.createdAt=Date.now();doc.by=S.name||S.email;id=D.add(C('appointments'),doc)}
     D.update(C('patients/'+p.id),{updatedAt:Date.now(),nextAppt:doc.date});closeSheet();toast(appt?'اتعدّل':'اتحجز');
     if($('#bwa')&&$('#bwa').checked)waAppt({id,...doc},'confirm')}};draw()}
function newPatient(o){const max=Math.max(0,...S.patients.map(p=>+p.fileNo||0));const p={name:o.name,phone:o.phone||'',fileNo:String(max+1),createdAt:Date.now(),updatedAt:Date.now(),...o};const id=D.add(C('patients'),p);const full={id,...p};S.patients.unshift(full);return full}


/* ================= المرضى ================= */
function vPatients(){const q0=qs().q||'';
  shell('المرضى',`<div class="search">${I.search}<input class="in" id="q" placeholder="ابحث بالاسم أو التليفون أو رقم الملف" value="${esc(q0)}" autocomplete="off"></div>
   <div class="fine" style="margin:8px 0">${S.patients.length} مريض</div><div class="list" id="res"></div>`,{fab:`<a class="fab" href="#/np" aria-label="مريض جديد">${I.plus}</a>`});
  const draw=()=>{const q=nrm($('#q').value);const r=(q?S.patients.filter(p=>nrm([p.name,p.phone,p.phone2,p.fileNo,p.dx].join(' ')).includes(q)):S.patients).slice(0,80);
    $('#res').innerHTML=r.map(p=>pItem(p,p.balance>0?`<span class="tag warn">عليه <span class="money">${money(p.balance)}</span></span>`:'')).join('')||'<div class="empty">مفيش مرضى بالاسم ده</div>'};
  $('#q').oninput=draw;draw()}
async function vPatientForm(id){const p=id?await getPatient(id):{};
  shell(id?'تعديل بيانات المريض':'مريض جديد',`<div class="form">
   <label class="f">الاسم<input class="in" id="name" value="${esc(p.name||'')}"></label>
   <div class="grid2"><label class="f">التليفون (واتساب)<input class="in num" id="phone" type="tel" inputmode="tel" value="${esc(p.phone||'')}"></label><label class="f">تليفون آخر<input class="in num" id="phone2" type="tel" value="${esc(p.phone2||'')}"></label></div>
   <div class="grid2"><label class="f">سنة الميلاد<input class="in num" id="birthYear" type="number" inputmode="numeric" value="${esc(p.birthYear||'')}"></label><label class="f">النوع<select class="in" id="sex">${opts([['','—'],['m','ذكر'],['f','أنثى']],p.sex)}</select></label></div>
   <div class="grid2"><label class="f">رقم الملف<input class="in num" id="fileNo" value="${esc(p.fileNo||String(Math.max(0,...S.patients.map(x=>+x.fileNo||0))+1))}"></label><label class="f">الوظيفة<input class="in" id="job" value="${esc(p.job||'')}"></label></div>
   <label class="f">العنوان<input class="in" id="address" value="${esc(p.address||'')}"></label>
   <label class="f">أمراض مزمنة / حساسية من أدوية<input class="in" id="history" value="${esc(p.history||'')}"></label>
   <label class="f">جاي عن طريق<select class="in" id="ref">${opts([['','—'],['fb','فيسبوك'],['ig','إنستجرام'],['tt','تيك توك'],['friend','صديق / مريض'],['doctor','تحويل من طبيب'],['google','جوجل'],['other','أخرى']],p.ref)}</select></label>
   <label class="f">ملاحظات<textarea class="in" id="notes">${esc(p.notes||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="save">حفظ</button>${id&&isDoc()?'<button class="btn danger" id="del">حذف المريض</button>':''}</div></div>`,{back:true});
  $('#save').onclick=()=>{const o={};['name','phone','phone2','birthYear','sex','fileNo','job','address','history','ref','notes'].forEach(k=>o[k]=val(k));if(!o.name)return toast('اكتب الاسم');o.updatedAt=Date.now();
    if(id){D.update(C('patients/'+id),o);location.hash='#/p/'+id}else{const n=newPatient(o);location.replace('#/p/'+n.id)}toast('اتحفظ')};
  const del=$('#del');if(del)confirmBtn(del,()=>{D.del(C('patients/'+id));location.hash='#/patients';toast('اتحذف')},'اضغط تاني للتأكيد')}

const PTABS=[['sum','الملخص'],['visits','الزيارات'],['rx','الروشتات'],['files','الأشعة والتحاليل'],['voice','ملاحظات صوتية'],['fu','المتابعة'],['acc','الحساب']];
async function vPatient(id,tab){const p=await getPatient(id);if(!p){shell('المريض','<div class="empty">المريض مش موجود</div>',{back:true});return}
  const age=ageOf(p);
  const head=`<div class="phead"><span class="av">${esc(initials(p))}</span><div style="flex:1;min-width:0"><div class="n">${esc(p.name)}</div><div class="meta">${[p.fileNo?'ملف '+esc(p.fileNo):'',age!=null?age+' سنة':'',p.sex==='m'?'ذكر':p.sex==='f'?'أنثى':''].filter(Boolean).join(' · ')}</div></div><a class="btn sm" href="#/pe/${id}">${I.edit}</a></div>
   <div class="row" style="margin-top:10px">${p.phone?`<button class="btn sm wa" id="pwa">${I.wa}واتساب</button><a class="btn sm" href="tel:${esc(p.phone)}">${I.phone}<span class="num">${esc(p.phone)}</span></a>`:''}<button class="btn sm primary" id="pbook">${I.cal}حجز</button></div>
   ${p.history?`<div class="bal" style="margin-top:10px;background:color-mix(in srgb,var(--bad) 10%,var(--surface))"><span>⚠️ ${esc(p.history)}</span></div>`:''}
   <nav class="tabs">${PTABS.filter(([k])=>k!=='acc'||isDoc()||S.mode==='local').map(([k,l])=>`<a href="#/p/${id}/${k}" class="${k===tab?'on':''}">${l}</a>`).join('')}</nav><div id="tab"></div>`;
  shell(p.name,head,{back:true});
  $('#pbook').onclick=()=>bookSheet({pid:id});const pw=$('#pwa');if(pw)pw.onclick=()=>waMenu(p);
  ({sum:tSum,visits:tVisits,rx:tRx,files:tFiles,voice:tVoice,fu:tFu,acc:tAcc}[tab]||tSum)(p)}
function waMenu(p){sheet(`<b>رسالة واتساب إلى ${esc(p.name)}</b><div class="list" style="margin-top:10px">
  <button class="item" data-w="free"><span class="m"><span class="t">رسالة فاضية</span></span></button>
  <button class="item" data-w="after"><span class="m"><span class="t">متابعة بعد الكشف</span><span class="s">${esc(waTpl('after').split('\n')[0])}</span></span></button>
  <button class="item" data-w="dues"><span class="m"><span class="t">تذكير بالمتبقي من الحساب</span></span></button></div>`);
  $$('[data-w]').forEach(b=>b.onclick=async()=>{const k=b.dataset.w;closeSheet();if(k==='free')return wa(p.phone,'');
    let extra={};if(k==='dues'){const bal=await balanceOf(p.id);extra['المبلغ']=money(bal)}wa(p.phone,fillTpl(waTpl(k),tplVars(p,extra)))})}

async function tSum(p){const [vis,cases,files]=await Promise.all([D.list(C('visits'),[['patientId','==',p.id]]),D.list(C('cases'),[['patientId','==',p.id]]),D.list(C('files'),[['patientId','==',p.id]])]);
  const appts=(await D.list(C('appointments'),[['patientId','==',p.id]])).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  const next=appts.filter(a=>a.date>=today()&&a.status==='booked').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
  const last=vis.sort((a,b)=>(b.date||'').localeCompare(a.date||''))[0];
  $('#tab').innerHTML=`${next?`<div class="bal"><span>الموعد القادم: <b>${fmtDay(next.date)} ${t12(next.time)}</b> · ${esc(VTN[next.type]||'')}</span></div>`:''}
   ${last?`<h3>آخر زيارة – ${fmt(last.date)}</h3><div class="card">${last.dx?`<b>${esc(last.dx)}</b><br>`:''}${esc(last.plan||last.complaint||'')}</div>`:''}
   ${cases.filter(c=>c.status==='open').map(c=>`<h3>${c.kind==='fracture'?'كسر':'عملية'} – ${esc(caseName(c))}</h3>${caseMsHtml(c)}`).join('')}
   <h3>الملفات</h3><div class="fine">${files.length} ملف (أشعة / تحاليل / روشتات)</div>
   <h3>المواعيد</h3><div class="list">${appts.slice(0,6).map(a=>`<div class="item"><span class="m"><span class="t">${fmtDay(a.date)} ${t12(a.time)}</span><span class="s">${esc(VTN[a.type]||'')}</span></span><span class="st ${a.status}">${ST[a.status]||''}</span></div>`).join('')||'<div class="empty">لا توجد مواعيد</div>'}</div>
   ${p.address||p.job||p.notes?`<h3>بيانات</h3><dl class="kv">${p.job?`<dt>الوظيفة</dt><dd>${esc(p.job)}</dd>`:''}${p.address?`<dt>العنوان</dt><dd>${esc(p.address)}</dd>`:''}${p.notes?`<dt>ملاحظات</dt><dd>${esc(p.notes)}</dd>`:''}</dl>`:''}`}

/* ---------- الزيارات ---------- */
async function tVisits(p){const vis=(await D.list(C('visits'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  $('#tab').innerHTML=`${isDoc()?`<button class="btn primary" id="nv">${I.plus}زيارة جديدة</button>`:''}<div class="tl" style="margin-top:10px">${vis.map(v=>`<button class="item" data-v="${v.id}"><span class="when">${fmt(v.date)}</span><span class="m" style="white-space:normal"><span class="t">${esc(v.dx||VTN[v.type]||'زيارة')}</span><span class="s" style="white-space:normal">${esc([v.complaint,v.plan].filter(Boolean).join(' – ')).slice(0,160)}</span></span></button>`).join('')||'<div class="empty">لا توجد زيارات</div>'}</div>`;
  const nv=$('#nv');if(nv)nv.onclick=()=>visitSheet(p,null);$$('[data-v]').forEach(b=>b.onclick=()=>visitSheet(p,vis.find(v=>v.id===b.dataset.v)))}
function visitSheet(p,v){const x=v||{date:today(),type:'kashf'};const ro=!isDoc();
  sheet(`<b>${v?'زيارة '+fmt(x.date):'زيارة جديدة'}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="vd" value="${x.date}" ${ro?'disabled':''}></label><label class="f">النوع<select class="in" id="vt" ${ro?'disabled':''}>${opts(VT,x.type)}</select></label></div>
   <label class="f">الشكوى<textarea class="in" id="vc" ${ro?'readonly':''}>${esc(x.complaint||'')}</textarea></label>
   <label class="f">الفحص<textarea class="in" id="ve" ${ro?'readonly':''}>${esc(x.exam||'')}</textarea></label>
   <label class="f">التشخيص<input class="in" id="vx" value="${esc(x.dx||'')}" ${ro?'readonly':''}></label>
   <label class="f">الخطة / العلاج<textarea class="in" id="vp" ${ro?'readonly':''}>${esc(x.plan||'')}</textarea></label>
   ${ro?'':`<button class="btn sm" id="dict">${I.mic}إملاء صوتي في الخانة المحددة</button>
   <label class="f">ميعاد المتابعة<select class="in" id="vn"><option value="">بدون</option><option value="7">بعد أسبوع</option><option value="14">بعد أسبوعين</option><option value="30">بعد شهر</option><option value="42">بعد ٦ أسابيع</option><option value="90">بعد ٣ شهور</option></select></label>
   <div class="row"><button class="btn primary" id="vs">حفظ</button><button class="btn" id="vrx">${I.rx}روشتة</button>${v?'<button class="btn danger" id="vdel">حذف</button>':''}</div>`}</div>`);
  if(ro)return;let lastF=$('#vc');['vc','ve','vx','vp'].forEach(k=>$('#'+k).addEventListener('focus',e=>lastF=e.target));
  $('#dict').onclick=()=>dictate(lastF,$('#dict'));
  const save=()=>{const o={patientId:p.id,date:$('#vd').value,type:$('#vt').value,complaint:val('vc'),exam:val('ve'),dx:val('vx'),plan:val('vp'),updatedAt:Date.now()};
    if(v)D.update(C('visits/'+v.id),o);else{o.createdAt=Date.now();D.add(C('visits'),o)}
    D.update(C('patients/'+p.id),{updatedAt:Date.now(),dx:o.dx||p.dx||''});const n=+val('vn');closeSheet();toast('اتحفظت الزيارة');
    if(n)bookSheet({pid:p.id,date:addDays(o.date,n),type:'reexam'});else render()};
  $('#vs').onclick=save;$('#vrx').onclick=()=>{rxSheet(p,null,{dx:val('vx')})};const dl=$('#vdel');if(dl)confirmBtn(dl,()=>{D.del(C('visits/'+v.id));closeSheet();render()})}

/* ---------- إملاء صوتي (Web Speech أو إضافة أندرويد) ---------- */
let dictOn=null;
async function dictate(target,btn){if(!target)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const plug=isNative&&window.Capacitor.Plugins.SpeechRecognition;
  if(dictOn){dictOn();return}
  const add=t=>{if(!t)return;target.value=(target.value?target.value.trim()+' ':'')+t;target.dispatchEvent(new Event('input'))};
  if(plug){try{const perm=await plug.requestPermissions();if(perm&&perm.speechRecognition==='denied')return toast('اسمح بالميكروفون');btn.classList.add('wa');btn.textContent='جاري الاستماع… اضغط للإيقاف';
      const r=await plug.start({language:'ar-EG',maxResults:1,partialResults:false,popup:true});add(r&&r.matches&&r.matches[0])}catch(e){toast('الإملاء غير متاح')}btn.classList.remove('wa');btn.innerHTML=I.mic+'إملاء صوتي';return}
  if(!SR)return toast('الإملاء الصوتي يحتاج Chrome أو Edge');
  const r=new SR();r.lang='ar-EG';r.continuous=true;r.interimResults=false;
  r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)add(e.results[i][0].transcript)};
  const stop=()=>{try{r.stop()}catch{}dictOn=null;btn.classList.remove('wa');btn.innerHTML=I.mic+'إملاء صوتي'};
  r.onend=()=>{if(dictOn)stop()};r.onerror=e=>{toast(e.error==='not-allowed'?'اسمح بالميكروفون':'توقف الإملاء');stop()};
  r.start();dictOn=stop;btn.classList.add('wa');btn.textContent='جاري الاستماع… اضغط للإيقاف'}

/* ---------- الروشتات ---------- */
async function tRx(p){const rx=(await D.list(C('rx'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.createdAt||0)-(a.createdAt||0));
  $('#tab').innerHTML=`<div class="row">${isDoc()?`<button class="btn primary" id="nrx">${I.rx}كتابة روشتة</button>`:''}<button class="btn" id="srx">${I.cam}سكان روشتة</button></div>
   <div class="list" style="margin-top:10px">${rx.map(r=>`<button class="item" data-r="${r.id}">${r.thumb?`<img src="${r.thumb}" style="width:44px;height:44px;object-fit:cover;border-radius:8px">`:`<span class="av">${I.rx}</span>`}<span class="m"><span class="t">${fmt(r.date)}${r.scanned?' · سكان':''}</span><span class="s ltr" style="text-align:end">${esc((r.items||[]).map(i=>i.n).join('، ')||(r.ocr||'').slice(0,80)||r.note||'')}</span></span></button>`).join('')||'<div class="empty">لا توجد روشتات</div>'}</div>`;
  const n=$('#nrx');if(n)n.onclick=()=>rxSheet(p,null);$('#srx').onclick=()=>scanFlow(p,{cat:'rx'});
  $$('[data-r]').forEach(b=>b.onclick=()=>{const r=rx.find(x=>x.id===b.dataset.r);r.scanned?viewRxScan(p,r):rxSheet(p,r)})}
function rxSheet(p,r,{dx=''}={}){const x=r?JSON.parse(JSON.stringify(r)):{date:today(),items:[],note:'',dx};
  const draw=()=>{sheet(`<b>${r?'روشتة '+fmt(x.date):'روشتة جديدة'}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="rd" value="${x.date}"></label><label class="f">التشخيص<input class="in" id="rdx" value="${esc(x.dx||'')}"></label></div>
   <div class="list" id="its">${x.items.map((it,i)=>`<div class="drug"><span class="dn">${esc(it.n)}</span><button class="btn sm danger" data-rm="${i}">✕</button><span class="dd">${esc([it.f,it.u].filter(Boolean).join(' – '))}</span></div>`).join('')||'<span class="fine">لسه مفيش أدوية</span>'}</div>
   <div class="card form"><label class="f">الدواء<input class="in ltr" id="dn" placeholder="اكتب اسم الدواء" autocomplete="off"></label><div class="sug" id="dsug"></div>
    <label class="f">الجرعة وطريقة الاستخدام<input class="in" id="df" list="fl"></label><datalist id="fl">${FREQ.map(f=>`<option value="${f}">`).join('')}</datalist>
    <label class="f">المدة<input class="in" id="du" list="ul"></label><datalist id="ul">${DUR.map(f=>`<option value="${f}">`).join('')}</datalist>
    <button class="btn" id="addd">${I.plus}إضافة للروشتة</button></div>
   <label class="f">تعليمات للمريض<textarea class="in" id="rn">${esc(x.note||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="rs">حفظ</button><button class="btn" id="rp">${I.print}طباعة / PDF</button><button class="btn wa" id="rw">${I.wa}إرسال للمريض</button>${r?'<button class="btn danger" id="rdel">حذف</button>':''}</div></div>`);
   const sug=()=>{const q=nrm(val('dn'));const l=drugs().filter(d=>!q||nrm(d.n).includes(q)).slice(0,q?8:14);
     $('#dsug').innerHTML=l.map(d=>`<button data-d="${esc(d.n)}">${esc(d.n)}</button>`).join('');
     $$('#dsug [data-d]').forEach(b=>b.onclick=()=>{const d=drugs().find(z=>z.n===b.dataset.d);$('#dn').value=d.n;$('#df').value=d.f||'';$('#du').value=d.u||''})};
   $('#dn').oninput=sug;sug();
   const keep=()=>{x.date=$('#rd').value;x.dx=val('rdx');x.note=val('rn')};
   $('#addd').onclick=()=>{const n=val('dn');if(!n)return toast('اكتب اسم الدواء');keep();x.items.push({n,f:val('df'),u:val('du')});
     if(!drugs().some(d=>d.n===n)&&isDoc()){const list=[...drugs(),{n,f:val('df'),u:val('du')}];S.clinic.drugs=list;D.update(clinicPath(),{drugs:list})}draw()};
   $$('[data-rm]').forEach(b=>b.onclick=()=>{keep();x.items.splice(+b.dataset.rm,1);draw()});
   const save=()=>{keep();const o={patientId:p.id,date:x.date,dx:x.dx,items:x.items,note:x.note,updatedAt:Date.now()};if(r){D.update(C('rx/'+r.id),o);return r.id}o.createdAt=Date.now();const id=D.add(C('rx'),o);r={id,...o};return id};
   $('#rs').onclick=()=>{if(!x.items.length&&!val('rn'))return toast('الروشتة فاضية');save();closeSheet();toast('اتحفظت');render()};
   $('#rp').onclick=async()=>{save();const b=await htmlToPdf(rxHtml(p,x));shareBlob(b,`Rx-${p.fileNo||''}-${x.date}.pdf`,'application/pdf')};
   $('#rw').onclick=async()=>{save();toast('جاري تجهيز الروشتة…');const b=await htmlToPdf(rxHtml(p,x));await shareBlob(b,`Rx-${p.fileNo||''}-${x.date}.pdf`,'application/pdf');};
   const dl=$('#rdel');if(dl)confirmBtn(dl,()=>{D.del(C('rx/'+r.id));closeSheet();render()})};draw()}
async function viewRxScan(p,r){const img=await getBlob(r.blob);sheet(`<b>روشتة سكان – ${fmt(r.date)}</b>
  ${img?`<img src="${img}" style="width:100%;border-radius:10px;margin-top:8px" id="rimg">`:'<div class="empty">الصورة مش متاحة</div>'}
  <label class="f" style="margin-top:10px">النص المستخرج / الأدوية<textarea class="in ltr" id="ro" style="min-height:120px">${esc(r.ocr||'')}</textarea></label>
  <div class="row" style="margin-top:8px"><button class="btn primary" id="rsv">حفظ النص</button><button class="btn" id="rocr">قراءة النص تلقائياً</button>${img?'<button class="btn" id="rsh">مشاركة</button>':''}<button class="btn danger" id="rdel">حذف</button></div><p class="fine" id="rst"></p>`);
  $('#rsv').onclick=()=>{D.update(C('rx/'+r.id),{ocr:val('ro')});closeSheet();toast('اتحفظ')};
  $('#rocr').onclick=async()=>{if(!img)return;const t=await runOCR(img,$('#rst'));if(t)$('#ro').value=t};
  const sh=$('#rsh');if(sh)sh.onclick=()=>shareDataUrl(img,`Rx-${p.fileNo||''}-${r.date}.jpg`,'image/jpeg');
  const im=$('#rimg');if(im)im.onclick=()=>viewer(img,'روشتة');
  confirmBtn($('#rdel'),()=>{delBlob(r.blob);D.del(C('rx/'+r.id));closeSheet();render()})}
/* قراءة النص من الصورة على الجهاز (Tesseract) — مناسبة للروشتات المطبوعة، الخط اليدوي غالباً لن يُقرأ */
let tessP=null;
function loadTess(){return tessP||(tessP=new Promise((res,rej)=>{if(window.Tesseract)return res();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=res;s.onerror=()=>{tessP=null;rej(new Error('net'))};document.head.appendChild(s)}))}
async function runOCR(img,stEl){const st=m=>{if(stEl)stEl.textContent=m};
  try{st('جاري تحميل قارئ النصوص (مرة واحدة)…');await loadTess();
    const w=await Tesseract.createWorker(['eng','ara'],1,{logger:m=>{if(m.status==='recognizing text')st('جاري القراءة… '+Math.round(m.progress*100)+'%');else if(/load/.test(m.status))st('جاري تحميل اللغة… '+Math.round((m.progress||0)*100)+'%')}});
    const r=await w.recognize(img);await w.terminate();st('تمت القراءة – راجع النص وعدّله');return (r.data.text||'').replace(/\n{3,}/g,'\n\n').trim()}
  catch(e){console.error(e);st('القراءة التلقائية تحتاج إنترنت في أول مرة. تقدر تكتب الأدوية يدوياً.');return''}}


/* ================= السكان: الأشعة والتحاليل والروشتات ================= */
function pickFile(accept,capture){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept=accept;if(capture)i.setAttribute('capture','environment');i.multiple=!capture;i.onchange=()=>res([...i.files]);i.click()})}
function loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src})}
function fileToDataUrl(f){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)})}
/* تحسين الصورة: أصلي / مستند (خلفية بيضاء ونص أوضح) / أشعة (تباين أعلى) */
function enhance(im,mode,rot,max=1800){const s=Math.min(1,max/Math.max(im.width,im.height));const w=Math.round(im.width*s),h=Math.round(im.height*s);
  const c=document.createElement('canvas');const r90=rot%180!==0;c.width=r90?h:w;c.height=r90?w:h;const g=c.getContext('2d');
  g.translate(c.width/2,c.height/2);g.rotate(rot*Math.PI/180);g.drawImage(im,-w/2,-h/2,w,h);g.setTransform(1,0,0,1,0,0);
  if(mode!=='orig'){const d=g.getImageData(0,0,c.width,c.height),a=d.data;const hist=new Uint32Array(256);
    for(let i=0;i<a.length;i+=4){const y=(a[i]*.299+a[i+1]*.587+a[i+2]*.114)|0;a[i]=a[i+1]=a[i+2]=y;hist[y]++}
    const n=a.length/4;let lo=0,hi=255,acc=0;const cut=mode==='doc'?.02:.005;for(;lo<255;lo++){acc+=hist[lo];if(acc>n*cut)break}acc=0;for(;hi>0;hi--){acc+=hist[hi];if(acc>n*(mode==='doc'?.25:.005))break}
    const span=Math.max(1,hi-lo);for(let i=0;i<a.length;i+=4){let v=(a[i]-lo)*255/span;if(mode==='doc')v=v>235?255:v*v/255*1.05;v=v<0?0:v>255?255:v;a[i]=a[i+1]=a[i+2]=v}
    g.putImageData(d,0,0)}return c}
function thumbOf(canvas){const s=200/Math.max(canvas.width,canvas.height);const c=document.createElement('canvas');c.width=Math.round(canvas.width*s);c.height=Math.round(canvas.height*s);c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7)}
async function scanFlow(p,{cat='xray',caseId=null}={}){
  const pages=[];let mode=cat==='xray'||cat==='mri'||cat==='ct'?'xray':'doc',rot=0,cur=null;
  const add=async(src)=>{const files=await pickFile('image/*,application/pdf',src==='cam');for(const f of files){
      if(f.type==='application/pdf'){pages.push({pdf:await fileToDataUrl(f),name:f.name});continue}
      const url=URL.createObjectURL(f);try{pages.push({im:await loadImg(url)})}catch{toast('الصورة مش مدعومة')}}draw()};
  const draw=()=>{const last=pages.length-1;
   sheet(`<b>سكان – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
    <div class="row"><button class="btn primary" id="scam">${I.cam}تصوير</button><button class="btn" id="sgal">من الصور / ملف PDF</button></div>
    ${pages.length?`<div class="scanbox" id="sprev"></div>
     <div class="seg" id="smode"><button data-m="orig" class="${mode==='orig'?'on':''}">أصلي</button><button data-m="doc" class="${mode==='doc'?'on':''}">مستند</button><button data-m="xray" class="${mode==='xray'?'on':''}">أشعة</button></div>
     <div class="row"><button class="btn sm" id="srot">↻ تدوير</button>${pages.length>1?`<span class="fine">${pages.length} صفحات</span>`:''}<button class="btn sm danger" id="sdelp">حذف الصفحة</button></div>
     <label class="f">النوع<select class="in" id="scat">${opts(FCAT,cat)}</select></label>
     <div class="grid2"><label class="f">التاريخ<input class="in num" type="date" id="sdate" value="${today()}"></label><label class="f">العنوان<input class="in" id="stitle" placeholder="مثلاً: أشعة ركبة يمين وقوف"></label></div>
     <label class="f">ملاحظة / النتيجة<textarea class="in" id="snote" style="min-height:60px"></textarea></label>
     <button class="btn primary" id="ssave">حفظ في ملف المريض</button>`:'<p class="fine">صوّر الأشعة على الشاشة أو اللوح الضوئي، أو صوّر ورقة التحليل أو الروشتة. تقدر تضيف أكتر من صفحة.</p>'}</div>`);
   $('#scam').onclick=()=>add('cam');$('#sgal').onclick=()=>add('gal');
   if(!pages.length)return;const pg=pages[last];
   if(pg.pdf){$('#sprev').innerHTML=`<div style="color:#fff;padding:30px;text-align:center">📄 ${esc(pg.name||'PDF')}</div>`;$('#smode').hidden=true;$('#srot').hidden=true}
   else{cur=enhance(pg.im,mode,rot);$('#sprev').appendChild(cur)}
   $$('#smode button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;const c=$('#scat').value;cat=c;draw()});
   $('#srot').onclick=()=>{rot=(rot+90)%360;cat=$('#scat').value;draw()};
   $('#sdelp').onclick=()=>{pages.pop();draw()};
   $('#scat').onchange=e=>{cat=e.target.value};
   $('#ssave').onclick=async()=>{const b=$('#ssave');b.disabled=true;b.textContent='جاري الحفظ…';
     const outs=[];let thumb=null;for(let i=0;i<pages.length;i++){const q=pages[i];if(q.pdf){outs.push({d:q.pdf,t:'pdf'});continue}
       const c=i===last?cur:enhance(q.im,mode,0);let d=c.toDataURL('image/jpeg',.82);if(d.length>2.5e6)d=c.toDataURL('image/jpeg',.6);if(!thumb)thumb=thumbOf(c);outs.push({d,t:'img'})}
     const ids=[];for(const o of outs)ids.push(await putBlob(o.d));
     const c2=$('#scat').value;const meta={patientId:p.id,cat:c2,date:val('sdate')||today(),title:val('stitle'),note:val('snote'),pages:ids,types:outs.map(o=>o.t),thumb,caseId,createdAt:Date.now(),by:S.name||S.email};
     if(c2==='rx'){const id=D.add(C('rx'),{patientId:p.id,date:meta.date,scanned:true,blob:ids[0],thumb,ocr:'',note:meta.note,createdAt:Date.now()});closeSheet();toast('اتحفظت الروشتة');
       const r={id,blob:ids[0],date:meta.date,scanned:true,ocr:''};viewRxScan(p,r);setTimeout(()=>{const o=$('#rocr');if(o)o.click()},300)}
     else{D.add(C('files'),meta);closeSheet();toast('اتحفظ');}
     D.update(C('patients/'+p.id),{updatedAt:Date.now()});if(c2!=='rx')render()}};
  draw()}
async function tFiles(p){const fl=(await D.list(C('files'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  const f0=qs().c||'';const cats=[...new Set(fl.map(f=>f.cat))];const show=f0?fl.filter(f=>f.cat===f0):fl;
  $('#tab').innerHTML=`<div class="row"><button class="btn primary" id="sc">${I.cam}سكان أشعة / تحليل</button></div>
   ${cats.length>1?`<div class="chips" style="margin-top:10px"><a class="chip ${f0?'':'on'}" href="#/p/${p.id}/files">الكل</a>${cats.map(c=>`<a class="chip ${f0===c?'on':''}" href="#/p/${p.id}/files?c=${c}">${FCATN[c]||c}</a>`).join('')}</div>`:''}
   <div class="thumbs" style="margin-top:10px">${show.map(f=>`<figure data-f="${f.id}">${f.thumb?`<img src="${f.thumb}" alt="">`:`<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:30px">📄</div>`}<figcaption><b>${esc(FCATN[f.cat]||'')}</b> · ${fmtShort(f.date)}<br>${esc(f.title||'')}${(f.pages||[]).length>1?` (${f.pages.length} صفحات)`:''}</figcaption></figure>`).join('')||'<div class="empty" style="grid-column:1/-1">لا توجد أشعة أو تحاليل</div>'}</div>`;
  $('#sc').onclick=()=>scanFlow(p,{});$$('[data-f]').forEach(el=>el.onclick=()=>openFile(p,fl.find(f=>f.id===el.dataset.f)))}
async function openFile(p,f){sheet(`<b>${esc(FCATN[f.cat]||'')} – ${fmt(f.date)}</b>${f.title?`<div>${esc(f.title)}</div>`:''}<div id="fpg" class="list" style="margin-top:8px"><span class="fine">جاري التحميل…</span></div>
  <label class="f" style="margin-top:8px">ملاحظة / النتيجة<textarea class="in" id="fn">${esc(f.note||'')}</textarea></label>
  <div class="row" style="margin-top:8px"><button class="btn primary" id="fsv">حفظ</button><button class="btn" id="fsh">مشاركة</button><button class="btn danger" id="fdel">حذف</button></div>`);
  const data=[];for(let i=0;i<(f.pages||[]).length;i++)data.push(await getBlob(f.pages[i]));
  $('#fpg').innerHTML=data.map((d,i)=>!d?'<div class="empty">الصفحة مش متاحة</div>':(f.types||[])[i]==='pdf'?`<button class="btn" data-pdf="${i}">📄 فتح ملف PDF</button>`:`<img src="${d}" data-i="${i}" style="width:100%;border-radius:10px;cursor:zoom-in">`).join('');
  $$('#fpg img').forEach(im=>im.onclick=()=>viewer(data[+im.dataset.i],FCATN[f.cat]||''));
  $$('[data-pdf]').forEach(b=>b.onclick=()=>shareDataUrl(data[+b.dataset.pdf],`file-${f.date}.pdf`,'application/pdf'));
  $('#fsv').onclick=()=>{D.update(C('files/'+f.id),{note:val('fn')});closeSheet();toast('اتحفظ')};
  $('#fsh').onclick=()=>{const d=data[0];if(d)shareDataUrl(d,`${f.cat}-${p.fileNo||''}-${f.date}.${(f.types||[])[0]==='pdf'?'pdf':'jpg'}`,(f.types||[])[0]==='pdf'?'application/pdf':'image/jpeg')};
  confirmBtn($('#fdel'),()=>{(f.pages||[]).forEach(delBlob);D.del(C('files/'+f.id));closeSheet();render()})}
function viewer(src,title){const v=document.createElement('div');v.className='viewer';v.innerHTML=`<div class="vb"><b>${esc(title||'')}</b><button class="btn sm" id="vz">تكبير</button><button class="btn sm" id="vx">إغلاق</button></div><div class="vi"><img src="${src}"></div>`;
  document.body.appendChild(v);v.querySelector('#vx').onclick=()=>v.remove();v.querySelector('#vz').onclick=()=>v.querySelector('.vi').classList.toggle('z')}

/* ================= الملاحظات الصوتية ================= */
let recState=null;
async function tVoice(p){const vs=(await D.list(C('voices'),[['patientId','==',p.id]])).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $('#tab').innerHTML=`<div class="card rec"><div class="timer" id="rt">0:00</div><button class="recbtn" id="rb">تسجيل</button><span class="fine">الملاحظة الصوتية تتحفظ في ملف المريض فقط.</span></div>
   <div class="list" style="margin-top:12px">${vs.map(v=>`<div class="card" data-v="${v.id}"><div class="row" style="justify-content:space-between"><b>${fmt(v.date)} · <span class="num">${Math.floor((v.dur||0)/60)}:${pad((v.dur||0)%60)}</span></b><span class="fine">${esc(v.by||'')}</span></div>
     <div class="pl" style="margin:8px 0"><button class="btn sm" data-play="${v.id}">▶ تشغيل</button></div>
     <textarea class="in" data-tx="${v.id}" placeholder="اكتب ملخص الملاحظة أو استخدم الإملاء" style="min-height:56px">${esc(v.text||'')}</textarea>
     <div class="row" style="margin-top:6px"><button class="btn sm" data-sv="${v.id}">حفظ النص</button><button class="btn sm" data-dc="${v.id}">${I.mic}إملاء</button><button class="btn sm danger" data-del="${v.id}">حذف</button></div></div>`).join('')||'<div class="empty">لا توجد ملاحظات صوتية</div>'}</div>`;
  $('#rb').onclick=()=>recState?stopRec():startRec(p);
  $$('[data-play]').forEach(b=>b.onclick=async()=>{const v=vs.find(x=>x.id===b.dataset.play);b.textContent='جاري التحميل…';const d=await getBlob(v.blob);if(!d){b.textContent='غير متاح';return}
    const au=document.createElement('audio');au.controls=true;au.src=d;b.replaceWith(au);au.play().catch(()=>{})});
  $$('[data-sv]').forEach(b=>b.onclick=()=>{D.update(C('voices/'+b.dataset.sv),{text:$(`[data-tx="${b.dataset.sv}"]`).value});toast('اتحفظ')});
  $$('[data-dc]').forEach(b=>b.onclick=()=>dictate($(`[data-tx="${b.dataset.dc}"]`),b));
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{const v=vs.find(x=>x.id===b.dataset.del);delBlob(v.blob);D.del(C('voices/'+v.id));render()}))}
async function startRec(p){let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch{return toast('اسمح باستخدام الميكروفون')}
  const mt=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||'';
  const rec=new MediaRecorder(stream,mt?{mimeType:mt,audioBitsPerSecond:32000}:{});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  const t0=Date.now();const tick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);const el=$('#rt');if(el)el.textContent=`${Math.floor(s/60)}:${pad(s%60)}`;if(s>=900)stopRec()},300);
  rec.onstop=async()=>{clearInterval(tick);stream.getTracks().forEach(t=>t.stop());const dur=Math.round((Date.now()-t0)/1000);const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
    if(dur<1)return render();toast('جاري الحفظ…');const d=await fileToDataUrl(blob);const id=await putBlob(d);
    D.add(C('voices'),{patientId:p.id,date:today(),dur,blob:id,type:blob.type,text:'',createdAt:Date.now(),by:S.name||S.email});D.update(C('patients/'+p.id),{updatedAt:Date.now()});toast('اتحفظت الملاحظة');recState=null;render()};
  rec.start(1000);recState={rec};const b=$('#rb');b.classList.add('on');b.textContent='إيقاف'}
function stopRec(){if(recState){recState.rec.stop()}}

/* ================= متابعة العمليات والكسور ================= */
const caseName=c=>c.title||((PROTO[c.kind]||{})[c.proto]||{}).n||'';
function msState(m){if(m.done)return'done';const t=today();if(m.due<t)return'late';if(m.due<=addDays(t,3))return'due';return''}
function caseMsHtml(c,clickable){return`<div class="ms">${(c.ms||[]).map((m,i)=>{const s=msState(m);return`<div class="m1 ${s}" ${clickable?`data-ms="${i}" style="cursor:pointer"`:''}><span class="d"></span><span class="x"><b>${esc(m.l)}</b><br><span class="fine">${m.done?'تمت'+(m.doneDate?' '+fmt(m.doneDate):''):fmtDay(m.due)}${s==='late'?' – متأخرة '+diffDays(m.due,today())+' يوم':''}</span>${m.union||m.wound||m.note?`<br><span class="fine">${[m.union?'الالتئام: '+(Object.fromEntries(UNION)[m.union]||''):'',m.wound?'الجرح: '+(Object.fromEntries(WOUND)[m.wound]||''):'',m.pain!=null&&m.pain!==''?'الألم '+m.pain+'/10':'',m.note||''].filter(Boolean).map(esc).join(' · ')}</span>`:''}</span>${s==='late'?'<span class="tag bad">متأخرة</span>':s==='due'?'<span class="tag warn">مستحقة</span>':''}</div>`}).join('')}</div>`}
function fuRow({c,m,i,late}){const p=patient(c.patientId)||{name:c.name};return`<div class="item" data-fu="${c.id}" data-i="${i}" style="flex-direction:column;align-items:stretch;gap:4px">
  <div style="display:flex;gap:10px;align-items:center"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><a class="m" href="#/case/${c.id}" style="text-decoration:none;color:inherit"><span class="t">${esc(p.name)}</span><span class="s">${esc(m.l)} · ${esc(caseName(c))}</span></a><span class="tag ${late?'bad':'warn'}">${late?'متأخرة':'اليوم'} ${fmtShort(m.due)}</span></div>
  <div class="acts"><button class="btn sm wa" data-k="wa">${I.wa}تذكير بالمتابعة</button><button class="btn sm" data-k="book">حجز</button><button class="btn sm primary" data-k="rec">تسجيل المتابعة</button></div></div>`}
function bindFu(){$$('[data-fu]').forEach(el=>{const c=S.cases.find(x=>x.id===el.dataset.fu);const i=+el.dataset.i;if(!c)return;const m=c.ms[i];
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.k;const p=patient(c.patientId)||{name:c.name,phone:c.phone};
   if(k==='wa'){if(wa(p.phone,fillTpl(waTpl('follow'),tplVars(p,{'المتابعة':m.l,'الحالة':caseName(c),'التاريخ':fmtDay(m.due)})))){c.ms[i].sentAt=Date.now();D.update(C('cases/'+c.id),{ms:c.ms})}}
   else if(k==='book')bookSheet({pid:c.patientId,date:m.due<today()?today():m.due,type:'fu',note:m.l});
   else msSheet(c,i)})})}
function vFollow(){const f=qs().f||'due';const t=today();const all=dueMilestones(f==='week'?7:f==='all'?3650:0);
  const list=f==='all'?S.cases:null;
  shell('متابعة العمليات والكسور',`<div class="seg"><a href="#/fu?f=due" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='due'?'on':''}">مستحقة ومتأخرة</a><a href="#/fu?f=week" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='week'?'on':''}">خلال أسبوع</a><a href="#/fu?f=all" style="flex:1;text-align:center;padding:9px;text-decoration:none;color:inherit" class="${f==='all'?'on':''}">كل الحالات</a></div>
   <div class="stats" style="margin-top:12px"><div class="stat"><div class="k">حالات مفتوحة</div><div class="v">${S.cases.length}</div></div><div class="stat"><div class="k">متأخرة</div><div class="v" style="color:var(--bad)">${dueMilestones(0).filter(x=>x.late).length}</div></div><div class="stat"><div class="k">عمليات</div><div class="v">${S.cases.filter(c=>c.kind==='surgery').length}</div></div><div class="stat"><div class="k">كسور</div><div class="v">${S.cases.filter(c=>c.kind==='fracture').length}</div></div></div>
   <div class="list" style="margin-top:12px">${list?list.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(c=>{const p=patient(c.patientId)||{name:c.name};const nx=(c.ms||[]).find(m=>!m.done);return`<a class="item" href="#/case/${c.id}"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${esc(caseName(c))} · ${fmt(c.date)}</span></span><span class="r">${nx?esc(nx.l)+'<br>'+fmtShort(nx.due):'اكتملت'}</span></a>`}).join(''):all.map(fuRow).join('')}
   ${(list?!list.length:!all.length)?'<div class="empty">مفيش متابعات هنا. ضيف عملية أو كسر من ملف المريض ← المتابعة.</div>':''}</div>`);
  $$('.seg a').forEach(a=>{if(a.classList.contains('on')){a.style.background='var(--accent)';a.style.color='var(--accent-ink)'}});bindFu()}
async function tFu(p){const cs=(await D.list(C('cases'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  $('#tab').innerHTML=`<div class="row"><button class="btn primary" id="ns">${I.plus}عملية</button><button class="btn primary" id="nf">${I.plus}كسر</button></div>
   <div class="list" style="margin-top:10px">${cs.map(c=>`<a class="item" href="#/case/${c.id}"><span class="av">${c.kind==='fracture'?'🦴':'✚'}</span><span class="m"><span class="t">${esc(caseName(c))}${c.side?' – '+esc(c.side):''}</span><span class="s">${fmt(c.date)} · ${(c.ms||[]).filter(m=>m.done).length}/${(c.ms||[]).length} متابعات</span></span><span class="tag ${c.status==='open'?'warn':'ok'}">${c.status==='open'?'جارية':'منتهية'}</span></a>`).join('')||'<div class="empty">لا توجد عمليات أو كسور مسجلة</div>'}</div>`;
  $('#ns').onclick=()=>caseSheet(p,'surgery');$('#nf').onclick=()=>caseSheet(p,'fracture')}
function caseSheet(p,kind,c){const x=c||{kind,date:today(),proto:Object.keys(PROTO[kind])[0]};
  sheet(`<b>${c?'تعديل':'تسجيل'} ${kind==='fracture'?'كسر':'عملية'} – ${esc(p.name)}</b><div class="form" style="margin-top:10px">
   <label class="f">${kind==='fracture'?'نوع العلاج':'العملية'}<select class="in" id="cp">${opts(Object.entries(PROTO[kind]).map(([k,v])=>[k,v.n]),x.proto)}</select></label>
   <label class="f">${kind==='fracture'?'الكسر (المكان والتصنيف)':'التفاصيل'}<input class="in" id="ct" value="${esc(x.title||'')}" placeholder="${kind==='fracture'?'مثلاً: كسر أسفل الكعبرة يسار':'مثلاً: ACL hamstring graft'}"></label>
   <div class="grid2"><label class="f">${kind==='fracture'?'تاريخ الإصابة / التثبيت':'تاريخ العملية'}<input class="in num" type="date" id="cd" value="${x.date}"></label><label class="f">الجهة<select class="in" id="cs">${opts([['','—'],['يمين','يمين'],['يسار','يسار'],['الجهتين','الجهتين']],x.side)}</select></label></div>
   ${kind==='surgery'?`<div class="grid2"><label class="f">المستشفى<input class="in" id="ch" value="${esc(x.hospital||'')}"></label><label class="f">تكلفة العملية<input class="in num" type="number" inputmode="decimal" id="cf" value="${esc(x.fee||'')}"></label></div>`:''}
   <label class="f">ملاحظات / المسمار أو الشريحة المستخدمة<textarea class="in" id="cn" style="min-height:60px">${esc(x.notes||'')}</textarea></label>
   <p class="fine">جدول المتابعة هيتعمل تلقائياً من تاريخ ${kind==='fracture'?'الكسر':'العملية'}، وتقدر تعدّل أي تاريخ بعدين.</p>
   <div class="row"><button class="btn primary" id="csv">حفظ</button></div></div>`);
  $('#csv').onclick=()=>{const proto=$('#cp').value,date=$('#cd').value;const tpl=PROTO[kind][proto];
    const ms=c&&c.proto===proto&&c.date===date?c.ms:tpl.m.map(([d,l])=>({d,l,due:addDays(date,d),done:false}));
    const o={patientId:p.id,name:p.name,phone:p.phone||'',kind,proto,title:val('ct'),date,side:$('#cs').value,hospital:$('#ch')?val('ch'):'',fee:$('#cf')?+val('cf')||0:0,notes:val('cn'),ms,status:c?c.status:'open',updatedAt:Date.now()};
    let id;if(c){id=c.id;D.update(C('cases/'+id),o)}else{o.createdAt=Date.now();id=D.add(C('cases'),o);
      if(o.fee>0)addTx({kind:'charge',amount:o.fee,date,patientId:p.id,name:p.name,cat:'surgery',note:'عملية: '+(o.title||tpl.n),at:Date.now(),caseId:id})}
    D.update(C('patients/'+p.id),{updatedAt:Date.now()});closeSheet();toast('اتحفظ');location.hash='#/case/'+id}}
async function vCase(id){const c0=await D.get(C('cases/'+id));if(!c0){shell('الحالة','<div class="empty">غير موجودة</div>',{back:true});return}const c={id,...c0};const p=await getPatient(c.patientId)||{name:c.name};
  const files=(await D.list(C('files'),[['patientId','==',c.patientId]])).filter(f=>f.caseId===id||f.date>=c.date).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
  shell(caseName(c),`<a class="item" href="#/p/${c.patientId}"><span class="av">${esc(initials(p))}</span><span class="m"><span class="t">${esc(p.name)}</span><span class="s">${c.kind==='fracture'?'كسر':'عملية'} · ${fmt(c.date)}${c.side?' · '+esc(c.side):''} · منذ ${Math.max(0,diffDays(c.date,today()))} يوم</span></span></a>
   ${c.title||c.notes||c.hospital?`<div class="card" style="margin-top:10px">${c.title?`<b>${esc(c.title)}</b><br>`:''}${c.hospital?'المستشفى: '+esc(c.hospital)+'<br>':''}${esc(c.notes||'')}</div>`:''}
   <h3>جدول المتابعة</h3>${caseMsHtml(c,true)}
   <div class="row" style="margin-top:10px"><button class="btn" id="addm">${I.plus}متابعة إضافية</button><button class="btn" id="cx">${I.cam}أشعة متابعة</button><button class="btn" id="ced">${I.edit}تعديل</button><button class="btn" id="cst">${c.status==='open'?'إنهاء المتابعة':'إعادة فتح'}</button></div>
   ${files.length?`<h3>الأشعة من بعد ${c.kind==='fracture'?'الكسر':'العملية'}</h3><div class="thumbs">${files.map(f=>`<figure data-f="${f.id}">${f.thumb?`<img src="${f.thumb}">`:'<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center">📄</div>'}<figcaption>${fmtShort(f.date)} · ${esc(FCATN[f.cat]||'')}</figcaption></figure>`).join('')}</div>`:''}
   ${isDoc()?'<div style="margin-top:20px"><button class="btn sm danger" id="cdel">حذف الحالة</button></div>':''}`,{back:true});
  $$('[data-ms]').forEach(el=>el.onclick=()=>msSheet(c,+el.dataset.ms));
  $('#addm').onclick=()=>{c.ms.push({d:diffDays(c.date,addDays(today(),14)),l:'متابعة',due:addDays(today(),14),done:false});D.update(C('cases/'+id),{ms:c.ms});msSheet(c,c.ms.length-1)};
  $('#cx').onclick=()=>scanFlow(p,{cat:'xray',caseId:id});$('#ced').onclick=()=>caseSheet(p,c.kind,c);
  $('#cst').onclick=()=>{D.update(C('cases/'+id),{status:c.status==='open'?'closed':'open'});setTimeout(render,200)};
  $$('[data-f]').forEach(el=>el.onclick=()=>openFile(p,files.find(f=>f.id===el.dataset.f)));
  const dl=$('#cdel');if(dl)confirmBtn(dl,()=>{D.del(C('cases/'+id));history.back()})}
function msSheet(c,i){const m=c.ms[i];const frac=c.kind==='fracture'||c.proto==='hto';
  sheet(`<b>${esc(m.l)}</b> <span class="fine">${esc(caseName(c))}</span><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">اسم المتابعة<input class="in" id="ml" value="${esc(m.l)}"></label><label class="f">الموعد<input class="in num" type="date" id="mdue" value="${m.due}"></label></div>
   <label class="tog" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="mdone" ${m.done?'checked':''}> تمت المتابعة</label>
   <div class="grid2"><label class="f">تاريخ الكشف<input class="in num" type="date" id="mdd" value="${m.doneDate||today()}"></label><label class="f">الألم (٠–١٠)<input class="in num" type="number" min="0" max="10" id="mp" value="${esc(m.pain??'')}"></label></div>
   <div class="grid2"><label class="f">الجرح<select class="in" id="mw">${opts(WOUND,m.wound)}</select></label>${frac?`<label class="f">الالتئام في الأشعة<select class="in" id="mu">${opts(UNION,m.union)}</select></label>`:'<span></span>'}</div>
   <label class="f">الحركة / التحميل<input class="in" id="mr" value="${esc(m.rom||'')}" placeholder="مثلاً: ثني ١٢٠°، مشي بدون عكاز"></label>
   <label class="f">ملاحظات<textarea class="in" id="mn" style="min-height:60px">${esc(m.note||'')}</textarea></label>
   <div class="row"><button class="btn primary" id="msv">حفظ</button><button class="btn wa" id="mwa">${I.wa}تذكير</button><button class="btn danger" id="mdel">حذف</button></div></div>`);
  const sv=()=>{const nd=$('#mdue').value;Object.assign(m,{l:val('ml')||m.l,due:nd,done:$('#mdone').checked,doneDate:$('#mdone').checked?$('#mdd').value:null,pain:val('mp'),wound:$('#mw').value,union:$('#mu')?$('#mu').value:m.union||'',rom:val('mr'),note:val('mn')});
    c.ms.sort((a,b)=>a.due.localeCompare(b.due));const allDone=c.ms.every(x=>x.done);D.update(C('cases/'+c.id),{ms:c.ms,...(allDone?{status:'closed'}:{}),updatedAt:Date.now()});closeSheet();toast(allDone?'اكتملت كل المتابعات':'اتحفظ');setTimeout(render,200)};
  $('#mdd').oninput=()=>$('#mdone').checked=true;['mp','mw','mr','mn','mu'].forEach(k=>{const e=$('#'+k);if(e)e.addEventListener('change',()=>$('#mdone').checked=true)});
  $('#msv').onclick=sv;$('#mwa').onclick=()=>{const p=patient(c.patientId)||{name:c.name,phone:c.phone};wa(p.phone,fillTpl(waTpl('follow'),tplVars(p,{'المتابعة':m.l,'الحالة':caseName(c),'التاريخ':fmtDay(m.due)})))};
  confirmBtn($('#mdel'),()=>{c.ms.splice(i,1);D.update(C('cases/'+c.id),{ms:c.ms});closeSheet();setTimeout(render,200)})}


/* ================= الحسابات ================= */
const clinicPath=()=>S.mode==='local'?'clinics/local':'clinics/'+S.cid;
function addTx(o){const id=D.add(C('tx'),{at:Date.now(),by:S.name||S.email,...o});if(o.patientId)setTimeout(()=>recomputeBalance(o.patientId),300);return id}
async function balanceOf(pid){const t=await D.list(C('tx'),[['patientId','==',pid]]);return t.reduce((s,x)=>s+(x.kind==='charge'?+x.amount:x.kind==='pay'?-x.amount:0),0)}
async function recomputeBalance(pid){const b=await balanceOf(pid);D.update(C('patients/'+pid),{balance:Math.round(b*100)/100})}
async function tAcc(p){const t=(await D.list(C('tx'),[['patientId','==',p.id]])).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.at||0)-(a.at||0));
  const ch=t.filter(x=>x.kind==='charge').reduce((s,x)=>s+ +x.amount,0),pd=t.filter(x=>x.kind==='pay').reduce((s,x)=>s+ +x.amount,0);
  $('#tab').innerHTML=`<div class="stats"><div class="stat"><div class="k">المطلوب</div><div class="v sm money">${money(ch)}</div></div><div class="stat"><div class="k">المدفوع</div><div class="v sm money pos">${money(pd)}</div></div><div class="stat"><div class="k">المتبقي</div><div class="v sm money ${ch-pd>0?'neg':''}">${money(ch-pd)}</div></div></div>
   <div class="row" style="margin-top:10px"><button class="btn primary" id="ap">دفعة</button><button class="btn" id="ac">مطلوب جديد (عملية / خدمة)</button>${ch-pd>0&&p.phone?`<button class="btn wa" id="aw">${I.wa}تذكير بالمتبقي</button>`:''}</div>
   <div class="list" style="margin-top:10px">${t.map(x=>`<div class="item"><span class="m"><span class="t">${x.kind==='pay'?'دفعة'+(x.method?' – '+(PMN[x.method]||''):''):esc(x.note||VTN[x.cat]||'مطلوب')}</span><span class="s">${fmt(x.date)}${x.by?' · '+esc(x.by):''}</span></span><span class="money ${x.kind==='pay'?'pos':''}">${x.kind==='pay'?'−':'+'}${money(x.amount)}</span>${isDoc()?`<button class="btn sm danger" data-del="${x.id}">✕</button>`:''}</div>`).join('')||'<div class="empty">لا توجد حسابات</div>'}</div>`;
  $('#ap').onclick=()=>txSheet({kind:'pay',p,suggest:Math.max(0,ch-pd)});$('#ac').onclick=()=>txSheet({kind:'charge',p});
  const aw=$('#aw');if(aw)aw.onclick=()=>wa(p.phone,fillTpl(waTpl('dues'),tplVars(p,{'المبلغ':money(ch-pd)})));
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{D.del(C('tx/'+b.dataset.del));setTimeout(()=>{recomputeBalance(p.id);render()},300)},'حذف؟'))}
function txSheet({kind,p=null,suggest=''}){const T={pay:'تسجيل دفعة',charge:'مطلوب جديد',exp:'مصروف جديد',inc:'إيراد آخر'}[kind];
  sheet(`<b>${T}${p?' – '+esc(p.name):''}</b><div class="form" style="margin-top:10px">
   <div class="grid2"><label class="f">المبلغ<input class="in num" type="number" inputmode="decimal" id="xa" value="${suggest||''}"></label><label class="f">التاريخ<input class="in num" type="date" id="xd" value="${today()}"></label></div>
   ${kind==='exp'?`<label class="f">البند<select class="in" id="xc">${opts(EXPC,'supply')}</select></label>`:''}
   ${kind==='charge'?`<label class="f">النوع<select class="in" id="xc">${opts([['surgery','عملية'],...VT],'surgery')}</select></label>`:''}
   ${kind==='pay'||kind==='inc'||kind==='exp'?`<div class="chips" id="xm">${PM.map(([k,l],i)=>`<button class="chip ${i===0?'on':''}" data-v="${k}">${l}</button>`).join('')}</div>`:''}
   <label class="f">البيان<input class="in" id="xn" placeholder="${kind==='exp'?'مثلاً: إيجار شهر نوفمبر':kind==='charge'?'مثلاً: عملية رباط صليبي':''}"></label>
   <div class="row"><button class="btn primary" id="xs">حفظ</button><button class="btn" data-close>إلغاء</button></div></div>`);
  let pm='cash';$$('#xm .chip').forEach(b=>b.onclick=()=>{pm=b.dataset.v;$$('#xm .chip').forEach(x=>x.classList.toggle('on',x===b))});
  $('#xs').onclick=()=>{const a=+val('xa');if(!(a>0))return toast('اكتب المبلغ');const o={kind:kind==='inc'?'pay':kind,amount:a,date:$('#xd').value,note:val('xn'),method:kind==='charge'?null:pm,cat:$('#xc')?$('#xc').value:(kind==='inc'?'other':null)};
    if(p){o.patientId=p.id;o.name=p.name}addTx(o);closeSheet();toast('اتسجل');setTimeout(render,350)}}
async function vAccounts(){if(!isDoc()){shell('الحسابات','<div class="empty">الحسابات متاحة للطبيب فقط</div>');return}
  const q=qs();const per=q.per||'month';const t=today();let from,to=t;
  if(per==='day'){from=q.d||t;to=from}else if(per==='month'){const m=q.m||t.slice(0,7);from=m+'-01';const d=new Date(from+'T12:00:00');d.setMonth(d.getMonth()+1);d.setDate(0);to=iso(d)}else if(per==='year'){const y=q.y||t.slice(0,4);from=y+'-01-01';to=y+'-12-31'}else{from=q.from||addDays(t,-30);to=q.to||t}
  const tx=await D.list(C('tx'),[['date','>=',from],['date','<=',to]]);
  const pays=tx.filter(x=>x.kind==='pay'),exps=tx.filter(x=>x.kind==='exp');const inc=pays.reduce((s,x)=>s+ +x.amount,0),out=exps.reduce((s,x)=>s+ +x.amount,0);
  const byCat={};pays.forEach(x=>{const k=x.cat==='surgery'?'عمليات':VTN[x.cat]||(x.cat==='other'?'إيرادات أخرى':'دفعات');byCat[k]=(byCat[k]||0)+ +x.amount});
  const byM={};pays.forEach(x=>{const k=PMN[x.method]||'غير محدد';byM[k]=(byM[k]||0)+ +x.amount});
  const byE={};exps.forEach(x=>{const k=EXPN[x.cat]||'أخرى';byE[k]=(byE[k]||0)+ +x.amount});
  const bars=o=>{const mx=Math.max(1,...Object.values(o));return`<div class="bars">${Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="b"><span>${esc(k)}</span><span class="bar"><i style="width:${v/mx*100}%"></i></span><span class="money" style="text-align:end">${money(v)}</span></div>`).join('')||'<span class="fine">لا يوجد</span>'}</div>`};
  const owing=S.patients.filter(p=>p.balance>0).sort((a,b)=>b.balance-a.balance);
  const visits=S.appts.length;
  const ml=q.m||t.slice(0,7);const mPrev=(()=>{const d=new Date(ml+'-15T12:00:00');d.setMonth(d.getMonth()-1);return iso(d).slice(0,7)})(),mNext=(()=>{const d=new Date(ml+'-15T12:00:00');d.setMonth(d.getMonth()+1);return iso(d).slice(0,7)})();
  shell('الحسابات',`<div class="seg">${[['day','اليوم'],['month','الشهر'],['year','السنة'],['range','فترة']].map(([k,l])=>`<button data-per="${k}" class="${per===k?'on':''}">${l}</button>`).join('')}</div>
   <div class="row" style="margin:10px 0;justify-content:space-between">${per==='month'?`<a class="btn sm" href="#/acc?per=month&m=${mPrev}">‹</a><b>${new Date(from+'T12:00:00').toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</b><a class="btn sm" href="#/acc?per=month&m=${mNext}">›</a>`:
     per==='day'?`<input type="date" class="in num" id="pd" value="${from}" style="max-width:200px">`:per==='year'?`<a class="btn sm" href="#/acc?per=year&y=${+from.slice(0,4)-1}">‹</a><b class="num">${from.slice(0,4)}</b><a class="btn sm" href="#/acc?per=year&y=${+from.slice(0,4)+1}">›</a>`:
     `<input type="date" class="in num" id="pf" value="${from}" style="max-width:160px"> إلى <input type="date" class="in num" id="pt" value="${to}" style="max-width:160px">`}</div>
   <div class="stats"><div class="stat"><div class="k">الإيرادات</div><div class="v sm money pos">${money(inc)}</div></div><div class="stat"><div class="k">المصروفات</div><div class="v sm money neg">${money(out)}</div></div><div class="stat"><div class="k">الصافي</div><div class="v sm money">${money(inc-out)}</div></div><div class="stat"><div class="k">عدد الدفعات</div><div class="v sm">${pays.length}</div></div></div>
   <div class="row" style="margin-top:10px"><button class="btn primary" id="ne">مصروف</button><button class="btn" id="ni">إيراد آخر</button><button class="btn" id="csv">تصدير Excel</button></div>
   <h3>الإيرادات حسب النوع</h3>${bars(byCat)}<h3>طريقة الدفع</h3>${bars(byM)}<h3>المصروفات</h3>${bars(byE)}
   <h3>مستحقات على المرضى (${owing.length}) – <span class="money">${money(owing.reduce((s,p)=>s+p.balance,0))}</span></h3><div class="list">${owing.slice(0,30).map(p=>pItem(p,`<span class="money neg">${money(p.balance)}</span>`,'#/p/'+p.id+'/acc')).join('')||'<div class="empty">لا توجد مستحقات</div>'}</div>
   <h3>الحركات</h3><div class="list">${[...tx].filter(x=>x.kind!=='charge').sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.at||0)-(a.at||0)).slice(0,100).map(x=>`<div class="item"><span class="m"><span class="t">${x.kind==='exp'?esc(EXPN[x.cat]||'مصروف'):esc(x.name||'إيراد')}</span><span class="s">${fmt(x.date)} · ${esc(x.note||VTN[x.cat]||'')}${x.method?' · '+(PMN[x.method]||''):''}</span></span><span class="money ${x.kind==='exp'?'neg':'pos'}">${x.kind==='exp'?'−':'+'}${money(x.amount)}</span><button class="btn sm danger" data-del="${x.id}" data-p="${x.patientId||''}">✕</button></div>`).join('')||'<div class="empty">لا توجد حركات</div>'}</div>`);
  $$('[data-per]').forEach(b=>b.onclick=()=>location.hash='#/acc?per='+b.dataset.per);
  const pdI=$('#pd');if(pdI)pdI.onchange=e=>location.hash='#/acc?per=day&d='+e.target.value;
  const pf=$('#pf');if(pf){const go=()=>location.hash=`#/acc?per=range&from=${$('#pf').value}&to=${$('#pt').value}`;pf.onchange=go;$('#pt').onchange=go}
  $('#ne').onclick=()=>txSheet({kind:'exp'});$('#ni').onclick=()=>txSheet({kind:'inc'});
  $$('[data-del]').forEach(b=>confirmBtn(b,()=>{D.del(C('tx/'+b.dataset.del));if(b.dataset.p)setTimeout(()=>recomputeBalance(b.dataset.p),300);setTimeout(render,350)},'حذف؟'));
  $('#csv').onclick=()=>{const rows=[['التاريخ','النوع','المريض','البند','البيان','طريقة الدفع','المبلغ']];
    [...tx].sort((a,b)=>(a.date||'').localeCompare(b.date||'')).forEach(x=>rows.push([x.date,{pay:'إيراد',exp:'مصروف',charge:'مطلوب'}[x.kind],x.name||'',x.kind==='exp'?EXPN[x.cat]||'':x.cat==='surgery'?'عملية':VTN[x.cat]||'',x.note||'',PMN[x.method]||'',x.amount]));
    const csv='﻿'+rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');shareBlob(new Blob([csv],{type:'text/csv'}),`clinic-accounts-${from}-${to}.csv`,'text/csv')}}

/* ================= المزيد والإعدادات ================= */
function vMore(){const c=CL();shell('المزيد',`<div class="card"><b>${esc(c.name||'العيادة')}</b><div class="fine">${esc(c.doctor||'')} · ${S.mode==='local'?'البيانات على هذا الجهاز فقط':'متصل بقاعدة بيانات العيادة – '+esc(S.email)+' ('+(isDoc()?'طبيب':'مساعد')+')'}</div></div>
  <div class="list" style="margin-top:12px">
   ${isDoc()?`<a class="item" href="#/more/clinic"><span class="m"><span class="t">بيانات العيادة ومواعيد العمل</span><span class="s">الاسم، العنوان، الأيام والساعات، مدة الكشف</span></span></a>
   <a class="item" href="#/more/fees"><span class="m"><span class="t">الأسعار</span><span class="s">الكشف، الاستشارة، الغيار…</span></span></a>
   <a class="item" href="#/more/wa"><span class="m"><span class="t">رسائل الواتساب</span><span class="s">التأكيد، التذكير، المتابعة</span></span></a>
   <a class="item" href="#/more/drugs"><span class="m"><span class="t">الأدوية المفضلة</span><span class="s">${drugs().length} دواء</span></span></a>`:''}
   ${S.mode==='cloud'&&isDoc()?`<a class="item" href="#/more/team"><span class="m"><span class="t">الفريق</span><span class="s">إضافة السكرتارية والمساعدين</span></span></a><a class="item" href="#/more/code"><span class="m"><span class="t">كود إعداد العيادة</span><span class="s">لتشغيل التطبيق على جهاز المساعد</span></span></a>`:''}
   ${S.mode==='local'?`<a class="item" href="#/more/connect"><span class="m"><span class="t">ربط قاعدة بيانات العيادة</span><span class="s">عشان الطبيب والسكرتارية يشتغلوا على نفس البيانات من أكتر من جهاز</span></span></a>`:''}
   <a class="item" href="#/more/backup"><span class="m"><span class="t">نسخة احتياطية</span><span class="s">حفظ واسترجاع كل البيانات</span></span></a>
   <a class="item" href="#/more/booklink"><span class="m"><span class="t">رابط حجز للمرضى على الواتساب</span><span class="s">حطه على فيسبوك وإنستجرام</span></span></a>
   ${S.mode==='cloud'?'<button class="item" id="out"><span class="m"><span class="t" style="color:var(--bad)">تسجيل خروج</span></span></button>':''}
  </div><p class="fine" style="margin-top:14px">العيادة – الإصدار ٢٫٠</p>`);
  const o=$('#out');if(o)o.onclick=()=>FB.signOut(auth)}
function saveClinic(o){Object.assign(S.clinic,o);D.update(clinicPath(),o);toast('اتحفظ')}
function vMoreSub(k){const c=CL();
  if(k==='clinic'){const days=c.days||[6,0,1,2,3,4];const DN=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    shell('بيانات العيادة',`<div class="form"><label class="f">اسم العيادة<input class="in" id="name" value="${esc(c.name||'')}"></label><label class="f">اسم الطبيب (يظهر في الروشتة والرسائل)<input class="in" id="doctor" value="${esc(c.doctor||'')}"></label>
     <label class="f">التخصص / اللقب<input class="in" id="title" value="${esc(c.title||'استشاري جراحة العظام والمناظير')}"></label>
     <label class="f">العنوان<input class="in" id="address" value="${esc(c.address||'')}"></label><div class="grid2"><label class="f">تليفون العيادة<input class="in num" id="phone" value="${esc(c.phone||'')}"></label><label class="f">رقم واتساب العيادة<input class="in num" id="waNo" value="${esc(c.waNo||'')}"></label></div>
     <b>أيام العمل</b><div class="chips" id="days">${[6,0,1,2,3,4,5].map(d=>`<button class="chip ${days.includes(d)?'on':''}" data-d="${d}">${DN[d]}</button>`).join('')}</div>
     <div class="grid2"><label class="f">من الساعة<input class="in num" type="time" id="from" value="${c.from||'15:00'}"></label><label class="f">إلى الساعة<input class="in num" type="time" id="to" value="${c.to||'22:00'}"></label></div>
     <label class="f">مدة الموعد (دقيقة)<select class="in" id="slot">${opts([['10','١٠'],['15','١٥'],['20','٢٠'],['30','٣٠']],String(c.slot||15))}</select></label>
     <button class="btn primary" id="sv">حفظ</button></div>`,{back:true});
    $$('#days .chip').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
    $('#sv').onclick=()=>{const o={};['name','doctor','title','address','phone','waNo','from','to'].forEach(x=>o[x]=val(x));o.slot=+val('slot');o.days=$$('#days .chip.on').map(b=>+b.dataset.d);saveClinic(o);history.back()};return}
  if(k==='fees'){const f=fees();shell('الأسعار',`<div class="form">${VT.map(([k2,l])=>`<label class="f">${l}<input class="in num" type="number" inputmode="decimal" data-fee="${k2}" value="${f[k2]||0}"></label>`).join('')}<button class="btn primary" id="sv">حفظ</button></div>`,{back:true});
    $('#sv').onclick=()=>{const o={};$$('[data-fee]').forEach(i=>o[i.dataset.fee]=+i.value||0);saveClinic({fees:o});history.back()};return}
  if(k==='wa'){const L={confirm:'تأكيد الحجز',remind:'تذكير قبل الموعد',follow:'تذكير بالمتابعة (عمليات وكسور)',after:'متابعة بعد الكشف',dues:'تذكير بالمتبقي'};
    shell('رسائل الواتساب',`<p class="fine">الكلمات بين { } بتتغير تلقائياً: {الاسم} {التاريخ} {الوقت} {الطبيب} {العنوان} {المتابعة} {الحالة} {المبلغ}</p><div class="form">${Object.keys(WA_DEF).map(x=>`<label class="f">${L[x]}<textarea class="in" data-wa="${x}" style="min-height:110px">${esc(waTpl(x))}</textarea></label>`).join('')}
     <div class="row"><button class="btn primary" id="sv">حفظ</button><button class="btn" id="rs">استرجاع الرسائل الأصلية</button></div></div>`,{back:true});
    $('#sv').onclick=()=>{const o={};$$('[data-wa]').forEach(t=>o[t.dataset.wa]=t.value);saveClinic({wa:o});history.back()};$('#rs').onclick=()=>{saveClinic({wa:{}});render()};return}
  if(k==='drugs'){const list=drugs();shell('الأدوية المفضلة',`<p class="fine">بتظهر كاقتراحات وأنت بتكتب الروشتة. أي دواء جديد بتكتبه بيتضاف هنا تلقائياً.</p>
     <div class="list">${list.map((d,i)=>`<div class="drug"><span class="dn">${esc(d.n)}</span><button class="btn sm danger" data-rm="${i}">✕</button><span class="dd">${esc([d.f,d.u].filter(Boolean).join(' – '))}</span></div>`).join('')}</div>
     <div class="card form" style="margin-top:10px"><label class="f">الدواء<input class="in ltr" id="dn"></label><label class="f">الجرعة<input class="in" id="df"></label><label class="f">المدة<input class="in" id="du"></label><button class="btn primary" id="add">إضافة</button></div>`,{back:true});
    $$('[data-rm]').forEach(b=>b.onclick=()=>{list.splice(+b.dataset.rm,1);saveClinic({drugs:[...list]});render()});
    $('#add').onclick=()=>{if(!val('dn'))return;saveClinic({drugs:[...list,{n:val('dn'),f:val('df'),u:val('du')}]});render()};return}
  if(k==='team')return vTeam();if(k==='code')return vSetupCode();if(k==='backup')return vBackup();
  if(k==='connect'){shell('ربط قاعدة بيانات العيادة',`<p>عشان الطبيب والسكرتارية يشتغلوا على نفس المواعيد وملفات المرضى من أكتر من جهاز (موبايل، كمبيوتر الاستقبال)، محتاج قاعدة بيانات Firebase مجانية:</p>
     <ol style="line-height:2"><li>ادخل <span class="ltr">console.firebase.google.com</span> ← Add project.</li><li>Authentication ← Email/Password ← Enable.</li><li>Firestore Database ← Create database ← Production.</li><li>Firestore ← Rules: الصق القواعد من ملف <span class="ltr">firestore.rules</span>.</li><li>Project settings ← Your apps ← Web ← انسخ <span class="ltr">firebaseConfig</span> والصقه هنا.</li></ol>
     <textarea class="in ltr" id="cfg" placeholder="const firebaseConfig = { apiKey: … }"></textarea><button class="btn primary" id="go" style="margin-top:8px">ربط</button>
     <p class="fine">بعد الربط هتعمل حساب بالإيميل وتنشئ العيادة، وبعدها تقدر ترفع بياناتك الحالية من "نسخة احتياطية ← استرجاع".</p>`,{back:true});
    $('#go').onclick=()=>{const cf=parseCfg($('#cfg').value);if(!cf)return toast('الإعدادات غير صحيحة');try{localStorage.setItem('fbconfig',JSON.stringify(cf));localStorage.removeItem('mode')}catch{}location.reload()};return}
  if(k==='booklink'){const n=waPhone(c.waNo||c.phone);const link=n?`https://wa.me/${n}?text=${encodeURIComponent('السلام عليكم، أريد حجز موعد في عيادة '+(c.doctor||''))}`:'';
    shell('رابط الحجز',n?`<p>المريض يضغط على الرابط، يفتح الواتساب على رقم العيادة برسالة حجز جاهزة، والسكرتارية تحجزله من التطبيق وتبعتله التأكيد.</p><textarea class="in ltr" readonly id="lk" style="min-height:90px">${link}</textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cp">نسخ</button><button class="btn" id="sh">مشاركة</button></div>
      <p class="fine">الحجز الآلي الكامل من غير سكرتارية (بوت واتساب يرد ويحجز لوحده) يحتاج WhatsApp Business API وسيرفر، وده بيتكلف اشتراك شهري من Meta.</p>`:'<div class="empty">اكتب رقم واتساب العيادة الأول من بيانات العيادة</div>',{back:true});
    if(n){$('#cp').onclick=()=>navigator.clipboard.writeText(link).then(()=>toast('اتنسخ'));$('#sh').onclick=()=>shareText(link)}return}
  vMore()}
async function vTeam(){const mem=await D.list(C('members'));shell('الفريق',`<div class="list">${mem.map(m=>`<div class="item"><span class="m"><span class="t">${esc(m.name||m.id)}</span><span class="s ltr">${esc(m.id)}</span></span><span class="tag ${m.role==='doctor'?'ok':'mut'}">${m.role==='doctor'?'طبيب':'مساعد'}</span>${m.id!==S.email?`<button class="btn sm danger" data-rm="${esc(m.id)}">إزالة</button>`:''}</div>`).join('')}</div>
  <h3>إضافة عضو</h3><div class="form"><label class="f">الاسم<input class="in" id="nm"></label><label class="f">البريد الإلكتروني (هيعمل حساب بيه)<input class="in ltr" type="email" id="em"></label>
  <label class="f">الصلاحية<select class="in" id="rl"><option value="assistant">مساعد / سكرتارية: الحجز، تسجيل المرضى، التحصيل، السكان</option><option value="doctor">طبيب: كل شيء بما فيه الزيارات والروشتات والحسابات</option></select></label><button class="btn primary" id="add">إضافة</button></div>`,{back:true});
  $('#add').onclick=()=>{const e=val('em').toLowerCase();if(!e.includes('@'))return toast('اكتب البريد');D.set(C('members/'+e),{role:$('#rl').value,name:val('nm'),email:e});D.set('memberships/'+e,{clinicId:S.cid,role:$('#rl').value});toast('اتضاف. يقدر يعمل حساب بـ '+e);setTimeout(vTeam,400)};
  $$('[data-rm]').forEach(b=>confirmBtn(b,()=>{D.del(C('members/'+b.dataset.rm));D.del('memberships/'+b.dataset.rm);setTimeout(vTeam,300)}))}
function vSetupCode(){const code=btoa(unescape(encodeURIComponent(JSON.stringify(getConfig()))));shell('كود إعداد العيادة',`<p>على جهاز المساعد: نزّل التطبيق، الصق الكود ده في أول شاشة، وبعدين سجّل دخول.</p><textarea class="in ltr" readonly id="code" style="min-height:140px;font-family:var(--f-num);font-size:12px">${code}</textarea><div class="row" style="margin-top:8px"><button class="btn primary" id="cp">نسخ</button><button class="btn wa" id="sh">${I.wa}إرسال</button></div>`,{back:true});
  $('#cp').onclick=()=>navigator.clipboard.writeText(code).then(()=>toast('اتنسخ')).catch(()=>$('#code').select());$('#sh').onclick=()=>shareText(code)}
const COLS=['patients','appointments','visits','rx','files','voices','cases','tx','blobs'];
async function vBackup(){shell('نسخة احتياطية',`<p>بيحفظ كل البيانات (المرضى، المواعيد، الزيارات، الروشتات، الأشعة، الملاحظات الصوتية، المتابعات، الحسابات) في ملف واحد تحتفظ بيه على جوجل درايف أو الكمبيوتر.</p>
  <button class="btn primary" id="go">حفظ نسخة احتياطية</button><p class="fine" id="st"></p>
  <h3>استرجاع</h3><p class="fine">يضيف البيانات من ملف نسخة احتياطية (مفيد لنقل البيانات من جهاز لجهاز أو بعد ربط قاعدة البيانات).</p><button class="btn" id="rs">اختيار ملف واسترجاعه</button><p class="fine" id="st2"></p>`,{back:true});
  $('#go').onclick=async()=>{$('#st').textContent='جاري التجميع…';const out={app:'clinic-ar',exportedAt:new Date().toISOString(),clinic:S.clinic};for(const c of COLS)out[c]=await D.list(C(c));
    $('#st').textContent=`${out.patients.length} مريض، ${out.appointments.length} موعد، ${out.files.length} ملف.`;await shareBlob(new Blob([JSON.stringify(out)],{type:'application/json'}),`clinic-backup-${today()}.json`,'application/json')};
  $('#rs').onclick=async()=>{const [f]=await pickFile('application/json,.json');if(!f)return;try{const j=JSON.parse(await f.text());let n=0;
    if(j.clinic&&isDoc())saveClinic(Object.fromEntries(Object.entries(j.clinic).filter(([k])=>!['ownerUid','createdAt'].includes(k))));
    for(const c of COLS)for(const d of (j[c]||[])){const {id,...rest}=d;await D.set(C(c+'/'+id),rest);n++;if(n%50===0)$('#st2').textContent='جاري الاسترجاع… '+n}
    $('#st2').textContent=`تم استرجاع ${n} سجل`;toast('تم الاسترجاع')}catch(e){console.error(e);toast('الملف غير صالح')}}}

/* ================= الطباعة والمشاركة ================= */
function letterhead(){const c=CL();return`<div class="lh"><div><b style="font-size:20px">${esc(c.doctor||'')}</b><div>${esc(c.title||'')}</div></div><div style="text-align:left"><b>${esc(c.name||'')}</b><div>${esc(c.address||'')}</div><div class="num">${esc(c.phone||'')}</div></div></div>`}
function rxHtml(p,x){const age=ageOf(p);return`<div class="page">${letterhead()}
  <div class="pt"><span><b>الاسم:</b> ${esc(p.name)}</span>${age!=null?`<span><b>السن:</b> ${age}</span>`:''}<span><b>التاريخ:</b> ${fmt(x.date)}</span>${x.dx?`<span><b>التشخيص:</b> ${esc(x.dx)}</span>`:''}</div>
  <div class="rx" style="direction:ltr;text-align:left">℞</div>
  <ol class="rxl">${(x.items||[]).map((it,i)=>`<li><b>${i+1}.  ${esc(it.n)}</b><span class="s">${esc([it.f,it.u].filter(Boolean).join(' – '))}</span></li>`).join('')}</ol>
  ${x.note?`<h4>تعليمات</h4><div class="rtl">${esc(x.note).replace(/\n/g,'<br>')}</div>`:''}
  <div class="sig"><span>التوقيع: ____________</span><span>${esc(CL().doctor||'')}</span></div>
  <div class="foot">${esc(CL().name||'')} · ${esc(CL().phone||'')}</div></div>`}
async function htmlToPdf(html){const root=$('#printRoot');root.innerHTML=html;await document.fonts.ready;const el=root.firstElementChild;
  const canvas=await html2canvas(el,{scale:2,backgroundColor:'#ffffff',useCORS:true});root.innerHTML='';
  const pdf=new jsPDF({unit:'pt',format:'a4'});const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
  const pxPerPage=Math.floor(canvas.width*ph/pw);let y=0,first=true;
  while(y<canvas.height){const h=Math.min(pxPerPage,canvas.height-y);const c=document.createElement('canvas');c.width=canvas.width;c.height=h;c.getContext('2d').drawImage(canvas,0,y,canvas.width,h,0,0,canvas.width,h);
    if(!first)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.92),'JPEG',0,0,pw,h*pw/canvas.width);first=false;y+=h}
  return pdf.output('blob')}
async function blobToB64(b){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(b)})}
async function shareBlob(blob,name,type){
  if(isNative&&window.Capacitor.Plugins.Filesystem){try{const {Filesystem,Share}=window.Capacitor.Plugins;const w=await Filesystem.writeFile({path:name.replace(/[\\/:*?"<>|]/g,'-'),data:await blobToB64(blob),directory:'CACHE'});await Share.share({title:name,files:[w.uri]});return}catch(e){if(String(e).includes('cancel'))return;console.error(e)}}
  const file=new File([blob],name,{type});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();toast('اتحفظ '+name)}
async function shareDataUrl(d,name,type){const b=await (await fetch(d)).blob();shareBlob(b,name,type)}
async function shareText(t){if(isNative&&window.Capacitor.Plugins.Share)return window.Capacitor.Plugins.Share.share({text:t});if(navigator.share)return navigator.share({text:t}).catch(()=>{});navigator.clipboard.writeText(t).then(()=>toast('اتنسخ'))}

/* ================= بيانات تجريبية ================= */
async function seedDemoLocal(){D=LocalDB;S.cid='local';const t=today();
  await D.set('clinics/local',{name:'عيادة الركبة والكتف',doctor:'د. السيد الفرس',title:'استشاري جراحة العظام والمناظير',address:'طنطا – شارع البحر',phone:'0100 000 0000',waNo:'01000000000',from:'15:00',to:'22:00',slot:15,days:[6,0,1,2,3,4],createdAt:Date.now()});
  const P=[['أحمد محمود السيد','01012345678',1988,'m','مهندس'],['منى عبد الله','01123456789',1965,'f','ربة منزل'],['محمد علي حسن','01234567890',2001,'m','طالب – لاعب كرة'],['سعاد إبراهيم','01098765432',1952,'f','على المعاش'],['يوسف خالد','01555555555',2014,'m','تلميذ']];
  const ids=[];for(let i=0;i<P.length;i++){const [name,phone,by,sex,job]=P[i];const id='p'+i;ids.push(id);await D.set(`clinics/local/patients/${id}`,{name,phone,birthYear:by,sex,job,fileNo:String(i+1),createdAt:Date.now()-i*1e8,updatedAt:Date.now()-i*1e6,history:i===3?'ضغط وسكر – حساسية من البنسلين':''})}
  const A=[[0,'15:00','kashf','arrived',1],[1,'15:15','reexam','booked'],[2,'15:30','fu','booked'],[3,'16:00','dress','booked']];
  for(const [pi,tm,ty,st,q] of A)await D.set(`clinics/local/appointments/a${pi}`,{patientId:ids[pi],name:P[pi][0],phone:P[pi][1],date:t,time:tm,type:ty,status:st,queue:q||null,createdAt:Date.now()});
  await D.set('clinics/local/appointments/a9',{patientId:ids[4],name:P[4][0],phone:P[4][1],date:addDays(t,1),time:'15:00',type:'fu',status:'booked',createdAt:Date.now()});
  const mk=(kind,proto,date)=>PROTO[kind][proto].m.map(([d,l])=>({d,l,due:addDays(date,d),done:addDays(date,d)<addDays(t,-2)}));
  await D.set('clinics/local/cases/c1',{patientId:ids[2],name:P[2][0],phone:P[2][1],kind:'surgery',proto:'acl',title:'ACL hamstring graft',date:addDays(t,-42),side:'يمين',fee:25000,ms:mk('surgery','acl',addDays(t,-42)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/cases/c2',{patientId:ids[4],name:P[4][0],phone:P[4][1],kind:'fracture',proto:'peds',title:'كسر فوق اللقمتين – جارتلاند ٣',date:addDays(t,-21),side:'يسار',ms:mk('fracture','peds',addDays(t,-21)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/cases/c3',{patientId:ids[3],name:P[3][0],phone:P[3][1],kind:'fracture',proto:'orif',title:'كسر أسفل الكعبرة يمين',date:addDays(t,-45),side:'يمين',ms:mk('fracture','orif',addDays(t,-45)),status:'open',createdAt:Date.now()});
  await D.set('clinics/local/tx/t1',{kind:'charge',amount:25000,date:addDays(t,-42),patientId:ids[2],name:P[2][0],cat:'surgery',note:'عملية رباط صليبي',at:Date.now()});
  await D.set('clinics/local/tx/t2',{kind:'pay',amount:15000,date:addDays(t,-42),patientId:ids[2],name:P[2][0],cat:'surgery',method:'instapay',at:Date.now()});
  await D.set('clinics/local/tx/t3',{kind:'exp',amount:6000,date:t.slice(0,8)+'01',cat:'rent',note:'إيجار الشهر',method:'cash',at:Date.now()});
  await D.set('clinics/local/tx/t4',{kind:'pay',amount:300,date:t,patientId:ids[0],name:P[0][0],cat:'kashf',method:'cash',at:Date.now()});
  await D.update(`clinics/local/patients/${ids[2]}`,{balance:10000});
  await D.set('clinics/local/visits/v1',{patientId:ids[1],date:addDays(t,-14),type:'kashf',complaint:'ألم بالركبة اليمنى منذ ٦ شهور يزيد مع السلم',exam:'Medial joint line tenderness, ROM 0-120',dx:'Knee OA – medial (KL II)',plan:'تمارين تقوية، إنقاص وزن، حقن هيالورونيك',createdAt:Date.now()})}

/* ================= بدء التشغيل ================= */
boot();
if('serviceWorker' in navigator&&!isNative&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
window.__clinic={S,render,D:()=>D};

})();
