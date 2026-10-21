import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';
import {Astro} from '../components/Astro';

export const AvCtx=React.createContext([{cor:SUN,acc:'nenhum'},()=>{}]);

export const Me=({s=64})=>{const [a]=React.useContext(AvCtx);return <Astro s={s} cor={a.cor} acc={a.acc}/>};

