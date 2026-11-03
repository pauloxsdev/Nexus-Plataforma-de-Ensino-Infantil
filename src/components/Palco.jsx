import React from 'react';
import { INK, SUN, ORANGE, PINK } from '../theme/tokens';
import { Ic } from './Icon';
import { Me } from '../context/AvatarContext';

const ROT = { N: 0, E: 90, S: 180, W: 270 };

// Desenha o mapa da fase. robo = { x, y, dir } (se não vier, mostra o Nexi no começo).
export function Palco({ mundo, robo, pegas = [], tam = 40, destaque = null }) {
  const r = robo || mundo.inicio;
  const tem = (lista, x, y) => lista.some(([a, b]) => a === x && b === y);
  const cel = (x, y) => {
    const base = { width: '100%', aspectRatio: '1', minWidth: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' };
    if (destaque && destaque[0] === x && destaque[1] === y) base.boxShadow = `0 0 0 3px ${PINK}, 0 0 0 5px #fff`;
    const k = x + '-' + y;
    if (x === r.x && y === r.y) {
      return (
        <div key={k} style={{ ...base, border: '2px solid #fff' }}>
          <Me s={Math.round(tam * 0.9)} />
          <div style={{ position: 'absolute', inset: 0, transform: `rotate(${ROT[r.dir]}deg)`, transition: 'transform .3s' }} aria-hidden="true">
            <span style={{ position: 'absolute', top: -5, left: '50%', marginLeft: -5, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `7px solid ${SUN}` }} />
          </div>
        </div>
      );
    }
    if (tem(mundo.lavas, x, y)) return <div key={k} className="disp" style={{ ...base, background: ORANGE, border: `3px solid ${INK}`, fontSize: tam * 0.6 }}>~</div>;
    if (tem(mundo.pedras, x, y)) return <div key={k} style={{ ...base, background: '#8F9BD0', border: `3px solid ${INK}` }}><div style={{ width: tam * 0.5, height: tam * 0.3, borderRadius: 4, background: '#fff', border: `2px solid ${INK}` }} /></div>;
    if (tem(mundo.estrelas, x, y)) {
      const ok = pegas.includes(x + ',' + y);
      return <div key={k} style={{ ...base, background: ok ? '#fff' : SUN, border: `3px solid ${INK}` }}>{ok ? <Ic n="check" s={tam * 0.55} w={4} /> : <Ic n="star" s={tam * 0.6} f="#fff" w={2.5} />}</div>;
    }
    return <div key={k} style={{ ...base, border: '2px solid #fff' }} />;
  };
  const cels = [];
  for (let y = 0; y < mundo.h; y++) for (let x = 0; x < mundo.w; x++) cels.push(cel(x, y));
  return <div className="grid gap-1.5 justify-center [&_svg]:max-w-full [&_svg]:h-auto" style={{ width: mundo.w * tam + (mundo.w - 1) * 6, maxWidth: '100%', gridTemplateColumns: `repeat(${mundo.w}, minmax(0, 1fr))` }} role="img" aria-label="Mapa da fase">{cels}</div>;
}
