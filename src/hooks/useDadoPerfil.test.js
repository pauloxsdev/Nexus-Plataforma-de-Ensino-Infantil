import React from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useDadoPerfil } from './useDadoPerfil';
import { FASES } from '../data/fases';
import { useProgresso } from './useProgresso';
import { chavePerfil, PERFIL_DEMO } from '../services/perfilLocal';
const a = { tipo: 'aluno', id: 'escola:1/aluno:1' };
const b = { tipo: 'aluno', id: 'escola:1/aluno:2' };
const avatarPadrao = (v) => v ?? { cor: 'amarelo' };
let dados, root, atual;
function Tela({ perfil }) {
  const progresso = useProgresso(FASES, perfil);
  const [avatar, setAvatar] = useDadoPerfil(perfil, 'avatar', avatarPadrao);
  atual = { ...progresso, avatar, setAvatar };
  return null;
}
const montar = (perfil) => act(() => { root = create(React.createElement(Tela, { perfil })); });
const trocar = (perfil) => act(() => root.update(React.createElement(Tela, { perfil })));
beforeEach(() => {
  dados = new Map();
  vi.stubGlobal('localStorage', { getItem: (k) => dados.get(k) ?? null, setItem: (k, v) => dados.set(k, v) });
});
afterEach(() => { if (root) act(() => root.unmount()); root = null; vi.unstubAllGlobals(); });
it('isola avatar e progresso ao trocar de aluno sem remontar o componente', () => {
  montar(a);
  act(() => { atual.concluir(1, 3); atual.setAvatar({ cor: 'azul' }); });
  trocar(b);
  expect(atual.estrelas).toEqual({}); expect(atual.avatar).toEqual({ cor: 'amarelo' });
  act(() => { atual.concluir(2, 2); atual.setAvatar({ cor: 'verde' }); });
  trocar(a);
  expect(atual.estrelas).toEqual({ 1: 3 }); expect(atual.avatar).toEqual({ cor: 'azul' });
  expect(JSON.parse(dados.get(chavePerfil(b, 'progresso')))).toEqual({ 2: 2 });
  expect(JSON.parse(dados.get(chavePerfil(b, 'avatar')))).toEqual({ cor: 'verde' });
});
it('restaura o perfil após remontar e não compartilha com a demonstração', () => {
  montar(a); act(() => { atual.concluir(1, 2); atual.setAvatar({ cor: 'rosa' }); });
  act(() => root.unmount()); montar(a);
  expect(atual.estrelas).toEqual({ 1: 2 }); expect(atual.avatar.cor).toBe('rosa');
  trocar(PERFIL_DEMO); expect(atual.estrelas).toEqual({}); expect(atual.avatar.cor).toBe('amarelo');
});
it('preserva dados globais legados sem atribuí-los ao primeiro aluno ou demo', () => {
  dados.set('nexus:progresso', '{"1":3}'); dados.set('nexus:avatar', '{"cor":"vermelho"}');
  montar(PERFIL_DEMO); expect(atual.estrelas).toEqual({});
  trocar(a); expect(atual.estrelas).toEqual({}); expect(atual.avatar.cor).toBe('amarelo');
  expect(dados.get('nexus:progresso')).toBe('{"1":3}'); expect(dados.get('nexus:avatar')).toBe('{"cor":"vermelho"}');
});
it('zerar e liberar fases altera somente o perfil ativo', () => {
  montar(a); act(() => atual.concluir(1, 3)); trocar(b);
  act(() => atual.liberarTodas()); expect(atual.feitas).toHaveLength(0);
  act(() => atual.zerar()); expect(atual.feitas).toEqual([]);
  trocar(a); expect(atual.estrelas).toEqual({ 1: 3 });
});
it('não cria chave para perfil ausente e evita colisões com separadores', () => {
  expect(() => chavePerfil(null, 'avatar')).toThrow();
  expect(chavePerfil({ tipo: 'aluno', id: 'a:b' }, 'avatar')).not.toBe(chavePerfil({ tipo: 'aluno', id: 'a%3Ab' }, 'avatar'));
});
