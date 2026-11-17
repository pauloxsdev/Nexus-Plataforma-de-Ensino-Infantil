import { useCallback } from 'react';
import { estadoInicial, circuitoDaFase } from '../game/motor';
import { comVersaoAtual } from '../game/versao';
import { useDadoPerfil } from './useDadoPerfil';

export function restaurarCircuito(fase, salvo) {
  const circuito = circuitoDaFase(fase, salvo);
  const estado = estadoInicial(circuito);
  if (fase.alternativas?.some(a => a.id === salvo?.estrutura)) estado.estrutura = salvo.estrutura;
  const visitar = (nos) => nos.forEach((n) => {
    if (n.tipo === 'espaco' && !n.fixo && fase.pecas.includes(salvo?.slots?.[n.id])) {
      estado.slots[n.id] = salvo.slots[n.id];
    }
    if (n.tipo === 'repetir') {
      const quantidade = salvo?.vezes?.[n.id];
      if (Number.isInteger(quantidade)) estado.vezes[n.id] = Math.max(1, Math.min(n.max, quantidade));
      visitar(n.dentro);
    }
    if (n.tipo === 'se') { visitar(n.sim); visitar(n.nao); }
  });
  visitar(circuito);
  return comVersaoAtual(estado);
}

export function useCircuito(perfil, projetoId, fase) {
  if (typeof projetoId !== 'string' || !projetoId.trim()) throw new Error('Projeto do circuito obrigatório');
  const normalizar = useCallback((valor) => restaurarCircuito(fase, valor), [fase]);
  const [estado, alterar] = useDadoPerfil(perfil, `circuito:${encodeURIComponent(projetoId)}:fase:${fase.id}`, normalizar);
  // Apply the version when creating a new draft, never when draining old events.
  return [estado, proximo => alterar(anterior => normalizar(
    typeof proximo === 'function' ? proximo(anterior) : proximo
  ))];
}
