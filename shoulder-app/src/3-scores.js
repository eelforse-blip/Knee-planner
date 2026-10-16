
/* ---------- outcome scores: WOSI, Rowe, Oxford instability, ASES, Constant, SIRSI, SANE ---------- */
const TP=[['preop','Pre-op'],['m3','3 months'],['m6','6 months'],['m12','12 months'],['m24','24 months']];
const TPL=Object.fromEntries(TP);
const SCORE_VIEWS=[['risk','ISIS / GTIMS'],['wosi','WOSI'],['rowe','Rowe'],['oiss','Oxford'],['ases','ASES'],['con','Constant'],['sirsi','SIRSI'],['sane','SANE']];
const WOSI=[
 ['Physical symptoms',['Pain with overhead activities','Aching or throbbing in the shoulder','Weakness or lack of strength in the shoulder','Fatigue or lack of stamina in the shoulder','Clicking, cracking or snapping in the shoulder','Stiffness in the shoulder','Discomfort in the neck muscles because of the shoulder','Feeling of instability or looseness in the shoulder','Compensating for the shoulder with other muscles','Loss of range of motion in the shoulder']],
 ['Sports, recreation and work',['Shoulder limits participation in sport or recreation','Shoulder affects the specific skills needed for sport or work','Need to protect the arm during activities','Difficulty lifting heavy objects below shoulder level']],
 ['Lifestyle',['Fear of falling on the shoulder','Difficulty maintaining the desired fitness level','Difficulty doing rough or play activities with family and friends','Difficulty sleeping because of the shoulder']],
 ['Emotions',['How conscious the patient is of the shoulder','Concern that the shoulder will get worse','Frustration because of the shoulder']]];
const WOSI_FLAT=WOSI.flatMap(([,a])=>a);
const VAS10=Array.from({length:11},(_,i)=>[i*10,i===0?'0 · no problem':i===10?'100 · extreme':String(i*10)]);
const ROWE=[
 ['stab','Stability',[[50,'No recurrence, subluxation or apprehension'],[30,'Apprehension in certain positions'],[10,'Subluxation (not requiring reduction)'],[0,'Recurrent dislocation']]],
 ['mot','Motion',[[20,'Full external rotation, elevation and internal rotation'],[15,'75 % of normal external rotation; normal elevation and internal rotation'],[5,'50 % of normal external rotation; 75 % of elevation and internal rotation'],[0,'50 % of elevation and internal rotation; no external rotation']]],
 ['fun','Function',[[30,'No limitation in work or sport; little or no discomfort'],[25,'Mild limitation and minimal discomfort'],[10,'Moderate limitation and discomfort'],[0,'Marked limitation and pain']]]];
const OIS_G=[[4,'None / not at all / never'],[3,'Slightly / rarely'],[2,'Moderately / sometimes'],[1,'Severely / often'],[0,'Extremely / always']];
const OISS=[
 ['During the past 6 months, how many times has the shoulder slipped out of joint?',[[4,'Not at all'],[3,'1–2 times in 6 months'],[2,'1–2 times per month'],[1,'1–2 times per week'],[0,'More often than weekly']]],
 ['Trouble dressing (e.g. putting on a T-shirt) because of the shoulder',OIS_G],['Worst pain from the shoulder',OIS_G],['Shoulder interfered with usual work (incl. housework)',OIS_G],
 ['Avoided activities for fear of the shoulder slipping out',OIS_G],['Shoulder prevented doing important things',OIS_G],['Shoulder interfered with social life',OIS_G],
 ['Shoulder interfered with sport or hobbies',OIS_G],['How often the shoulder is on the mind',OIS_G],['Shoulder interfered with lifting heavy objects',OIS_G],
 ['Usual pain from the shoulder',OIS_G],['Avoided lying in certain positions in bed because of the shoulder',OIS_G]];
