// Namespace local não é autenticação. IDs reais devem vir da sessão do servidor.
export const PERFIL_DEMO = { tipo: 'demo', id: 'local' };

export function chavePerfil(perfil, dado) {
  if (!perfil || !['demo', 'aluno'].includes(perfil.tipo) || typeof perfil.id !== 'string' || !perfil.id.trim()) {
    throw new Error('Perfil local inválido');
  }
  return `nexus:v2:${perfil.tipo}:${encodeURIComponent(perfil.id)}:${dado}`;
}

export function lerPerfil(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor ?? padrao;
  } catch { return padrao; }
}
