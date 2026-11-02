import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';

export const Modal=({children,onClose,largo})=>(<div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{background:'rgba(16,26,74,.7)'}} onClick={onClose}><div className={"card up w-full p-6 text-center "+(largo?"max-w-3xl":"max-w-sm")} onClick={e=>e.stopPropagation()}>{children}</div></div>);

