import { useCallback, useState } from 'react';
import { useDadoPerfil } from './useDadoPerfil';

export function progressoValido(valor, fases) {
  const entrada = Array.isArray(valor) ? Object.fromEntries(valor.map((id) => [id, 1])) : valor;
  return Object.fromEntries(fases.filter((f) => Number.isInteger(entrada?.[f.id]) && entrada[f.id] >= 1 && entrada[f.id] <= 3).map((f) => [f.id, entrada[f.id]]));
}
export function useProgresso(fases, perfil) {
  const normalizar = useCallback((v) => progressoValido(v, fases), [fases]);
  const [salvas, setEstrelas] = useDadoPerfil(perfil, 'progresso', normalizar);
  const [liberado, setLiberado] = useState(null);
  const perfilId = JSON.stringify(perfil);
  const estrelas = progressoValido(salvas, fases);
  const feitas = fases.filter((f) => estrelas[f.id]).map((f) => f.id);
  const totalEstrelas = Object.values(estrelas).reduce((s, n) => s + n, 0);
  const concluir = (id, n = 1) => {
    if (!fases.some((f) => f.id === id) || !Number.isInteger(n) || n < 1 || n > 3) return;
    setEstrelas((e) => ({ ...e, [id]: Math.max(e[id] || 0, n) }));
  };
  const zerar = () => { setEstrelas({}); setLiberado(null); };
  // Liberação temporária para experimentar, sem fabricar conclusões ou estrelas.
  const liberarTodas = () => { if (perfil.tipo === 'demo') setLiberado(perfilId); };
  const proximaId = fases.find((f) => !feitas.includes(f.id))?.id ?? fases.at(-1)?.id;
  return { estrelas, feitas, totalEstrelas, concluir, zerar, liberarTodas, demoLiberada: liberado === perfilId, proximaId, totalFases: fases.length, restantes: fases.length - feitas.length };
}
