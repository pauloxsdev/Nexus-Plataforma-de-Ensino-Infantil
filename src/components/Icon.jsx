import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const P={star:'M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.800 5.600 21.500l1.700-7.200L2 9.600 9 9z',fire:'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',lock:'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',check:'M4 13l5 5L20 6',play:'M7 4l13 8-13 8z',plus:'M12 4v16M4 12h16',help:'M9 9a3 3 0 1 1 4 2.800c-1 .5-1 1.200-1 2.200M12 18v1',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'};

export const Ic=({n,s=22,f='none',w=3})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill={f} stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]}/></svg>);

P.bolt='M13 2L4 14h7l-1 8 9-12h-7z';P.cloud='M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4 4 0 0 1 0 8z';


// ícones da barra lateral
P.home = 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10';
P.map = 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14';
P.user = 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8';
P.trophy = 'M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 2.8M16 6h4v2a3 3 0 0 1-4 2.8M12 14v4M8 20h8';
P.users = 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.8.9 3 2.7 3 5.6';
P.logout = 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9';
P.chevL = 'M15 5l-7 7 7 7';
P.chevR = 'M9 5l7 7-7 7';
P.book = 'M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20V5M8 7h7M8 11h5';
P.wifi = 'M2 9a15 15 0 0 1 20 0M5.500 12.500a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.500h.01';
P.som = 'M4 9v6h4l5 4V5L8 9zM16.500 8.500a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12';
P.mudo = 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6';
