import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import * as Pt from 'blockly/msg/pt-br';
import { registrarBlocos, TOOLBOX, ESTADO_INICIAL } from './blocos';
import { temaNexus } from './tema';

Blockly.setLocale(Pt);

// Caixa do Blockly. Guarda os blocos no aparelho (localStorage, por enquanto)
// para o aluno não perder o trabalho se a internet cair ou a página recarregar.
// TODO: trocar localStorage por IndexedDB (services/sincronizacao.js).
export function AreaBlockly({ wsRef, chave }) {
  const div = useRef(null);
  useEffect(() => {
    registrarBlocos();
    const ws = Blockly.inject(div.current, {
      toolbox: TOOLBOX,
      theme: temaNexus,
      renderer: 'zelos', // visual arredondado, parecido com o Scratch
      sounds: false, // os sons do jogo são nossos (services/som.js)
      trashcan: true,
      maxInstances: { nexus_inicio: 1 },
      grid: { spacing: 24, length: 3, colour: '#C6D4FF', snap: true },
      zoom: { controls: true, wheel: false, startScale: 1 },
      move: { scrollbars: true, drag: true, wheel: false },
    });
    let estado = ESTADO_INICIAL;
    try { const salvo = JSON.parse(localStorage.getItem(chave)); if (salvo) estado = salvo; } catch { /* usa o inicial */ }
    Blockly.serialization.workspaces.load(estado, ws);
    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;
      try { localStorage.setItem(chave, JSON.stringify(Blockly.serialization.workspaces.save(ws))); } catch { /* sem espaço: ignora */ }
    });
    const ro = new ResizeObserver(() => Blockly.svgResize(ws));
    ro.observe(div.current);
    wsRef.current = ws;
    return () => { ro.disconnect(); ws.dispose(); wsRef.current = null; };
  }, []);
  return <div ref={div} style={{ width: '100%', height: '100%' }} />;
}
