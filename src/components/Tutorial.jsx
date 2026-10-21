import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';
import {Nexi} from './Nexi';
import {Btn} from './Btn';

export function Tutorial({steps,onClose}){
  const [i,setI]=useState(0); const s=steps[i]; const last=i===steps.length-1;
  useEffect(()=>{const el=s.sel&&document.querySelector(s.sel); if(el){el.classList.add('spot');el.scrollIntoView({block:'center',behavior:'smooth'})} return()=>el&&el.classList.remove('spot')},[i]);
  return (<>
    <div className="fixed inset-0 z-50" style={{background:'rgba(16,26,74,.65)'}} onClick={onClose}/>
    <div className="fixed bottom-4 inset-x-4 z-[70] max-w-lg mx-auto up flex items-end gap-2">
      <div className="shrink-0"><Nexi s={76}/></div>
      <div className="card flex-1 p-4 relative" style={{background:'#FFF6B8'}}>
        <div className="absolute -left-3 bottom-8 w-5 h-5 rotate-45" style={{background:'#FFF6B8',borderLeft:`3px solid ${INK}`,borderBottom:`3px solid ${INK}`}}/>
        <h3 className="text-xl">{s.t}</h3><p className="text-sm mt-1 font-semibold">{s.d}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs">{i+1} de {steps.length}</span>
          <div className="flex items-center gap-3">{!last&&<button onClick={onClose} className="text-sm underline">Pular</button>}
            <Btn c={BLUE} className="!text-base !py-1 !px-4 !text-white" onClick={()=>last?onClose():setI(i+1)}>{last?'Entendi':'Próximo'}</Btn></div></div></div></div></>);
}

