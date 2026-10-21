import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const Astro=({s=80,cor=SUN,acc='nenhum'})=>(<svg width={s} height={s} viewBox="0 0 80 80" aria-label="Seu astronauta"><rect x="24" y="58" width="32" height="20" rx="8" fill={cor} stroke={INK} strokeWidth="4"/>
 {acc==='antena'&&<><line x1="40" y1="10" x2="40" y2="3" stroke={INK} strokeWidth="4"/><circle cx="40" cy="3" r="3.5" fill={PINK} stroke={INK} strokeWidth="3"/></>}
 <circle cx="40" cy="34" r="26" fill="#fff" stroke={INK} strokeWidth="4"/><rect x="20" y="22" width="40" height="24" rx="12" fill={INK}/><circle cx="32" cy="33" r="3.5" fill="#fff"/><circle cx="48" cy="33" r="3.5" fill="#fff"/><path d="M33 40q7 6 14 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
 {acc==='fones'&&<><rect x="7" y="28" width="9" height="15" rx="3" fill={BLUE} stroke={INK} strokeWidth="3"/><rect x="64" y="28" width="9" height="15" rx="3" fill={BLUE} stroke={INK} strokeWidth="3"/></>}
 {acc==='estrela'&&<path d="M40 8l2.500 5.500 6 .6-4.500 4 1.400 5.800L40 21l-5.400 3.400 1.400-5.800-4.500-4 6-.6z" fill={SUN} stroke={INK} strokeWidth="2"/>}</svg>);

