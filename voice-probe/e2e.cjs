const {chromium}=require('playwright');const fs=require('fs');const out=[];const log=(...a)=>{const s=a.join(' ');console.log(s);out.push(s)};
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')log('CONSOLE',m.text().slice(0,200))});
await p.goto('http://localhost:8099/');await p.waitForTimeout(1000);
await p.evaluate(()=>localStorage.setItem('vn_set',JSON.stringify({auto:false,model:'small',lang:'ar'})));await p.reload();await p.waitForTimeout(800);
await p.setInputFiles('#audioIn','ar.wav');await p.waitForTimeout(1500);
let t=Date.now();await p.click('#trBtn');
for(let i=0;i<600;i++){await p.waitForTimeout(1000);const v=await p.$eval('#txt',e=>e.value).catch(()=>'');if(v)break;const pr=await p.$eval('#prog',e=>e.innerText).catch(()=>'');if(i%15===0)log('progress',pr.replace(/\n/g,' '))}
log('AR transcript',((Date.now()-t)/1000).toFixed(0)+'s ::',await p.$eval('#txt',e=>e.value));
t=Date.now();await p.click('#toEn');for(let i=0;i<400;i++){await p.waitForTimeout(1000);const v=await p.$eval('#trn',e=>e.value).catch(()=>'');if(v)break}
log('AR->EN',((Date.now()-t)/1000).toFixed(0)+'s ::',await p.$eval('#trn',e=>e.value));
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('vn_set'));s.model='base';localStorage.setItem('vn_set',JSON.stringify(s))});
await p.setInputFiles('#audioIn','en.wav');await p.waitForTimeout(1500);await p.selectOption('#nLang','en');await p.selectOption('#nModel','base');await p.waitForTimeout(300);
t=Date.now();await p.click('#trBtn');for(let i=0;i<400;i++){await p.waitForTimeout(1000);const v=await p.$eval('#txt',e=>e.value).catch(()=>'');if(v)break}
log('EN transcript',((Date.now()-t)/1000).toFixed(0)+'s ::',await p.$eval('#txt',e=>e.value));
t=Date.now();await p.click('#toAr');for(let i=0;i<400;i++){await p.waitForTimeout(1000);const v=await p.$eval('#trn',e=>e.value).catch(()=>'');if(v)break}
log('EN->AR',((Date.now()-t)/1000).toFixed(0)+'s ::',await p.$eval('#trn',e=>e.value));
t=Date.now();await p.click('#fxBtn');await p.waitForTimeout(8000);log('enhanced',await p.evaluate(()=>!!window.__vn.items()[0].enh));
fs.writeFileSync('e2e.txt',out.join('\n'));await b.close()})().catch(e=>{log('FAIL',e.message);fs.writeFileSync('e2e.txt',out.join('\n'));process.exit(1)});
