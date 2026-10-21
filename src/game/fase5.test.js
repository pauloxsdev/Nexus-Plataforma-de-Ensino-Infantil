import { describe, it, expect } from 'vitest';
import { simular } from './fase5';
import { paraPrograma } from '../blockly/programa';

// bloco de mentira com a mesma API do Blockly (só para testar a conversão)
const B = (type, o = {}) => {
  const b = { type, next: null, inputs: o.inputs || {}, fields: o.fields || {},
    getNextBlock() { return this.next; }, getInputTargetBlock(n) { return this.inputs[n] || null; }, getFieldValue(n) { return this.fields[n]; } };
  return b;
};
const encadeia = (...bs) => { bs.reduce((a, b) => { a.next = b; return b; }); return bs[0]; };
const ws = (...topo) => ({ getTopBlocks: () => topo });

const solucao = [{ t: 'repetir', n: 3, faz: [{ t: 'se', sim: [{ t: 'pular' }], nao: [{ t: 'mover' }] }] }];

describe('simular (fase 5)', () => {
  it('3 repetições de "se obstáculo: pular, senão: andar" pegam as 3 estrelas', () => {
    expect(simular(solucao)).toMatchObject({ fim: 'ok', estrelas: 3 });
  });
  it('2 repetições pegam só 2 estrelas', () => {
    const r = simular([{ ...solucao[0], n: 2 }]);
    expect(r.fim).toBe('try'); expect(r.estrelas).toBe(2);
  });
  it('andar com lava na frente para na lava', () => {
    expect(simular([{ t: 'mover' }]).fim).toBe('lava');
  });
  it('programa vazio', () => { expect(simular([]).fim).toBe('vazio'); });
  it('pular, andar, andar também resolve', () => {
    expect(simular([{ t: 'pular' }, { t: 'mover' }, { t: 'mover' }]).fim).toBe('ok');
  });
  it('repetições demais param no limite', () => {
    const loop = { t: 'repetir', n: 6, faz: [{ t: 'repetir', n: 6, faz: [{ t: 'repetir', n: 6, faz: [{ t: 'pular' }] }] }] };
    // pular sem lava na frente nunca coleta tudo, mas deve terminar sem travar
    expect(['limite', 'try', 'ok']).toContain(simular([loop]).fim);
  });
});

describe('paraPrograma (blocos -> lista)', () => {
  it('converte repetir + se/senão', () => {
    const se = B('nexus_se_obstaculo', { inputs: { SIM: B('nexus_pular'), NAO: B('nexus_mover') } });
    const rep = B('nexus_repetir', { fields: { VEZES: 3 }, inputs: { FAZ: se } });
    const inicio = encadeia(B('nexus_inicio'), rep);
    expect(paraPrograma(ws(inicio))).toEqual(solucao);
  });
  it('sem bloco de início devolve lista vazia', () => {
    expect(paraPrograma(ws(B('nexus_mover')))).toEqual([]);
  });
});
