import {pipeline} from '@huggingface/transformers';import fs from 'fs';import wf from 'wavefile';
const load=f=>{const w=new wf.WaveFile(fs.readFileSync(f));w.toBitDepth('32f');let s=w.getSamples();if(Array.isArray(s))s=s[0];return Float32Array.from(s)};
for(const m of ['onnx-community/whisper-base','onnx-community/whisper-small']){const asr=await pipeline('automatic-speech-recognition',m,{dtype:'q8'});
  for(const f of fs.readdirSync('samples').sort()){const lang=f.startsWith('ar')?'arabic':'english';const r=await asr(load('samples/'+f),{language:lang,task:'transcribe',chunk_length_s:30});console.log(m.split('/')[1],f,'::',r.text)}}
