// Regras da fase 5 (SEM React e SEM Blockly: só lógica, fácil de testar).
// Trilha na linha do meio: casa 0 = Nexi, casa 1 = lava, casas 2, 3 e 4 = estrelas.
export const FASE5 = { ultimaCasa: 4, lava: 1, estrelas: [2, 3, 4] };

const LIMITE_DE_ACOES = 200; // evita travar se alguém aninhar repetições demais

// programa = lista de blocos simples:
//   { t: 'mover' } | { t: 'pular' } | { t: 'repetir', n, faz: [...] } | { t: 'se', sim: [...], nao: [...] }
// devolve { passos: [{ c, g }], fim, estrelas }
//   fim: 'ok' | 'try' | 'lava' | 'vazio' | 'limite'
export function simular(programa, fase = FASE5) {
  let c = 0, fim = null, acoes = 0;
  const g = [], passos = [];
  const obstaculoAFrente = () => c + 1 === fase.lava;
  const andou = () => {
    if (fase.estrelas.includes(c) && !g.includes(c)) g.push(c);
    passos.push({ c, g: [...g] });
  };
  const rodar = (lista) => {
    for (const b of lista) {
      if (fim) return;
      if (++acoes > LIMITE_DE_ACOES) { fim = 'limite'; return; }
      if (b.t === 'mover') {
        if (obstaculoAFrente()) { fim = 'lava'; return; } // parou antes da lava
        c = Math.min(c + 1, fase.ultimaCasa); andou();
      } else if (b.t === 'pular') {
        c = Math.min(c + 2, fase.ultimaCasa); andou();
      } else if (b.t === 'repetir') {
        for (let i = 0; i < b.n && !fim; i++) rodar(b.faz);
      } else if (b.t === 'se') {
        rodar(obstaculoAFrente() ? b.sim : b.nao);
      }
    }
  };
  rodar(programa);
  if (!fim) fim = programa.length === 0 ? 'vazio' : g.length === fase.estrelas.length ? 'ok' : 'try';
  return { passos, fim, estrelas: g.length };
}
