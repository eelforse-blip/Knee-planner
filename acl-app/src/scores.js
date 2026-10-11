/* ---------- outcome scores: Tegner, Lysholm, IKDC subjective, IKDC examination, ACL-RSI ---------- */
const TP=[['preinj','Pre-injury'],['preop','Pre-op'],['m3','3 months'],['m6','6 months'],['m9','9 months'],['m12','12 months'],['m24','24 months']];
const TPL=Object.fromEntries(TP);
const SCORE_VIEWS=[['tegner','Tegner'],['lys','Lysholm'],['ikdc','IKDC'],['obj','IKDC exam'],['rsi','ACL-RSI']];
const TEGNER=[
 [10,'Competitive sport: football, rugby – national or international elite'],
 [9,'Competitive sport: football, rugby – lower divisions; ice hockey, wrestling, gymnastics'],
 [8,'Competitive sport: squash, badminton, jumping athletics, downhill skiing'],
 [7,'Competitive: tennis, running athletics, handball, basketball, motocross. Recreational: football, rugby, ice hockey, basketball, squash, jumping athletics'],
 [6,'Recreational: tennis, badminton, handball, downhill skiing; jogging ≥ 5 times a week'],
 [5,'Work: heavy labour (construction, forestry). Competitive cycling or cross-country skiing. Jogging on uneven ground ≥ 2 times a week'],
 [4,'Work: moderately heavy labour (truck driving, heavy housework). Recreational cycling, cross-country skiing, jogging on even ground ≥ 2 times a week'],
 [3,'Work: light labour (e.g. nursing). Swimming; walking in forest possible'],
 [2,'Work: light labour. Walking on uneven ground possible, not in forest'],
 [1,'Work: sedentary (e.g. office). Walking on even ground possible'],
 [0,'Sick leave or disability pension because of the knee']];
const LYS=[
 {k:'limp',l:'Limp',o:[[5,'None'],[3,'Slight or periodic'],[0,'Severe and constant']]},
 {k:'support',l:'Support',o:[[5,'None'],[2,'Stick or crutch'],[0,'Weight-bearing impossible']]},
 {k:'lock',l:'Locking',o:[[15,'No locking and no catching'],[10,'Catching but no locking'],[6,'Locking occasionally'],[2,'Locking frequently'],[0,'Locked joint on examination']]},
 {k:'inst',l:'Instability',o:[[25,'Never gives way'],[20,'Rarely, during athletics or other severe exertion'],[15,'Frequently during athletics or severe exertion (or unable to take part)'],[10,'Occasionally in daily activities'],[5,'Often in daily activities'],[0,'Every step']]},
 {k:'pain',l:'Pain',o:[[25,'None'],[20,'Inconstant and slight during severe exertion'],[15,'Marked during severe exertion'],[10,'Marked on or after walking more than 2 km'],[5,'Marked on or after walking less than 2 km'],[0,'Constant']]},
 {k:'swell',l:'Swelling',o:[[10,'None'],[6,'On severe exertion'],[2,'On ordinary exertion'],[0,'Constant']]},
 {k:'stairs',l:'Stair climbing',o:[[10,'No problems'],[6,'Slightly impaired'],[2,'One step at a time'],[0,'Impossible']]},
 {k:'squat',l:'Squatting',o:[[5,'No problems'],[4,'Slightly impaired'],[2,'Not beyond 90°'],[0,'Impossible']]}];
