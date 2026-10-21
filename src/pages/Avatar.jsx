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

export function Avatar({go}){
  const [a,setA]=React.useContext(AvCtx);
  return (<div className="max-w-md mx-auto p-5"><h2 className="text-4xl">Escolha seu astronauta</h2><p className="mt-1">Ele não tem nome nem foto. É só o seu jeito de aparecer no jogo.</p>
    <div className="card p-6 my-4 flex justify-center" style={{background:'#FFF6B8'}}><Astro s={170} cor={a.cor} acc={a.acc}/></div>
    <div data-t="av-cor"><h3 className="text-xl mb-2">Cor do traje</h3><div className="flex gap-3">{SUITS.map(c=>(<button key={c} aria-label="Escolher cor do traje" onClick={()=>{sfx('tap');setA({...a,cor:c})}} className="w-12 h-12 rounded-full" style={{background:c,border:`3px solid ${INK}`,outline:a.cor===c?`4px solid ${PINK}`:'none',outlineOffset:3}}/>))}</div></div>
    <div className="mt-4" data-t="av-acc"><h3 className="text-xl mb-2">Acessório</h3><div className="grid grid-cols-4 gap-2">{[['nenhum','Nenhum'],['antena','Antena'],['fones','Fones'],['estrela','Estrela']].map(([k,l])=>(<button key={k} onClick={()=>{sfx('tap');setA({...a,acc:k})}} className="card !shadow-none py-2 text-sm" style={{background:a.acc===k?SUN:'#fff'}}>{l}</button>))}</div></div>
    <Btn className="w-full mt-6 text-2xl" onClick={()=>go('dash')}>Pronto!</Btn></div>);
}

