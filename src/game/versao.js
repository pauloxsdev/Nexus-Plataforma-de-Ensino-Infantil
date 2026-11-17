// Mapa, estruturas e pontuação precisam acompanhar a tentativa até o servidor.
// Eventos antigos sem versão continuam na fila com seus IDs e conteúdos originais.
export const VERSAO_REGRAS = 2;
export const comVersaoAtual = estado => ({ ...estado, versaoRegras: VERSAO_REGRAS });
