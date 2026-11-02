import React, { useEffect, useRef, useState } from 'react';
import { INK, SUN, BLUE } from '../theme/tokens';
import { Nexi } from './Nexi';
import { NexiApontando } from './NexiApontando';
import { Btn } from './Btn';

const LARG = 420, M = 16, FOLGA = 116, NEXI = 64;
const entre = (v, a, b) => Math.max(a, Math.min(b, v));

// Acompanha a posição do elemento que o tutorial está mostrando (ele pode se mexer ao rolar a página)
function useRetangulo(sel) {
  const [r, setR] = useState(null);
  useEffect(() => {
    let id;
    const volta = () => {
      const el = sel && document.querySelector(sel);
      if (el) { const b = el.getBoundingClientRect(); setR((p) => (p && Math.abs(p.x - b.x) < 0.5 && Math.abs(p.y - b.y) < 0.5 && Math.abs(p.w - b.width) < 0.5 && Math.abs(p.h - b.height) < 0.5 ? p : { x: b.x, y: b.y, w: b.width, h: b.height })); }
      else setR(null);
      id = requestAnimationFrame(volta);
    };
    volta();
    return () => cancelAnimationFrame(id);
  }, [sel]);
  return r;
}

// Escolhe de que lado do alvo o balão aparece. O Nexi fica entre o balão e o alvo, apontando para ele.
function posicionar(r, vw, vh, alt) {
  if (!r) return { lado: null, x: (vw - LARG) / 2, y: Math.max(M + 110, (vh - alt) / 2) };
  const yMeio = entre(r.y + r.h / 2 - alt / 2, M, vh - alt - M);
  const xMeio = entre(r.x + r.w / 2 - LARG / 2, M, vw - LARG - M);
  const op = {
    direita: { x: r.x + r.w + FOLGA, y: yMeio, nx: r.x + r.w + 38, ny: r.y + r.h / 2 - NEXI / 2, dir: 'esq' },
    esquerda: { x: r.x - FOLGA - LARG, y: yMeio, nx: r.x - 38 - NEXI, ny: r.y + r.h / 2 - NEXI / 2, dir: 'dir' },
    baixo: { x: xMeio, y: r.y + r.h + FOLGA, nx: r.x + r.w / 2 - NEXI / 2, ny: r.y + r.h + 40, dir: 'cima' },
    cima: { x: xMeio, y: r.y - FOLGA - alt, nx: r.x + r.w / 2 - NEXI / 2, ny: r.y - 40 - NEXI, dir: 'baixo' },
  };
  const cabe = (o) => o.x >= M && o.y >= M && o.x + LARG <= vw - M && o.y + alt <= vh - M;
  const ordem = r.x < 340 ? ['direita', 'baixo', 'cima', 'esquerda'] : ['baixo', 'cima', 'direita', 'esquerda'];
  for (const l of ordem) if (cabe(op[l])) return { lado: l, ...op[l] };
  // alvo grande demais: o balão fica embaixo e o Nexi aponta de dentro do alvo
  return { lado: 'dentro', x: xMeio, y: vh - alt - M, nx: entre(r.x + r.w / 2 - NEXI / 2, M, vw - NEXI - M), ny: entre(r.y + 12, M + 30, vh - 150), dir: 'baixo' };
}

// Tutorial de cada tela: escurece o resto, destaca o elemento e o Nexi aponta para ele.
export function Tutorial({ steps, onClose }) {
  const [i, setI] = useState(0);
  const [alt, setAlt] = useState(230);
  const caixa = useRef(null);
  const s = steps[i]; const ultimo = i === steps.length - 1;
  const r = useRetangulo(s.sel);
  const vw = window.innerWidth, vh = window.innerHeight;
  const p = posicionar(r, vw, vh, alt);
  const proximo = () => (ultimo ? onClose() : setI((n) => n + 1));
  const anterior = () => setI((n) => Math.max(0, n - 1));

  useEffect(() => {
    const el = s.sel && document.querySelector(s.sel);
    if (el) { el.classList.add('spot'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    return () => el && el.classList.remove('spot');
  }, [i]); // eslint-disable-line
  useEffect(() => { if (caixa.current && Math.abs(caixa.current.offsetHeight - alt) > 2) setAlt(caixa.current.offsetHeight); });
  useEffect(() => {
    const tecla = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); proximo(); }
      else if (e.key === 'ArrowLeft') anterior();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(16,26,74,.78)' }} onClick={onClose} />
      {p.lado ? (
        <div className="fixed z-[70]" style={{ left: p.nx, top: p.ny, pointerEvents: 'none' }}><NexiApontando dir={p.dir} s={NEXI} /></div>
      ) : (
        <div className="fixed z-[70] flutua" style={{ left: p.x + LARG / 2 - 48, top: p.y - 112, pointerEvents: 'none' }}><Nexi s={96} mood="feliz" /></div>
      )}
      <div ref={caixa} role="dialog" aria-label="Tutorial" className="fixed z-[70] up" style={{ left: p.x, top: p.y, width: LARG }}>
        <div style={{ background: '#fff', border: `4px solid ${INK}`, borderRadius: 22, boxShadow: `7px 7px 0 ${INK}`, overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-5 py-2.5" style={{ background: BLUE }}>
            <h3 className="text-2xl" style={{ color: '#fff' }}>{s.t}</h3>
            <span className="text-sm shrink-0 ml-3" style={{ color: '#fff', fontWeight: 800 }}>{i + 1} de {steps.length}</span>
          </div>
          <div className="px-5 pt-4 pb-4">
            <p style={{ fontSize: 18, lineHeight: 1.4, color: INK, fontWeight: 700 }} aria-live="polite">{s.d}</p>
            <div className="flex items-center justify-between mt-4 gap-3">
              <div className="flex gap-1.5" aria-hidden="true">{steps.map((_, k) => <span key={k} className="rounded-full" style={{ width: k === i ? 22 : 10, height: 10, background: k === i ? BLUE : '#C6D4FF', border: `2px solid ${INK}`, transition: 'width .2s' }} />)}</div>
              <div className="flex items-center gap-2">
                {i > 0 && <Btn c="#fff" className="!text-base !py-1 !px-4" onClick={anterior}>Voltar</Btn>}
                <Btn c={SUN} className="!text-lg !py-1.5 !px-5" onClick={proximo}>{ultimo ? 'Entendi!' : 'Próximo →'}</Btn>
              </div>
            </div>
            <div className="flex justify-between mt-3 text-xs">
              <button onClick={onClose} className="underline">Pular o tutorial</button>
              <span>Dica: use as teclas ← e →</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
