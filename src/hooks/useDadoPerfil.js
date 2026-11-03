import { useEffect, useMemo, useRef, useState } from 'react';
import { registrarDado } from '../services/sessaoAluno';
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
  const atual = useRef({ chave, valor });
  atual.current = { chave, valor };
  const alterar = (proximo) => {
    const novo = typeof proximo === 'function' ? proximo(atual.current.valor) : proximo;
    atual.current = { chave, valor: novo };
    setEstado(atual.current);
    registrarDado(perfil, dado, novo);
  };
  return [valor, alterar];
}
