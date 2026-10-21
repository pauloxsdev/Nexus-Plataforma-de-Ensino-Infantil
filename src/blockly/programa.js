// Converte os blocos do Blockly em uma lista simples (sem usar eval).
// Só usa a API básica de bloco (type, getNextBlock, getInputTargetBlock, getFieldValue),
// então dá para testar com blocos de mentira.
function cadeia(bloco) {
  const lista = [];
  for (let b = bloco; b; b = b.getNextBlock()) {
    if (b.type === 'nexus_mover') lista.push({ t: 'mover' });
    else if (b.type === 'nexus_pular') lista.push({ t: 'pular' });
    else if (b.type === 'nexus_repetir') {
      lista.push({ t: 'repetir', n: Number(b.getFieldValue('VEZES')) || 1, faz: cadeia(b.getInputTargetBlock('FAZ')) });
    } else if (b.type === 'nexus_se_obstaculo') {
      lista.push({ t: 'se', sim: cadeia(b.getInputTargetBlock('SIM')), nao: cadeia(b.getInputTargetBlock('NAO')) });
    }
  }
  return lista;
}

// O programa começa no bloco "quando o Nexi começar".
export function paraPrograma(workspace) {
  const inicio = workspace.getTopBlocks(true).find((b) => b.type === 'nexus_inicio');
  return inicio ? cadeia(inicio.getNextBlock()) : [];
}
