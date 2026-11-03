import React from 'react';
import { INK, PINK } from '../theme/tokens';
import { PECAS } from '../game/pecas';
import { Ic } from './Icon';
import { Nexi } from './Nexi';
import { Btn } from './Btn';
import { Modal } from './Modal';
import { Palco } from './Palco';

const MOTIVOS = {
  vazio: 'Você ainda não colocou nenhuma peça no circuito.',
  lava: 'Na caixa marcada, o Nexus pisaria na lava.',
  pedra: 'Na caixa marcada, o Nexus bateria numa pedra.',
  parede: 'Na caixa marcada, o Nexus bateria na parede do mapa.',
  limite: 'O circuito ficou grande demais e o Nexus se cansaria.',
};

const Estrelas = ({ n, s = 38 }) => (
  <div className="flex justify-center gap-1 my-2" role="img" aria-label={`${n} de 3 estrelas`}>
    {[1, 2, 3].map((i) => <Ic key={i} n="star" s={s} f={i <= n ? '#FFD60A' : '#fff'} w={2.5} />)}
  </div>
);
const Crit = ({ ok, texto }) => (
  <li className="flex gap-2 items-start text-sm text-left"><Ic n="star" s={20} f={ok ? '#FFD60A' : '#fff'} w={2.5} /><span>{texto}</span></li>
);

// Pop-up "Caminho do Nexus": escurece o resto da tela, mostra o mapa grande e depois o resultado.
//   popup.t = 'rodando' (o Nexus está andando) | 'ok' (acertou) | 'faltou' | 'lava' | 'pedra' | 'parede' | 'vazio' | 'limite'
export function CaminhoPopup({ popup, fase, robo, pegas, proxima, onTentar, onTrilha, onProxima }) {
  const total = fase.mundo.estrelas.length;
  const t = popup.t;
  const mapa = (
    <div className="rounded-xl p-3 flex justify-center my-2" style={{ background: INK }}>
      <Palco mundo={fase.mundo} robo={robo} pegas={pegas} tam={52} destaque={popup.celula} />
    </div>
  );
  let corpo;
  if (t === 'rodando') {
    corpo = (
      <>
        <p className="text-sm" aria-live="polite">{popup.passo === 0 ? 'O Nexus está começando...' : `Passo ${popup.passo} de ${popup.total}: ${PECAS[popup.peca]?.nome ?? ''}`}</p>
        <div className="flex justify-center items-center gap-1.5 mt-2"><Ic n="star" s={26} f="#FFD60A" w={2.5} /><span className="disp text-2xl">{pegas.length}/{total}</span></div>
      </>
    );
  } else if (t === 'ok') {
    const { av } = popup;
    corpo = (
      <>
        <h3 className="text-3xl">Fase completa!</h3>
        <Estrelas n={av.estrelas} />
        <ul className="space-y-1.5 my-2">
          <Crit ok texto="Completou a fase." />
          <Crit ok={av.poucos} texto={av.poucos ? `Poucos passos: o Nexus fez só ${av.passos}!` : `Poucos passos: o Nexus fez ${av.passos}. Dá para fazer em ${av.ideal.passos}.`} />
          <Crit ok={av.rapido} texto={av.rapido ? `Rápido: ${av.segundos === 1 ? '1 segundo' : av.segundos + ' segundos'}!` : `Rápido: você levou ${av.segundos} s. A meta é ${av.ideal.segundos} s.`} />
        </ul>
        <div className="text-left text-sm rounded-xl p-3 my-3" style={{ background: '#DDF6E8', border: `2px solid ${INK}` }}><b>O que você aprendeu:</b> {fase.aprendeu}</div>
        <div className="flex flex-wrap gap-2">
          <Btn c="#fff" className="flex-1 min-w-[120px] !text-base" onClick={onTrilha}>Ver trilha</Btn>
          <Btn className="flex-1 min-w-[120px] !text-base" onClick={onProxima}>{proxima ? 'Próxima fase' : 'Continuar'}</Btn>
        </div>
      </>
    );
  } else {
    const motivo = t === 'faltou'
      ? `O Nexus terminaria o circuito, mas pegaria só ${popup.r.estrelas} de ${popup.r.total} estrelas.${popup.vazios > 0 ? ' Ainda tem espaços vazios no circuito.' : ''}`
      : MOTIVOS[t];
    corpo = (
      <>
        <div className="flex justify-center"><Nexi s={48} mood="pensando" /></div>
        <h3 className="text-2xl mt-1">O Nexus não conseguiu completar a fase</h3>
        <p className="mt-2 text-sm">{motivo}</p>
        <p className="mt-2 text-xs rounded-xl p-2" style={{ background: '#FFF6B8', border: `2px solid ${INK}` }}>Dica: {fase.dica}</p>
        <p className="mt-2 text-sm" style={{ color: PINK, fontWeight: 800 }}>Sem problema! Mude o circuito e tente de novo.</p>
        <Btn className="mt-3 w-full" onClick={onTentar}>Tentar de novo</Btn>
      </>
    );
  }
  return (
    <Modal largo onClose={t === 'rodando' || t === 'ok' ? () => {} : onTentar}>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 sm:gap-6 items-center min-w-0">
        <div>
          <h3 className="text-2xl">Caminho do Nexus</h3>
          <p className="text-xs">Fase {fase.id}: {fase.titulo}</p>
          {mapa}
        </div>
        <div>{corpo}</div>
      </div>
    </Modal>
  );
}
