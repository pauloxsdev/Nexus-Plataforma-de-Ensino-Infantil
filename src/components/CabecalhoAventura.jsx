import React from 'react';
import { Nexi } from './Nexi';
export function CabecalhoAventura({ etiqueta, titulo, children, extra }) {
  return <header className="adventure-header card">
    <div className="adventure-copy"><span className="eyebrow">{etiqueta}</span><h2>{titulo}</h2><div className="mt-2">{children}</div>{extra && <div className="mt-4">{extra}</div>}</div>
    <div className="mascot-orbit" aria-hidden="true"><span className="orbit-star star-one">✦</span><Nexi s={154} /><span className="orbit-star star-two">✧</span></div>
  </header>;
}