const ACT=[[4,'Very strenuous: jumping or pivoting (basketball, football)'],[3,'Strenuous: heavy physical work, skiing, tennis'],[2,'Moderate: moderate physical work, running, jogging'],[1,'Light: walking, housework, yard work'],[0,'None of the above because of the knee']];
const DIFF=[[4,'Not difficult at all'],[3,'Minimally difficult'],[2,'Moderately difficult'],[1,'Extremely difficult'],[0,'Unable to do']];
const SCALE10=(lo,hi)=>Array.from({length:11},(_,i)=>[i,i===0?`0 · ${lo}`:i===10?`10 · ${hi}`:String(i)]);
const IKDC=[
 {k:'q1',l:'1. Highest level of activity you can do without significant knee pain',o:ACT},
 {k:'q2',l:'2. In the past 4 weeks (or since injury), how often have you had pain?',o:SCALE10('never','constant'),rev:true},
 {k:'q3',l:'3. If you have pain, how severe is it?',o:SCALE10('no pain','worst imaginable'),rev:true},
 {k:'q4',l:'4. In the past 4 weeks, how stiff or swollen was your knee?',o:[[4,'Not at all'],[3,'Mildly'],[2,'Moderately'],[1,'Very'],[0,'Extremely']]},
 {k:'q5',l:'5. Highest level of activity you can do without significant swelling',o:ACT},
 {k:'q6',l:'6. In the past 4 weeks, did your knee lock or catch?',o:[[1,'No'],[0,'Yes']]},
 {k:'q7',l:'7. Highest level of activity you can do without the knee giving way',o:ACT},
 {k:'q8',l:'8. Highest level of activity you can do on a regular basis',o:ACT},
 ...[['a','Go up stairs'],['b','Go down stairs'],['c','Kneel on the front of the knee'],['d','Squat'],['e','Sit with the knee bent'],['f','Rise from a chair'],['g','Run straight ahead'],['h','Jump and land on the injured leg'],['i','Stop and start quickly']]
   .map(([x,l],i)=>({k:'q9'+x,l:(i?'':'9. How does your knee affect your ability to: ')+l,o:DIFF,sub:i>0})),
 {k:'q10',l:'10. Rate the function of your knee today',o:SCALE10('cannot do daily activities','normal, excellent')}];
const RSI=[
 ['Are you confident that you can perform at your previous level of sport?','Not at all confident','Fully confident'],
 ['Do you think you are likely to re-injure your knee by playing your sport?','Extremely likely','Not likely at all'],
 ['Are you nervous about playing your sport?','Extremely nervous','Not nervous at all'],
 ['Are you confident that your knee will not give way when playing your sport?','Not at all confident','Fully confident'],
 ['Are you confident that you could play your sport without worrying about your knee?','Not at all confident','Fully confident'],
 ['Is it frustrating to have to think about your knee when playing your sport?','Extremely frustrating','Not frustrating at all'],
 ['Are you fearful of re-injuring your knee by playing your sport?','Extremely fearful','Not fearful at all'],
 ['Are you confident that your knee can hold up under pressure?','Not at all confident','Fully confident'],
 ['Are you afraid of accidentally injuring your knee by playing your sport?','Extremely afraid','Not afraid at all'],
 ['Do thoughts of having to go through surgery and rehabilitation again stop you from playing your sport?','All of the time','Not at all'],
 ['Are you confident in your ability to perform well at your sport?','Not at all confident','Fully confident'],
 ['Do you feel relaxed about playing your sport?','Not at all relaxed','Fully relaxed']];
const RSI_OPT=(lo,hi)=>Array.from({length:11},(_,i)=>[i*10,i===0?`0 · ${lo}`:i===10?`100 · ${hi}`:String(i*10)]);
const GRADE='ABCD';

function blankTP(){return{date:'',tegner:'',lys:{},ikdc:{},rsi:{},obj:{}}}
function scTP(k){S.sc=S.sc||{tp:'preop',view:'ikdc',d:{}};return S.sc.d[k]=S.sc.d[k]||blankTP()}
function tegnerOf(k){return k==='preinj'?num(S.d.tegner):num(scTP(k).tegner)}
function lysScore(t){const a=LYS.map(q=>num(t.lys[q.k]));if(a.some(x=>x==null))return null;return a.reduce((s,x)=>s+x,0)}
function lysGrade(x){return x==null?'':x>=95?'Excellent':x>=84?'Good':x>=65?'Fair':'Poor'}
function ikdcScore(t){let sum=0,max=0,miss=0;for(const q of IKDC){const v=num(t.ikdc[q.k]);const m=Math.max(...q.o.map(o=>o[0]));if(v==null){miss++;continue}sum+=q.rev?m-v:v;max+=m}
  return{score:miss>2||!max?null:sum/max*100,miss,answered:IKDC.length-miss}}
