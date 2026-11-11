import React from 'react';
import { SUN, INK, PINK } from '../theme/tokens';
import { Ic } from '../components/Icon';
import { Seg } from '../components/Seg';
import { Btn } from '../components/Btn';
import { CabecalhoAventura } from '../components/CabecalhoAventura';
import { Nexi } from '../components/Nexi';
import { Me } from '../context/AvatarContext';

export function Dash({ go, fase, estrelas, feitas, totalFases, restantes, conquistas, atividade }) {
  return (<div className="max-w-5xl mx-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
    <div className="md:col-span-2"><CabecalhoAventura etiqueta="SEU CANTINHO DE DESCOBERTAS" titulo="Olá, Explorador!" extra={<button data-t="avatar" className="flex items-center gap-2 text-sm" aria-label="Trocar o Nexus" onClick={() => go('avatar')}><Me s={42} /><span className="underline">Deixe seu Nexus com a sua cara</span></button>}>Uma ideia de cada vez, um novo caminho para descobrir.</CabecalhoAventura></div>
    <section className="card discovery-card md:col-span-2"><span className="eyebrow">{restantes ? 'SUA PRÓXIMA DESCOBERTA' : 'AVENTURA COMPLETA'}</span><div className="flex flex-wrap items-center justify-between gap-5"><div><h3 className="text-3xl mt-2">{restantes ? fase?.titulo : 'Que tal um novo jeito de resolver?'}</h3><p className="mt-2">{restantes ? `Fase ${fase?.id} · ${fase?.conceito}` : 'Revisite seus desafios e tente conquistar mais estrelas.'}</p><div className="discovery-path" aria-hidden="true"><span><Ic n="play" s={24} /></span><i /><span><Ic n="bolt" s={24} /></span><i /><span><Ic n="star" s={24} /></span></div></div><Btn data-t="go" className="!text-lg" onClick={() => go('work')}>{restantes ? 'Vamos descobrir!' : 'Jogar novamente'} →</Btn></div></section>
    <div data-t="xp" className="card p-4">
      <h3 className="text-3xl">Sua trilha</h3>
      <p className="mt-3 text-lg">{feitas} de {totalFases} fases concluídas</p>
      <div className="my-3" aria-label="Progresso da trilha"><Seg v={feitas} n={totalFases} /></div>
      <p>{restantes ? `Faltam ${restantes} fases.` : 'Trilha concluída!'}</p>
      <button className="underline text-sm py-2 mt-2" onClick={() => go('nivel')}>Ver meu progresso →</button>
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
    <button className="card p-4 flex items-center gap-4 text-left" style={{background:'#e7f1ff'}} onClick={() => go('avatar')}><Nexi s={70} /><span><b className="disp text-xl">Uma coleção de possibilidades</b><span className="block text-sm mt-1">Suas fases e estrelas liberam novas formas, cores e enfeites. Ver coleção →</span></span></button>
  </div>);
}
