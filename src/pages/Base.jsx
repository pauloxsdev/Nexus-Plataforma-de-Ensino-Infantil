import React from 'react';
import { SUN, INK, PINK } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Seg } from '../components/Seg';
import { Btn } from '../components/Btn';
import { Me } from '../context/AvatarContext';

export function Dash({ go, fase, estrelas, feitas, totalFases, restantes, conquistas, atividade }) {
  return (<div className="max-w-5xl mx-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
    <div className="flex items-center gap-3 md:col-span-2"><button data-t="avatar" aria-label="Trocar o Nexus" onClick={() => go('avatar')}><Me s={64} /></button><div><h2 className="text-3xl sm:text-4xl">Olá, Explorador!</h2><p>Vamos aprender mais um pouco?</p></div></div>
    <div data-t="xp" className="card p-4">
      <h3 className="text-3xl">Sua trilha</h3>
      <p className="mt-3 text-lg">{feitas} de {totalFases} fases concluídas</p>
      <div className="my-3" aria-label="Progresso da trilha"><Seg v={feitas} n={totalFases} /></div>
      <p>{restantes ? `Faltam ${restantes} fases.` : 'Trilha concluída!'}</p>
    </div>
    <div data-t="streak" className="card p-4" style={{ background: SUN }}>
      <div className="flex items-center gap-2 mb-3"><Ic n="fire" f={PINK} /><h3 className="text-2xl">{atividade.consecutivos} {atividade.consecutivos === 1 ? 'dia seguido' : 'dias seguidos'}</h3></div>
      <p>{atividade.acumulados} {atividade.acumulados === 1 ? 'dia de atividade acumulado' : 'dias de atividade acumulados'}</p>
      <p className="text-xs mt-2">Últimos 7 dias — uma tentativa com peças conta como atividade.</p>
      <div className="grid grid-cols-7 gap-1 mt-2">{atividade.ultimosDias.map(({ data, ativo }) => <div key={data} className="text-center min-w-0">
        <span role="img" aria-label={`${data}: ${ativo ? 'com atividade' : 'sem atividade'}`} className="aspect-square rounded-full flex items-center justify-center" style={{ background: ativo ? '#DDF6E8' : '#fff', border: `2px solid ${INK}` }}>{ativo ? <Ic n="check" s={18} /> : '–'}</span>
        <span className="text-[10px]">{data.slice(8)}/{data.slice(5, 7)}</span>
      </div>)}</div>
      <p className="text-xs mt-2">Abrir o aplicativo não conta. Só registramos atividades realizadas a partir desta atualização.</p>
    </div>
    <div className="grid grid-cols-3 card text-center divide-x-[3px]" style={{ borderColor: INK }}>
      {[[estrelas, 'estrelas'], [feitas, 'fases'], [conquistas, 'conquistas']].map(([n, nome]) => <div key={nome} className="py-3 min-w-0"><div className="disp text-3xl">{n}</div><div className="text-xs">{nome}</div></div>)}
    </div>
    <Btn data-t="go" className="w-full text-2xl py-3" onClick={() => go('work')}>{restantes ? `Continuar a fase ${fase?.id}` : 'Jogar novamente'}</Btn>
  </div>);
}