function rsiScore(t){const a=RSI.map((q,i)=>num(t.rsi['r'+i])).filter(x=>x!=null);return a.length>=10?a.reduce((s,x)=>s+x,0)/a.length:null}
function objGrade(o){const e=num(o.eff),ext=num(o.ext),fl=num(o.flex),ap=num(o.ap),pv=num(o.pivot),hop=num(o.hop);
  const g={};g.eff=e;g.ext=ext==null?null:ext<3?0:ext<=5?1:ext<=10?2:3;g.flex=fl==null?null:fl<=5?0:fl<=15?1:fl<=25?2:3;
  g.ap=ap==null?null:ap<=2?0:ap<=5?1:ap<=10?2:3;g.pivot=pv;g.hop=hop==null?null:hop>=90?0:hop>=76?1:hop>=50?2:3;
  const w=a=>{const x=a.filter(v=>v!=null);return x.length?Math.max(...x):null};
  g.motion=w([g.ext,g.flex]);g.lig=w([g.ap,g.pivot]);g.final=g.eff!=null&&g.motion!=null&&g.lig!=null?Math.max(g.eff,g.motion,g.lig):null;return g}
function scoreRow(k){const t=scTP(k);return{tegner:tegnerOf(k),lys:lysScore(t),ikdc:ikdcScore(t).score,obj:objGrade(t.obj).final,rsi:rsiScore(t),date:t.date}}
function hasData(k){const r=scoreRow(k);return Object.entries(r).some(([n,v])=>n!=='date'&&v!=null)}

