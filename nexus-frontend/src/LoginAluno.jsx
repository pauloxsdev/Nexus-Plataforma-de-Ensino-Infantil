import { useState } from 'react';
import './index.css';

const LoginAluno = ({ aoLogar }) => {
  const [codigo, setCodigo] = useState('');

  const validarAcesso = () => {
    // Validação básica simulando a Regra de Negócio RN01 (Código de 6 dígitos)
    if (codigo.length >= 5) {
      aoLogar(codigo);
    } else {
      alert('O código de acesso parece incompleto. Peça ajuda ao professor!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="card-ludico" style={{ maxWidth: '400px' }}>
        <h1 style={{ color: '#4CAF50', fontSize: '32px' }}>Nexus 2.0</h1>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Digite seu código secreto para jogar!</p>
        
        <input 
          type="text" 
          className="input-codigo" 
          placeholder="EX: A1B2C" 
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          maxLength={6}
        />
        
        <br />
        <button className="btn-gigante" onClick={validarAcesso}>
          🚀 ENTRAR
        </button>
      </div>
    </div>
  );
};

export default LoginAluno;