import React from 'react';
import { INK, PINK } from '../theme/tokens';
import { Ic } from './Icon';
import { Nexi } from './Nexi';
import { Btn } from './Btn';
import { DESCOBERTAS } from '../data/descobertas';
import { Modal } from './Modal';
import { Palco } from './Palco';

const MOTIVOS = {
  vazio: 'Você ainda não colocou nenhuma peça no circuito.',
  lava: 'Na caixa marcada, o Nexus pisou na lava.',
  pedra: 'Na caixa marcada, o Nexus encontrou uma pedra.',
  parede: 'Na caixa marcada, o Nexus encontrou a parede do mapa.',
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

// Resultado após observar a execução; apenas tentativas concluídas concedem estrelas.
export function CaminhoPopup({ popup, fase, robo, pegas, proxima, onTentar, onTrilha, onProxima }) {
  const t = popup.t;
  const mapa = (
    <div className="rounded-xl p-3 flex justify-center my-2" style={{ background: INK }}>
      <Palco mundo={fase.mundo} robo={robo} pegas={pegas} tam={52} destaque={popup.celula} />
    </div>
  );
  let corpo;
  if (t === 'ok') {
    const { av } = popup;
    corpo = (
      <>
        <h3 className="text-3xl">Fase completa!</h3>
        <Estrelas n={av.estrelas} />
        <ul className="space-y-1.5 my-2">
          <Crit ok texto="Completou a fase." />
          <Crit ok={av.poucos} texto={av.poucos ? `Poucos passos: o Nexus fez só ${av.passos}!` : `Poucos passos: o Nexus fez ${av.passos}. Dá para fazer em ${av.ideal.passos}.`} />
          <Crit ok={av.compacto} texto={av.compacto ? `Programa compacto: ${av.pecas} peças de ação.` : `Explore uma forma de usar até ${av.ideal.pecas} peças de ação. Você usou ${av.pecas}.`} />
        </ul>
        <div className="text-left text-sm rounded-xl p-3 my-3" style={{ background: '#DDF6E8', border: `2px solid ${INK}` }}><b>Vamos pensar?</b> {DESCOBERTAS[fase.id].reflexao}</div>
        <details className="reflection-card"><summary>Quero explicar minha descoberta</summary><p className="mt-2">{DESCOBERTAS[fase.id].transfere}</p><p className="text-xs mt-2">Conte para alguém ou desenhe sua ideia. Esta conversa não vale estrelas.</p></details>
        <div className="flex flex-wrap gap-2">
          <Btn c="#fff" className="flex-1 min-w-[120px] !text-base" onClick={onTrilha}>Ver trilha</Btn>
          <Btn className="flex-1 min-w-[120px] !text-base" onClick={onProxima}>{proxima ? 'Próxima fase' : 'Continuar'}</Btn>
        </div>
      </>
    );
  } else {
    const motivo = t === 'faltou'
      ? `O programa terminou, mas o Nexus pegou só ${popup.r.estrelas} de ${popup.r.total} estrelas.${popup.vazios > 0 ? ' Ainda tem espaços vazios no circuito.' : ''}`
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
    <Modal largo onClose={onTentar}>
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
