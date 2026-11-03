// Datas civis do navegador: não converter a data de atividade por toISOString.
export function dataLocal(data = new Date(), fuso) {
  if (fuso) { const partes = new Intl.DateTimeFormat('en-CA', { timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(data); const p = Object.fromEntries(partes.map(v => [v.type, v.value])); return `${p.year}-${p.month}-${p.day}`; }
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}
export function deslocarDia(chave, quantidade) {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return dataLocal(new Date(ano, mes - 1, dia + quantidade, 12));
}
export function normalizarDias(valor) {
  return [...new Set((Array.isArray(valor) ? valor : []).filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && deslocarDia(d, 0) === d))].sort();
}
export function resumirAtividade(dias, hoje = dataLocal()) {
  const validos = normalizarDias(dias).filter((dia) => dia <= hoje);
  const conjunto = new Set(validos);
  let cursor = conjunto.has(hoje) ? hoje : deslocarDia(hoje, -1);
  let consecutivos = 0;
  while (conjunto.has(cursor)) { consecutivos++; cursor = deslocarDia(cursor, -1); }
  return { acumulados: validos.length, consecutivos, hoje, ultimosDias: Array.from({ length: 7 }, (_, i) => {
    const data = deslocarDia(hoje, i - 6);
    return { data, ativo: conjunto.has(data) };
  }) };
}
export function temAcao(programa) {
  return programa.some((p) => p.t === 'acao' || (p.t === 'repetir' && temAcao(p.faz)) || (p.t === 'se' && (temAcao(p.sim) || temAcao(p.nao))));
}
