let csrf = '';
export function csrfAtiva() { return Boolean(csrf); }
export function definirSessao(sessao) { csrf = sessao?.csrf || ''; }
export async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, { method, credentials: 'same-origin', signal: AbortSignal.timeout(15000), headers: {
      'Content-Type': 'application/json', 'X-Nexus-Request': '1', ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    }, ...(method !== 'GET' ? { body: JSON.stringify(body ?? {}) } : {}) });
  } catch { throw new Error('Servidor indisponível. Confira a conexão e tente novamente.'); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.erro || 'Não foi possível acessar o servidor.'); error.status = response.status; throw error; }
  return data;
}
