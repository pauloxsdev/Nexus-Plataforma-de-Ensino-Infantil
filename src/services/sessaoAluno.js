import { api } from './api';
import { chavePerfil } from './perfilLocal';
import { guardarLocal, pendentes, sincronizar } from './sincronizacao';
let serial = Promise.resolve();
let perfilAtivo = null;
export function encerrarPerfil() { perfilAtivo = null; }
let filaErro = null;
export function enfileirar(evento) {
  const operation = serial.then(() => guardarLocal(evento));
  serial = operation.catch(() => {});
  operation.then(() => { filaErro = null; window.dispatchEvent(new Event('nexus-fila')); }, () => { filaErro = new Error('Não foi possível salvar no aparelho.'); window.dispatchEvent(new Event('nexus-fila')); });
  return operation;
}
export function erroFila() { return filaErro; }
export function registrarDado(perfil, chave, valor) {
  if (perfil.id !== perfilAtivo || perfil.tipo !== 'aluno' || !(chave === 'avatar' || chave === 'conquistas' || chave.startsWith('circuito:'))) return;
  void enfileirar({ tipo: 'dado', perfil, chave, valor }).catch(() => {});
}
let sync = Promise.resolve();
export function enviarFila(perfil) {
  const current = sync.catch(() => {}).then(async () => {
    await serial;
    await sincronizar(({ enviado, criadoEm, ordem, ...evento }) => api('/aluno/eventos', { method: 'POST', body: evento }), perfil);
  });
  sync = current; return current;
}
export async function prepararAluno(sessao) {
  const perfil = { tipo: 'aluno', id: sessao.id };
  // A sessão autenticada é a única fonte de identidade. Nunca importar a demo.
  await enviarFila(perfil);
  const estado = await api('/aluno/estado');
  for (const dado of ['progresso', 'avatar', 'atividade', 'conquistas']) {
    const valor = estado.dados[dado] ?? (dado === 'atividade' ? [] : {});
    localStorage.setItem(chavePerfil(perfil, dado), JSON.stringify(valor));
  }
  for (const [dado, valor] of Object.entries(estado.dados)) {
    if (dado.startsWith('circuito:')) localStorage.setItem(chavePerfil(perfil, dado), JSON.stringify(valor));
  }
  perfilAtivo = perfil.id;
  return { ...sessao, perfil, rotulo: estado.rotulo, fuso: estado.fuso };
}
export { pendentes };
