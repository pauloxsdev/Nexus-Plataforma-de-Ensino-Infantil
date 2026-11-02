import React from 'react';
import { INK } from '../theme/tokens';
import { PECAS } from '../game/pecas';

// A peça "fantasma" que segue o dedo/mouse enquanto a criança arrasta.
// voltando = a peça foi solta fora e desliza de volta para a bandeja.
export function PecaArrastada({ arrasto, voltando = false }) {
  if (!arrasto) return null;
  const def = PECAS[arrasto.peca];
  const ida = voltando && arrasto.ida;
  return (
    <div aria-hidden="true" className="flex flex-col items-center justify-center rounded-2xl"
      style={{ position: 'fixed', left: arrasto.x, top: arrasto.y, width: 88, minHeight: 66,
        transform: `translate(-50%, -60%) rotate(-4deg) scale(${ida ? 0.55 : 1})`, opacity: ida ? 0.2 : 1,
        transition: voltando ? 'left .28s ease-in, top .28s ease-in, opacity .28s, transform .28s' : 'none',
        background: def.cor, color: def.txt, border: `3px solid ${INK}`, boxShadow: `6px 8px 0 ${INK}`, pointerEvents: 'none', zIndex: 100 }}>
      <span className="disp text-2xl leading-none">{def.glifo}</span>
      <span className="text-[11px] leading-tight px-1 text-center" style={{ fontWeight: 800 }}>{def.nome}</span>
    </div>
  );
}
