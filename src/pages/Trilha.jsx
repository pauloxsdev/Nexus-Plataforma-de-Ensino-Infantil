import React, { useState } from 'react';
import { INK, SUN, PINK, BLUE } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Btn } from '../components/Btn';
import { Me } from '../context/AvatarContext';
import { Ilustracao } from '../components/Ilustracao';
import { Emblema } from '../components/Emblema';
import { FASES } from '../data/fases';
import { AULAS } from '../data/aulas';

// linhas da amarelinha (cada linha vira uma coluna, da esquerda para a direita)
const LINHAS = [[1], [2], [3, 4], [5], [6, 7], [8]];
const MUNDOS = [
  { nome: 'Vale da Sequência', fases: [1, 2, 3], cor: '#DDF6E8', frase: 'ordem e direção' },
  { nome: 'Colina da Repetição', fases: [4, 5], cor: '#FFE3EA', frase: 'fazer de novo' },
  { nome: 'Reino das Decisões', fases: [6, 7, 8], cor: '#DCE4FF', frase: 'escolher o caminho' },
];
const ESTRELAS_FUNDO = [[6, 14], [18, 70], [30, 30], [44, 84], [58, 12], [72, 60], [86, 26], [93, 78], [12, 48], [50, 52]];

const Cenario = () => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    {ESTRELAS_FUNDO.map(([x, y], i) => <span key={i} className="pisca absolute rounded-full" style={{ left: x + '%', top: y + '%', width: i % 3 ? 5 : 8, height: i % 3 ? 5 : 8, background: i % 2 ? '#fff' : SUN, animationDelay: i * 0.3 + 's' }} />)}
    <svg className="absolute" style={{ right: 14, top: 10 }} width="70" height="52" viewBox="0 0 70 52"><ellipse cx="35" cy="26" rx="33" ry="9" fill="none" stroke="#9B7BFF" strokeWidth="5" transform="rotate(-18 35 26)" /><circle cx="35" cy="26" r="17" fill="#FF9F1C" stroke="#fff" strokeWidth="3" /><path d="M14 28q21 11 44-6" fill="none" stroke="#9B7BFF" strokeWidth="5" strokeLinecap="round" transform="rotate(-18 35 26)" /></svg>
    <svg className="absolute" style={{ left: 12, bottom: 12 }} width="40" height="40" viewBox="0 0 40 40"><path d="M28 6a15 15 0 1 0 6 24A12 12 0 0 1 28 6z" fill="#FFF6B8" stroke="#fff" strokeWidth="2.500" /></svg>
  </div>
);

