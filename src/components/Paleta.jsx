import React from 'react';
import { INK, PINK } from '../theme/tokens';
import { PECAS } from '../game/pecas';

// Peças da fase. Arraste uma peça até um espaço do circuito (tocar na peça e depois no espaço também funciona).
//   modo 'lista'   = coluna à esquerda do circuito (layout vertical)
//   modo 'bandeja' = faixa embaixo do circuito (layout horizontal)
export function Paleta({ pecas, mao, onPegar, onArrastar, modo = 'lista' }) {
  const bandeja = modo === 'bandeja';
  const dica = mao ? `Na mão: ${PECAS[mao].nome}. Clique num espaço do circuito (ou arraste).` : 'Arraste uma peça até um espaço do circuito.';
  const atalhos = pecas.length === 1 ? 'Atalhos: tecla 1 pega a peça, Enter executa.' : `Atalhos: teclas 1 a ${pecas.length} pegam a peça, Enter executa.`;
  const botao = (id, i) => {
    const p = PECAS[id]; const sel = mao === id;
    const estilo = { touchAction: 'none', cursor: 'grab', userSelect: 'none', background: '#E6EDFF', border: `2px solid ${INK}`, outline: sel ? `4px solid ${PINK}` : 'none', outlineOffset: 2 };
    return (
      <button key={id} data-peca={id} onClick={(e) => { onPegar(id); if (e.detail > 0) e.currentTarget.blur(); }} onPointerDown={(e) => onArrastar(id, 'paleta', e)} aria-pressed={sel} aria-keyshortcuts={String(i + 1)}
        className={bandeja ? 'min-h-11 flex items-center gap-2 rounded-xl px-2 py-1.5 text-left' : 'min-w-0 w-full flex items-center gap-3 rounded-xl p-2 text-left'} style={estilo}>
        <span className={bandeja ? 'disp text-xl w-[42px] h-[42px] flex items-center justify-center rounded-lg shrink-0' : 'disp text-2xl w-[52px] h-[52px] flex items-center justify-center rounded-xl shrink-0'}
          style={{ background: p.cor, color: p.txt, border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}` }}>{p.glifo}</span>
        <span className="min-w-0"><span className={bandeja ? 'disp text-[15px] block leading-tight' : 'disp text-base block leading-tight'}>{p.nome}</span><span className="text-xs block leading-tight">{p.sub}</span></span>
        <span className="ml-auto text-[11px] rounded px-1" style={{ border: `1.5px solid ${INK}`, background: '#fff' }} aria-hidden="true">{i + 1}</span>
      </button>
    );
  };
  if (bandeja) {
    return (
      <div data-t="paleta" className="card px-3 py-2.5">
        <div className="flex items-center gap-3 flex-wrap"><h3 className="text-xl shrink-0">Bandeja de peças</h3><p className="text-xs flex-1 min-w-[160px]">{dica} {atalhos}</p></div>
        <div className="flex gap-2 flex-wrap mt-2">{pecas.map(botao)}</div>
      </div>
    );
  }
  return (
    <div data-t="paleta" className="card min-w-0 p-3 sm:p-4">
      <h3 className="text-2xl text-center mb-3">Peças</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">{pecas.map(botao)}</div>
      <p className="text-xs mt-3 min-h-[2.5rem]">{dica}</p>
      <p className="text-[11px] mt-1 opacity-80">{atalhos}</p>
    </div>
  );
}
