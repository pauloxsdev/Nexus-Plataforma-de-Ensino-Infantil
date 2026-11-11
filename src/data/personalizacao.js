import catalogo from './personalizacao.json';
import { FASES } from './fases';
export { catalogo };
export function resumoProgresso(estrelas = {}) {
  const valores = FASES.map(f => estrelas[f.id]).filter(n => Number.isInteger(n) && n >= 1 && n <= 3);
  return { fases: valores.length, estrelas: valores.reduce((a, b) => a + b, 0), total: FASES.length };
}
export function liberado(item, progresso) {
  return progresso.fases >= (item.fases || 0) && progresso.estrelas >= (item.estrelas || 0)
    && (!item.trilha || progresso.fases === progresso.total)
    && (!item.perfeita || progresso.estrelas === progresso.total * 3);
}
export function requisito(item) {
  if (item.perfeita) return 'Ganhe 3 estrelas em todas as fases';
  if (item.trilha) return 'Conclua toda a trilha';
  if (item.estrelas) return `Junte ${item.estrelas} estrelas`;
  if (item.fases) return `Conclua ${item.fases} ${item.fases === 1 ? 'fase' : 'fases'}`;
  return 'Disponível desde o início';
}
export function avatarDisponivel(avatar, progresso) {
  return Object.fromEntries(Object.entries(catalogo).map(([parte, itens]) => [parte,
    itens.find(i => i.id === avatar?.[parte] && liberado(i, progresso))?.id ?? itens[0].id]));
}
export function colecao(progresso) {
  const todos = Object.values(catalogo).flat();
  return { total: todos.length, livres: todos.filter(i => liberado(i, progresso)).length };
}
