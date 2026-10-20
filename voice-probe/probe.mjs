import {pipeline,env} from '@huggingface/transformers';import fs from 'fs';import wf from 'wavefile';
const load=f=>{const w=new wf.WaveFile(fs.readFileSync(f));w.toBitDepth('32f');w.toSampleRate(16000);let s=w.getSamples();if(Array.isArray(s))s=s[0];return Float32Array.from(s)};
const ar=load('ar.wav'),en=load('en.wav');console.log('audio seconds',ar.length/16000,en.length/16000);
const T=async(label,fn)=>{const t=Date.now();try{const r=await fn();console.log(`OK ${label} ${Date.now()-t}ms ::`,JSON.stringify(r).slice(0,400))}catch(e){console.log(`FAIL ${label}`,String(e).slice(0,300))}};
for(const m of (process.env.ASR_MODELS||'').split(',').filter(Boolean)){
  for(const dtype of ['q8']){let asr;await T(`load ${m} ${dtype}`,async()=>{asr=await pipeline('automatic-speech-recognition',m,{dtype});return 'loaded'});if(!asr)continue;
    await T(`${m} ar transcribe`,()=>asr(ar,{language:'arabic',task:'transcribe',chunk_length_s:30,stride_length_s:5}));
    await T(`${m} ar translate`,()=>asr(ar,{language:'arabic',task:'translate',chunk_length_s:30,stride_length_s:5}));
    await T(`${m} en transcribe ts`,()=>asr(en,{language:'english',task:'transcribe',return_timestamps:true,chunk_length_s:30,stride_length_s:5}));
    await T(`${m} auto`,()=>asr(ar,{chunk_length_s:30}));}}
for(const m of (process.env.MT_MODELS||'').split(',').filter(Boolean)){let tr;
  await T(`load ${m}`,async()=>{tr=await pipeline('translation',m,{dtype:'q8'});return 'loaded'});if(!tr)continue;
  const multi=/m2m|nllb/.test(m);const ar2en=multi?(/nllb/.test(m)?{src_lang:'arb_Arab',tgt_lang:'eng_Latn'}:{src_lang:'ar',tgt_lang:'en'}):{};const en2ar=multi?(/nllb/.test(m)?{src_lang:'eng_Latn',tgt_lang:'arb_Arab'}:{src_lang:'en',tgt_lang:'ar'}):{};
  if(multi||m.includes('ar-en'))await T(`${m} ar->en`,()=>tr('المريض يشكو من ألم في الركبة اليمنى منذ ثلاثة أشهر بعد إصابة في كرة القدم',ar2en));
  if(multi||m.includes('en-ar'))await T(`${m} en->ar`,()=>tr('The patient has had right knee pain for three months after a football injury.',en2ar))}
// list file sizes
import {execSync} from 'child_process';try{console.log(execSync('du -sh node_modules/@huggingface/transformers/.cache/* 2>/dev/null || du -sh ~/.cache/huggingface 2>/dev/null; find / -path /proc -prune -o -name "*.onnx" -size +1M -print 2>/dev/null | xargs -r ls -la | awk \'{print $5,$9}\' | head -60').toString())}catch(e){}
