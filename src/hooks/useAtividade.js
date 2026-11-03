import { useEffect, useState } from 'react';
import { useDadoPerfil } from './useDadoPerfil';
import { dataLocal, normalizarDias, resumirAtividade } from '../services/atividade';

export function useAtividade(perfil, fuso) {
  const [dias, setDias] = useDadoPerfil(perfil, 'atividade', normalizarDias);
  const [hoje, setHoje] = useState(() => dataLocal(new Date(), fuso));
  useEffect(() => {
    const atualizar = () => setHoje(dataLocal(new Date(), fuso));
    const timer = setInterval(atualizar, 30000);
    window.addEventListener('focus', atualizar);
    document.addEventListener('visibilitychange', atualizar);
    return () => { clearInterval(timer); window.removeEventListener('focus', atualizar); document.removeEventListener('visibilitychange', atualizar); };
  }, [fuso]);
  const registrar = () => {
    const dia = dataLocal(new Date(), fuso);
    setHoje(dia);
    setDias((atuais) => atuais.includes(dia) ? atuais : [...atuais, dia].sort());
  };
  return { ...resumirAtividade(dias, hoje), registrar };
}
