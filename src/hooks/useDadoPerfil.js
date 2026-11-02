import { useEffect, useMemo, useState } from 'react';
import { chavePerfil, lerPerfil } from '../services/perfilLocal';

// Ao trocar de perfil, nunca renderizar nem persistir o estado do perfil anterior.
export function useDadoPerfil(perfil, dado, normalizar) {
  const chave = chavePerfil(perfil, dado);
  const inicial = useMemo(() => normalizar(lerPerfil(chave, null)), [chave, normalizar]);
  const [estado, setEstado] = useState(() => ({ chave, valor: inicial }));
  const valor = estado.chave === chave ? estado.valor : inicial;
  useEffect(() => {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* permite uso em memória */ }
  }, [chave, valor]);
  const alterar = (proximo) => setEstado((anterior) => {
    const atual = anterior.chave === chave ? anterior.valor : inicial;
    return { chave, valor: typeof proximo === 'function' ? proximo(atual) : proximo };
  });
  return [valor, alterar];
}
