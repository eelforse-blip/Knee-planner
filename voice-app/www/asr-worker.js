// Speech recognition and translation run here, off the main thread, with transformers.js (ONNX Runtime Web).
import {pipeline,env} from './transformers.min.js';
env.allowLocalModels=false;
const P={};
function get(task,model,opts,id){const k=task+'|'+model+'|'+JSON.stringify(opts);
  if(!P[k])P[k]=pipeline(task,model,{...opts,progress_callback:p=>postMessage({id,type:'progress',p})}).catch(e=>{delete P[k];throw e});
  return P[k]}
function splitLong(x){if(x.length<=220)return[x];const parts=x.split(/(?<=[،,;؛])\s+/);const out=[];let buf='';
  for(const p of parts){if((buf+' '+p).length>220&&buf){out.push(buf.trim());buf=p}else buf=buf?buf+' '+p:p}if(buf.trim())out.push(buf.trim());
  return out.flatMap(c=>{if(c.length<=300)return[c];const w=c.split(/\s+/),r=[];for(let i=0;i<w.length;i+=35)r.push(w.slice(i,i+35).join(' '));return r})}
function splitText(t){return t.split(/\n/).map(para=>{const s=para.trim();if(!s)return[];const sents=s.match(/[^.!?؟۔]+[.!?؟۔]*/g)||[s];return sents.map(x=>x.trim()).filter(x=>x&&!/^[.!?؟۔\s]+$/.test(x)).flatMap(splitLong)})}
onmessage=async e=>{const m=e.data;
  try{
    if(m.type==='asr'){
      const asr=await get('automatic-speech-recognition',m.model,{dtype:m.dtype,device:m.device},m.id);
      postMessage({id:m.id,type:'stage',stage:'run'});
      const opt={task:m.task,chunk_length_s:30,stride_length_s:5,return_timestamps:!!m.ts};if(m.language)opt.language=m.language;
      const out=await asr(m.audio,opt);postMessage({id:m.id,type:'done',out})}
    else if(m.type==='mt'){
      const tr=await get('translation',m.model,{dtype:m.dtype},m.id);
      postMessage({id:m.id,type:'stage',stage:'run'});
      const paras=splitText(m.text);const n=paras.reduce((a,b)=>a+b.length,0);let i=0;const res=[];
      for(const pa of paras){const r=[];for(const p of pa){i++;const o=await tr(p,{...(m.opts||{}),max_new_tokens:512});r.push((o[0]&&o[0].translation_text)||'');postMessage({id:m.id,type:'part',i,n})}res.push(r.join(' '))}
      postMessage({id:m.id,type:'done',out:{text:res.join('\n')}})}
  }catch(err){postMessage({id:m.id,type:'error',error:String(err&&err.message||err)})}};