function optSel(path,opts,val,wide){return`<select data-s="${path}" ${wide?'style="max-width:none;width:100%"':''}><option value="">—</option>${opts.map(([v,l])=>`<option value="${v}" ${val!==''&&val!=null&&String(val)===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select>`}
function qBlock(path,l,opts,val,sub){return`<div class="q ${sub?'sub':''}"><span>${esc(l)}</span>${optSel(path,opts,val,true)}</div>`}

function renderScores(){const el=$('#p-sc');S.sc=S.sc||{tp:'preop',view:'ikdc',d:{}};const k=S.sc.tp,t=scTP(k),view=S.sc.view;
  let h=`<div class="group"><h3>Time point</h3><div class="fgrid"><label for="scTp">Assessment</label><select id="scTp">${TP.map(([v,l])=>`<option value="${v}" ${v===k?'selected':''}>${l}${hasData(v)?' ✓':''}</option>`).join('')}</select>
   <label for="scDate">Date</label><input id="scDate" type="date" value="${esc(t.date||'')}" style="padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--bg);font-size:16px;grid-column:2/4"></div></div>
   <div class="seg" id="scView">${SCORE_VIEWS.map(([v,l])=>`<button data-sv="${v}" class="${v===view?'on':''}">${l}</button>`).join('')}</div>
   <div id="scLive"></div>`;
  if(view==='tegner'){const val=k==='preinj'?S.d.tegner:t.tegner;
    h+=`<div class="group"><h3>Tegner activity scale${k==='preinj'?' · before injury':''}</h3><p class="fine">Pick the highest level the patient ${k==='preinj'?'took part in before the injury':'takes part in now'}.</p><div class="tg">${TEGNER.map(([v,l])=>`<label class="tog ${String(val)===String(v)?'on':''}"><input type="radio" name="tg" data-s="tegner" value="${v}" ${String(val)===String(v)?'checked':''}><b>${v}</b><span>${l}</span></label>`).join('')}</div></div>`}
  if(view==='lys')h+=`<div class="group"><h3>Lysholm knee score</h3>${LYS.map(q=>qBlock('lys.'+q.k,q.l,q.o.map(([v,l])=>[v,`${l} (${v})`]),t.lys[q.k])).join('')}</div>`;
  if(view==='ikdc')h+=`<div class="group"><h3>IKDC subjective knee form</h3><p class="fine">The patient answers for the past 4 weeks. Grade activities by the highest level done without significant symptoms, even if not actually performed.</p>${IKDC.map(q=>qBlock('ikdc.'+q.k,q.l,q.o,t.ikdc[q.k],q.sub)).join('')}</div>`;
  if(view==='obj'){const o=t.obj;const sel=(key,opts)=>optSel('obj.'+key,opts,o[key]);
    h+=`<div class="group"><h3>IKDC knee examination</h3><div class="row"><button class="btn" id="objFill">Fill from Exam tab</button></div><div class="fgrid">
     <label>Effusion</label>${sel('eff',[[0,'A · none'],[1,'B · mild'],[2,'C · moderate'],[3,'D · severe']])}
     <label>Extension lack vs other knee</label><input type="number" inputmode="decimal" step="any" data-s="obj.ext" value="${esc(o.ext??'')}"><span class="u">°</span>
     <label>Flexion lack vs other knee</label><input type="number" inputmode="decimal" step="any" data-s="obj.flex" value="${esc(o.flex??'')}"><span class="u">°</span>
     <label>Anterior translation, side-to-side (Lachman / KT)</label><input type="number" inputmode="decimal" step="any" data-s="obj.ap" value="${esc(o.ap??'')}"><span class="u">mm</span>
     <label>Pivot shift</label>${sel('pivot',[[0,'A · equal'],[1,'B · glide'],[2,'C · clunk'],[3,'D · gross']])}
     <label>Single-leg hop, % of other leg</label><input type="number" inputmode="decimal" step="any" data-s="obj.hop" value="${esc(o.hop??'')}"><span class="u">%</span></div></div>`}
  if(view==='rsi')h+=`<div class="group"><h3>ACL-RSI (return to sport after injury)</h3><p class="fine">Each item 0–100 in steps of 10; 100 is always the most positive answer. Score = mean of the items.</p>${RSI.map((q,i)=>qBlock('rsi.r'+i,(i+1)+'. '+q[0],RSI_OPT(q[1],q[2]),t.rsi['r'+i])).join('')}</div>`;
  h+=`<div class="group" id="scHist"></div>`;
  const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;renderScoreLive();renderScoreHistory();
  $('#scTp').onchange=e=>{S.sc.tp=e.target.value;renderScores();autosave()};
  $('#scDate').onchange=e=>{scTP(S.sc.tp).date=e.target.value;renderScoreHistory();autosave()};
  $$('#scView button').forEach(b=>b.onclick=()=>{S.sc.view=b.dataset.sv;renderScores();autosave()});
  const fill=$('#objFill');if(fill)fill.onclick=()=>{const d=S.d,o=scTP(S.sc.tp).obj;o.eff={none:0,mild:1,mod:2}[d.effusion];
    if(num(d.extDef)!=null)o.ext=num(d.extDef);if(num(d.flex)!=null&&num(d.flexOther)!=null)o.flex=Math.max(0,num(d.flexOther)-num(d.flex));
    o.ap=num(d.kt)!=null?num(d.kt):[1,4,8,12][+d.lachman];o.pivot=+d.pivot;if(num(d.hop)!=null)o.hop=num(d.hop);renderScores();autosave();toast('Filled from the Exam tab')}}
function renderScoreLive(){const el=$('#scLive');if(!el)return;const k=S.sc.tp,t=scTP(k),view=S.sc.view;let h='';
  if(view==='tegner'){const v=tegnerOf(k),pre=num(S.d.tegner);h=`<div class="figs"><div><span class="k">Tegner</span><span class="v">${v??'—'}</span></div>${k!=='preinj'&&pre!=null?`<div><span class="k">Pre-injury</span><span class="v">${pre}</span></div>`:''}</div>${k!=='preinj'&&pre!=null&&v!=null?`<p class="fine">${v>=pre?'Back to the pre-injury activity level.':`${pre-v} level${pre-v>1?'s':''} below the pre-injury level.`}</p>`:''}`}
  if(view==='lys'){const x=lysScore(t),n=LYS.filter(q=>num(t.lys[q.k])!=null).length;h=`<div class="figs"><div><span class="k">Lysholm</span><span class="v">${x??(n?'…':'—')}<small>/100</small></span></div><div><span class="k">Grade</span><span class="v" style="font-size:16px">${lysGrade(x)||n+'/8 answered'}</span></div></div>`}
  if(view==='ikdc'){const r=ikdcScore(t);h=`<div class="figs"><div><span class="k">IKDC subjective</span><span class="v">${r.score!=null?f1(r.score):'—'}<small>/100</small></span></div><div><span class="k">Answered</span><span class="v">${r.answered}<small>/18</small></span></div></div><p class="fine">${r.score==null?'Scored once at least 16 of 18 items are answered.':'Score = sum of item scores ÷ maximum possible for the answered items × 100.'}</p>`}
  if(view==='obj'){const g=objGrade(t.obj);const G=x=>x==null?'—':GRADE[x];h=`<div class="figs"><div><span class="k">IKDC grade</span><span class="v">${G(g.final)}</span></div><div><span class="k">Effusion</span><span class="v">${G(g.eff)}</span></div><div><span class="k">Motion</span><span class="v">${G(g.motion)}</span></div><div><span class="k">Ligament</span><span class="v">${G(g.lig)}</span></div><div><span class="k">Hop</span><span class="v">${G(g.hop)}</span></div></div><p class="fine">A normal · B nearly normal · C abnormal · D severely abnormal. The final grade is the worst of effusion, motion and ligament groups; the hop test is recorded but not included.</p>`}
  if(view==='rsi'){const x=rsiScore(t);h=`<div class="figs"><div><span class="k">ACL-RSI</span><span class="v">${x!=null?f1(x):'—'}<small>/100</small></span></div></div><p class="fine">Higher = more psychologically ready to return to sport. Scored once at least 10 of 12 items are answered.</p>`}
  el.innerHTML=`<div class="rec" style="padding:10px 12px">${h}</div>`}
function scoreHistoryRows(){const rows=TP.filter(([k])=>hasData(k)).map(([k,l])=>({k,l,...scoreRow(k)}));return rows}
function renderScoreHistory(){const el=$('#scHist');if(!el)return;const rows=scoreHistoryRows();
  if(!rows.length){el.innerHTML='<h3>History</h3><div class="empty">No scores recorded yet.</div>';return}
  const G=x=>x==null?'—':GRADE[x];
  const base=rows.find(r=>r.k==='preop'&&r.ikdc!=null),last=[...rows].reverse().find(r=>r.k!=='preop'&&r.k!=='preinj'&&r.ikdc!=null);
  let ch='';if(base&&last){const dlt=last.ikdc-base.ikdc;ch=`<p class="fine">IKDC change pre-op → ${last.l}: <b>${dlt>=0?'+':''}${f1(dlt)}</b> points. ${dlt>=20.5?'Above 20.5: clearly improved (high specificity).':dlt>=11.5?'Above 11.5: likely a meaningful improvement.':'Below the 11.5-point threshold for meaningful improvement.'} (Irrgang 2006)</p>`}
  el.innerHTML=`<h3>History</h3><div style="overflow-x:auto"><table class="mt"><tr><th>Time point</th><th>Tegner</th><th>Lysholm</th><th>IKDC</th><th>Exam</th><th>RSI</th></tr>
   ${rows.map(r=>`<tr><td>${r.l}${r.date?`<div class="ref">${esc(r.date)}</div>`:''}</td><td class="n">${r.tegner??'—'}</td><td class="n">${r.lys??'—'}</td><td class="n">${r.ikdc!=null?f1(r.ikdc):'—'}</td><td class="n">${G(r.obj)}</td><td class="n">${r.rsi!=null?f0(r.rsi):'—'}</td></tr>`).join('')}</table></div>${ch}${trendSVG(rows)}`}
function trendSVG(rows){const pts=rows.filter(r=>r.ikdc!=null||r.lys!=null);if(pts.length<2)return'';
  const W=320,H=130,L=30,R=10,T=12,B=26,x=i=>L+i*(W-L-R)/(pts.length-1),y=v=>T+(100-v)*(H-T-B)/100;
  const path=key=>pts.map((r,i)=>r[key]==null?null:[x(i),y(r[key])]).filter(Boolean).map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const dots=(key,c)=>pts.map((r,i)=>r[key]==null?'':`<circle cx="${x(i).toFixed(1)}" cy="${y(r[key]).toFixed(1)}" r="3" fill="${c}"/>`).join('');
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:480px" role="img" aria-label="IKDC and Lysholm over time">
   ${[0,50,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${v}</text>`).join('')}
   ${pts.map((r,i)=>`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${r.l.replace(' months',' m').replace('Pre-injury','Pre-inj')}</text>`).join('')}
   <path d="${path('ikdc')}" fill="none" stroke="var(--accent)" stroke-width="2"/>${dots('ikdc','var(--accent)')}
   <path d="${path('lys')}" fill="none" stroke="var(--warn)" stroke-width="2" stroke-dasharray="5 3"/>${dots('lys','var(--warn)')}
   </svg><p class="fine"><span style="color:var(--accent)">━ IKDC</span> · <span style="color:var(--warn)">╍ Lysholm</span></p>`}
document.addEventListener('change',e=>{const i=e.target;if(!i.dataset||!i.dataset.s)return;const [grp,key]=i.dataset.s.split('.');const t=scTP(S.sc.tp);
  if(grp==='tegner'){if(S.sc.tp==='preinj')S.d.tegner=i.value;else t.tegner=i.value;renderScores()}
  else{t[grp][key]=i.value;renderScoreLive();renderScoreHistory();
    if(i.type!=='number'){const opt=$('#scTp').selectedOptions[0];if(opt)opt.textContent=TPL[S.sc.tp]+(hasData(S.sc.tp)?' ✓':'')}}
  autosave()});
document.addEventListener('input',e=>{const i=e.target;if(!i.dataset||!i.dataset.s||i.type!=='number')return;const [grp,key]=i.dataset.s.split('.');scTP(S.sc.tp)[grp][key]=i.value;renderScoreLive();autosave()});
function scoresCard(){const rows=scoreHistoryRows();if(!rows.length)return'';const G=x=>x==null?'—':GRADE[x];
  return`<div class="card"><div class="hd"><b>Outcome scores</b><button class="btn" data-goto="sc">Open</button></div><table class="mt"><tr><th>Time point</th><th>Tegner</th><th>Lysholm</th><th>IKDC</th><th>Exam</th><th>RSI</th></tr>
   ${rows.map(r=>`<tr><td>${r.l}</td><td class="n">${r.tegner??'—'}</td><td class="n">${r.lys??'—'}</td><td class="n">${r.ikdc!=null?f1(r.ikdc):'—'}</td><td class="n">${G(r.obj)}</td><td class="n">${r.rsi!=null?f0(r.rsi):'—'}</td></tr>`).join('')}</table></div>`}
function scoresSummary(){const rows=scoreHistoryRows();return rows.map(r=>`${r.l}${r.date?' ('+r.date+')':''}: `+[r.tegner!=null?'Tegner '+r.tegner:'',r.lys!=null?'Lysholm '+r.lys:'',r.ikdc!=null?'IKDC '+f1(r.ikdc):'',r.obj!=null?'IKDC exam '+GRADE[r.obj]:'',r.rsi!=null?'ACL-RSI '+f0(r.rsi):''].filter(Boolean).join(', '))}
