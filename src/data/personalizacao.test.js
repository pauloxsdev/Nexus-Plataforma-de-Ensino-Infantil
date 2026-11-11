import { expect, it } from 'vitest';
import { FASES } from './fases';
import { avatarDisponivel, catalogo, colecao, liberado, resumoProgresso } from './personalizacao';

const item = (parte, id) => catalogo[parte].find(i => i.id === id);
const progresso = (quantidade, estrelas = 1) => resumoProgresso(Object.fromEntries(FASES.slice(0, quantidade).map(f => [f.id, estrelas])));

it('começa com sete itens e não considera pontuações inválidas ou fases inexistentes', () => {
  const p = resumoProgresso({ 1: 0, 2: 4, 3: 1.5, 4: '3', 999: 3 });
  expect(colecao(p)).toEqual({ livres: 7, total: 28 });
  expect(liberado(item('forma', 'gota'), p)).toBe(false);
});
it('abre a gota, rosa, piscadinha e antena ao concluir a primeira fase', () => {
  const p = progresso(1);
  expect(colecao(p).livres).toBe(11);
  expect(avatarDisponivel({ forma: 'gota', cor: '#FF5C8A', rosto: 'piscando', acc: 'antena' }, p))
    .toEqual({ forma: 'gota', cor: '#FF5C8A', rosto: 'piscando', acc: 'antena' });
  expect(liberado(item('forma', 'estrela'), p)).toBe(false);
});
it('diferencia o requisito de estrelas da quantidade de fases', () => {
  expect(liberado(item('acc', 'raio'), progresso(3, 2))).toBe(false);
  expect(liberado(item('acc', 'raio'), progresso(3, 3))).toBe(true);
});
it('reserva a coroa para a trilha com três estrelas em todas as fases', () => {
  const completa = progresso(FASES.length);
  expect(liberado(item('forma', 'diamante'), completa)).toBe(true);
  expect(liberado(item('acc', 'halo'), completa)).toBe(true);
  expect(liberado(item('acc', 'coroa'), completa)).toBe(false);
  expect(liberado(item('acc', 'coroa'), progresso(FASES.length - 1, 3))).toBe(false);
  expect(colecao(progresso(FASES.length, 3))).toEqual({ livres: 28, total: 28 });
});
it('normaliza itens antigos bloqueados sem alterar o registro original', () => {
  const antigo = { forma: 'diamante', cor: '#2B4DFF', rosto: 'feliz', acc: 'coroa' };
  expect(avatarDisponivel(antigo, progresso(0))).toEqual({ forma: 'orbe', cor: '#2B4DFF', rosto: 'feliz', acc: 'nenhum' });
  expect(antigo.acc).toBe('coroa');
});