const ASES_ADL=['Put on a coat','Sleep on the affected side','Wash back / fasten bra','Manage toileting','Comb hair','Reach a high shelf','Lift 10 lb (4.5 kg) above shoulder level','Throw a ball overhand','Do usual work','Do usual sport'];
const ASES_O=[[3,'Not difficult'],[2,'Somewhat difficult'],[1,'Very difficult'],[0,'Unable to do']];
const CON_ROM=[[0,'0–30°'],[2,'31–60°'],[4,'61–90°'],[6,'91–120°'],[8,'121–150°'],[10,'> 150°']];
const CON=[
 ['pain','Pain',[[15,'None'],[10,'Mild'],[5,'Moderate'],[0,'Severe']]],
 ['work','Work limited by the shoulder',[[4,'Not limited'],[3,'Slightly'],[2,'Moderately'],[1,'Markedly'],[0,'Unable']]],
 ['leis','Recreation / sport limited',[[4,'Not limited'],[3,'Slightly'],[2,'Moderately'],[1,'Markedly'],[0,'Unable']]],
 ['sleep','Sleep',[[2,'Undisturbed'],[1,'Occasionally disturbed'],[0,'Disturbed every night']]],
 ['pos','Pain-free hand position',[[2,'Up to the waist'],[4,'Up to the xiphoid'],[6,'Up to the neck'],[8,'Top of the head'],[10,'Above the head']]],
 ['ff','Forward flexion (pain-free)',CON_ROM],['abd','Abduction (pain-free)',CON_ROM],
 ['er','External rotation',[[0,'Hand cannot reach the head'],[2,'Hand behind head, elbow forward'],[4,'Hand behind head, elbow back'],[6,'Hand on top of head, elbow forward'],[8,'Hand on top of head, elbow back'],[10,'Full elevation from on top of the head']]],
 ['ir','Internal rotation (back of hand reaches)',[[0,'Lateral thigh'],[2,'Buttock'],[4,'Lumbosacral junction'],[6,'Waist (L3)'],[8,'T12'],[10,'Between the scapulae (T7)']]]];
const SIRSI=[['Confident to perform at the previous level of sport','Not at all confident','Fully confident'],['Likelihood of re-injuring the shoulder in sport','Extremely likely','Not likely at all'],['Nervous about playing sport','Extremely nervous','Not nervous at all'],
 ['Confident the shoulder will not give way','Not at all confident','Fully confident'],['Confident to play without concern for the shoulder','Not at all confident','Fully confident'],['Frustrated at having to consider the shoulder in sport','Extremely frustrated','Not frustrated at all'],
 ['Fearful of re-injuring the shoulder playing sport','Extremely fearful','Not fearful at all'],['Confident the shoulder can hold up under pressure','Not at all confident','Fully confident'],['Afraid of accidentally injuring the shoulder playing sport','Extremely afraid','Not afraid at all'],
 ['Thoughts of having to go through surgery and rehab again stop me playing','All the time','Not at all'],['Confident in the ability to perform well in sport','Not at all confident','Fully confident'],['Relaxed about playing sport','Not at all relaxed','Fully relaxed']];
const SIRSI_OPT=(lo,hi)=>Array.from({length:11},(_,i)=>[i*10,i===0?`0 · ${lo}`:i===10?`100 · ${hi}`:String(i*10)]);

function blankTP(){return{date:'',wosi:{},rowe:{},oiss:{},ases:{},con:{},sirsi:{},sane:{}}}
function scTP(k){S.sc=S.sc||{tp:'preop',view:'risk',d:{}};const t=S.sc.d[k]=S.sc.d[k]||blankTP();for(const g of ['wosi','rowe','oiss','ases','con','sirsi','sane'])t[g]=t[g]||{};return t}
const vals0=(o,keys)=>keys.map(k=>num(o[k]));
function wosiScore(t){const a=WOSI_FLAT.map((_,i)=>num(t.wosi['w'+i]));const got=a.filter(x=>x!=null);if(got.length<19)return null;
  const raw=got.reduce((s,x)=>s+x,0)*21/got.length;return{raw:Math.round(raw),pct:(2100-raw)/2100*100,n:got.length}}
