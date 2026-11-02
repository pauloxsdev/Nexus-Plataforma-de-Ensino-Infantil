import React from 'react';
import { INK, SUN, GREEN } from '../theme/tokens';
import { PECAS } from '../game/pecas';

const PONTOS = 'radial-gradient(#fff 1.5px, transparent 2px)';
// Canos horizontais (a "energia" corre da esquerda para a direita) e verticais
const CanoH = ({ w = 22 }) => <div aria-hidden="true" className="cano-h shrink-0" style={{ width: w, height: 12, background: INK, backgroundImage: PONTOS, backgroundSize: '8px 12px' }} />;
const CanoVert = ({ h = 22 }) => <div aria-hidden="true" className="shrink-0" style={{ width: 12, height: h, background: INK, backgroundImage: PONTOS, backgroundSize: '12px 8px' }} />;
const CanoAbs = ({ style }) => <div aria-hidden="true" style={{ position: 'absolute', width: 12, background: INK, backgroundImage: PONTOS, backgroundSize: '12px 8px', ...style }} />;
const Marco = ({ texto, bg }) => (
  <div className="disp rounded-full px-5 py-1 text-lg whitespace-nowrap" style={{ background: bg, border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>{texto}</div>
);
// "REPETIR [−] 3 [+] vezes": escolhe quantas vezes o que está dentro roda
function CabecalhoRepetir({ n, v, onVezes }) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      <span className="disp text-lg">REPETIR</span>
      <button onClick={() => onVezes(n.id, -1, n.max)} aria-label="Menos uma vez" className="w-8 h-8 rounded-lg disp text-xl" style={{ background: '#fff', border: `3px solid ${INK}` }}>−</button>
      <span className="disp text-3xl w-8 text-center" aria-live="polite">{v}</span>
      <button onClick={() => onVezes(n.id, 1, n.max)} aria-label="Mais uma vez" className="w-8 h-8 rounded-lg disp text-xl" style={{ background: '#fff', border: `3px solid ${INK}` }}>+</button>
      <span className="disp text-lg">{v === 1 ? 'vez' : 'vezes'}</span>
    </div>
  );
}
const CARTAO_REPETIR = { background: '#FFE3EA', border: `3px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` };
const CARTAO_SE = { background: '#DDF6E8', border: `3px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` };

function Espaco({ n, rotulo, estado, ativo, falha, alvo, arrastando, onEspaco, onRemover, onArrastar }) {
  const id = n.id;
  const p = n.fixo || estado.slots[id];
  const def = p && PECAS[p];
  const anel = alvo === id ? `0 0 0 4px #19B35A, 0 0 0 7px ${INK}` : ativo === id ? `0 0 0 4px ${SUN}, 0 0 0 7px ${INK}` : falha === id ? `0 0 0 4px ${PINK}, 0 0 0 7px ${INK}` : undefined;
  return (
    <div className="relative flex flex-col items-center">
      <button data-slot={id} onClick={(e) => { onEspaco(id); if (e.detail > 0) e.currentTarget.blur(); }} onPointerDown={def && !n.fixo ? (e) => onArrastar(p, id, e) : undefined} aria-label={def ? `${rotulo}: ${def.nome}. Toque para trocar` : `${rotulo}: vazio. Toque para colocar a peça`}
        className="flex flex-col items-center justify-center rounded-2xl"
        style={{ width: 88, minHeight: 66, touchAction: def && !n.fixo ? 'none' : 'auto', cursor: def && !n.fixo ? 'grab' : 'pointer', userSelect: 'none', opacity: arrastando === id ? 0.35 : 1, background: def ? def.cor : alvo === id ? '#DDF6E8' : 'rgba(255,255,255,.7)', color: def ? def.txt : '#8F9BD0',
          border: def ? `3px solid ${INK}` : '3px dashed #8F9BD0', boxShadow: anel || (def ? `3px 3px 0 ${INK}` : 'none'), transition: 'box-shadow .15s' }}>
        {def ? <><span className="disp text-2xl leading-none">{def.glifo}</span><span className="text-[11px] leading-tight px-1 text-center" style={{ fontWeight: 800 }}>{def.nome}</span></>
             : <span className="text-xs px-1 text-center" style={{ fontWeight: 800 }}>{rotulo}</span>}
      </button>
      {def && !n.fixo && (
        <button onClick={() => onRemover(id)} aria-label={`Tirar a peça de ${rotulo}`} className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-sm leading-none flex items-center justify-center" style={{ background: '#fff', border: `2px solid ${INK}` }}>×</button>
      )}
      {falha === id && <span className="mt-1 text-[11px] rounded-full px-2" style={{ background: PINK, border: `2px solid ${INK}`, fontWeight: 800 }}>Parou aqui</span>}
    </div>
  );
}

