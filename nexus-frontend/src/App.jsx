import { useState } from 'react';
import LoginAluno from './LoginAluno';
import WorkspaceAluno from './WorkspaceAluno';

function App() {
  const [estaLogado, setEstaLogado] = useState(false);

  // Se não estiver logado, mostra a tela de Login. 
  // Se estiver, mostra a tela dos blocos do Google Blockly.
  return (
    <>
      {!estaLogado ? (
        <LoginAluno aoLogar={() => setEstaLogado(true)} />
      ) : (
        <WorkspaceAluno />
      )}
    </>
  );
}

export default App;