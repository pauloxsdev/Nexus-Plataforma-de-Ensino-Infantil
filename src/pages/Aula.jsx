import React, { useState } from 'react';
import { INK, SUN, PINK, GREEN } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Btn } from '../components/Btn';
import { Nexi } from '../components/Nexi';
import { Ilustracao } from '../components/Ilustracao';
import { sfx } from '../services/som';

const CORES = [SUN, '#FFE3EA', '#DDF6E8', '#DCE4FF', '#FFE8CC', '#FFF6B8', '#E9E1FF', '#D6F5F0'];
const Cartao = ({ titulo, cor = '#fff', children, t, tracejado }) => (
  <section data-t={t} className="card p-4 mb-4" style={{ background: cor, ...(tracejado ? { borderStyle: 'dashed', boxShadow: 'none' } : {}) }}>
    <h3 className="text-2xl mb-2">{titulo}</h3>{children}
  </section>
);

// Aula da fase: explica a ideia SEM entregar a resposta. O "tutorial" é uma investigação:
// a criança testa, anota o que viu e só pede pista se quiser (as pistas vão do leve ao forte).
export function Aula({ fase, aula, estrelas, status, onVoltar, onJogar, onOutra, total }) {
  const [feitos, setFeitos] = useState([]);
  const [pistas, setPistas] = useState(0);
  const alternar = (i) => { sfx('tap'); setFeitos((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i])); };
  const cor = CORES[(fase.id - 1) % CORES.length];
  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={onVoltar} className="flex items-center gap-1 rounded-full px-3 py-1 hover:brightness-95" style={{ background: '#fff', border: `3px solid ${INK}` }}><Ic n="chevL" s={16} w={3.5} /><span className="text-sm" style={{ fontWeight: 800 }}>Trilhas</span></button>
        <span className="text-sm">Aula {fase.id} de {total}</span>
        {status === 'done' && <span className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5" style={{ background: '#DDF6E8', border: `2px solid ${INK}`, fontWeight: 800 }}><Ic n="check" s={14} w={4} />Fase completa, {estrelas || 1} {(estrelas || 1) === 1 ? 'estrela' : 'estrelas'}</span>}
      </div>
      <div className="grid grid-cols-2 gap-5 items-start">
        <div>
          <section data-t="aula-resumo" className="card mb-4 overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: cor, borderBottom: `3px solid ${INK}` }}>
              <h2 className="text-3xl">{fase.titulo}</h2>
              <span className="disp text-base rounded-full px-3" style={{ background: '#fff', border: `3px solid ${INK}` }}>{fase.conceito}</span>
            </div>
            <div className="p-5">
              <div className="flex justify-center rounded-2xl py-3 mb-3" style={{ background: '#F3F6FF', border: `3px dashed #8F9BD0` }}><Ilustracao k={aula.ilustracao} s={300} /></div>
              <p className="text-lg leading-snug">{aula.resumo}</p>
              <div className="mt-3 rounded-xl p-3" style={{ background: '#FFF6B8', border: `2px solid ${INK}` }}>
                <span className="text-xs">Palavra nova</span>
                <div className="disp text-xl leading-tight">{aula.palavra.termo}</div>
                <p className="text-sm">{aula.palavra.sig}</p>
              </div>
            </div>
          </section>
          <Cartao titulo="No dia a dia">
            <ul className="space-y-2">{aula.diaADia.map((x, i) => (
              <li key={i} className="flex gap-3 items-start"><span className="disp shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: cor, border: `3px solid ${INK}` }}>{i + 1}</span><span>{x}</span></li>
            ))}</ul>
          </Cartao>
          <section className="card p-4 flex items-start gap-3" style={{ background: '#E6EDFF' }}>
            <Nexi s={64} mood="curioso" />
            <div><h3 className="text-xl">Pense nisso</h3><p className="text-lg leading-snug">{aula.gancho}</p></div>
          </section>
        </div>
        <div>
          <Cartao titulo="Tutorial: descubra sozinho" t="aula-tutorial" cor="#fff">
            <p className="text-sm mb-3">Aqui não tem resposta pronta. Você vai investigar! Teste cada ideia no jogo e marque quando fizer.</p>
            <ul className="space-y-2">{aula.experimentos.map((x, i) => {
              const ok = feitos.includes(i);
              return (
                <li key={i}><button onClick={() => alternar(i)} aria-pressed={ok} className="w-full flex gap-3 items-start text-left rounded-xl p-2 hover:brightness-95" style={{ background: ok ? '#DDF6E8' : '#F3F6FF', border: `2px solid ${INK}` }}>
                  <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#fff', border: `3px solid ${INK}` }}>{ok && <Ic n="check" s={18} w={4.5} />}</span>
                  <span>{x}</span></button></li>
              );
            })}</ul>
            <p className="text-xs mt-2" style={{ fontWeight: 800 }}>{feitos.length} de {aula.experimentos.length} testados</p>
          </Cartao>
          <Cartao titulo="Quer uma pista?" t="aula-pista" cor="#FFF6B8">
            <p className="text-sm mb-2">Tente sozinho primeiro! As pistas começam leves e vão ficando mais fortes.</p>
            <ol className="space-y-2 mb-3">{aula.pistas.slice(0, pistas).map((x, i) => (
              <li key={i} className="flex gap-2 items-start rounded-xl p-2 up" style={{ background: '#fff', border: `2px solid ${INK}` }}><Ic n="star" s={20} f={SUN} w={2.5} /><span><b>Pista {i + 1}:</b> {x}</span></li>
            ))}</ol>
            {pistas < aula.pistas.length
              ? <Btn c="#fff" className="!text-base !py-1" onClick={() => { sfx('tap'); setPistas(pistas + 1); }}>{pistas === 0 ? 'Mostrar a primeira pista' : 'Mais uma pista'}</Btn>
              : <p className="text-sm">Acabaram as pistas. Agora é com você!</p>}
          </Cartao>
          <Cartao titulo="Desafio criativo" tracejado cor="#FFE3EA">
            <div className="flex gap-3 items-start"><Ic n="bolt" s={26} f={SUN} /><p className="text-lg leading-snug">{aula.desafio}</p></div>
          </Cartao>
          <div className="flex gap-3 items-center">
            <Btn data-t="aula-ir" c={GREEN} className="flex-1 !text-xl" onClick={onJogar}>{status === 'done' ? `Jogar a fase ${fase.id} de novo` : `Ir para a fase ${fase.id}`}</Btn>
          </div>
          <div className="flex justify-between mt-3">
            <button disabled={!onOutra.anterior} onClick={() => onOutra.anterior()} className="underline text-sm disabled:opacity-40">{'← Aula anterior'}</button>
            <button disabled={!onOutra.proxima} onClick={() => onOutra.proxima()} className="underline text-sm disabled:opacity-40">{'Próxima aula →'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
