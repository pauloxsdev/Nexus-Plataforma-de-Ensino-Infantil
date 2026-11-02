import React, { useEffect, useRef, useState } from 'react';
import { INK, BLUE, SUN } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Nexi } from '../components/Nexi';
import { Btn } from '../components/Btn';
import { Modal } from '../components/Modal';
import { Palco } from '../components/Palco';
import { Circuito } from '../components/Circuito';
import { Paleta } from '../components/Paleta';
import { PecaArrastada } from '../components/PecaArrastada';
import { MissaoFase } from '../components/MissaoFase';
import { CaminhoPopup } from '../components/CaminhoPopup';
import { useArrastar } from '../hooks/useArrastar';
import { FASES } from '../data/fases';
import { estadoInicial, montarPrograma, simular, contarVazios } from '../game/motor';
import { avaliar } from '../game/avaliacao';
import { sfx } from '../services/som';

const PASSO_MS = 550;

// Tela de jogo (feita para computador). Dois layouts, escolhidos no botão "Circuito" da barra de demonstração:
//   'vertical'   = peças | circuito de cima para baixo | mapa
//   'horizontal' = circuito da esquerda para a direita (com a bandeja de peças embaixo) | mapa
// Ao apertar Executar abre o pop-up "Caminho do Nexus" (a tela escurece):
//   - deu certo: o Nexus anda no pop-up, e aparecem as estrelas ganhas e o que a criança aprendeu;
//   - deu errado: o Nexus NÃO anda; o pop-up explica o que aconteceu e o circuito marca "Parou aqui".
export function Work({ fase, onConcluir, irParaFase, go, layout = 'vertical' }) {
  const [estado, setEstado] = useState(() => estadoInicial(fase.circuito));
  const [mao, setMao] = useState(null); // só usado pelo toque (alternativa ao arrastar)
  const [robo, setRobo] = useState(fase.mundo.inicio);
  const [pegas, setPegas] = useState([]);
  const [falha, setFalha] = useState(null);
  const [popup, setPopup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [missao, setMissao] = useState(true);
  const [help, setHelp] = useState(false);
  const timers = useRef([]);
  const inicio = useRef(null); // quando a criança começou a jogar (fechou a missão)
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const proxima = FASES.find((f) => f.id === fase.id + 1);
  const fecharMissao = () => { if (inicio.current === null) inicio.current = Date.now(); setMissao(false); };

  // Soltar uma peça: num espaço (coloca ou troca de lugar) ou fora do circuito (se veio do circuito, tira)
  const soltar = (peca, origem, alvo) => {
    setFalha(null);
    if (alvo) sfx('place'); else if (origem !== 'paleta') sfx('tap');
    setEstado((e) => {
      const s = { ...e.slots };
      if (alvo) {
        const antigo = s[alvo]; s[alvo] = peca;
        if (origem !== 'paleta' && origem !== alvo) { if (antigo) s[origem] = antigo; else delete s[origem]; }
      } else if (origem !== 'paleta') delete s[origem];
      return { ...e, slots: s };
    });
  };
  const { arrasto, sobre, volta, iniciar, foiArrasto } = useArrastar({ onSoltar: soltar, desabilitado: busy });

  const onEspaco = (id) => {
    if (foiArrasto() || busy || !mao) return;
    setFalha(null); sfx('place');
    setEstado((e) => ({ ...e, slots: { ...e.slots, [id]: mao } }));
  };
  const onRemover = (id) => { if (busy) return; setFalha(null); sfx('tap'); setEstado((e) => { const s = { ...e.slots }; delete s[id]; return { ...e, slots: s }; }); };
  const onVezes = (id, d, max) => { if (busy) return; sfx('tap'); setEstado((e) => ({ ...e, vezes: { ...e.vezes, [id]: Math.max(1, Math.min(max, e.vezes[id] + d)) } })); };
  const limpar = () => { if (busy) return; setEstado(estadoInicial(fase.circuito)); setFalha(null); };

  const executar = () => {
    if (busy) return;
    sfx('tap'); setFalha(null);
    const r = simular(fase.mundo, montarPrograma(fase.circuito, estado));
    const segundos = Math.round((Date.now() - (inicio.current ?? Date.now())) / 1000);
    setRobo(fase.mundo.inicio); setPegas([]);
    if (r.fim === 'ok') {
      const av = avaliar(fase.ideal, { passos: r.passos.length, segundos });
      const n = r.passos.length;
      setBusy(true); setPopup({ t: 'rodando', passo: 0, total: n });
      r.passos.forEach((p, i) => timers.current.push(setTimeout(() => {
        setRobo(p); setPegas(p.estrelasPegas); setPopup({ t: 'rodando', passo: i + 1, total: n, peca: p.peca }); sfx('place');
      }, (i + 1) * PASSO_MS)));
      timers.current.push(setTimeout(() => {
        setBusy(false); sfx('ok'); onConcluir(fase.id, av.estrelas); setPopup({ t: 'ok', av });
      }, (n + 1) * PASSO_MS + 300));
    } else {
      // deu errado: o Nexus não anda
      setFalha(r.noFalha); sfx('soft');
      setPopup({ t: r.fim, r, vazios: contarVazios(fase.circuito, estado), celula: r.celulaFalha });
    }
  };

  // atalhos de teclado (computador): 1..9 pegam a peça, Enter executa
  useEffect(() => {
    const tecla = (e) => {
      if (e.target !== document.body || missao || popup || help) return;
      if (/^[1-9]$/.test(e.key)) { const id = fase.pecas[Number(e.key) - 1]; if (id) { sfx('tap'); setMao((m) => (m === id ? null : id)); } }
      else if (e.key === 'Enter' && !busy) { e.preventDefault(); executar(); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  const total = fase.mundo.estrelas.length;
  const horizontal = layout === 'horizontal';
  const paleta = <Paleta pecas={fase.pecas} mao={mao} modo={horizontal ? 'bandeja' : 'lista'} onArrastar={iniciar} onPegar={(id) => { if (foiArrasto()) return; sfx('tap'); setMao(mao === id ? null : id); }} />;
  const painelCircuito = (
    <div className="card p-4 flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <h3 className={horizontal ? 'text-2xl' : 'text-3xl'}>Montar circuito</h3>
        <div className="flex gap-3">
          <Btn data-t="run" c="#19B35A" className="!text-xl px-8" onClick={executar} disabled={busy}>Executar</Btn>
          <Btn c="#fff" className="!text-base" onClick={limpar} disabled={busy}>Limpar</Btn>
        </div>
      </div>
      <Circuito direcao={layout} circuito={fase.circuito} estado={estado} falha={falha} alvo={arrasto ? sobre : null} arrastando={arrasto?.origem !== 'paleta' ? arrasto?.origem : null}
        onEspaco={onEspaco} onRemover={onRemover} onArrastar={iniciar} onVezes={onVezes} />
    </div>
  );
  const painelMapa = (
    <div data-t="palco" className="card p-4">
      <h3 className="text-2xl text-center">Mapa da fase</h3>
      <p className="text-center text-xs mb-2">Veja o mapa e planeje o circuito</p>
      <div className="rounded-full px-3 py-1 flex items-center gap-2 text-xs mb-3" style={{ background: '#FFF6B8', border: `2px solid ${INK}` }}>
        <Ic n="star" s={16} f={SUN} w={2.5} />Objetivo: pegar {total === 1 ? 'a estrela' : `as ${total} estrelas`}
      </div>
      <div className="rounded-xl p-3 flex justify-center" style={{ background: INK }}><Palco mundo={fase.mundo} /></div>
      <div className="flex items-center justify-between gap-2 mt-3">
        <span className="text-xs">Aperte Executar (ou Enter) para ver o Nexus andar.</span>
        <Btn c={BLUE} className="!text-base !py-1 !px-4 !text-white" onClick={() => setHelp(true)}>Ajuda</Btn>
      </div>
    </div>
  );
  return (
    <div className="max-w-[1400px] mx-auto p-4">
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <h2 className="text-3xl">Fase {fase.id}: {fase.titulo}</h2>
        <span className="rounded-full px-3 py-0.5 text-sm" style={{ background: SUN, border: `2px solid ${INK}`, fontWeight: 800 }}>{fase.conceito}</span>
        <button onClick={() => setMissao(true)} className="underline text-sm">Ver missão</button>
      </div>
      {horizontal ? (
        <div className="grid gap-4 grid-cols-[1fr_300px] items-start">
          <div className="flex flex-col gap-4">{painelCircuito}{paleta}</div>
          {painelMapa}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-[250px_1fr_300px] items-start">{paleta}{painelCircuito}{painelMapa}</div>
      )}
      <PecaArrastada arrasto={arrasto || volta} voltando={!arrasto && !!volta} />
      {missao && <MissaoFase fase={fase} onFechar={fecharMissao} />}
      {popup && <CaminhoPopup popup={popup} fase={fase} robo={robo} pegas={pegas} proxima={proxima}
        onTentar={() => setPopup(null)} onTrilha={() => go('courses')} onProxima={() => (proxima ? irParaFase(proxima.id) : go('nivel'))} />}
      {help && (
        <Modal onClose={() => setHelp(false)}>
          <Nexi s={72} mood="curioso" /><h3 className="text-3xl mt-2">Uma dica</h3><p className="mt-1">{fase.dica}</p>
          <Btn className="mt-4" onClick={() => setHelp(false)}>Entendi</Btn>
        </Modal>
      )}
    </div>
  );
}
