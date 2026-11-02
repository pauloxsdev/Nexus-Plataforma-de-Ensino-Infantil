import React from 'react';

// Não aceitar um papel vindo do navegador como autorização. A área só poderá
// voltar a operar quando houver sessão e permissões verificadas pelo backend.
export function Teacher() {
  return (
    <div className="max-w-2xl mx-auto p-5">
      <h2 className="text-4xl">Área do professor indisponível</h2>
      <p className="card p-4 mt-4" role="status">O acesso e a criação de códigos dependem da autenticação de professores, que ainda não está disponível.</p>
    </div>
  );
}
