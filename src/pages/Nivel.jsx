import React from 'react';
import { Btn } from '../components/Btn';
import { Nexi } from '../components/Nexi';
import { Me } from '../context/AvatarContext';

// Resumo do progresso registrado. Não há regras de XP/nível no projeto.
export function Nivel({ go, feitas = 0, total = 0, estrelas = 0 }) {
  const completa = total > 0 && feitas === total;
  return (<div className="max-w-md mx-auto p-4 sm:p-5 text-center">
    <h2 className="text-3xl sm:text-4xl mt-6">{completa ? 'Trilha concluída!' : 'Seu progresso'}</h2>
    <div className="card p-6 my-7" style={{ background: '#FFF6B8' }}>
      <div className="disp text-5xl">{feitas}/{total}</div><p>fases concluídas</p><p className="mt-3 text-xl">{estrelas} estrelas</p>
    </div>
    <div className="flex justify-center items-end gap-3"><Me s={96} /><Nexi s={80} mood={completa ? 'comemorando' : 'feliz'} /></div>
    <p className="mt-3">Veja suas conquistas ou volte à trilha para continuar explorando.</p>
    <div className="flex flex-col sm:flex-row gap-3 mt-5"><Btn c="#fff" className="flex-1 !text-base" onClick={() => go('ach')}>Ver conquistas</Btn><Btn className="flex-1 !text-base" onClick={() => go('courses')}>Ver trilha</Btn></div>
  </div>);
}
