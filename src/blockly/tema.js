import * as Blockly from 'blockly';
import { INK, BLUE, PINK, GREEN } from '../theme/tokens';

// O Blockly escolhe texto branco nos blocos, então usamos cores escuras o bastante.
// Para mudar o visual dos blocos, mexa aqui.
export const temaNexus = Blockly.Theme.defineTheme('nexus', {
  name: 'nexus',
  base: Blockly.Themes.Classic,
  blockStyles: {
    nexus_inicio: { colourPrimary: INK, colourSecondary: '#2A3470', colourTertiary: INK, hat: 'cap' },
    nexus_mover: { colourPrimary: BLUE, colourSecondary: '#5A75FF', colourTertiary: INK },
    nexus_pular: { colourPrimary: '#E8590C', colourSecondary: '#F2813D', colourTertiary: INK },
    nexus_repetir: { colourPrimary: '#E0457B', colourSecondary: PINK, colourTertiary: INK },
    nexus_decisao: { colourPrimary: '#0E9A4A', colourSecondary: GREEN, colourTertiary: INK },
  },
  categoryStyles: {
    cat_mov: { colour: BLUE },
    cat_rep: { colour: '#E0457B' },
    cat_dec: { colour: '#0E9A4A' },
  },
  componentStyles: {
    workspaceBackgroundColour: '#E6EDFF',
    toolboxBackgroundColour: '#FFFFFF',
    toolboxForegroundColour: INK,
    flyoutBackgroundColour: '#FFF6B8',
    flyoutForegroundColour: INK,
    flyoutOpacity: 1,
    scrollbarColour: INK,
    scrollbarOpacity: 0.4,
    insertionMarkerColour: INK,
    insertionMarkerOpacity: 0.3,
    cursorColour: PINK,
  },
  fontStyle: { family: "Nunito, 'Trebuchet MS', sans-serif", weight: '800', size: 13 },
});
