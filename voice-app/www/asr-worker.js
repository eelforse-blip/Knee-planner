// Speech recognition and translation run here, off the main thread, with transformers.js (ONNX Runtime Web).
import {pipeline,env} from './transformers.min.js';
env.allowLocalModels=false;
const P={};
function get(task,model,opts,id){const k=task+'|'+model+'|'+JSON.stringify(opts);
  if(!P[k])P[k]=pipeline(task,model,{...opts,progress_callback:p=>postMessage({id,type:'progress',p})}).catch(e=>{delete P[k];throw e});
  return P[k]}
function splitText(t){return t.split(/\n/).map(para=>{const s=para.trim();if(!s)return[];const sents=s.match(/[^.!?؟۔]+[.!?؟۔]*\s*/g)||[s];const out=[];let buf='';for(const x of sents){if((buf+x).length>350&&buf){out.push(buf.trim());buf=x}else buf+=x}if(buf.trim())out.push(buf.trim());return out})}
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
