import * as Blockly from 'blockly';

// Definição dos blocos do Nexus (formato JSON do Blockly).
// Para criar um bloco novo: 1) acrescente aqui, 2) coloque no TOOLBOX abaixo,
// 3) trate o bloco em programa.js e em game/fase5.js.
export const BLOCOS = [
  { type: 'nexus_inicio', message0: 'quando o Nexi começar', nextStatement: null, style: 'nexus_inicio', tooltip: 'O programa começa aqui.' },
  { type: 'nexus_mover', message0: 'andar 1 passo', previousStatement: null, nextStatement: null, style: 'nexus_mover', tooltip: 'O Nexi anda uma casa.' },
  { type: 'nexus_pular', message0: 'pular', previousStatement: null, nextStatement: null, style: 'nexus_pular', tooltip: 'O Nexi pula duas casas e passa por cima da lava.' },
  {
    type: 'nexus_repetir', message0: 'repetir %1 vezes %2',
    args0: [{ type: 'field_number', name: 'VEZES', value: 2, min: 1, max: 6, precision: 1 }, { type: 'input_statement', name: 'FAZ' }],
    previousStatement: null, nextStatement: null, style: 'nexus_repetir', tooltip: 'Repete os blocos de dentro.',
  },
  {
    type: 'nexus_se_obstaculo', message0: 'se tem obstáculo à frente %1', args0: [{ type: 'input_statement', name: 'SIM' }],
    message1: 'senão %1', args1: [{ type: 'input_statement', name: 'NAO' }],
    previousStatement: null, nextStatement: null, style: 'nexus_decisao', tooltip: 'Faz uma coisa se tiver lava na frente e outra se não tiver.',
  },
];

export const TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    { kind: 'category', name: 'Movimentos', categorystyle: 'cat_mov', contents: [{ kind: 'block', type: 'nexus_mover' }, { kind: 'block', type: 'nexus_pular' }] },
    { kind: 'category', name: 'Repetição', categorystyle: 'cat_rep', contents: [{ kind: 'block', type: 'nexus_repetir' }] },
    { kind: 'category', name: 'Decisões', categorystyle: 'cat_dec', contents: [{ kind: 'block', type: 'nexus_se_obstaculo' }] },
  ],
};

// Área de trabalho inicial: só o bloco azul "quando o Nexi começar" (não pode ser apagado).
export const ESTADO_INICIAL = {
  blocks: { languageVersion: 0, blocks: [{ type: 'nexus_inicio', x: 24, y: 24, deletable: false }] },
};

let registrado = false;
export function registrarBlocos() {
  if (registrado) return;
  Blockly.common.defineBlocksWithJsonArray(BLOCOS);
  registrado = true;
}

export function reiniciar(workspace) {
  Blockly.serialization.workspaces.load(ESTADO_INICIAL, workspace);
}
