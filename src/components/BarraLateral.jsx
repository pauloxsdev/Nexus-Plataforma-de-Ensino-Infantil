import React, { useState } from 'react';
import { INK, SUN, GREEN } from '../theme/tokens';
import { Ic } from './Icon';
import { Nexi } from './Nexi';
import { Me } from '../context/AvatarContext';

// Barra lateral do aluno (e do professor). Quem entra só tem um CÓDIGO: nenhum nome real aparece aqui (LGPD).
// Pode ser recolhida (só ícones) para sobrar mais espaço no jogo.
const ITENS = [
  { k: 'dash', nome: 'Início', icone: 'home', cor: SUN },
  { k: 'courses', nome: 'Trilhas', icone: 'map', cor: '#DCE4FF' },
  { k: 'work', nome: 'Fase atual', icone: 'play', cor: '#DDF6E8' },
  { k: 'avatar', nome: 'Meu Nexus', icone: 'user', cor: '#FFE3EA' },
  { k: 'ach', nome: 'Conquistas', icone: 'trophy', cor: '#FFE8CC' },
];
const PROFESSOR = { k: 'teacher', nome: 'Professor', icone: 'users', cor: '#fff' };
const CHAVE = 'nexus:menu-recolhido';
const inicial = () => { try { const v = localStorage.getItem(CHAVE); if (v !== null) return v === '1'; } catch { /* usa o padrão */ } return window.innerWidth < 1280; };

