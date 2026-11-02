import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const face=(m)=>{const E=(x,px,py,r=7)=>(<><circle cx={x} cy="40" r={r} fill="#fff" stroke={INK} strokeWidth="3"/><circle cx={px} cy={py} r="3" fill={INK}/></>);
 if(m==='pensando')return <>{E(28,31,38)}{E(52,55,38)}<path d="M31 57h18" stroke={INK} strokeWidth="4" strokeLinecap="round"/><path d="M42 28l16-5" stroke={INK} strokeWidth="3.5" strokeLinecap="round"/></>;
 if(m==='comemorando')return <><path d="M21 44q7-10 14 0M45 44q7-10 14 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round"/><path d="M27 52q13 18 26 0z" fill={INK}/></>;
 if(m==='curioso')return <>{E(28,29,41,6)}{E(52,53,41,9)}<circle cx="40" cy="58" r="4" fill={INK}/></>;
 if(m==='cochilando')return <><path d="M21 42h14M45 42h14M35 57q5 3 10 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round"/><text x="60" y="16" fontSize="14" fontWeight="800" fill={INK}>z</text></>;
 return <>{E(28,29,41)}{E(52,53,41)}<path d="M27 55q13 9 26 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round"/></>;};

export const Nexi=({s=72,mood='feliz'})=>(<svg width={s} height={s} viewBox="0 0 80 80" aria-label={`Nexi, o robô (${mood})`}><line x1="40" y1="8" x2="40" y2="20" stroke={INK} strokeWidth="4"/><circle cx="40" cy="8" r="5" fill={PINK} stroke={INK} strokeWidth="3"/><rect x="10" y="20" width="60" height="48" rx="14" fill={SUN} stroke={INK} strokeWidth="4"/><rect x="2" y="36" width="8" height="16" rx="3" fill={BLUE} stroke={INK} strokeWidth="3"/><rect x="70" y="36" width="8" height="16" rx="3" fill={BLUE} stroke={INK} strokeWidth="3"/>{face(mood)}</svg>);

