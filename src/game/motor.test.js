import { describe, it, expect } from 'vitest';
import { FASES } from '../data/fases';
import { montarPrograma, simular, contarVazios } from './motor';
import { avaliar } from './avaliacao';

const roda = (id, slots = {}, vezes = {}) => {
  const f = FASES.find((x) => x.id === id);
  const estado = { slots, vezes };
  return simular(f.mundo, montarPrograma(f.circuito, estado));
};

describe('fases: a solução certa vence e as erradas não', () => {
  it('1: andar 3 vezes', () => {
    expect(roda(1, { a: 'andar', b: 'andar', c: 'andar' }).fim).toBe('ok');
    expect(roda(1, { a: 'andar', b: 'andar' }).fim).toBe('faltou');
    expect(roda(1).fim).toBe('vazio');
  });
  it('2: andar, andar, virar à direita, andar, andar', () => {
    expect(roda(2, { a: 'andar', b: 'andar', c: 'virar_dir', d: 'andar', e: 'andar' }).fim).toBe('ok');
    expect(roda(2, { a: 'virar_dir', b: 'andar', c: 'andar', d: 'andar', e: 'andar' }).fim).toBe('parede');
  });
  it('3: pular a pedra', () => {
    expect(roda(3, { a: 'pular', b: 'andar' }).fim).toBe('ok');
    const r = roda(3, { a: 'andar', b: 'pular', c: 'andar' });
    expect(r.fim).toBe('pedra'); expect(r.noFalha).toBe('a');
  });
  it('4: repetir andar 4 vezes', () => {
    expect(roda(4, { a: 'andar' }, { r: 4 }).fim).toBe('ok');
    expect(roda(4, { a: 'andar' }, { r: 3 }).fim).toBe('faltou');
    expect(roda(4, { a: 'andar' }, { r: 6 }).fim).toBe('parede');
  });
  it('5: a escada', () => {
    const s = { a: 'andar', b: 'virar_esq', c: 'andar', d: 'virar_dir' };
    expect(roda(5, s, { r: 3 }).fim).toBe('ok');
    expect(roda(5, s, { r: 2 }).fim).toBe('faltou');
    expect(roda(5, { a: 'andar', b: 'andar', c: 'virar_esq', d: 'virar_dir' }, { r: 3 }).fim).not.toBe('ok');
  });
  it('6: lava → pular, senão andar', () => {
    const s = { a: 'pular', b: 'andar' };
    expect(roda(6, s, { r: 2 }).fim).toBe('ok');
    expect(roda(6, s, { r: 1 }).fim).toBe('faltou');
    expect(roda(6, s, { r: 3 }).fim).toBe('parede');
    expect(roda(6, { a: 'andar', b: 'andar' }, { r: 2 }).fim).toBe('lava');
  });
  it('7: seguir a parede', () => {
    const s = { a: 'virar_dir', b: 'andar' };
    for (const n of [8, 9, 10]) expect(roda(7, s, { r: n }).fim).toBe('ok');
    expect(roda(7, s, { r: 7 }).fim).toBe('faltou');
    expect(roda(7, { a: 'virar_esq', b: 'andar' }, { r: 10 }).fim).toBe('faltou');
  });
  it('8: a mesma regra em outro mapa', () => {
    const s = { a: 'virar_dir', b: 'andar' };
    for (const n of [10, 11, 12]) expect(roda(8, s, { r: n }).fim).toBe('ok');
    expect(roda(8, s, { r: 9 }).fim).toBe('faltou');
  });
  it('conta espaços vazios', () => {
    const f = FASES[0]; expect(contarVazios(f.circuito, { slots: { a: 'andar' }, vezes: {} })).toBe(4);
  });
  it('metas de passos (estrela extra)', () => {
    const ok = (id, slots, vezes) => roda(id, slots, vezes).passos.length;
    expect(ok(1, { a: 'andar', b: 'andar', c: 'andar' })).toBe(3);
    expect(ok(1, { a: 'andar', b: 'andar', c: 'andar', d: 'andar' })).toBe(4);
    expect(roda(1, { a: 'andar', b: 'andar', c: 'andar', d: 'andar', e: 'andar' }).fim).toBe('parede');
    expect(ok(2, { a: 'andar', b: 'andar', c: 'virar_dir', d: 'andar', e: 'andar' })).toBe(5);
    expect(ok(3, { a: 'pular', b: 'andar' })).toBe(2);
    expect(ok(4, { a: 'andar' }, { r: 4 })).toBe(4);
    expect(ok(5, { a: 'andar', b: 'virar_esq', c: 'andar', d: 'virar_dir' }, { r: 3 })).toBe(12);
    expect(ok(6, { a: 'pular', b: 'andar' }, { r: 2 })).toBe(2);
    expect(ok(7, { a: 'virar_dir', b: 'andar' }, { r: 8 })).toBe(8);
    expect(ok(8, { a: 'virar_dir', b: 'andar' }, { r: 10 })).toBe(10);
  });
  it('todas as fases têm meta (ideal) coerente', () => {
    for (const f of FASES) { expect(f.ideal.passos > 0).toBe(true); expect(f.ideal.segundos > 0).toBe(true); }
  });
  it('a casa onde o Nexi falhou vem na resposta', () => {
    expect(roda(3, { a: 'andar' }).celulaFalha).toEqual([1, 1]);
  });
});

describe('avaliar (estrelas)', () => {
  const ideal = { passos: 3, segundos: 45 };
  it('3 estrelas: poucos passos e rápido', () => { expect(avaliar(ideal, { passos: 3, segundos: 30 }).estrelas).toBe(3); });
  it('2 estrelas: só poucos passos ou só rápido', () => {
    expect(avaliar(ideal, { passos: 3, segundos: 90 }).estrelas).toBe(2);
    expect(avaliar(ideal, { passos: 5, segundos: 20 }).estrelas).toBe(2);
  });
  it('1 estrela: completou, mas com mais passos e mais tempo', () => { expect(avaliar(ideal, { passos: 6, segundos: 120 }).estrelas).toBe(1); });
});
