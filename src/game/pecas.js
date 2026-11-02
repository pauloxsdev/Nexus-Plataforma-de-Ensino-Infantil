import { SUN, BLUE, GREEN, ORANGE, INK } from '../theme/tokens';

// Peças que a criança pode usar nos espaços do circuito.
// Para criar uma peça nova: 1) acrescente aqui, 2) trate em motor.js (função agir).
export const PECAS = {
  andar: { nome: 'Andar', sub: '1 casa para frente', cor: SUN, txt: INK, glifo: '→' },
  virar_dir: { nome: 'Virar à direita', sub: 'gira para a direita', cor: BLUE, txt: '#fff', glifo: '↻' },
  virar_esq: { nome: 'Virar à esquerda', sub: 'gira para a esquerda', cor: GREEN, txt: INK, glifo: '↺' },
  pular: { nome: 'Pular', sub: '2 casas, por cima de tudo', cor: ORANGE, txt: INK, glifo: '»' },
};
