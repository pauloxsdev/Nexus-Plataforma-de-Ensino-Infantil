// Motor do jogo: SEM React. Recebe o mapa (mundo) e o programa montado pela criança
// e devolve o que aconteceria. Fácil de testar (veja motor.test.js).
const DIRS = ['N', 'E', 'S', 'W'];
const DX = { N: 0, E: 1, S: 0, W: -1 };
const DY = { N: -1, E: 0, S: 1, W: 0 };
const LIMITE = 300; // evita travar se o circuito repetir demais

// estado = { slots: { idDoEspaco: 'andar' }, vezes: { idDoRepetir: 3 } }
// Espaços vazios são ignorados. Devolve uma lista de ações: acao | repetir | se
export function montarPrograma(circuito, estado) {
  const lista = (nos) => nos.flatMap((n) => {
    if (n.tipo === 'espaco') { const p = n.fixo || estado.slots[n.id]; return p ? [{ t: 'acao', peca: p, id: n.id }] : []; }
    if (n.tipo === 'repetir') return [{ t: 'repetir', id: n.id, n: estado.vezes[n.id] ?? n.inicial ?? 1, faz: lista(n.dentro) }];
    if (n.tipo === 'se') return [{ t: 'se', id: n.id, cond: n.cond, sim: lista(n.sim), nao: lista(n.nao) }];
    return [];
  });
  return lista(circuito);
}

// quantos espaços (sem peça fixa) ainda estão vazios
export function contarVazios(circuito, estado) {
  const conta = (nos) => nos.reduce((s, n) => {
    if (n.tipo === 'espaco') return s + (n.fixo || estado.slots[n.id] ? 0 : 1);
    if (n.tipo === 'repetir') return s + conta(n.dentro);
    if (n.tipo === 'se') return s + conta(n.sim) + conta(n.nao);
    return s;
  }, 0);
  return conta(circuito);
}

// fim: 'ok' | 'faltou' | 'vazio' | 'lava' | 'pedra' | 'parede' | 'limite'
// noFalha: id do espaço onde o Nexi parou (para destacar na tela)
export function simular(mundo, programa) {
  let { x, y, dir } = mundo.inicio;
  const chaves = mundo.estrelas.map(([a, b]) => a + ',' + b);
  const pegas = new Set(); const passos = [];
  let fim = null, noFalha = null, celulaFalha = null, acoes = 0;
  const tipo = (a, b) => {
    if (a < 0 || b < 0 || a >= mundo.w || b >= mundo.h) return 'parede';
    if (mundo.pedras.some(([p, q]) => p === a && q === b)) return 'pedra';
    if (mundo.lavas.some(([p, q]) => p === a && q === b)) return 'lava';
    return 'livre';
  };
  const frente = (k) => [x + DX[dir] * k, y + DY[dir] * k];
  const registrar = (id, peca) => {
    const c = x + ',' + y; if (chaves.includes(c)) pegas.add(c);
    passos.push({ x, y, dir, estrelasPegas: [...pegas], id, peca });
  };
  const pisar = (a, b, id, peca) => {
    const t = tipo(a, b);
    if (t !== 'livre') { fim = t; noFalha = id; celulaFalha = [a, b]; return; }
    x = a; y = b; registrar(id, peca);
  };
  const girar = (d, id, peca) => { dir = DIRS[(DIRS.indexOf(dir) + d + 4) % 4]; registrar(id, peca); };
  const agir = (peca, id) => {
    if (peca === 'andar') pisar(...frente(1), id, peca);
    else if (peca === 'pular') pisar(...frente(2), id, peca);
    else if (peca === 'virar_dir') girar(1, id, peca);
    else if (peca === 'virar_esq') girar(-1, id, peca);
  };
  const condicao = (c) => (c === 'obstaculo' ? tipo(...frente(1)) !== 'livre' : false);
  const rodar = (lista) => {
    for (const b of lista) {
      if (fim) return;
      if (++acoes > LIMITE) { fim = 'limite'; return; }
      if (b.t === 'acao') agir(b.peca, b.id);
      else if (b.t === 'repetir') { for (let i = 0; i < b.n && !fim; i++) rodar(b.faz); }
      else if (b.t === 'se') rodar(condicao(b.cond) ? b.sim : b.nao);
    }
  };
  rodar(programa);
  if (!fim) fim = programa.length === 0 ? 'vazio' : pegas.size === chaves.length ? 'ok' : 'faltou';
  return { fim, passos, estrelas: pegas.size, total: chaves.length, noFalha, celulaFalha };
}

// estado inicial do circuito de uma fase: nenhum espaço preenchido e cada REPETIR no valor inicial
export function estadoInicial(circuito) {
  const vezes = {};
  const varre = (nos) => nos.forEach((n) => {
    if (n.tipo === 'repetir') { vezes[n.id] = n.inicial ?? 1; varre(n.dentro); }
    if (n.tipo === 'se') { varre(n.sim); varre(n.nao); }
  });
  varre(circuito);
  return { slots: {}, vezes };
}
