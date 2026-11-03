import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { FASES } from '../data/fases';
import { simular, montarPrograma } from './motor';
import { avaliar } from './avaliacao';
import { temAcao } from '../services/atividade';
const resource = (path) => JSON.parse(readFileSync(new URL(`../../backend/src/${path}`, import.meta.url), 'utf8'));
it('mantém o catálogo do servidor idêntico à fonte do frontend', () => {
  expect(resource('main/resources/fases.json')).toEqual(FASES);
});
it('mantém os 640 casos compartilhados coerentes com o motor atual do frontend', () => {
  const cases = resource('test/resources/game-fixtures.json');
  expect(cases).toHaveLength(640);
  for (const c of cases) {
    const f = FASES.find(f => f.id === c.faseId), programa = montarPrograma(f.circuito, c.estado), r = simular(f.mundo, programa);
    expect({ activity: temAcao(programa), success: r.fim === 'ok', stars: r.fim === 'ok' ? avaliar(f.ideal, { passos: r.passos.length, segundos: c.segundos }).estrelas : 0, steps: r.passos.length }).toEqual({ activity: c.activity, success: c.success, stars: c.stars, steps: c.steps });
  }
});
