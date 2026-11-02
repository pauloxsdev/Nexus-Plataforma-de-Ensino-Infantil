import React from 'react';
import { Nexi } from '../components/Nexi';
import { Btn } from '../components/Btn';

// A demonstração não autentica nem cria uma identidade de aluno.
export function Login({ entrar }) {
  return (
    <div className="max-w-4xl mx-auto p-5 pt-8 grid grid-cols-2 gap-12 items-center">
      <div>
        <Nexi s={84} />
        <h1 className="text-5xl mt-3">Conheça o Nexus</h1>
        <p className="mt-3">Explore as atividades em modo de demonstração.</p>
      </div>
      <div>
        <p className="card p-4" role="note">O acesso de alunos e professores ainda não está disponível. Esta demonstração não faz login e guarda o progresso neste navegador.</p>
        <Btn data-t="enter" className="w-full mt-6 text-2xl" onClick={() => entrar()}>Explorar demonstração</Btn>
        <p className="text-sm mt-4">Você não precisa informar nome, e-mail ou código.</p>
      </div>
    </div>
  );
}
