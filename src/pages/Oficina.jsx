import React, { useRef, useState } from 'react';
import { INK, BLUE, SUN, ORANGE } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Nexi } from '../components/Nexi';
import { Btn } from '../components/Btn';
import { Modal } from '../components/Modal';
import { sfx } from '../services/som';
import { AreaBlockly } from '../blockly/AreaBlockly';
import { reiniciar } from '../blockly/blocos';
import { paraPrograma } from '../blockly/programa';
import { simular } from '../game/fase5';

// Desenho do palco (só visual). As regras ficam em game/fase5.js.
const GRID = [[0, 0, 'rock', 0, 0], [0, 0, 0, 0, 0], ['nexi', 'lava', 'star', 'star', 'star'], [0, 0, 'rock', 0, 0], [0, 0, 0, 0, 0]];

const MENSAGENS = {
  vazio: ['Faltam blocos', 'Encaixe blocos embaixo do bloco azul "quando o Nexi começar".'],
  lava: ['O robô parou na lava', 'Tinha lava na frente e o Nexi tentou andar. Use o bloco "se tem obstáculo à frente" e faça ele pular.'],
  limite: ['Programa grande demais', 'Tem repetição demais. Diminua os números ou tire blocos.'],
};

export function Work({ save, go }) {
  const ws = useRef(null);
  const [pos, setPos] = useState(0);
  const [got, setGot] = useState([]);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);

  const executar = () => {
    if (busy || !ws.current) return;
    sfx('tap');
    const r = simular(paraPrograma(ws.current)); // 1) blocos -> lista  2) lista -> passos do robô
    setBusy(true); setPos(0); setGot([]);
    r.passos.forEach((p, i) => setTimeout(() => { setPos(p.c); setGot(p.g); }, (i + 1) * 650));
    setTimeout(() => {
      setBusy(false);
      sfx(r.fim === 'ok' ? 'ok' : 'soft');
      if (r.fim === 'ok') save(); // registra o progresso (vai para a fila offline)
      setRes({ t: r.fim, g: r.estrelas });
    }, (r.passos.length + 1) * 650);
  };

  const fechar = () => { const ganhou = res?.t === 'ok'; setRes(null); setHelp(false); if (ganhou) go('nivel'); };
  const [titulo, texto] = help
    ? ['Uma dica', 'Quando tem lava na frente, o Nexi precisa pular. Quando não tem, ele anda. Coloque tudo dentro de um "repetir" e aumente o número até pegar as 3 estrelas.']
    : MENSAGENS[res?.t] || ['Quase lá!', `O robô pegou ${res?.g} de 3 estrelas. Tente aumentar o número de repetições.`];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl mb-3">Fase 5: leve o Nexi até as estrelas</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        <div className="card p-4 flex flex-col gap-3">
          <h3 className="text-3xl text-center">Monte o programa</h3>
          <div data-t="blocos" className="rounded-xl overflow-hidden" style={{ height: 480, border: `3px solid ${INK}` }}>
            <AreaBlockly wsRef={ws} chave="nexus:fase5" />
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Btn data-t="run" c="#19B35A" className="text-2xl px-10" onClick={executar} disabled={busy}>Executar</Btn>
            <Btn c="#fff" className="!text-base" onClick={() => { reiniciar(ws.current); setPos(0); setGot([]); }} disabled={busy}>Limpar blocos</Btn>
          </div>
        </div>
        <div data-t="stage" className="card p-4 self-start">
          <h3 className="text-2xl text-center">Caminho do Nexi</h3>
          <p className="text-center text-xs mb-2">Fase 5</p>
          <div className="rounded-full px-3 py-1 flex items-center gap-2 text-xs mb-3" style={{ background: '#FFF6B8', border: `2px solid ${INK}` }}>
            <Ic n="star" s={16} f={SUN} w={2.5} />Objetivo: coletar as estrelas!
          </div>
          <div className="rounded-xl p-3 grid gap-1.5 justify-center" style={{ background: INK, gridTemplateColumns: 'repeat(5,40px)' }}>
            {GRID.flatMap((row, r) => row.map((k, c) => {
              const base = { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' };
              const id = r + '-' + c;
              if (r === 2 && c === pos) return <div key={id} style={{ ...base, border: '2px solid #fff' }}><Nexi s={34} /></div>;
              if (k === 'lava') return <div key={id} className="disp text-2xl" style={{ ...base, background: ORANGE, border: `3px solid ${INK}` }}>~</div>;
              if (k === 'rock') return <div key={id} style={{ ...base, background: '#8F9BD0', border: `3px solid ${INK}` }}><div style={{ width: 20, height: 12, borderRadius: 4, background: '#fff', border: `2px solid ${INK}` }} /></div>;
              if (k === 'star') { const ok = got.includes(c); return <div key={id} style={{ ...base, background: ok ? '#fff' : SUN, border: `3px solid ${INK}` }}>{ok ? <Ic n="check" s={22} w={4} /> : <Ic n="star" s={24} f="#fff" w={2.5} />}</div>; }
              return <div key={id} style={{ ...base, border: '2px solid #fff' }} />;
            }))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5"><Ic n="star" s={26} f={SUN} w={2.5} /><span className="disp text-2xl">{got.length}/3</span></div>
            <Btn c={BLUE} className="!text-base !py-1 !px-4 !text-white" onClick={() => setHelp(true)}>Ajuda</Btn>
          </div>
        </div>
      </div>
      {(res || help) && (
        <Modal onClose={fechar}>
          {res?.t === 'ok' ? (
            <>
              <div className="slap mx-auto w-36 h-36 rounded-full flex flex-col items-center justify-center" style={{ background: '#FF5C8A', border: '4px solid #fff', outline: `3px solid ${INK}`, boxShadow: `4px 4px 0 ${INK}` }}>
                <span className="disp text-5xl" style={{ color: '#fff' }}>∞</span><span className="text-xs text-white">Mestre do loop</span>
              </div>
              <h3 className="text-3xl mt-5">Você chegou!</h3>
              <p className="mt-1">As 3 estrelas são suas. +50 XP e uma figurinha nova no álbum.</p>
            </>
          ) : (
            <>
              <Nexi s={72} mood={help || res?.t === 'try' ? (help ? 'curioso' : 'pensando') : 'curioso'} />
              <h3 className="text-3xl mt-2">{titulo}</h3>
              <p className="mt-1">{texto}</p>
            </>
          )}
          <Btn className="mt-5" onClick={fechar}>{res?.t === 'ok' ? 'Continuar' : 'Entendi'}</Btn>
        </Modal>
      )}
    </div>
  );
}
