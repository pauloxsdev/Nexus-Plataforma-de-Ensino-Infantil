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

export function Login({go}){
  const [code,setCode]=useState(''); const [err,setErr]=useState('');
  const enter=()=>code.toUpperCase()==='A1B2C'?go('dash'):setErr('Esse código não existe. Confira as 5 letras com seu professor.');
  return (<div className="max-w-md mx-auto p-5 pt-10">
    <Nexi s={84}/>
    <h1 className="text-5xl mt-3">Qual é o seu código?</h1>
    <p className="mt-3">Seu professor te deu 5 letras ou números. Digite aqui.</p>
    <label className="relative block mt-6" data-t="code">
      <div className="flex gap-2">{[0,1,2,3,4].map(i=>(<div key={i} className="card flex-1 h-20 flex items-center justify-center text-4xl disp" style={{borderRadius:14,background:code[i]?'#fff':'#F3F6FF'}}>{code[i]?.toUpperCase()}</div>))}</div>
      <input aria-label="Código do aluno" value={code} onChange={e=>{setCode(e.target.value.replace(/[^a-z0-9]/gi,'').slice(0,5));setErr('')}} onKeyDown={e=>e.key==='Enter'&&enter()} className="absolute inset-0 w-full h-full opacity-0 cursor-text"/></label>
    {err&&<p role="alert" className="mt-3 card !shadow-none p-3 text-sm" style={{background:'#FFE3EA'}}>{err}</p>}
    <Btn data-t="enter" className="w-full mt-6 text-2xl" onClick={enter}>Entrar</Btn>
    <p className="text-sm mt-4">Você não precisa de e-mail nem de nome.</p></div>);
}

