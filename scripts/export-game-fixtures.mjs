import { writeFileSync } from 'node:fs';
import { FASES } from '../src/data/fases.js';
import { montarPrograma, simular, estadoInicial } from '../src/game/motor.js';
import { avaliar } from '../src/game/avaliacao.js';
import { temAcao } from '../src/services/atividade.js';
let seed = 42;
const random = (n) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
const fixtures = [];
for (const fase of FASES) {
  for (let i = 0; i < 80; i++) {
    const estado = estadoInicial(fase.circuito);
    const visit = nodes => nodes.forEach(n => {
      if (n.tipo === 'espaco' && !n.fixo) { const p = random(fase.pecas.length + 1); if (p < fase.pecas.length) estado.slots[n.id] = fase.pecas[p]; }
      if (n.tipo === 'repetir') { estado.vezes[n.id] = random(n.max) + 1; visit(n.dentro); }
      if (n.tipo === 'se') { visit(n.sim); visit(n.nao); }
    });
    if (i) visit(fase.circuito);
    const programa = montarPrograma(fase.circuito, estado), r = simular(fase.mundo, programa), segundos = random(300);
    fixtures.push({ faseId: fase.id, estado, segundos, activity: temAcao(programa), success: r.fim === 'ok', stars: r.fim === 'ok' ? avaliar(fase.ideal, { passos: r.passos.length, segundos }).estrelas : 0, steps: r.passos.length });
  }
}
writeFileSync(new URL('../backend/src/test/resources/game-fixtures.json', import.meta.url), JSON.stringify(fixtures) + '\n');
