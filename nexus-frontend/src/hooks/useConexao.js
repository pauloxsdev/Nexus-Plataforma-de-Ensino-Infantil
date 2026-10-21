import { useState } from 'react';
import { SUN, GREEN } from '../theme/tokens';

// Estado de conexão do app. Hoje é SIMULADO (botão "Internet" no topo).
// TODO: trocar por navigator.onLine + eventos online/offline e ligar em services/sincronizacao.js
export function useConexao() {
  const [net, setNet] = useState({ on: true, pending: 0, sync: false });
  const save = () => setNet((n) => (n.on ? n : { ...n, pending: n.pending + 1 }));
  const toggle = () => {
    if (net.on) { setNet({ ...net, on: false }); return; }
    const enviando = net.pending > 0;
    setNet({ on: true, pending: 0, sync: enviando });
    if (enviando) setTimeout(() => setNet((n) => ({ ...n, sync: false })), 1800);
  };
  const chip = !net.on
    ? ['cloud', SUN, 'Salvo no aparelho' + (net.pending ? ` (${net.pending} para enviar)` : '')]
    : net.sync ? ['cloud', '#fff', 'Enviando...'] : ['check', GREEN, 'Tudo enviado'];
  return { net, save, toggle, chip };
}
