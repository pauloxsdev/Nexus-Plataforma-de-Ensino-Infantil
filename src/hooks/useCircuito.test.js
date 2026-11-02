import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { useCircuito, restaurarCircuito } from './useCircuito';
import { FASES } from '../data/fases';
import { estadoInicial } from '../game/motor';
const aluno = { tipo: 'aluno', id: 'a' };
const fase = FASES[3];
let root, estado, alterar;
function Tela(props) { [estado, alterar] = useCircuito(props.perfil, props.projetoId, props.fase); return null; }
const props = { perfil: aluno, projetoId: 'projeto-1', fase };
const montar = (p = props) => act(() => { root = create(React.createElement(Tela, p)); });
const trocar = (p) => act(() => root.update(React.createElement(Tela, { ...props, ...p })));
beforeEach(() => {
  const dados = new Map();
  vi.stubGlobal('localStorage', { getItem: (k) => dados.get(k) ?? null, setItem: (k, v) => dados.set(k, v) });
});
afterEach(() => { if (root) act(() => root.unmount()); root = null; vi.unstubAllGlobals(); });
it('restaura peças e repetições após sair e remontar', () => {
  montar(); act(() => alterar({ slots: { a: 'andar' }, vezes: { r: 4 } }));
  act(() => root.unmount()); montar();
  expect(estado).toEqual({ slots: { a: 'andar' }, vezes: { r: 4 } });
});
it('isola projetos, fases e alunos, mesmo sem remontar', () => {
  montar(); act(() => alterar({ slots: { a: 'andar' }, vezes: { r: 5 } }));
  for (const p of [{ projetoId: 'outro' }, { perfil: { tipo: 'aluno', id: 'b' } }, { fase: FASES[4] }]) {
    trocar(p); expect(estado).toEqual(estadoInicial((p.fase ?? fase).circuito));
  }
  trocar({}); expect(estado).toEqual({ slots: { a: 'andar' }, vezes: { r: 5 } });
});
it('limpar persiste o circuito inicial e não altera outro projeto', () => {
  montar(); act(() => alterar({ slots: { a: 'andar' }, vezes: { r: 4 } }));
  trocar({ projetoId: 'outro' }); act(() => alterar({ slots: { a: 'andar' }, vezes: { r: 3 } }));
  trocar({}); act(() => alterar(estadoInicial(fase.circuito)));
  act(() => root.unmount()); montar(); expect(estado).toEqual(estadoInicial(fase.circuito));
  trocar({ projetoId: 'outro' }); expect(estado.vezes.r).toBe(3);
});
it('descarta slots e peças incompatíveis e limita repetições ao circuito atual', () => {
  expect(restaurarCircuito(fase, { slots: { a: 'pular', inexistente: 'andar' }, vezes: { r: 100, outro: 3 } }))
    .toEqual({ slots: {}, vezes: { r: 6 } });
  expect(restaurarCircuito(fase, { vezes: { r: 'quatro' } })).toEqual(estadoInicial(fase.circuito));
  expect(restaurarCircuito(FASES[5], { slots: { a: 'pular', b: 'andar' }, vezes: { r: 2 } }))
    .toEqual({ slots: { a: 'pular', b: 'andar' }, vezes: { r: 2 } });
});
