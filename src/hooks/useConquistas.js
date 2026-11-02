import { useMemo, useState } from 'react';
import { avaliarConquistas } from '../data/conquistas';

// Calcula as conquistas a partir do progresso. "novas" = conquistadas que a criança ainda não viu.
const CHAVE = 'nexus:conquistas-vistas';
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; } };

export function useConquistas(contexto) {
  const chave = JSON.stringify(contexto);
  const lista = useMemo(() => avaliarConquistas(contexto), [chave]); // eslint-disable-line react-hooks/exhaustive-deps
  const [vistas, setVistas] = useState(ler);
  const conquistadas = lista.filter((x) => x.desbloqueada).map((x) => x.id);
  const novas = conquistadas.filter((id) => !vistas.includes(id));
  const marcarVistas = () => {
    const todas = [...new Set([...vistas, ...conquistadas])];
    setVistas(todas);
    try { localStorage.setItem(CHAVE, JSON.stringify(todas)); } catch { /* ignora */ }
  };
  return { lista, novas, marcarVistas };
}
