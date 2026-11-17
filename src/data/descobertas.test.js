import { expect, it } from 'vitest';
import { DESCOBERTAS } from './descobertas';
import { simular } from '../game/motor';

// Resultados esperados dos exemplos didáticos, conferidos pelos mapas.
// Nem todo exemplo completa o mapa: alguns pedem prever uma posição intermediária.
it.each([
  [1, 2, 0, 'E', 'faltou'], [2, 2, 1, 'E', 'ok'],
  [3, 3, 0, 'E', 'ok'], [4, 3, 0, 'E', 'faltou'],
  [5, 2, 0, 'E', 'ok'], [6, 4, 0, 'E', 'ok'],
  [7, 2, 1, 'S', 'ok'], [8, 1, 1, 'S', 'ok'],
])('exemplo da aula %i termina na posição prevista', (id, x, y, dir, fim) => {
  const d = DESCOBERTAS[id], r = simular(d.mundo, d.programa);
  expect(r.fim).toBe(fim);
  expect(r.passos.at(-1)).toMatchObject({ x, y, dir });
  expect(d.opcoes[d.correta]).toBeTruthy();
});
