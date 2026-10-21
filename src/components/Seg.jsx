import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const Seg=({v,n=12,c=GREEN})=>(<div className="flex gap-1" role="img" aria-label={`${v} de ${n}`}>{Array.from({length:n},(_,i)=>(<div key={i} className="flex-1 h-7 rounded-md" style={{background:i<v?c:'#fff',border:`3px solid ${INK}`}}/>))}</div>);

