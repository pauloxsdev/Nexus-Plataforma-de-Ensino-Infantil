import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';

const WorkspaceAluno = () => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    // Inicializa a área lúdica de blocos do Google Blockly
    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: `
        <xml>
          <block type="controls_if"></block>
          <block type="logic_compare"></block>
          <block type="math_number"></block>
          <block type="text"></block>
          <block type="text_print"></block>
        </xml>
      `,
      trashcan: true,
      theme: Blockly.Themes.Modern,
    });

    return () => {
      workspace.current.dispose();
    };
  }, []);

  const executarCodigo = () => {
    try {
      // Aqui entrará a lógica client-side futura
      alert('Progresso Salvo Localmente! (Simulação PWA)');
    } catch {
      alert('Tente novamente! A lógica está quase lá.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Desafio 1: Faça o personagem andar!</h2>
      <div ref={blocklyDiv} style={{ height: '500px', width: '100%', borderRadius: '12px', border: '1px solid #ccc' }} />
      <button 
        onClick={executarCodigo} 
        style={{ marginTop: '15px', padding: '15px 30px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
        ▶ Executar Lógica
      </button>
    </div>
  );
};

export default WorkspaceAluno;