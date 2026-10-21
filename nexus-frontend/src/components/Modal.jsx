import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const Modal=({children,onClose})=>(<div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{background:'rgba(16,26,74,.7)'}} onClick={onClose}><div className="card up max-w-sm w-full p-6 text-center" onClick={e=>e.stopPropagation()}>{children}</div></div>);

