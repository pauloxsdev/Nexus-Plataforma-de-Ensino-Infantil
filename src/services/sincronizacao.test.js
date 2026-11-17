import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openDB } from 'idb';
import { guardarLocal, pendentes, sincronizar } from './sincronizacao';

beforeEach(async () => {
  const d = await openDB('nexus', 1, { upgrade(db) { db.createObjectStore('progresso', { keyPath: 'id' }); } });
  await d.clear('progresso');
  d.close();
});

describe('fila persistente de sincronização', () => {
  it('persiste os dados e mantém o ID em novas leituras', async () => {
    const evento = { tipo: 'fase_concluida', codigo: 'A1B2C', faseId: 1, estrelas: 3 };
    const id = await guardarLocal(evento);
    expect(await pendentes()).toEqual([expect.objectContaining({ ...evento, id, enviado: false })]);
    expect((await pendentes())[0].id).toBe(id);
  });
  it('não duplica nem sobrescreve um evento com o mesmo ID', async () => {
    await guardarLocal({ id: 'evento-1', estrelas: 3 });
    await guardarLocal({ id: 'evento-1', estrelas: 1 });
    expect(await pendentes()).toEqual([expect.objectContaining({ id: 'evento-1', estrelas: 3 })]);
  });
  it('preserva a fila quando não existe transporte ou a rede falha', async () => {
    await guardarLocal({ id: 'evento-1' });
    await expect(sincronizar()).rejects.toThrow('indisponível');
    await expect(sincronizar(async () => { throw new Error('offline'); })).rejects.toThrow('offline');
    expect(await pendentes()).toHaveLength(1);
  });
  it.each([undefined, { confirmado: false, id: 'evento-1' }, { confirmado: true, id: 'outro' }])('não aceita confirmação inválida %j', async (resposta) => {
    await guardarLocal({ id: 'evento-1' });
    await expect(sincronizar(async () => resposta)).rejects.toThrow('sem confirmação');
    expect(await pendentes()).toHaveLength(1);
  });
  it('só confirma os eventos aceitos e retenta os restantes com o mesmo ID', async () => {
    await guardarLocal({ id: 'a' });
    await guardarLocal({ id: 'b' });
    await expect(sincronizar(async (e) => {
      if (e.id === 'b') throw new Error('offline');
      return { confirmado: true, id: e.id };
    })).rejects.toThrow('offline');
    expect((await pendentes()).map((e) => e.id)).toEqual(['b']);
    const enviar = vi.fn(async (e) => ({ confirmado: true, id: e.id }));
    await sincronizar(enviar);
    expect(enviar).toHaveBeenCalledTimes(1);
    expect(enviar.mock.calls[0][0].id).toBe('b');
    expect(await pendentes()).toEqual([]);
    await guardarLocal({ id: 'b' });
    expect(await pendentes()).toEqual([]);
  });
});

it('envia somente a identidade selecionada e preserva demo, outro aluno e eventos legados', async () => {
  const a = { tipo: 'aluno', id: 'aluno-a' }, b = { tipo: 'aluno', id: 'aluno-b' };
  await guardarLocal({ id: 'a', perfil: a });
  await guardarLocal({ id: 'b', perfil: b });
  await guardarLocal({ id: 'demo', perfil: { tipo: 'demo', id: 'local' } });
  await guardarLocal({ id: 'legado' });
  const enviar = vi.fn(async (e) => ({ confirmado: true, id: e.id }));
  await sincronizar(enviar, a);
  expect(enviar.mock.calls.map(([e]) => e.id)).toEqual(['a']);
  expect(await pendentes(a)).toEqual([]);
  expect((await pendentes()).map(e => e.id).sort()).toEqual(['b', 'demo', 'legado']);
});

it('mantém a ordem de criação das tentativas, não a ordem alfabética dos IDs', async () => {
  const perfil = { tipo: 'aluno', id: 'aluno' };
  await guardarLocal({ id: 'z', perfil });
  await guardarLocal({ id: 'a', perfil });
  const enviados = [];
  await sincronizar(async e => { enviados.push(e.id); return { confirmado: true, id: e.id }; }, perfil);
  expect(enviados).toEqual(['z', 'a']);
});

it('preserva versões e payloads de filas antigas e novas ao retentar o envio', async () => {
  const perfil = { tipo: 'aluno', id: 'a' };
  const antigo = { id: 'antigo', tipo: 'tentativa', perfil, faseId: 6, estado: { slots: { a: 'pular', b: 'andar' }, vezes: { r: 2 } } };
  const novo = { ...antigo, id: 'novo', estado: { ...antigo.estado, vezes: { r: 3 }, versaoRegras: 2 } };
  await guardarLocal(antigo); await guardarLocal(novo);
  const antes = await pendentes(perfil);
  await expect(sincronizar(async () => { throw new Error('conexão interrompida'); }, perfil)).rejects.toThrow('interrompida');
  expect(await pendentes(perfil)).toEqual(antes);
  const recebidos = [];
  await sincronizar(async evento => { recebidos.push(evento); return { confirmado: true, id: evento.id }; }, perfil);
  expect(recebidos.map(e => e.estado)).toEqual([antigo.estado, novo.estado]);
  expect(recebidos.map(e => e.id)).toEqual(['antigo', 'novo']);
  expect(await pendentes(perfil)).toEqual([]);
});
