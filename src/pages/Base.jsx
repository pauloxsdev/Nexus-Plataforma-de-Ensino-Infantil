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

export function Dash({go}){
  const days=['S','T','Q','Q','S','S','D'];
  return (<div className="max-w-xl mx-auto p-5 space-y-5">
    <div className="flex items-center gap-3"><button data-t="avatar" aria-label="Trocar astronauta" onClick={()=>go('avatar')}><Me s={64}/></button><div><h2 className="text-4xl">Olá, Astronauta!</h2><p>Hoje tem fase nova esperando.</p></div></div>
    <div data-t="xp" className="card p-4"><div className="flex items-end justify-between mb-3"><div className="disp text-5xl">Nível 8</div><div className="text-right text-sm">1.240 de 1.500 XP<br/>faltam 260 para o nível 9</div></div><Seg v={10}/></div>
    <div data-t="streak" className="card p-4" style={{background:SUN}}>
      <div className="flex items-center gap-2 mb-3"><Ic n="fire" f={PINK}/><span className="disp text-2xl">7 dias seguidos</span></div>
      <div className="flex gap-2">{days.map((d,i)=>(<div key={i} className="flex-1 aspect-square rounded-full flex items-center justify-center" style={{background:'#fff',border:`3px solid ${INK}`}}><Ic n="check" s={18} w={4}/></div>))}</div>
      <div className="flex gap-2 mt-1">{days.map((d,i)=>(<div key={i} className="flex-1 text-center text-xs">{d}</div>))}</div></div>
    <div className="grid grid-cols-3 gap-0 card text-center divide-x-[3px]" style={{borderColor:INK}}>
      {[['24','blocos usados'],['1.240','XP'],['5','figurinhas']].map(([n,l])=>(<div key={l} className="py-3 border-[color:var(--ink)]"><div className="disp text-3xl">{n}</div><div className="text-xs">{l}</div></div>))}</div>
    <Btn data-t="go" className="w-full text-2xl py-3" onClick={()=>go('work')}>Continuar a fase 5</Btn></div>);
}