function roweScore(t){const a=vals0(t.rowe,['stab','mot','fun']);if(a.some(x=>x==null))return null;return a.reduce((s,x)=>s+x,0)}
const roweGrade=x=>x==null?'':x>=90?'Excellent':x>=75?'Good':x>=51?'Fair':'Poor';
function oissScore(t){const a=OISS.map((_,i)=>num(t.oiss['o'+i])).filter(x=>x!=null);if(a.length<11)return null;return Math.round(a.reduce((s,x)=>s+x,0)*12/a.length)}
function asesScore(t){const pain=num(t.ases.pain);const a=ASES_ADL.map((_,i)=>num(t.ases['a'+i])).filter(x=>x!=null);if(pain==null||a.length<9)return null;
  return(10-pain)*5+a.reduce((s,x)=>s+x,0)*10/a.length*5/3}
function conScore(t){const c=t.con;const a=CON.map(([k])=>num(c[k]));const kg=num(c.kg);if(a.some(x=>x==null)||kg==null)return null;
  return a.reduce((s,x)=>s+x,0)+Math.min(25,Math.round(kg*2.2))}
function sirsiScore(t){const a=SIRSI.map((_,i)=>num(t.sirsi['s'+i])).filter(x=>x!=null);return a.length>=10?a.reduce((s,x)=>s+x,0)/a.length:null}
function saneScore(t){return num(t.sane.v)}
function scoreRow(k){const t=scTP(k);const w=wosiScore(t);return{wosi:w?w.pct:null,wosiRaw:w?w.raw:null,rowe:roweScore(t),oiss:oissScore(t),ases:asesScore(t),con:conScore(t),sirsi:sirsiScore(t),sane:saneScore(t),date:t.date}}
function hasData(k){const r=scoreRow(k);return Object.entries(r).some(([n,v])=>n!=='date'&&v!=null)}

function optSel(path,opts,val,wide){return`<select data-s="${path}" ${wide?'style="max-width:none;width:100%"':''}><option value="">—</option>${opts.map(([v,l])=>`<option value="${v}" ${val!==''&&val!=null&&String(val)===String(v)?'selected':''}>${esc(l)}</option>`).join('')}</select>`}
function qBlock(path,l,opts,val){return`<div class="q"><span>${esc(l)}</span>${optSel(path,opts,val,true)}</div>`}
function riskView(){const R=decide();const row=a=>a.map(([l,p,m])=>`<tr><td>${esc(l)}</td><td class="n">${p}/${m}</td></tr>`).join('');const hx=R.hx;
  return`<div class="group"><h3>Instability Severity Index Score (ISIS)</h3><table class="mt">${row(R.isis)}<tr><td><b>Total</b></td><td class="n"><b>${R.isisT}/10</b></td></tr></table>
   <p class="fine">> 6: about 70 % recurrence after arthroscopic Bankart – Latarjet advised (Balg & Boileau 2007). Many surgeons now use ≥ 4.</p></div>
   <div class="group"><h3>Glenoid Track Instability Management Score (GTIMS)</h3>${R.gtimsT!=null?`<table class="mt">${row(R.gtims)}<tr><td><b>Total</b></td><td class="n"><b>${R.gtimsT}/10</b></td></tr></table>`:'<p class="fine">Needs the glenoid track: measure glenoid bone loss and the Hill-Sachs interval on the Imaging tab.</p>'}
   <p class="fine">Same clinical items as ISIS; the X-ray items are replaced by an off-track Hill-Sachs on 3D CT (4 points). ≥ 4 → Latarjet, < 4 → arthroscopic Bankart (Di Giacomo 2020).</p></div>
   <div class="group"><h3>Laxity and classification</h3><table class="mt"><tr><td>Beighton</td><td class="n">${hx.bg}/9</td></tr><tr><td>External rotation at the side</td><td class="n">${hx.er??'—'}°</td></tr><tr><td>Gagey hyperabduction</td><td class="n">${hx.gg??'—'}°</td></tr>
   <tr><td>FEDS</td><td class="n" style="white-space:normal">${esc(R.feds)}</td></tr><tr><td>Stanmore</td><td class="n" style="white-space:normal">${esc(R.stanmore.l)}</td></tr></table>
   <p class="fine">Edit the items on the History, Exam and Imaging tabs.</p></div>`}
