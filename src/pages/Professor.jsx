import React,{useState,useEffect} from 'react';
import {INK,BLUE,SUN,GREEN,PINK,ORANGE,SUITS} from '../theme/tokens';
import {Ic} from '../components/Icon';
import {Nexi} from '../components/Nexi';
import {Astro} from '../components/Astro';
import {Btn} from '../components/Btn';
import {Seg} from '../components/Seg';
import {Modal} from '../components/Modal';
import {AvCtx,Me} from '../context/AvatarContext';
import {sfx} from '../services/som';

export function Teacher(){
  const [turma,setTurma]=useState('5º ano A'); const [rowsT,setRows]=useState([['A1B2C',7],['K9M4P',4],['Z7X3Q',7]]);
  const [cert,setCert]=useState(null); const [nome,setNome]=useState(''); const [ok,setOk]=useState(false);
  const novo=()=>setRows([...rowsT,[Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join(''),0]]);
  const baixar=async()=>{const {gerarCertificado}=await import('../services/certificado');gerarCertificado({nome,codigo:cert});setOk(true);setTimeout(()=>{setOk(false);setCert(null);setNome('')},2200)};
  return (<div className="max-w-2xl mx-auto p-5"><h2 className="text-4xl">Diário da turma</h2>
    <div className="flex gap-3 mt-3 items-center"><input aria-label="Nome da turma" value={turma} onChange={e=>setTurma(e.target.value)} className="card !shadow-none flex-1 min-w-0 px-3 py-2 disp text-xl"/><Btn data-t="newcode" c={BLUE} className="!text-white !text-base" onClick={novo}>Novo código</Btn></div>
    <p className="text-sm my-3">Anote o nome de cada aluno no seu caderno. O sistema guarda só os códigos.</p>
    <div className="card overflow-hidden">{rowsT.map(([c,f],i)=>(<div key={c} className="flex items-center gap-3 p-3 flex-wrap" style={{borderTop:i?`2px solid ${INK}`:'none'}}>
      <div className="disp text-2xl w-24 tracking-wider">{c}</div>
      <div className="flex gap-1 flex-1 min-w-[120px]" role="img" aria-label={`${f} de 7 fases`}>{Array.from({length:7},(_,k)=>(<div key={k} className="flex-1 h-5 rounded" style={{background:k<f?GREEN:'#fff',border:`2px solid ${INK}`}}/>))}</div>
      <Btn data-t={i===0?'cert':undefined} className="!text-base !py-1" disabled={f<7} onClick={()=>setCert(c)}>{f<7?`Faltam ${7-f} fases`:'Emitir certificado'}</Btn></div>))}</div>
    {cert&&<Modal onClose={()=>setCert(null)}>{ok?<><h3 className="text-2xl">Certificado baixado</h3><p className="mt-2 text-sm">O arquivo certificado-{cert}.pdf foi salvo neste computador. O nome não saiu do navegador.</p></>:<>
      <div className="p-4 mb-3" style={{border:`3px double ${INK}`,background:'#FFFDF0'}}><div className="text-xs">Certificado de conclusão</div><div className="disp text-3xl min-h-[2.2rem] break-words">{nome||'Nome da criança'}</div><div className="text-xs">completou a trilha de lógica do Nexus</div></div>
      <input autoFocus aria-label="Nome completo da criança" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Digite o nome completo" className="card !shadow-none w-full px-3 py-2"/>
      <p className="text-xs mt-2">O nome fica só na tela. Não é enviado nem salvo no servidor.</p>
      <Btn className="mt-4 w-full" disabled={!nome.trim()} onClick={baixar}>Baixar PDF</Btn></>}</Modal>}</div>);
}