export function BarraLateral({ tela, ir, jogar, codigo, totalEstrelas, fasesFeitas, totalFases, faseAtualId, proximaId, chip, config, novas = 0 }) {
  const [recolhida, setRecolhida] = useState(inicial);
  const alternar = () => setRecolhida((r) => { const n = !r; try { localStorage.setItem(CHAVE, n ? '1' : '0'); } catch { /* ignora */ } return n; });
  const tudoFeito = fasesFeitas >= totalFases;
  const pct = Math.round((fasesFeitas / totalFases) * 100);

  const item = (it) => {
    const ativo = tela === it.k || (it.k === 'courses' && tela === 'aula');
    const nome = it.k === 'work' ? `Fase ${faseAtualId}` : it.nome;
    return (
      <button key={it.k} onClick={() => ir(it.k)} aria-current={ativo ? 'page' : undefined} title={recolhida ? nome : undefined}
        className={'relative flex items-center gap-3 rounded-2xl text-left w-full ' + (ativo ? '' : 'hover:bg-[#E6EDFF]')}
        style={{ padding: recolhida ? '3px' : '3px 8px', justifyContent: recolhida ? 'center' : 'flex-start', background: ativo ? SUN : 'transparent', border: `3px solid ${ativo ? INK : 'transparent'}`, boxShadow: ativo ? `3px 3px 0 ${INK}` : 'none' }}>
        <span className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 36, height: 36, background: it.cor, border: `3px solid ${INK}` }}>{it.k === 'avatar' ? <Me s={30} /> : <Ic n={it.icone} s={20} />}</span>
        {!recolhida && <span className="disp text-base leading-none flex-1">{nome}</span>}
        {it.k === 'ach' && novas > 0 && <span className="pulsa disp text-xs rounded-full px-1.5 shrink-0" style={{ background: '#FF5C8A', border: `2px solid ${INK}`, minWidth: 22, textAlign: 'center', ...(recolhida ? { position: 'absolute', marginLeft: 26, marginTop: -26 } : {}) }} aria-label={`${novas} conquistas novas`}>{novas}</span>}
      </button>
    );
  };
  const pequeno = { background: '#fff', border: `2px solid ${INK}` };

  return (
    <div data-t="menu" className="sticky top-0 h-screen shrink-0 z-30" style={{ width: recolhida ? 84 : 256, transition: 'width .18s ease' }}>
      <aside aria-label="Menu principal" className="h-full overflow-y-auto flex flex-col gap-2.5 p-3" style={{ background: '#fff', borderRight: `3px solid ${INK}` }}>
        <div className="flex items-center gap-2" style={{ justifyContent: recolhida ? 'center' : 'flex-start' }}>
          <span className="shrink-0"><Nexi s={recolhida ? 44 : 46} /></span>
          {!recolhida && <div><div className="disp text-xl leading-none">Nexus 2.0</div><div className="text-[11px] mt-0.5">Aprenda a programar</div></div>}
        </div>

        {recolhida ? (
          <div className="flex justify-center" title={`Código ${codigo}`}><Me s={44} /></div>
        ) : (
          <div className="rounded-2xl p-3 flex flex-col gap-2" style={{ background: '#FFF6B8', border: `3px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
            <div className="flex items-center gap-3">
              <Me s={44} />
              <div><div className="disp text-base leading-tight">Explorador</div><div className="text-xs">Código {codigo}</div></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={pequeno}><Ic n="star" s={14} f={SUN} w={2.5} />{totalEstrelas} estrelas</span>
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={pequeno}><Ic n="fire" s={14} f="#FF5C8A" w={2.5} />7 dias</span>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1.5" aria-label="Telas">{ITENS.map(item)}</nav>

        {!recolhida && (
          <div>
            <div className="flex justify-between text-xs mb-1"><span>Trilha</span><span>{fasesFeitas} de {totalFases} fases</span></div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#fff', border: `2px solid ${INK}` }} role="img" aria-label={`${fasesFeitas} de ${totalFases} fases completas`}>
              <div style={{ width: pct + '%', height: '100%', background: GREEN }} />
            </div>
          </div>
        )}

        <div className="flex-1 min-h-[8px]" />

        {!recolhida && (
          <div className="so-altos rounded-2xl p-3" style={{ background: '#E6EDFF', border: `3px solid ${INK}` }}>
            <div className="flex items-start gap-2">
              <Nexi s={42} mood={tudoFeito ? 'comemorando' : 'feliz'} />
              <p className="text-sm leading-snug">{tudoFeito ? 'Você completou todas as fases! Que tal jogar uma de novo?' : `Vamos continuar a fase ${proximaId}?`}</p>
            </div>
            <button onClick={() => (tudoFeito ? ir('courses') : jogar(proximaId))} className="btn !text-base !py-1 mt-2 w-full" style={{ background: SUN }}>{tudoFeito ? 'Ver trilha' : 'Jogar agora'}</button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span role="status" title={chip[2]} className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs" style={{ background: chip[1], border: `2px solid ${INK}` }}>
            <Ic n={chip[0]} s={16} w={3} />{!recolhida && chip[2]}
          </span>
          {[[config.internet, 'Internet', 'wifi', 'ligada', 'desligada'], [config.som, 'Som', config.som[0] ? 'som' : 'mudo', 'ligado', 'desligado']].map(([[on, alternarCfg], nome, ic, sim, nao]) => (
            <button key={nome} onClick={alternarCfg} aria-pressed={on} title={recolhida ? `${nome}: ${on ? sim : nao}` : undefined}
              className="flex items-center gap-2 rounded-full px-2.5 py-1 text-xs hover:brightness-95" style={{ ...pequeno, justifyContent: recolhida ? 'center' : 'flex-start', opacity: on ? 1 : 0.7 }}>
              <Ic n={ic} s={16} w={2.8} />
              {!recolhida && <span style={{ fontWeight: 800 }}>{nome}: {on ? sim : nao}</span>}
              {!recolhida && <span className="ml-auto rounded-full" style={{ width: 10, height: 10, background: on ? GREEN : '#8F9BD0', border: `2px solid ${INK}` }} />}
            </button>
          ))}
        </div>

        <div className="pt-2 flex flex-col gap-1" style={{ borderTop: `2px dashed #8F9BD0` }}>
          {item(PROFESSOR)}
          <button onClick={() => ir('login')} title={recolhida ? 'Sair' : undefined} className="flex items-center gap-3 rounded-2xl w-full hover:bg-[#FFE3EA]" style={{ padding: recolhida ? '3px' : '3px 8px', justifyContent: recolhida ? 'center' : 'flex-start', border: '3px solid transparent' }}>
            <span className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36 }}><Ic n="logout" s={20} /></span>
            {!recolhida && <span className="disp text-base leading-none">Sair</span>}
          </button>
        </div>
      </aside>
      <button onClick={alternar} aria-label={recolhida ? 'Expandir o menu' : 'Recolher o menu'} aria-expanded={!recolhida}
        className="absolute flex items-center justify-center rounded-full hover:brightness-95" style={{ right: -16, top: 26, width: 32, height: 32, background: '#fff', border: `3px solid ${INK}`, boxShadow: `2px 2px 0 ${INK}` }}>
        <Ic n={recolhida ? 'chevR' : 'chevL'} s={16} w={3.5} />
      </button>
    </div>
  );
}