export function Courses({ feitas, estrelas = {}, proximaId, jogar, abrirAula, liberarTodas, zerar, demoLiberada }) {
  const [aba, setAba] = useState('mapa');
  const [sel, setSel] = useState(proximaId);
  const status = (n) => (feitas.includes(n) ? 'done' : demoLiberada || n === 1 || feitas.includes(n - 1) ? 'now' : 'lock');
  const primeiraTrancada = FASES.find((f) => status(f.id) === 'lock')?.id;
  const f = FASES.find((x) => x.id === sel); const st = status(sel);
  const totalEstrelas = Object.values(estrelas).reduce((s, n) => s + n, 0);

  const Quadrado = ({ n }) => {
    const s = status(n);
    return (
      <button data-t={s === 'now' ? 'now' : n === primeiraTrancada ? 'lock' : undefined} onClick={() => setSel(n)} aria-label={`Fase ${n}: ${FASES[n - 1].titulo}`}
        className="w-20 h-20 flex flex-col items-center justify-center disp text-3xl rounded-lg relative hover:brightness-95"
        style={{ background: s === 'done' ? '#fff' : s === 'now' ? SUN : 'rgba(255,255,255,.06)', color: s === 'lock' ? '#8F9BD0' : INK,
          border: s === 'lock' ? '3px dashed #8F9BD0' : '4px solid #fff', outline: sel === n ? `4px solid ${PINK}` : 'none', outlineOffset: 3 }}>
        {s === 'done' ? <><Ic n="check" s={28} w={4} /><span className="flex gap-0.5 mt-0.5">{[1, 2, 3].map((i) => <Ic key={i} n="star" s={14} f={i <= (estrelas[n] || 1) ? SUN : '#E6EDFF'} w={2.5} />)}</span></> : s === 'lock' ? <Ic n="lock" s={30} /> : n}
        {s === 'now' && <span className="flutua absolute -top-6 -right-5" style={{ pointerEvents: 'none' }}><Me s={44} /></span>}
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-5">
      <header className="card p-4 flex flex-wrap items-center gap-3 sm:gap-5 mb-4" style={{ background: '#FFF6B8' }}>
        <div className="flutua"><Me s={84} /></div>
        <div className="flex-1 min-w-[170px]">
          <h2 className="text-3xl sm:text-4xl">Sua trilha</h2>
          <p>O seu Nexus está na <b>fase {proximaId}</b>. Aprenda nas aulas e coloque em prática no mapa!</p>
        </div>
        <div className="flex gap-3">
          <span className="rounded-2xl px-4 py-2 text-center" style={{ background: '#fff', border: `3px solid ${INK}` }}><span className="disp text-3xl block leading-none">{feitas.length}/{FASES.length}</span><span className="text-xs">fases</span></span>
          <span className="rounded-2xl px-4 py-2 text-center" style={{ background: '#fff', border: `3px solid ${INK}` }}><span className="disp text-3xl block leading-none">{totalEstrelas}</span><span className="text-xs">estrelas</span></span>
        </div>
      </header>
      <div data-t="abas" className="flex flex-wrap gap-2 mb-4" role="tablist">
        {[['mapa', 'Mapa da trilha', 'map'], ['aulas', 'Aulas', 'book']].map(([k, t, ic]) => (
          <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)} className="flex items-center gap-2 disp text-lg rounded-full px-5 py-1.5" style={{ background: aba === k ? SUN : '#fff', border: `3px solid ${INK}`, boxShadow: aba === k ? `3px 3px 0 ${INK}` : 'none' }}>
            <Ic n={ic} s={20} />{t}
          </button>
        ))}
      </div>

      {aba === 'mapa' ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="min-w-0">
            <div data-t="mapa-trilha" className="relative rounded-2xl overflow-hidden" style={{ background: INK, border: `3px solid ${INK}`, boxShadow: `5px 5px 0 ${BLUE}` }}>
              <Cenario />
              <div className="relative flex flex-row flex-wrap items-center justify-center gap-3 p-5 md:p-8 pt-10 md:pt-10">
                {LINHAS.map((r, i) => <div key={i} className="flex flex-col gap-3">{r.map((n) => <Quadrado key={n} n={n} />)}</div>)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {MUNDOS.map((m) => {
                const feitasM = m.fases.filter((n) => feitas.includes(n)).length; const completo = feitasM === m.fases.length;
                const est = m.fases.reduce((s, n) => s + (estrelas[n] || 0), 0);
                return (
                  <div key={m.nome} className="card p-3 flex items-center sm:flex-col xl:flex-row gap-3" style={{ background: m.cor }}>
                    <Emblema simbolo={completo ? 'trofeu' : 'mapa'} raridade={completo ? 'ouro' : 'bronze'} bloqueado={feitasM === 0} s={56} titulo={m.nome} />
                    <div><div className="disp text-lg leading-tight">{m.nome}</div><div className="text-xs">Fases {m.fases[0]} a {m.fases[m.fases.length - 1]} · {m.frase}</div>
                      <div className="text-xs mt-0.5" style={{ fontWeight: 800 }}>{completo ? 'Mundo completo!' : `${feitasM} de ${m.fases.length} fases`} · {est} estrelas</div></div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="card p-4">
              <div className="text-sm">Fase {f.id}</div>
              <h3 className="text-3xl leading-tight">{f.titulo}</h3>
              <p className="text-sm mt-1">Você vai aprender: <b>{f.conceito}</b>.</p>
              <div className="flex justify-center rounded-xl my-3 py-1 [&>svg]:max-w-full [&>svg]:h-auto" style={{ background: '#F3F6FF', border: '2px dashed #8F9BD0', opacity: st === 'lock' ? 0.45 : 1 }}><Ilustracao k={AULAS[f.id].ilustracao} s={230} /></div>
              {st === 'done' && <p className="text-sm" aria-label={`${estrelas[sel] || 1} de 3 estrelas`}>Melhor resultado: {'★'.repeat(estrelas[sel] || 1)}{'☆'.repeat(3 - (estrelas[sel] || 1))}</p>}
              <p className="text-sm mt-1">{st === 'done' ? 'Você já completou esta fase.' : st === 'now' ? 'Esta é a sua fase. Vamos jogar?' : 'Termine a fase anterior para abrir esta.'}</p>
              {st !== 'lock' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Btn c="#fff" className="flex-1 !text-base" onClick={() => abrirAula(f.id)}>Ver aula</Btn>
                  <Btn className="flex-1 !text-base" onClick={() => jogar(f.id)}>{st === 'done' ? 'Jogar de novo' : 'Jogar'}</Btn>
                </div>
              )}
            </div>
            {liberarTodas && zerar && <p className="text-xs mt-4 text-center">Só para testar: <button className="underline" onClick={liberarTodas}>liberar todas as fases</button>{demoLiberada && <span> (liberadas para experimentar; sem registrar conclusões)</span>} · <button className="underline" onClick={zerar}>zerar progresso</button></p>}
          </div>
        </div>
      ) : (
        <div data-t="aulas-lista" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {FASES.map((fa) => {
            const s = status(fa.id);
            return (
              <div key={fa.id} className="card p-3 flex flex-col gap-2" style={{ opacity: s === 'lock' ? 0.65 : 1 }}>
                <div className="flex justify-center rounded-xl py-1 [&>svg]:max-w-full [&>svg]:h-auto" style={{ background: '#F3F6FF', border: '2px dashed #8F9BD0' }}><Ilustracao k={AULAS[fa.id].ilustracao} s={190} /></div>
                <div className="text-xs">Aula {fa.id}</div>
                <h3 className="text-xl leading-tight">{fa.titulo}</h3>
                <span className="text-xs rounded-full px-2 py-0.5 self-start" style={{ background: SUN, border: `2px solid ${INK}`, fontWeight: 800 }}>{fa.conceito}</span>
                <div className="mt-auto pt-1">
                  {s === 'lock'
                    ? <span className="flex items-center gap-1 text-sm"><Ic n="lock" s={16} />Termine a fase anterior</span>
                    : <Btn c={s === 'done' ? '#fff' : SUN} className="w-full !text-base !py-1" onClick={() => abrirAula(fa.id)}>{s === 'done' ? 'Rever a aula' : 'Abrir a aula'}</Btn>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
