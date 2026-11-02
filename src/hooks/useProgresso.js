import { useDadoPerfil } from './useDadoPerfil';

// Dados legados globais não têm dono conhecido e não são atribuídos a perfis.
function normalizar(valor) {
  if (Array.isArray(valor)) return Object.fromEntries(valor.map((id) => [id, 1]));
  return valor && typeof valor === 'object' ? valor : {};
}

export function useProgresso(total, perfil) {
  const [estrelas, setEstrelas] = useDadoPerfil(perfil, 'progresso', normalizar);
  const feitas = Object.keys(estrelas).map(Number);
  const totalEstrelas = Object.values(estrelas).reduce((s, n) => s + n, 0);
  const concluir = (id, n = 1) => setEstrelas((e) => ({ ...e, [id]: Math.max(e[id] || 0, n) }));
  const zerar = () => setEstrelas({});
  const liberarTodas = () => setEstrelas((e) => { // só para demonstração: deixa a última fase para jogar
    const novo = { ...e }; for (let i = 1; i < total; i++) novo[i] = novo[i] || 1; return novo;
  });
  let proximaId = total;
  for (let n = 1; n <= total; n++) if (!feitas.includes(n)) { proximaId = n; break; }
  return { estrelas, feitas, totalEstrelas, concluir, zerar, liberarTodas, proximaId };
}
