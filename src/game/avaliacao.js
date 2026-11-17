// O tempo de leitura e exploração não reduz as recompensas.
// Preserva-se o melhor resultado já registrado de cada aluno.
export function avaliar(ideal, { passos, pecas }) {
  const poucos = passos <= ideal.passos;
  const compacto = pecas <= ideal.pecas;
  return { estrelas: 1 + Number(poucos) + Number(compacto), poucos, compacto, passos, pecas, ideal };
}
