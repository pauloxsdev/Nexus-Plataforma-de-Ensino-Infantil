import React from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';
import { AvCtx, AVATAR_PADRAO } from '../context/AvatarContext';
import { avatarDisponivel, resumoProgresso } from '../data/personalizacao';
vi.mock('../services/som', () => ({ sfx: vi.fn() }));
let root;
afterEach(() => { if (root) act(() => root.unmount()); vi.restoreAllMocks(); });
function montar(estrelas = {}) {
  const set = vi.fn(), progresso = resumoProgresso(estrelas);
  act(() => { root = create(<AvCtx.Provider value={[AVATAR_PADRAO, set]}><Avatar go={vi.fn()} progresso={progresso} /></AvCtx.Provider>); });
  return { set, progresso };
}
it('explica o requisito de um item bloqueado e impede equipá-lo', () => {
  const { set } = montar();
  const gota = root.root.findAllByType('button').find(b => b.props['aria-label']?.startsWith('Gota.'));
  act(() => gota.props.onClick());
  expect(set).not.toHaveBeenCalled();
  expect(root.root.findByProps({ role: 'status' }).children.join('')).toBe('Gota: Conclua 1 fase.');
});
it('permite equipar o item ao atingir o requisito', () => {
  const { set } = montar({ 1: 1 });
  const gota = root.root.findAllByType('button').find(b => b.props['aria-label']?.startsWith('Gota.'));
  expect(gota.props['aria-disabled']).toBe(false);
  act(() => gota.props.onClick());
  expect(set).toHaveBeenCalledWith({ ...AVATAR_PADRAO, forma: 'gota' });
});
it('sorteia somente combinações que o aluno pode equipar, incluindo os extremos da lista', () => {
  const { set, progresso } = montar();
  const random = vi.spyOn(Math, 'random');
  for (const valor of [0, .25, .5, .75, .99999]) {
    random.mockReturnValue(valor);
    act(() => root.root.findByProps({ 'data-t': 'av-sortear' }).props.onClick());
    const escolhido = set.mock.lastCall[0];
    expect(escolhido).toEqual(avatarDisponivel(escolhido, progresso));
  }
});
