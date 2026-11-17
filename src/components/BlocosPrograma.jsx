import React from 'react';
import { PECAS } from '../game/pecas';

// Leitura visual do exemplo. As peças editáveis continuam na oficina.
export function BlocosPrograma({ programa, evento }) {
  return <div className="visual-program" aria-label="Comandos do exemplo">
    {programa.map(p => p.t === 'acao'
      ? <div key={p.id} className={`visual-action ${evento?.id === p.id ? 'visual-active' : ''}`}><span aria-hidden="true" className="visual-glyph">{PECAS[p.peca].glifo}</span><span>{PECAS[p.peca].nome}</span></div>
      : p.t === 'repetir'
        ? <div className="visual-loop" key={p.id}><b>↻ REPITA {p.n} VEZES</b><BlocosPrograma programa={p.faz} evento={evento}/></div>
        : <div className="visual-condition" key={p.id}><b>◆ Há obstáculo à frente?</b><div className="visual-branches">{[['SIM', 'sim', p.sim], ['SENÃO', 'nao', p.nao]].map(([label, ramo, lista])=><div key={ramo} className={evento?.id===p.id && evento.ramo===ramo?'visual-active':''}><span>{label}</span><BlocosPrograma programa={lista} evento={evento}/></div>)}</div></div>
    )}
  </div>;
}