function renderScores(){const el=$('#p-sc');S.sc=S.sc||{tp:'preop',view:'risk',d:{}};const k=S.sc.tp,t=scTP(k),view=S.sc.view;
  let h=`<div class="seg" id="scView">${SCORE_VIEWS.map(([v,l])=>`<button data-sv="${v}" class="${v===view?'on':''}">${l}</button>`).join('')}</div>`;
  if(view==='risk'){h+=riskView()}
  else{h+=`<div class="group"><h3>Time point</h3><div class="fgrid"><label for="scTp">Assessment</label><select id="scTp">${TP.map(([v,l])=>`<option value="${v}" ${v===k?'selected':''}>${l}${hasData(v)?' ✓':''}</option>`).join('')}</select>
   <label for="scDate">Date</label><input id="scDate" type="date" value="${esc(t.date||'')}" style="padding:6px 8px;border:1px solid var(--line);border-radius:7px;background:var(--bg);font-size:16px;grid-column:2/4"></div></div><div id="scLive"></div>`;
    if(view==='wosi'){let i=0;h+=`<div class="group"><h3>Western Ontario Shoulder Instability Index</h3><p class="fine">Each item 0 (no problem) to 100 (extreme), for the past week. Lower raw score = better.</p>${WOSI.map(([dom,items])=>`<p class="fine" style="margin-top:8px"><b>${dom}</b></p>`+items.map(l=>{const j=i++;return qBlock('wosi.w'+j,(j+1)+'. '+l,VAS10,t.wosi['w'+j])}).join('')).join('')}</div>`}
    if(view==='rowe')h+=`<div class="group"><h3>Rowe score for instability</h3>${ROWE.map(([key,l,o])=>qBlock('rowe.'+key,l,o.map(([v,x])=>[v,`${x} (${v})`]),t.rowe[key])).join('')}</div>`;
    if(view==='oiss')h+=`<div class="group"><h3>Oxford Shoulder Instability Score</h3><p class="fine">Past 6 months. Each item 0–4; total 0–48, higher = better. Item wording paraphrased – use the licensed questionnaire for formal studies.</p>${OISS.map(([l,o],i)=>qBlock('oiss.o'+i,(i+1)+'. '+l,o,t.oiss['o'+i])).join('')}</div>`;
    if(view==='ases')h+=`<div class="group"><h3>ASES shoulder score</h3>${qBlock('ases.pain','Pain today (0 = none, 10 = worst)',Array.from({length:11},(_,i)=>[i,String(i)]),t.ases.pain)}<p class="fine" style="margin-top:8px">Activities of daily living</p>${ASES_ADL.map((l,i)=>qBlock('ases.a'+i,(i+1)+'. '+l,ASES_O,t.ases['a'+i])).join('')}</div>`;
    if(view==='con')h+=`<div class="group"><h3>Constant–Murley score</h3>${CON.map(([key,l,o])=>qBlock('con.'+key,l,o.map(([v,x])=>[v,`${x} (${v})`]),t.con[key])).join('')}
      <div class="fgrid" style="margin-top:8px"><label>Strength at 90° abduction (kg, best of 3)</label><input type="number" inputmode="decimal" step="any" data-s="con.kg" value="${esc(t.con.kg??'')}"><span class="u">kg</span><p class="h">1 point per pound (kg × 2.2), maximum 25.</p></div></div>`;
    if(view==='sirsi')h+=`<div class="group"><h3>SIRSI – psychological readiness to return to sport</h3><p class="fine">Each item 0–100 in steps of 10; 100 is always the most positive answer. Score = mean of the items.</p>${SIRSI.map((q,i)=>qBlock('sirsi.s'+i,(i+1)+'. '+q[0],SIRSI_OPT(q[1],q[2]),t.sirsi['s'+i])).join('')}</div>`;
    if(view==='sane')h+=`<div class="group"><h3>Single Assessment Numeric Evaluation</h3><div class="fgrid"><label>How would you rate your shoulder today as a percentage of normal?</label><input type="number" inputmode="decimal" min="0" max="100" data-s="sane.v" value="${esc(t.sane.v??'')}"><span class="u">%</span></div></div>`}
  h+=`<div class="group" id="scHist"></div>`;
  const st=el.scrollTop;el.innerHTML=h;el.scrollTop=st;renderScoreLive();renderScoreHistory();
  const tp=$('#scTp');if(tp)tp.onchange=e=>{S.sc.tp=e.target.value;renderScores();autosave()};
  const dt=$('#scDate');if(dt)dt.onchange=e=>{scTP(S.sc.tp).date=e.target.value;renderScoreHistory();autosave()};
  $$('#scView button').forEach(b=>b.onclick=()=>{S.sc.view=b.dataset.sv;renderScores();autosave()})}