// Desenha o circuito da fase. direcao:
//   'vertical'   = de cima para baixo (COMEÇA AQUI no topo, FIM embaixo)
//   'horizontal' = da esquerda para a direita, com "fio de volta" no REPETIR e bifurcação no SE/SENÃO
export function Circuito({ circuito, estado, ativo, falha, alvo, arrastando, onEspaco, onRemover, onArrastar, onVezes, direcao = 'vertical' }) {
  let passo = 0;
  const horizontal = direcao === 'horizontal';
  const comum = { estado, ativo, falha, alvo, arrastando, onEspaco, onRemover, onArrastar };
  const entre = (lista, render, w = 14) => lista.flatMap((d, i) => [i ? (horizontal ? <CanoH key={'c' + d.id} w={w} /> : <CanoVert key={'c' + d.id} h={14} />) : null, render(d)]);
  const no = (n) => {
    if (n.tipo === 'espaco') return <Espaco key={n.id} n={n} rotulo={`Passo ${++passo}`} {...comum} />;
    if (n.tipo === 'repetir') {
      const v = estado.vezes[n.id] ?? n.inicial ?? 1;
      return (
        <div key={n.id} className="rounded-2xl px-3 pt-3 pb-2 flex flex-col items-center gap-2" style={CARTAO_REPETIR}>
          <CabecalhoRepetir n={n} v={v} onVezes={onVezes} />
          {!horizontal && <span className="text-xs">e a cada vez faz isto:</span>}
          <div className={horizontal ? 'flex items-center' : 'flex flex-col items-center'}>{entre(n.dentro, no)}</div>
          {horizontal && (
            <div className="relative w-full" style={{ height: 22 }} aria-hidden="true">
              <div style={{ position: 'absolute', left: 8, right: 8, top: 0, bottom: 8, border: `3px solid ${INK}`, borderTop: 'none', borderRadius: '0 0 18px 18px' }} />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-0 px-2 text-[11px] rounded-full whitespace-nowrap" style={{ background: '#FFE3EA', fontWeight: 800 }}>↻ volta e repete {v} {v === 1 ? 'vez' : 'vezes'}</span>
            </div>
          )}
        </div>
      );
    }
    const rotuloSe = (t) => <span className="disp text-base rounded-full px-3" style={{ background: t === 'SIM' ? GREEN : '#fff', border: `3px solid ${INK}` }}>{t}</span>;
    return (
      <div key={n.id} className="rounded-2xl p-3 flex flex-col items-center gap-2" style={CARTAO_SE}>
        <span className="disp text-lg text-center">SE tem obstáculo na frente?</span>
        {horizontal ? (
          <div className="relative flex flex-col gap-4 px-5">
            {[['SIM', n.sim], ['SENÃO', n.nao]].map(([t, lista]) => (
              <div key={t} className="flex items-center gap-2"><CanoH w={14} />{rotuloSe(t)}{entre(lista, (d) => <Espaco key={d.id} n={d} rotulo={t} {...comum} />, 12)}<CanoH w={14} /></div>
            ))}
            <CanoAbs style={{ left: 8, top: '25%', bottom: '25%' }} />
            <CanoAbs style={{ right: 8, top: '25%', bottom: '25%' }} />
          </div>
        ) : (
          <div className="flex gap-4 items-start">
            {[['SIM', n.sim], ['SENÃO', n.nao]].map(([t, lista]) => (
              <div key={t} className="flex flex-col items-center gap-1">{rotuloSe(t)}{lista.map((d) => <Espaco key={d.id} n={d} rotulo={t} {...comum} />)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div data-t="circuito" className={horizontal ? 'flex flex-wrap items-center justify-center gap-y-5' : 'flex flex-col items-center'}>
      <Marco texto="COMEÇA AQUI" bg={SUN} />
      {circuito.map((n) => <React.Fragment key={n.id}>{horizontal ? <CanoH /> : <CanoVert />}{no(n)}</React.Fragment>)}
      {horizontal ? <CanoH /> : <CanoVert />}<Marco texto="FIM" bg="#fff" />
    </div>
  );
}
