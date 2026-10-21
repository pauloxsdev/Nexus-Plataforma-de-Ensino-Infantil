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

export function Nivel({go}){
  const [a]=React.useContext(AvCtx); useEffect(()=>{sfx('up')},[]);
  return (<div className="relative overflow-hidden max-w-md mx-auto p-5 text-center" style={{minHeight:'78vh'}}>
    {Array.from({length:14},(_,i)=>(<span key={i} className="cf absolute top-0 w-3 h-5 rounded-sm" style={{left:((i*7+3)%96)+'%',animationDelay:(i*.15)+'s',background:SUITS[i%5],border:`2px solid ${INK}`}}/>))}
    <h2 className="text-4xl mt-6">Você subiu de nível!</h2>
    <div className="slap relative mx-auto my-7 w-44 h-44 flex items-center justify-center"><div className="absolute inset-0 rotate-12 rounded-3xl" style={{background:SUN,border:`4px solid ${INK}`,boxShadow:`6px 6px 0 ${INK}`}}/><div className="absolute inset-0 rounded-3xl" style={{background:PINK,border:`4px solid ${INK}`}}/><div className="relative"><div className="disp text-lg">Nível</div><div className="disp text-8xl leading-none">9</div></div></div>
    <div className="flex justify-center items-end gap-3"><Astro s={90} cor={a.cor} acc={a.acc}/><Nexi s={80} mood="comemorando"/></div>
    <p className="mt-3">+50 XP e a figurinha <b>Mestre do loop</b> no seu álbum.</p>
    <div className="flex gap-3 mt-5"><Btn c="#fff" className="flex-1 !text-base" onClick={()=>go('ach')}>Ver álbum</Btn><Btn className="flex-1 !text-base" onClick={()=>go('courses')}>Próxima fase</Btn></div></div>);
}

