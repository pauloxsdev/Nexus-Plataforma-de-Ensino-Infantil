import React from 'react';
import { act, create } from 'react-test-renderer';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { useProgresso } from './useProgresso';
import { useAtividade } from './useAtividade';
import { useConquistas } from './useConquistas';
import { FASES } from '../data/fases';
import { avaliarConquistas } from '../data/conquistas';
import { dataLocal, resumirAtividade, temAcao } from '../services/atividade';
const a = { tipo: 'aluno', id: 'a' }, b = { tipo: 'aluno', id: 'b' };
let root, atual;
function Tela({ perfil, fases = FASES }) {
  const progresso = useProgresso(fases, perfil);
  const atividade = useAtividade(perfil);
  const conquistas = useConquistas({ fasesFeitas: progresso.feitas.length, feitas: progresso.feitas, totalEstrelas: progresso.totalEstrelas, tres: Object.values(progresso.estrelas).filter((n) => n === 3).length, avatarMudou: false, dias: atividade.consecutivos, totalFases: fases.length }, perfil);
  atual = { ...progresso, atividade, conquistas };
  return null;
}
function montar(perfil = a, fases = FASES) { act(() => { root = create(React.createElement(Tela, { perfil, fases })); }); }
function trocar(perfil, fases = FASES) { act(() => root.update(React.createElement(Tela, { perfil, fases }))); }
const relogio = (dia) => { vi.setSystemTime(new Date(2026, 10, dia, 12)); act(() => vi.advanceTimersByTime(30000)); };
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 10, 1, 12));
  const dados = new Map();
  vi.stubGlobal('localStorage', { getItem: (k) => dados.get(k) ?? null, setItem: (k, v) => dados.set(k, v) });
  vi.stubGlobal('window', new EventTarget()); vi.stubGlobal('document', new EventTarget());
});
afterEach(() => { if (root) act(() => root.unmount()); root = null; vi.useRealTimers(); vi.unstubAllGlobals(); });
it('aluno novo começa sem atividade, progresso ou conquistas e abrir não conta', () => {
  montar(); expect(atual.feitas).toEqual([]); expect(atual.totalEstrelas).toBe(0);
  expect(atual.atividade.acumulados).toBe(0); expect(atual.atividade.consecutivos).toBe(0);
  expect(atual.conquistas.lista.filter((c) => c.desbloqueada)).toEqual([]);
  act(() => root.unmount()); montar(); expect(atual.atividade.acumulados).toBe(0);
});
it('repetir a fase preserva o melhor resultado, sem somar estrelas ou premiar novamente', () => {
  montar(); act(() => { atual.concluir(1, 3); atual.atividade.registrar(); });
  const ganhas = atual.conquistas.lista.filter((c) => c.desbloqueada).map((c) => c.id);
  act(() => atual.conquistas.marcarVistas());
  act(() => { atual.concluir(1, 1); atual.atividade.registrar(); });
  expect(atual.feitas).toEqual([1]); expect(atual.totalEstrelas).toBe(3); expect(atual.atividade.acumulados).toBe(1);
  act(() => root.unmount()); montar();
  expect(atual.conquistas.lista.filter((c) => c.desbloqueada).map((c) => c.id)).toEqual(ganhas);
  expect(atual.conquistas.novas).toEqual([]); expect(atual.totalEstrelas).toBe(3);
});
it('atividade e conquistas são isoladas por perfil', () => {
  montar(); act(() => { atual.concluir(1, 2); atual.atividade.registrar(); });
  trocar(b); expect(atual.atividade.acumulados).toBe(0); expect(atual.feitas).toEqual([]); expect(atual.conquistas.novas).toEqual([]);
  act(() => atual.concluir(2, 1)); expect(atual.conquistas.lista.find((c) => c.id === 'primeira').desbloqueada).toBe(false);
  trocar(a); expect(atual.feitas).toEqual([1]); expect(atual.atividade.acumulados).toBe(1);
});
it('conta dias únicos, mantém ontem e interrompe após um dia sem atividade', () => {
  montar(); act(() => { atual.atividade.registrar(); atual.atividade.registrar(); });
  relogio(2); expect(atual.atividade.consecutivos).toBe(1);
  act(() => atual.atividade.registrar()); expect(atual.atividade.consecutivos).toBe(2);
  relogio(4); expect(atual.atividade.consecutivos).toBe(0);
  act(() => atual.atividade.registrar()); expect(atual.atividade.consecutivos).toBe(1); expect(atual.atividade.acumulados).toBe(3);
});
it('registra conquista de sete dias uma vez, preservando-a após interrupção', () => {
  montar();
  for (let dia = 1; dia <= 7; dia++) { relogio(dia); act(() => atual.atividade.registrar()); }
  expect(atual.conquistas.lista.find((c) => c.id === 'fogo').desbloqueada).toBe(true);
  act(() => atual.conquistas.marcarVistas()); relogio(10);
  expect(atual.atividade.consecutivos).toBe(0); expect(atual.conquistas.lista.find((c) => c.id === 'fogo').desbloqueada).toBe(true);
  act(() => root.unmount()); montar(); expect(atual.conquistas.novas).toEqual([]);
});
it('total e conquista de trilha acompanham as fases cadastradas', () => {
  montar(); act(() => FASES.forEach((f) => atual.concluir(f.id, 1)));
  const fases = [...FASES, { id: 9 }]; trocar(a, fases);
  expect(atual.totalFases).toBe(9); expect(atual.restantes).toBe(1); expect(atual.proximaId).toBe(9);
  const lista = avaliarConquistas({ fasesFeitas: 8, feitas: FASES.map((f) => f.id), totalEstrelas: 8, tres: 0, dias: 0, totalFases: 9 });
  expect(lista.find((c) => c.id === 'completa')).toMatchObject({ meta: 9, desbloqueada: false });
  act(() => atual.concluir(9, 2)); expect(atual.restantes).toBe(0);
});
it('liberação de demonstração não fabrica progresso nem atividade', () => {
  montar({ tipo: 'demo', id: 'local' }); act(() => atual.liberarTodas());
  expect(atual.demoLiberada).toBe(true); expect(atual.feitas).toEqual([]); expect(atual.totalEstrelas).toBe(0); expect(atual.atividade.acumulados).toBe(0);
});
it('ignora conclusões inválidas e não mistura IDs fora do catálogo', () => {
  montar(); act(() => { atual.concluir(99, 3); atual.concluir(1, 7); }); expect(atual.feitas).toEqual([]);
});
it('usa calendário local, atravessa mês/ano e ano bissexto sem contar duplicatas', () => {
  expect(dataLocal(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  expect(resumirAtividade(['2026-12-31', '2027-01-01', '2027-01-01'], '2027-01-01')).toMatchObject({ acumulados: 2, consecutivos: 2 });
  expect(resumirAtividade(['2024-02-28', '2024-02-29', '2024-03-01'], '2024-03-01').consecutivos).toBe(3);
  expect(resumirAtividade(['2026-02-30', 'inválida', '2027-01-01'], '2026-11-01').acumulados).toBe(0);
});
it('circuito vazio, inclusive repetição vazia, não representa tentativa com peças', () => {
  expect(temAcao([])).toBe(false); expect(temAcao([{ t: 'repetir', faz: [] }])).toBe(false);
  expect(temAcao([{ t: 'se', sim: [], nao: [{ t: 'acao' }] }])).toBe(true);
});
