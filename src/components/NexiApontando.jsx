import React from 'react';
import { INK, SUN, PINK } from '../theme/tokens';
import { Nexi } from './Nexi';

// O Nexi apontando para o alvo do tutorial, com o bracinho "pulsando" na direção (animação em index.css).
// dir = para onde ele aponta: 'dir' | 'esq' | 'cima' | 'baixo'
const BRACOS = {
  dir: { x1: 68, y1: 44, x2: 98, y2: 44, ponta: 'M96 33L116 44 96 55z' },
  esq: { x1: 12, y1: 44, x2: -18, y2: 44, ponta: 'M-16 33L-36 44-16 55z' },
  baixo: { x1: 40, y1: 68, x2: 40, y2: 98, ponta: 'M29 96L40 116 51 96z' },
  cima: { x1: 62, y1: 24, x2: 62, y2: -6, ponta: 'M51 -4L62 -24 73 -4z' },
};
export function NexiApontando({ dir = 'dir', s = 64 }) {
  const b = BRACOS[dir];
  return (
    <div style={{ position: 'relative', width: s, height: s }}>
      <Nexi s={s} mood="feliz" />
      <svg width={s} height={s} viewBox="0 0 80 80" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} aria-hidden="true">
        <g className={'ap-' + dir}>
          <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={INK} strokeWidth="11" strokeLinecap="round" />
          <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={SUN} strokeWidth="5" strokeLinecap="round" />
          <path d={b.ponta} fill={PINK} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
