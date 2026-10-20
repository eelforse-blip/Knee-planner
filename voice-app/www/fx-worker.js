// Voice enhancer: high-pass, RNNoise noise suppression, speech EQ, leveller, limiter. Input/output: mono Float32 at 48 kHz → 24 kHz WAV.
import {Rnnoise} from './rnnoise.js';
let rnP=null;const getRn=()=>rnP||(rnP=Rnnoise.load());

function biquad(type,f0,fs,Q,gainDb){const A=Math.pow(10,(gainDb||0)/40),w=2*Math.PI*f0/fs,c=Math.cos(w),s=Math.sin(w),al=s/(2*Q);let b0,b1,b2,a0,a1,a2;
  if(type==='hp'){b0=(1+c)/2;b1=-(1+c);b2=(1+c)/2;a0=1+al;a1=-2*c;a2=1-al}
  else if(type==='lp'){b0=(1-c)/2;b1=1-c;b2=(1-c)/2;a0=1+al;a1=-2*c;a2=1-al}
  else{b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A}
  return{b0:b0/a0,b1:b1/a0,b2:b2/a0,a1:a1/a0,a2:a2/a0}}
function filt(x,f){let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<x.length;i++){const v=x[i];const y=f.b0*v+f.b1*x1+f.b2*x2-f.a1*y1-f.a2*y2;x2=x1;x1=v;y2=y1;y1=y;x[i]=y}}
const db=v=>20*Math.log10(Math.max(v,1e-9));
function frameRms(x,n){const out=new Float32Array(Math.floor(x.length/n));for(let k=0;k<out.length;k++){let s=0;const o=k*n;for(let i=0;i<n;i++){const v=x[o+i];s+=v*v}out[k]=Math.sqrt(s/n)}return out}
const pct=(a,p)=>{const s=Float32Array.from(a).sort();return s[Math.min(s.length-1,Math.floor(p*s.length))]||0};
function wav16(x,fs){const b=new ArrayBuffer(44+x.length*2),v=new DataView(b);const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  w(0,'RIFF');v.setUint32(4,36+x.length*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,fs,true);v.setUint32(28,fs*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,x.length*2,true);
  for(let i=0;i<x.length;i++){const s=Math.max(-1,Math.min(1,x[i]));v.setInt16(44+i*2,s<0?s*32768:s*32767,true)}return b}

onmessage=async e=>{const {id,pcm,level}=e.data;const FS=48000,N=480;const t0=Date.now();
  try{const x=pcm;const post=(p)=>postMessage({id,type:'part',p});
    const before=frameRms(x,N);const floorBefore=pct(before,.1),speechBefore=pct(before,.9);
    filt(x,biquad('hp',80,FS,0.707));
    // noise suppression
    const nF=Math.floor(x.length/N);const vad=new Float32Array(nF).fill(1);
    if(level!=='light'){const rn=await getRn();const st=rn.createDenoiseState();const fr=new Float32Array(N);
      for(let k=0;k<nF;k++){const o=k*N;for(let i=0;i<N;i++)fr[i]=x[o+i]*32767;vad[k]=st.processFrame(fr);for(let i=0;i<N;i++)x[o+i]=fr[i]/32767;if(k%2000===0)post(k/nF*.7)}
      st.destroy();for(let i=nF*N;i<x.length;i++)x[i]=0;
      const D=2*N;x.copyWithin(0,D);x.fill(0,x.length-D);vad.copyWithin(0,2);vad.fill(0,nF-2)}
    else{const r=frameRms(x,N);const fl=pct(r,.15);for(let k=0;k<nF;k++)vad[k]=r[k]>fl*3?1:0}
    // residual-noise gate between words (strong)
    if(level==='strong'){let g=1;for(let k=0;k<nF;k++){const tgt=vad[k]>0.5?1:vad[k]>0.2?0.5:0.18;const o=k*N;for(let i=0;i<N;i++){g+=(tgt-g)*(tgt>g?0.02:0.0015);x[o+i]*=g}}}
    // speech EQ: less mud, more presence, tame hiss
    filt(x,biquad('peak',250,FS,1,-2));filt(x,biquad('peak',3000,FS,1,3));filt(x,biquad('lp',9500,FS,0.707));
    post(.8);
    // leveller (speech only drives the gain)
    const target=0.1;let p=target*target,g=1;const r2=frameRms(x,N);
    for(let k=0;k<nF;k++){if(vad[k]>0.6)p=p*0.92+r2[k]*r2[k]*0.08;const want=Math.max(0.3,Math.min(8,target/Math.sqrt(p||1e-8)));const o=k*N;
      for(let i=0;i<N;i++){g+=(want-g)*(want<g?0.003:0.0004);x[o+i]*=g}}
    // soft limiter + peak normalise
    let pk=0;for(let i=0;i<x.length;i++){let v=x[i];const a=Math.abs(v);if(a>0.7){v=Math.sign(v)*(0.7+0.3*Math.tanh((a-0.7)/0.3))}x[i]=v;if(Math.abs(v)>pk)pk=Math.abs(v)}
    const k2=pk>0?0.94/pk:1;
    // downsample to 24 kHz (already low-passed at 9.5 kHz)
    const out=new Float32Array(Math.floor(x.length/2));for(let i=0;i<out.length;i++)out[i]=x[2*i]*k2;
    const after=frameRms(out,N/2);const floorAfter=pct(after,.1),speechAfter=pct(after,.9);
    const buf=wav16(out,24000);
    postMessage({id,type:'done',out:{wav:buf,stats:{snrBefore:db(speechBefore)-db(floorBefore),snrAfter:db(speechAfter)-db(floorAfter),floorBefore:db(floorBefore),floorAfter:db(floorAfter),ms:Date.now()-t0}}},[buf])}
  catch(err){postMessage({id,type:'error',error:String(err&&err.message||err)})}};
