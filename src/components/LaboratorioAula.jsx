import React, { useEffect, useMemo, useState } from 'react';
import { simular } from '../game/motor';
import { Palco } from './Palco';
import { CodigoPrograma } from './CodigoPrograma';
import { BlocosPrograma } from './BlocosPrograma';
import { Ic } from './Icon';
export function LaboratorioAula({ descoberta }) {
  const resultado = useMemo(() => simular(descoberta.mundo, descoberta.programa), [descoberta]);
  const [passo, setPasso] = useState(-1), [rodando, setRodando] = useState(false), [codigo, setCodigo] = useState(false);
  const evento = resultado.eventos[passo];
  useEffect(() => {
    if (!rodando) return;
    if (passo >= resultado.eventos.length - 1) { setRodando(false); return; }
    const timer = setTimeout(() => setPasso(p => p + 1), 900);
    return () => clearTimeout(timer);
  }, [rodando, passo, resultado]);
  return <div className="lesson-lab">
    <div className="lab-sky"><span className="lab-dot dot-a" aria-hidden="true" /><span className="lab-dot dot-b" aria-hidden="true" /><div className="lab-caption"><Ic n="play" s={18} /> EXEMPLO PARA EXPLORAR</div>
      <div className="lab-map"><Palco mundo={descoberta.mundo} robo={evento} pegas={evento?.estrelasPegas} tam={55} /></div>
      <div role="status" className="lab-status">{evento?.texto || 'Olhe o mapa. O que vai acontecer?'}{evento?.tipo === 'acao' && evento.voltas.length > 0 && <small>{evento.voltas.join(' · ')}</small>}</div>
    </div>
    <div className="lab-controls"><button className="btn !text-base" onClick={() => { if (passo >= resultado.eventos.length - 1) setPasso(-1); setRodando(r => !r); }}>{rodando ? 'Pausar' : 'Ver acontecer'}</button><button className="btn !text-base" onClick={() => { setRodando(false); setPasso(p => Math.min(p + 1, resultado.eventos.length - 1)); }} disabled={passo >= resultado.eventos.length - 1}>Um passo</button><button className="lesson-reset" onClick={() => { setRodando(false); setPasso(-1); }}>Recomeçar</button></div>
    <div className="lesson-blocks"><BlocosPrograma programa={descoberta.programa} evento={evento}/></div>
    <button className="lesson-reset w-full" aria-expanded={codigo} onClick={() => setCodigo(v => !v)}>{codigo ? 'Fechar' : 'Ver'} algoritmo em português</button>
    {codigo && <CodigoPrograma programa={descoberta.programa} evento={evento} />}
  </div>;
}
