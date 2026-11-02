import React, { useEffect, useRef, useState } from 'react';
import { INK, SUN, PINK } from '../theme/tokens';
import { Btn } from '../components/Btn';
import { Modal } from '../components/Modal';
import { Emblema } from '../components/Emblema';
import { RARIDADES } from '../data/conquistas';

const FILTROS = [['todas', 'Todas'], ['conquistadas', 'Conquistadas'], ['andamento', 'Em andamento']];
const Barra = ({ atual, meta, cor = '#19B35A' }) => (
  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#fff', border: `2px solid ${INK}` }} role="img" aria-label={`${atual} de ${meta}`}>
    <div style={{ width: `${(atual / meta) * 100}%`, height: '100%', background: cor, transition: 'width .5s' }} />
  </div>
);

// Conquistas dinâmicas: calculadas a partir do que a criança fez (fases, estrelas, Nexus...).
export function Ach({ lista, novas, marcarVistas }) {
  const [filtro, setFiltro] = useState('todas');
  const [detalhe, setDetalhe] = useState(null);
  const novasAoEntrar = useRef(novas); // guarda quais eram novas ao abrir a tela, para mostrar "Nova!"
  useEffect(() => { const t = setTimeout(marcarVistas, 1500); return () => clearTimeout(t); }, []); // eslint-disable-line
  const ganhas = lista.filter((x) => x.desbloqueada).length;
  const circ = 2 * Math.PI * 46;
  const visiveis = lista
    .filter((x) => (filtro === 'conquistadas' ? x.desbloqueada : filtro === 'andamento' ? !x.desbloqueada : true))
    .sort((a, b) => Number(b.desbloqueada) - Number(a.desbloqueada) || b.atual / b.meta - a.atual / a.meta);

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="card p-5 flex items-center gap-6 mb-5" style={{ background: '#FFF6B8' }}>
        <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`${ganhas} de ${lista.length} conquistas`}>
            <circle cx="60" cy="60" r="46" fill="#fff" stroke={INK} strokeWidth="14" />
            <circle cx="60" cy="60" r="46" fill="none" stroke="#19B35A" strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ganhas / lista.length)} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset .8s' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="disp text-4xl leading-none">{ganhas}</span><span className="text-xs">de {lista.length}</span></div>
        </div>
        <div className="flex-1">
          <h2 className="text-4xl">Minhas conquistas</h2>
          <p className="mt-1">Cada conquista vale por uma coisa que você aprendeu ou fez. Toque numa para ver como ganhar!</p>
          <div className="flex gap-4 mt-3 flex-wrap">
            {Object.entries(RARIDADES).map(([k, r]) => {
              const todas = lista.filter((x) => x.raridade === k); const g = todas.filter((x) => x.desbloqueada).length;
              return <span key={k} className="flex items-center gap-1.5 rounded-full pr-3" style={{ background: '#fff', border: `2px solid ${INK}` }}><Emblema simbolo="estrela" raridade={k} s={34} titulo={r.nome} /><span className="text-sm" style={{ fontWeight: 800 }}>{r.nome} {g}/{todas.length}</span></span>;
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mb-4" role="group" aria-label="Filtrar conquistas">
        {FILTROS.map(([k, t]) => <button key={k} onClick={() => setFiltro(k)} aria-pressed={filtro === k} className="disp text-base rounded-full px-4 py-1.5" style={{ background: filtro === k ? SUN : '#fff', border: `3px solid ${INK}`, boxShadow: filtro === k ? `3px 3px 0 ${INK}` : 'none' }}>{t}</button>)}
      </div>
      <div data-t="conquistas-grid" className="grid grid-cols-4 gap-4">
        {visiveis.map((c) => {
          const nova = c.desbloqueada && novasAoEntrar.current.includes(c.id);
          const quase = !c.desbloqueada && c.atual / c.meta >= 0.5;
          return (
            <button key={c.id} onClick={() => setDetalhe(c)} className="card p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-1 transition-transform" style={{ background: c.desbloqueada ? '#fff' : '#F3F6FF' }}>
              <div className={'relative ' + (c.desbloqueada ? 'flutua' : '')}>
                <Emblema simbolo={c.simbolo} raridade={c.raridade} bloqueado={!c.desbloqueada} s={104} titulo={c.nome} />
                {nova && <span className="pulsa absolute -top-2 -right-4 disp text-sm rounded-full px-2" style={{ background: PINK, border: `3px solid ${INK}` }}>Nova!</span>}
              </div>
              <div className="disp text-lg leading-tight">{c.nome}</div>
              <div className="text-xs">{c.desbloqueada ? c.desc : c.como}</div>
              {!c.desbloqueada && <><Barra atual={c.atual} meta={c.meta} /><span className="text-xs" style={{ fontWeight: 800 }}>{c.atual} de {c.meta}</span></>}
              {quase && <span className="pulsa text-xs rounded-full px-2 py-0.5" style={{ background: SUN, border: `2px solid ${INK}`, fontWeight: 800 }}>Quase lá!</span>}
              <span className="text-[11px] rounded-full px-2" style={{ background: RARIDADES[c.raridade].cor, border: `2px solid ${INK}`, fontWeight: 800 }}>{RARIDADES[c.raridade].nome}</span>
            </button>
          );
        })}
      </div>
      {detalhe && (
        <Modal onClose={() => setDetalhe(null)}>
          <div className="flex justify-center"><Emblema simbolo={detalhe.simbolo} raridade={detalhe.raridade} bloqueado={!detalhe.desbloqueada} s={150} titulo={detalhe.nome} /></div>
          <h3 className="text-3xl mt-2">{detalhe.nome}</h3>
          <span className="text-xs rounded-full px-3 py-0.5 inline-block my-1" style={{ background: RARIDADES[detalhe.raridade].cor, border: `2px solid ${INK}`, fontWeight: 800 }}>{RARIDADES[detalhe.raridade].nome}</span>
          <p className="mt-1">{detalhe.desbloqueada ? detalhe.desc : detalhe.como}</p>
          {!detalhe.desbloqueada && <div className="mt-3"><Barra atual={detalhe.atual} meta={detalhe.meta} /><p className="text-sm mt-1">Você já tem {detalhe.atual} de {detalhe.meta}.</p></div>}
          {detalhe.desbloqueada && <p className="text-sm mt-2" style={{ color: '#0E9A4A', fontWeight: 800 }}>Conquista desbloqueada!</p>}
          <Btn className="mt-4" onClick={() => setDetalhe(null)}>Fechar</Btn>
        </Modal>
      )}
    </div>
  );
}
