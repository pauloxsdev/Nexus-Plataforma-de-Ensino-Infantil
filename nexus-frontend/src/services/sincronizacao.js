import { openDB } from 'idb';

// ESQUELETO da sincronização offline-first (ainda NÃO está ligado às telas).
// Ideia: toda ação do aluno é gravada no IndexedDB e enviada à API Java quando houver internet.
// Importante: enviar sempre com um id único do evento, para a API ignorar repetições (idempotência).
const db = () => openDB('nexus', 1, { upgrade(d) { d.createObjectStore('progresso', { keyPath: 'id' }); } });

export async function guardarLocal(evento) {
  await (await db()).put('progresso', { ...evento, id: evento.id ?? crypto.randomUUID(), enviado: false, criadoEm: Date.now() });
}
export async function pendentes() {
  return (await (await db()).getAll('progresso')).filter((e) => !e.enviado);
}
// enviar: função que faz o POST na API (ex.: POST /sync) e devolve uma Promise.
export async function sincronizar(enviar) {
  const d = await db();
  for (const e of await pendentes()) { await enviar(e); await d.put('progresso', { ...e, enviado: true }); }
}
