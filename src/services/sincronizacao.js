import { openDB } from 'idb';

// A fila é persistente. Só um transporte conectado a uma API com confirmação
// explícita pode marcar um evento como enviado; estar online não basta.
const db = () => openDB('nexus', 1, { upgrade(d) { d.createObjectStore('progresso', { keyPath: 'id' }); } });

export async function guardarLocal(evento) {
  const d = await db();
  const id = evento.id ?? crypto.randomUUID();
  const tx = d.transaction('progresso', 'readwrite');
  if (!(await tx.store.get(id))) {
    await tx.store.put({ ...evento, id, enviado: false, criadoEm: Date.now() });
  }
  await tx.done;
  return id;
}
export async function pendentes() {
  return (await (await db()).getAll('progresso')).filter((e) => !e.enviado);
}
// enviar(evento) deve resolver com { confirmado: true, id: evento.id }
// somente após confirmação do servidor. Falhas preservam o evento e seu ID.
export async function sincronizar(enviar) {
  if (typeof enviar !== 'function') throw new Error('Transporte de sincronização indisponível');
  const d = await db();
  for (const e of await pendentes()) {
    const resposta = await enviar(e);
    if (resposta?.confirmado !== true || resposta.id !== e.id) {
      throw new Error('Envio sem confirmação do servidor');
    }
    await d.put('progresso', { ...e, enviado: true });
  }
}
