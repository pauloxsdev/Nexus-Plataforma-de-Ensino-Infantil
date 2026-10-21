import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';
import {Ic} from '../components/Icon';
import {Nexi} from '../components/Nexi';
import {Astro} from '../components/Astro';
import {Btn} from '../components/Btn';
import {Seg} from '../components/Seg';
import {Modal} from '../components/Modal';
import {AvCtx,Me} from '../context/AvatarContext';
import {sfx} from '../services/som';

export const phases=[{n:1,t:'Primeiros passos',s:'done'},{n:2,t:'Sequências',s:'done'},{n:3,t:'Repetições',s:'done'},{n:4,t:'Decisões',s:'done'},{n:5,t:'Lógica na prática',s:'now'},{n:6,t:'Variáveis',s:'lock'},{n:7,t:'Missão final',s:'lock'}];

export const rows=[[1],[2],[3,4],[5],[6,7]];

export function Courses({go}){
  const [sel,setSel]=useState(5); const p=phases[sel-1];
  const Sq=({n})=>{const q=phases[n-1];const on=sel===n;return (
    <button data-t={q.s==='now'?'now':n===6?'lock':undefined} onClick={()=>setSel(n)} aria-label={`Fase ${n}: ${q.t}`}
      className="w-20 h-20 flex items-center justify-center disp text-3xl rounded-lg relative"
      style={{background:q.s==='done'?'#fff':q.s==='now'?SUN:'transparent',color:INK,border:q.s==='lock'?'3px dashed #8F9BD0':'4px solid #fff',outline:on?`4px solid ${PINK}`:'none',outlineOffset:3,...(q.s==='lock'?{color:'#8F9BD0'}:{})}}>
      {q.s==='done'?<Ic n="check" s={34} w={4}/>:q.s==='lock'?<Ic n="lock" s={30} w={3}/>:n}
      {q.s==='now'&&<span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full" style={{background:BLUE,border:`3px solid ${INK}`}}/>}</button>)};
  return (<div className="max-w-md mx-auto p-5">
    <h2 className="text-4xl">Sua trilha</h2><p className="mb-3">4 de 7 fases completas. Pule até a pedrinha!</p>
    <div className="rounded-2xl p-6 flex flex-col-reverse items-center gap-3" style={{background:INK,border:`3px solid ${INK}`,boxShadow:`5px 5px 0 ${BLUE}`}}>
      {rows.map((r,i)=>(<div key={i} className="flex gap-3">{r.map(n=><Sq key={n} n={n}/>)}</div>))}</div>
    <div className="card p-4 mt-5"><div className="text-sm">Fase {p.n}</div><h3 className="text-2xl">{p.t}</h3>
      <p className="text-sm mt-1">{p.s==='done'?'Você já completou esta fase.':p.s==='now'?'Você está aqui. Falta pouco para terminar.':'Termine a fase anterior para abrir esta.'}</p>
      {p.s==='now'&&<Btn className="mt-3" onClick={()=>go('work')}>Jogar fase 5</Btn>}</div></div>);
}

