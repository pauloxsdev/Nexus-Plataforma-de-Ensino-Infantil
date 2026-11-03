import { useEffect, useState } from 'react';
import { SUN } from '../theme/tokens';
import { PERFIL_DEMO } from '../services/perfilLocal';
import { enfileirar, enviarFila, pendentes, erroFila } from '../services/sessaoAluno';

export function useConexao(perfil = PERFIL_DEMO) {
  const [net, setNet] = useState(() => ({ on: navigator.onLine, pending: 0, saving: false, error: '', loaded: false }));
  useEffect(() => {
    let ativo = true, running = false;
    const atualizar = async () => {
      if (running) return; running = true;
      let error = '';
      try { if (perfil.tipo === 'aluno' && navigator.onLine) await enviarFila(perfil); } catch (e) { error = e.message; }
      try { const fila = await pendentes(perfil); if (ativo) setNet({ on: navigator.onLine, pending: fila.length, saving: false, error: erroFila()?.message || error, loaded: true }); }
      catch { if (ativo) setNet(n => ({ ...n, error: 'Não foi possível ler os dados locais.', loaded: true })); }
      running = false;
    };
    const offline = () => setNet(n => ({ ...n, on: false }));
    void atualizar(); const timer = setInterval(atualizar, 15000);
    window.addEventListener('online', atualizar); window.addEventListener('offline', offline); window.addEventListener('nexus-fila', atualizar);
    return () => { ativo = false; clearInterval(timer); window.removeEventListener('online', atualizar); window.removeEventListener('offline', offline); window.removeEventListener('nexus-fila', atualizar); };
  }, [perfil.tipo, perfil.id]);
  const save = async evento => { try { await enfileirar(evento); return true; } catch { return false; } };
  const texto = net.error ? `Sincronização pendente: ${net.error}` : !net.loaded ? 'Verificando dados...' : perfil.tipo === 'demo' ? 'Demonstração: salvo neste aparelho' : net.pending ? `${net.pending} alterações aguardando envio` : net.on ? 'Alterações confirmadas pelo servidor' : 'Offline: alterações serão salvas no aparelho';
  return { net, save, chip: ['cloud', SUN, texto] };
}