function renderScoreLive(){const el=$('#scLive');if(!el)return;const t=scTP(S.sc.tp),view=S.sc.view;let h='';const fig=(k,v,u)=>`<div><span class="k">${k}</span><span class="v">${v}<small>${u||''}</small></span></div>`;
  if(view==='wosi'){const w=wosiScore(t);const n=WOSI_FLAT.filter((_,i)=>num(t.wosi['w'+i])!=null).length;h=`<div class="figs">${fig('WOSI raw',w?w.raw:'—','/2100')}${fig('% of normal',w?f0(w.pct):'—','%')}${fig('Answered',n,'/21')}</div><p class="fine">% of normal = (2100 − raw) ÷ 2100 × 100. Scored once 19 of 21 items are answered.</p>`}
  if(view==='rowe'){const x=roweScore(t);h=`<div class="figs">${fig('Rowe',x??'—','/100')}${fig('Grade',`<span style="font-size:16px">${roweGrade(x)||'—'}</span>`)}</div><p class="fine">90–100 excellent · 75–89 good · 51–74 fair · ≤ 50 poor.</p>`}
  if(view==='oiss'){const x=oissScore(t);h=`<div class="figs">${fig('Oxford instability',x??'—','/48')}</div><p class="fine">Higher = better. Scored once 11 of 12 items are answered.</p>`}
  if(view==='ases'){const x=asesScore(t);h=`<div class="figs">${fig('ASES',x!=null?f0(x):'—','/100')}</div><p class="fine">ASES = (10 − pain) × 5 + ADL total × 5/3.</p>`}
  if(view==='con'){const x=conScore(t);h=`<div class="figs">${fig('Constant',x??'—','/100')}</div><p class="fine">Pain 15 · activities 20 · motion 40 · strength 25. Compare with the other shoulder or age/sex norms.</p>`}
  if(view==='sirsi'){const x=sirsiScore(t);h=`<div class="figs">${fig('SIRSI',x!=null?f1(x):'—','/100')}</div><p class="fine">Higher = more ready. Athletes who returned to rugby scored ~61 vs ~38 in those who did not (Gerometta 2018).</p>`}
  if(view==='sane'){const x=saneScore(t);h=`<div class="figs">${fig('SANE',x??'—','%')}</div>`}
  el.innerHTML=h?`<div class="rec" style="padding:10px 12px">${h}</div>`:''}
function scoreHistoryRows(){return TP.filter(([k])=>hasData(k)).map(([k,l])=>({k,l,...scoreRow(k)}))}
const HIST_COLS=[['wosi','WOSI %',x=>f0(x)],['rowe','Rowe',x=>x],['oiss','Oxford',x=>x],['ases','ASES',x=>f0(x)],['con','Constant',x=>x],['sirsi','SIRSI',x=>f0(x)],['sane','SANE',x=>x]];
function histTable(rows){const cols=HIST_COLS.filter(([k])=>rows.some(r=>r[k]!=null));
  return`<div style="overflow-x:auto"><table class="mt"><tr><th>Time point</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr>${rows.map(r=>`<tr><td>${r.l}${r.date?`<div class="ref">${esc(r.date)}</div>`:''}</td>${cols.map(([k,,fm])=>`<td class="n">${r[k]!=null?fm(r[k]):'—'}</td>`).join('')}</tr>`).join('')}</table></div>`}
