import { useEffect } from 'react';
import { avaliarConquistas, CONQUISTAS } from '../data/conquistas';
import { useDadoPerfil } from './useDadoPerfil';
const idsValidos = (ids) => [...new Set((Array.isArray(ids) ? ids : []).filter((id) => CONQUISTAS.some((c) => c.id === id)))];
const normalizar = (v) => ({ ganhas: idsValidos(v?.ganhas), vistas: idsValidos(v?.vistas) });

export function useConquistas(contexto, perfil) {
  const [registro, setRegistro] = useDadoPerfil(perfil, 'conquistas', normalizar);
  const avaliadas = avaliarConquistas(contexto);
  const elegiveis = avaliadas.filter((c) => c.desbloqueada).map((c) => c.id);
  const faltantes = elegiveis.filter((id) => !registro.ganhas.includes(id));
  const assinatura = JSON.stringify(faltantes);
  useEffect(() => {
    if (faltantes.length) setRegistro((r) => ({ ...r, ganhas: [...new Set([...r.ganhas, ...faltantes])] }));
  }, [assinatura]); // só registra IDs ainda ausentes
  const lista = avaliadas.map((c) => ({ ...c, desbloqueada: registro.ganhas.includes(c.id) }));
  const novas = registro.ganhas.filter((id) => !registro.vistas.includes(id));
  const marcarVistas = () => setRegistro((r) => ({ ...r, vistas: [...new Set([...r.vistas, ...r.ganhas])] }));
  return { lista, novas, marcarVistas };
}
