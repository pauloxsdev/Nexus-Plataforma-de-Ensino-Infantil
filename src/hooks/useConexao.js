import { useEffect, useState } from 'react';
import { SUN } from '../theme/tokens';
import { guardarLocal, pendentes } from '../services/sincronizacao';

// navigator.onLine informa a rede do navegador, não a disponibilidade de uma API.
export function useConexao() {
  const [net, setNet] = useState(() => ({ on: navigator.onLine, pending: 0, saving: false, error: false, loaded: false }));
  useEffect(() => {
    let ativo = true;
    const atualizar = () => setNet((n) => ({ ...n, on: navigator.onLine }));
    window.addEventListener('online', atualizar);
    window.addEventListener('offline', atualizar);
    pendentes().then((fila) => { if (ativo) setNet((n) => ({ ...n, pending: fila.length, loaded: true })); })
      .catch(() => { if (ativo) setNet((n) => ({ ...n, error: true, loaded: true })); });
    return () => { ativo = false; window.removeEventListener('online', atualizar); window.removeEventListener('offline', atualizar); };
  }, []);
  const save = async (evento) => {
    setNet((n) => ({ ...n, saving: true }));
    try {
      await guardarLocal(evento);
      const fila = await pendentes();
      setNet((n) => ({ ...n, pending: fila.length, saving: false, error: false, loaded: true }));
      return true;
    } catch {
      setNet((n) => ({ ...n, saving: false, error: true, loaded: true }));
      return false;
    }
  };
  const texto = net.error ? 'Não foi possível salvar no aparelho'
    : !net.loaded ? 'Verificando dados locais...'
    : net.saving ? 'Salvando no aparelho...'
    : net.pending ? `Salvo no aparelho (${net.pending}); envio indisponível`
    : 'Envio ao servidor indisponível';
  return { net, save, chip: ['cloud', SUN, texto] };
}
