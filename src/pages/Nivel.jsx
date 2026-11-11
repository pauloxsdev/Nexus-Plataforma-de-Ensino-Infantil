import React from 'react';
import { Ic } from '../components/Icon';
import { Btn } from '../components/Btn';
import { CabecalhoAventura } from '../components/CabecalhoAventura';
import { Me } from '../context/AvatarContext';
import { colecao } from '../data/personalizacao';
export function Nivel({ go, feitas = 0, total = 0, estrelas = 0, progresso }) {
  const completa = total > 0 && feitas === total;
  const itens = colecao(progresso);
  return <div className="max-w-5xl mx-auto p-4 sm:p-6">
    <CabecalhoAventura etiqueta="SEU DIÁRIO DE EXPLORADOR" titulo={completa ? 'Você completou a trilha!' : 'Veja até onde você chegou'}>Cada tentativa ensina algo novo. Seu próximo passo começa aqui.</CabecalhoAventura>
    <div className="grid md:grid-cols-2 gap-6"><section className="card p-6 text-center" style={{background:'#fff3c4'}}><div className="flex justify-center"><Me s={136} /></div><h3 className="text-3xl mt-4">Seu progresso</h3><p className="disp text-5xl mt-5">{feitas}<span className="text-2xl">/{total}</span></p><p className="mt-2">fases concluídas</p><progress className="w-full mt-5" value={feitas} max={total || 1} aria-label="Fases concluídas" /><p className="mt-3">{estrelas} estrelas conquistadas</p><Btn className="mt-6 w-full" onClick={() => go('courses')}>{completa ? 'Revisitar a trilha' : 'Continuar a trilha'}</Btn></section>
    <section className="card p-2"><div className="progress-landmark"><span className="landmark-number" aria-hidden="true"><Ic n="map" /></span><div><h3 className="text-xl">Pequenos passos</h3><p className="text-sm mt-1">{total-feitas} fases restantes para completar sua jornada.</p></div></div><div className="progress-landmark"><span className="landmark-number" style={{background:'#fff3c4'}}>✦</span><div><h3 className="text-xl">Seu melhor resultado</h3><p className="text-sm mt-1">Repetir um desafio pode melhorar suas estrelas. A melhor pontuação fica com você.</p></div></div><div className="progress-landmark"><span className="landmark-number" style={{background:'#ffe3ea'}}>♡</span><div><h3 className="text-xl">Seu estilo, suas descobertas</h3><p className="text-sm mt-1">{itens.livres} de {itens.total} itens de personalização disponíveis.</p><button className="underline mt-2 text-sm py-2" onClick={() => go('avatar')}>Abrir minha coleção →</button></div></div><div className="p-4"><Btn c="#fff" className="w-full" onClick={() => go('ach')}>Ver conquistas</Btn></div></section></div>
  </div>;
}
