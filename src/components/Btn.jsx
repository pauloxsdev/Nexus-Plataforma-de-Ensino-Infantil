import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const Btn=({c=SUN,className='',children,...p})=>(<button {...p} style={{background:c}} className={`btn ${className}`}>{children}</button>);

