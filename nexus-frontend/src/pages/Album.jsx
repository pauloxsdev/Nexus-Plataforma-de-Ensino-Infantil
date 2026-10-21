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

export const stk=[['Primeiro voo','▲',1,SUN],['Mestre do loop','∞',1,PINK],['7 dias seguidos','7',1,'#FF9F1C'],['Pensador lógico','?',1,BLUE],['100 XP','100',1,GREEN],['Robô amigo','',0],['Trilha completa','',0],['Cientista','',0]];

export function Ach(){return (<div className="max-w-2xl mx-auto p-5"><h2 className="text-4xl">Meu álbum</h2><p className="mb-4">5 de 8 figurinhas coladas.</p>
  <div data-t="badges" className="grid grid-cols-2 sm:grid-cols-4 gap-5">{stk.map(([t,g,u,c],i)=>(<div key={t} className="text-center">
    {u?<div className="mx-auto w-28 h-28 rounded-2xl flex items-center justify-center disp text-4xl" style={{background:c,color:c===SUN?INK:'#fff',border:'5px solid #fff',outline:`3px solid ${INK}`,boxShadow:`3px 3px 0 ${INK}`,transform:`rotate(${[-5,4,-3,6,-4][i]}deg)`}}>{g}</div>
    :<div className="mx-auto w-28 h-28 rounded-2xl flex flex-col items-center justify-center" style={{border:'3px dashed #8F9BD0',color:'#8F9BD0'}}><Ic n="lock" s={26}/><span className="text-xs mt-1">nº {i+1}</span></div>}
    <div className="text-sm mt-2">{t}</div></div>))}</div></div>);}

