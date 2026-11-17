import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Palco } from './Palco';
import { CodigoPrograma } from './CodigoPrograma';
export function ExecucaoPrograma({ fase, programa, resultado, onFim }) {
  const [indice, setIndice] = useState(-1), [auto, setAuto] = useState(true);
  const eventos = resultado.eventos, atual = eventos[indice], acabou = indice >= eventos.length - 1;
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => { if (acabou) onFim(); else setIndice(i => i + 1); }, 650);
    return () => clearTimeout(timer);
  }, [auto, indice, acabou, onFim]);
  return <Modal largo titulo="Observe seu programa" onClose={onFim}>
    <span className="eyebrow">EXECUTAR TAMBÉM É INVESTIGAR</span><h3 className="text-2xl mt-2">Uma instrução de cada vez</h3>
    <div className="execution-layout"><div><div className="execution-map"><Palco mundo={fase.mundo} robo={atual} pegas={atual?.estrelasPegas} destaque={atual?.tipo==='erro'?resultado.celulaFalha:null} tam={48}/></div><div className="execution-event" role="status"><b>{atual?.texto||'Vamos ler o programa juntos.'}</b><p>{atual?.tipo==='acao'?atual.voltas.join(' · '):`Etapa ${indice+1} de ${eventos.length}`}</p></div></div><CodigoPrograma programa={programa} evento={atual}/></div>
    <div className="execution-controls"><button className="btn !text-base" onClick={()=>setAuto(v=>!v)}>{auto?'Pausar':'Continuar'}</button><button className="btn !text-base" onClick={()=>{setAuto(false);setIndice(i=>Math.min(i+1,eventos.length-1));}} disabled={acabou}>Próximo passo</button><button className="lesson-reset" onClick={onFim}>Ver resultado</button></div>
  </Modal>;
}
