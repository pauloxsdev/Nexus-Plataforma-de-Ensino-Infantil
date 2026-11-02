// Quantas estrelas a criança ganha em uma fase (de 1 a 3):
//   1ª  completou a fase
//   2ª  usou poucos passos (passos do Nexi <= ideal.passos)
//   3ª  terminou rápido (segundos <= ideal.segundos)
// O tempo conta desde que a criança fecha a missão até apertar Executar com a resposta certa.
// ideal = { passos, segundos } vem de cada fase em data/fases.js
export function avaliar(ideal, { passos, segundos }) {
  const poucos = passos <= ideal.passos;
  const rapido = segundos <= ideal.segundos;
  return { estrelas: 1 + (poucos ? 1 : 0) + (rapido ? 1 : 0), poucos, rapido, passos, segundos, ideal };
}
