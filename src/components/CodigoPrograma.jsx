import React from 'react';
const nomes = { andar: 'ANDAR', pular: 'PULAR', virar_dir: 'VIRAR À DIREITA', virar_esq: 'VIRAR À ESQUERDA' };
export function linhasPrograma(programa, nivel = 0) {
  return programa.flatMap(p => p.t === 'acao' ? [{ id: p.id, nivel, texto: nomes[p.peca] }] : p.t === 'repetir' ? [
    { id: p.id, nivel, texto: `REPITA ${p.n} VEZES` }, ...linhasPrograma(p.faz, nivel + 1), { id: `${p.id}:fim`, nivel, texto: 'FIM DA REPETIÇÃO' },
  ] : [
    { id: p.id, nivel, texto: 'SE HÁ OBSTÁCULO À FRENTE' }, ...linhasPrograma(p.sim, nivel + 1),
    { id: `${p.id}:nao`, nivel, texto: 'SENÃO' }, ...linhasPrograma(p.nao, nivel + 1), { id: `${p.id}:fim`, nivel, texto: 'FIM DA CONDIÇÃO' },
  ]);
}
export function CodigoPrograma({ programa, evento }) {
  const ativo = evento?.tipo === 'se' && evento.ramo === 'nao' ? `${evento.id}:nao` : evento?.id;
  return <div className="program-code" aria-label="Algoritmo em português"><span className="code-label">SEU PROGRAMA EM PALAVRAS</span>
    {programa.length ? <ol>{linhasPrograma(programa).map((l, i) => <li key={`${l.id}-${i}`} className={ativo === l.id ? 'code-active' : ''} aria-current={ativo === l.id ? 'step' : undefined}><span aria-hidden="true">{i + 1}</span><code style={{ paddingLeft: `${l.nivel * 12}px` }}>{l.texto}</code></li>)}</ol> : <p className="text-sm p-4">Escolha uma peça para começar.</p>}
    <p className="text-xs p-3">Pseudocódigo: uma forma de ler seu algoritmo em português.</p>
  </div>;
}
