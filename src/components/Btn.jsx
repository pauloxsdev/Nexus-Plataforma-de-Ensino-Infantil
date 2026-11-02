import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

// depois de um clique com o mouse o botão perde o foco: assim a tecla Enter continua executando o circuito
export const Btn=({c=SUN,className='',children,onClick,...p})=>(<button {...p} onClick={(e)=>{onClick&&onClick(e);if(e.detail>0)e.currentTarget.blur();}} style={{background:c}} className={`btn ${className}`}>{children}</button>);

