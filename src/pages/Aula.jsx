import React, { useEffect, useState } from 'react';
import { Btn } from '../components/Btn';
import { Nexi } from '../components/Nexi';
import { Ic } from '../components/Icon';
import { Ilustracao } from '../components/Ilustracao';
import { LaboratorioAula } from '../components/LaboratorioAula';
import { DESCOBERTAS } from '../data/descobertas';

export function Aula({ fase, aula, estrelas, status, onVoltar, onJogar, onOutra, total }) {
  const d = DESCOBERTAS[fase.id];
  const [etapa, setEtapa] = useState(0), [resposta, setResposta] = useState(null), [pistas, setPistas] = useState(0), [voz, setVoz] = useState(false);
  const podeOuvir = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => { if (podeOuvir) window.speechSynthesis.cancel(); }, [podeOuvir]);
  const ouvir = () => {
    if (voz) { window.speechSynthesis.cancel(); setVoz(false); return; }
    const texto = [d.titulo, d.objetivo, etapa === 0 ? d.definicao : etapa === 1 ? `${d.pergunta} ${d.opcoes.join('. ')}` : d.transfere].join('. ');
    const fala = new SpeechSynthesisUtterance(texto); fala.lang = 'pt-BR'; fala.rate = .9;
    fala.onend = fala.onerror = () => setVoz(false); window.speechSynthesis.speak(fala); setVoz(true);
  };
  const trocar = e => { setEtapa(e); if (podeOuvir) window.speechSynthesis.cancel(); setVoz(false); };
  return <div className="lesson-page max-w-6xl mx-auto p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><button className="lesson-back" onClick={onVoltar}>← Trilhas</button><span className="text-sm">Descoberta {fase.id} de {total}{status === 'done' ? ` · ${estrelas || 1} estrelas na fase` : ''}</span></div>
    <header className="lesson-hero" data-t="aula-resumo"><div><span className="eyebrow">LABORATÓRIO DE IDEIAS</span><h2>{d.titulo}</h2><p>{d.objetivo}</p></div><div className="lesson-guide"><Nexi s={112} /><span>Vamos descobrir?</span></div></header>
    <div className="lesson-steps" role="group" aria-label="Etapas da descoberta">{['Veja', 'Preveja', 'Experimente'].map((label,i)=><button key={label} aria-pressed={etapa===i} className={etapa===i?'active':''} onClick={()=>trocar(i)}><span>{i+1}</span>{label}</button>)}</div>
    <div className="lesson-layout">
      <section className="card lesson-example"><LaboratorioAula key={fase.id} descoberta={d} /></section>
      <section className="card lesson-explore" data-t="aula-tutorial">
        <div className="flex justify-between items-center gap-2"><span className="eyebrow">{etapa===0?'UMA IDEIA PARA LEVAR':etapa===1?'QUAL É A SUA PREVISÃO?':'SUA VEZ DE INVESTIGAR'}</span>{podeOuvir&&<button aria-label={voz?'Parar leitura':'Ouvir explicação'} className="listen-button" onClick={ouvir}><Ic n={voz?'mudo':'som'} s={20}/></button>}</div>
        {etapa===0&&<><div className="lesson-concept-art" aria-hidden="true"><Ilustracao k={aula.ilustracao} s={200}/></div><h3 className="text-3xl">{d.palavra}</h3><p className="text-lg mt-2">{d.definicao}</p><button className="btn mt-6 w-full !text-base" onClick={()=>trocar(1)}>Tenho um palpite →</button></>}
        {etapa===1&&<><h3 className="text-2xl mt-4">{d.pergunta}</h3><div className="prediction-options">{d.opcoes.map((op,i)=><button key={op} aria-pressed={resposta===i} className={resposta===i?'chosen':''} onClick={()=>setResposta(i)}><span>{String.fromCharCode(65+i)}</span>{op}</button>)}</div>{resposta!==null&&<div className={`prediction-feedback ${resposta===d.correta?'correct':''}`} role="status"><b>{resposta===d.correta?'Boa descoberta!':'Vamos investigar juntos?'}</b><p>{resposta===d.correta?d.explica:'Use “Um passo” no exemplo, observe e escolha novamente.'}</p></div>}<button className="lesson-reset w-full mt-3" onClick={()=>trocar(2)}>Experimentar na fase →</button></>}
        {etapa===2&&<><div className="lesson-concept-art compact" aria-hidden="true"><Ic n="bolt" s={64} f="#ffdb30"/></div><h3 className="text-2xl">E se mudasse alguma coisa?</h3><p className="text-lg mt-3">{d.transfere}</p><div className="nexi-note mt-5 text-sm">Na fase, monte seu programa. Depois explique: qual comando fez a diferença?</div><Btn className="w-full mt-6 !text-base" onClick={onJogar}>Montar meu programa →</Btn></>}
      </section>
    </div>
    <div className="lesson-bottom"><details className="card p-4"><summary>Uma ideia do dia a dia</summary><p className="mt-3">{aula.diaADia[0]}</p></details><details className="card p-4" data-t="aula-pista"><summary>Preciso de uma pista para a fase</summary><ol className="mt-3 space-y-2">{aula.pistas.slice(0,pistas).map((x,i)=><li key={x}>{i+1}. {x}</li>)}</ol>{pistas<aula.pistas.length&&<button className="lesson-reset mt-2" onClick={()=>setPistas(p=>p+1)}>Revelar uma pista</button>}</details></div>
    <div className="lesson-footer"><button disabled={!onOutra.anterior} onClick={()=>onOutra.anterior?.()}>← Aula anterior</button><button data-t="aula-ir" onClick={onJogar}>Ir para a fase {fase.id} →</button><button disabled={!onOutra.proxima} onClick={()=>onOutra.proxima?.()}>Próxima aula →</button></div>
  </div>;
}
