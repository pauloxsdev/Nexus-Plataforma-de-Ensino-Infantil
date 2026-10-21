import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const P={star:'M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.800 5.600 21.500l1.700-7.200L2 9.600 9 9z',fire:'M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z',lock:'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',check:'M4 13l5 5L20 6',play:'M7 4l13 8-13 8z',plus:'M12 4v16M4 12h16',help:'M9 9a3 3 0 1 1 4 2.800c-1 .5-1 1.200-1 2.200M12 18v1',trash:'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13'};

export const Ic=({n,s=22,f='none',w=3})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill={f} stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]}/></svg>);

P.bolt='M13 2L4 14h7l-1 8 9-12h-7z';P.cloud='M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4 4 0 0 1 0 8z';

