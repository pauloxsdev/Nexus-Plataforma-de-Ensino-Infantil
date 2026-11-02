import { useState, useEffect } from 'react';

// Progresso: { [numeroDaFase]: melhorQuantidadeDeEstrelas (1 a 3) }. Fica salvo no aparelho (localStorage).
// App registra as conclusões na fila IndexedDB; envio depende de uma API disponível.
const CHAVE = 'nexus:progresso';

function ler() {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE));
    if (Array.isArray(v)) return Object.fromEntries(v.map((id) => [id, 1])); // formato antigo
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export function useProgresso(total) {
  const [estrelas, setEstrelas] = useState(ler);
  useEffect(() => { try { localStorage.setItem(CHAVE, JSON.stringify(estrelas)); } catch { /* ignora */ } }, [estrelas]);
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
