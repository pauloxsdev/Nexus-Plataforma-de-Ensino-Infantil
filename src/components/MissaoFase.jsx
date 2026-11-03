import React from 'react';
import { INK, SUN } from '../theme/tokens';
import { Nexi } from './Nexi';
import { Btn } from './Btn';
import { Modal } from './Modal';
import { Palco } from './Palco';

const PASSOS = ['Arraste uma peça da lista até um espaço vazio do circuito.', 'Para trocar de lugar, arraste a peça que já está no circuito. Para tirar, solte fora do circuito ou toque no ×.', 'Aperte Executar e veja o Nexus andar.'];

// Janela que aparece no começo de cada fase: história, mapa, o que é novo e como jogar.
export function MissaoFase({ fase, onFechar }) {
  const n = fase.mundo.estrelas.length;
  return (
    <Modal onClose={onFechar} largo>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center min-w-0">
        <div>
        <Nexi s={64} mood="feliz" />
        <div className="text-sm">Fase {fase.id}</div>
        <h3 className="text-3xl">{fase.titulo}</h3>
        <p className="mt-2 text-sm">{fase.historia}</p>
        <div className="my-3 flex justify-center"><div className="rounded-xl p-2" style={{ background: INK }}><Palco mundo={fase.mundo} tam={30} /></div></div>
        <p className="text-sm" style={{ fontWeight: 800 }}>Objetivo: pegar {n === 1 ? 'a estrela' : `as ${n} estrelas`}.</p>
        </div>
        <div>
        <div className="text-left text-sm rounded-xl p-3 my-3" style={{ background: '#FFF6B8', border: `2px solid ${INK}` }}>
          <b>Novidade: {fase.novo.titulo}.</b> {fase.novo.texto}
        </div>
        <div className="text-left text-sm rounded-xl p-3 my-3" style={{ background: '#DDF6E8', border: `2px solid ${INK}` }}>
          <b>Ganhe até 3 estrelas:</b>
          <ul className="mt-1 space-y-0.5">
            <li>1ª: completar a fase.</li>
            <li>2ª: o Nexus fazer até {fase.ideal.passos} passos (andar, virar ou pular conta 1 passo).</li>
            <li>3ª: terminar em até {fase.ideal.segundos} segundos.</li>
          </ul>
        </div>
        <ol className="text-left space-y-2 my-3">
          {PASSOS.map((p, i) => (
            <li key={i} className="flex gap-2 items-start text-sm">
              <span className="disp shrink-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: SUN, border: `3px solid ${INK}` }}>{i + 1}</span><span>{p}</span>
            </li>
          ))}
        </ol>
        <Btn className="mt-3 w-full" onClick={onFechar}>Vamos lá!</Btn>
        </div>
      </div>
    </Modal>
  );
}