function renderScoreHistory(){const el=$('#scHist');if(!el)return;const rows=scoreHistoryRows();
  if(!rows.length){el.innerHTML='<h3>History</h3><div class="empty">No outcome scores recorded yet.</div>';return}
  const base=rows.find(r=>r.k==='preop'&&r.wosi!=null),last=[...rows].reverse().find(r=>r.k!=='preop'&&r.wosi!=null);
  let ch='';if(base&&last){ch=`<p class="fine">WOSI pre-op → ${last.l}: ${f0(base.wosi)} % → ${f0(last.wosi)} % of normal (raw ${base.wosiRaw} → ${last.wosiRaw}; a change of ~220 raw points is commonly quoted as clinically important).</p>`}
  el.innerHTML=`<h3>History</h3>${histTable(rows)}${ch}${trendSVG(rows)}`}
function trendSVG(rows){const pts=rows.filter(r=>r.wosi!=null||r.rowe!=null);if(pts.length<2)return'';
  const W=320,H=130,L=30,R=10,T=12,B=26,x=i=>L+i*(W-L-R)/(pts.length-1),y=v=>T+(100-v)*(H-T-B)/100;
  const path=key=>pts.map((r,i)=>r[key]==null?null:[x(i),y(r[key])]).filter(Boolean).map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const dots=(key,c)=>pts.map((r,i)=>r[key]==null?'':`<circle cx="${x(i).toFixed(1)}" cy="${y(r[key]).toFixed(1)}" r="3" fill="${c}"/>`).join('');
  return`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:480px" role="img" aria-label="WOSI and Rowe over time">
   ${[0,50,100].map(v=>`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="var(--muted)">${v}</text>`).join('')}
   ${pts.map((r,i)=>`<text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--muted)">${r.l.replace(' months',' m')}</text>`).join('')}
   <path d="${path('wosi')}" fill="none" stroke="var(--accent)" stroke-width="2"/>${dots('wosi','var(--accent)')}
   <path d="${path('rowe')}" fill="none" stroke="var(--warn)" stroke-width="2" stroke-dasharray="5 3"/>${dots('rowe','var(--warn)')}
   </svg><p class="fine"><span style="color:var(--accent)">━ WOSI % of normal</span> · <span style="color:var(--warn)">╍ Rowe</span></p>`}
document.addEventListener('change',e=>{const i=e.target;if(!i.dataset||!i.dataset.s)return;const [grp,key]=i.dataset.s.split('.');const t=scTP(S.sc.tp);
  t[grp][key]=i.value;renderScoreLive();renderScoreHistory();
  if(i.type!=='number'){const opt=$('#scTp')&&$('#scTp').selectedOptions[0];if(opt)opt.textContent=TPL[S.sc.tp]+(hasData(S.sc.tp)?' ✓':'')}
  autosave()});
document.addEventListener('input',e=>{const i=e.target;if(!i.dataset||!i.dataset.s||i.type!=='number')return;const [grp,key]=i.dataset.s.split('.');scTP(S.sc.tp)[grp][key]=i.value;renderScoreLive();autosave()});
function scoresCard(){const rows=scoreHistoryRows();if(!rows.length)return'';
  return`<div class="card"><div class="hd"><b>Outcome scores</b><button class="btn" data-goto="sc">Open</button></div>${histTable(rows)}</div>`}
function scoresSummary(){return scoreHistoryRows().map(r=>`${r.l}${r.date?' ('+r.date+')':''}: `+HIST_COLS.filter(([k])=>r[k]!=null).map(([k,l,fm])=>`${l} ${fm(r[k])}`).join(', '))}
