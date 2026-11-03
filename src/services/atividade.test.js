import { expect, it } from 'vitest';
import { dataLocal } from './atividade';
it('usa o dia civil do fuso da turma, mesmo se o instante UTC já for o dia seguinte', () => {
  const instante = new Date('2026-11-04T01:00:00Z');
  expect(dataLocal(instante, 'America/Sao_Paulo')).toBe('2026-11-03');
  expect(dataLocal(instante, 'Europe/Lisbon')).toBe('2026-11-04');
});
