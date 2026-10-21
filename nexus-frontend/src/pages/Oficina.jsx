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

export const PIECES=[{k:'desvio',n:'Desvio',s:'se / senão',c:BLUE,t:'#fff',g:'se'},{k:'rep',n:'Repetidor',s:'repetir X vezes',c:PINK,t:INK,g:'2x'},{k:'mover',n:'Mover',s:'andar um passo',c:SUN,t:INK,g:'→'},{k:'pular',n:'Pular',s:'pular a lava',c:ORANGE,t:INK,g:'↑'},{k:'sensor',n:'Sensor',s:'obstáculo na frente?',c:GREEN,t:INK,g:'!'}];

export const GRID=[[0,0,'rock',0,0],[0,0,0,0,0],['nexi','lava','star','star','star'],[0,0,'rock',0,0],[0,0,0,0,0]];

export const PIPES=['M108 190H150','M262 165H284V80H306','M398 80H428','M262 215H284V280H306','M406 280H446'];

export const pcol=k=>k==='mover'?SUN:ORANGE;

export function BNode({x,y,w,h,bg,dash,onClick,label,children}){
  const Tag=onClick?'button':'div';
  return (<Tag onClick={onClick} aria-label={label} style={{position:'absolute',left:x,top:y,width:w,height:h,background:bg,border:`3px ${dash?'dashed':'solid'} ${dash?'#8F9BD0':INK}`,borderRadius:16,boxShadow:dash?'none':`4px 4px 0 ${INK}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,textAlign:'center',color:dash?'#8F9BD0':INK,fontFamily:"'Baloo 2',system-ui",fontWeight:800}}>{children}</Tag>);
}

export const BTag=({x,y,children})=>(<div className="absolute rounded-full px-2.5 text-xs" style={{left:x,top:y,background:'#FFF6B8',border:`2px solid ${INK}`,fontWeight:800}}>{children}</div>);

export function Work({save,go}){
  const [hand,setHand]=useState(null),[yes,setYes]=useState(null),[no,setNo]=useState(null),[n,setN]=useState(2);
  const [pos,setPos]=useState(0),[got,setGot]=useState([]),[res,setRes]=useState(null),[busy,setBusy]=useState(false),[help,setHelp]=useState(false),[msg,setMsg]=useState('');
  const pick=k=>{if(k==='mover'||k==='pular'){setHand(hand===k?null:k);setMsg('')}else setMsg(k==='rep'?'O Repetidor já está no circuito. Use + e − nele.':'Essa peça já está no circuito.')};
  const place=w=>{sfx('place');const set=w==='yes'?setYes:setNo,cur=w==='yes'?yes:no;set(hand||(cur===null?'mover':cur==='mover'?'pular':null))};
  const exec=()=>{
    if(busy)return; if(!yes||!no){setRes({t:'empty'});return;}
    let c=0,g=[],steps=[],end='fim';
    for(let i=0;i<n;i++){const a=c===0?yes:no;
      if(a==='mover'){if(c===0){end='lava';break;}c=Math.min(c+1,4);}else c=Math.min(c+2,4);
      if(c>=2&&!g.includes(c))g.push(c); steps.push({c,g:[...g]});}
    setBusy(true);setPos(0);setGot([]);
    steps.forEach((s,i)=>setTimeout(()=>{setPos(s.c);setGot(s.g)},(i+1)*650));
    setTimeout(()=>{setBusy(false);const t=end==='lava'?'lava':g.length===3?'ok':'try';sfx(t==='ok'?'ok':'soft');if(t==='ok')save();setRes({t,g:g.length})},(steps.length+1)*650);
  };
  const Step=({d,l})=>(<span role="button" tabIndex={0} aria-label={l} onClick={()=>setN(Math.max(1,Math.min(5,n+d)))} className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer" style={{background:'#fff',border:`2px solid ${INK}`}}>{d>0?'+':'−'}</span>);
  return (<div className="max-w-6xl mx-auto p-4">
    <h2 className="text-3xl mb-3">Fase 5: leve o Nexi até as estrelas</h2>
    <div className="grid gap-4 lg:grid-cols-[250px_1fr_280px]">
      <div data-t="pal" className="card p-4">
        <h3 className="text-2xl text-center mb-3">Peças de energia</h3>
        <div className="space-y-2">{PIECES.map(p=>(<button key={p.k} onClick={()=>pick(p.k)} className="w-full flex items-center gap-3 rounded-xl p-2 text-left" style={{background:'#E6EDFF',border:`2px solid ${INK}`,outline:hand===p.k?`4px solid ${PINK}`:'none',outlineOffset:2}}>
          <span className="disp text-2xl w-[52px] h-[52px] flex items-center justify-center rounded-xl shrink-0" style={{background:p.c,color:p.t,border:`3px solid ${INK}`,boxShadow:`3px 3px 0 ${INK}`}}>{p.g}</span>
          <span><span className="disp text-base block">{p.n}</span><span className="text-xs">{p.s}</span></span></button>))}</div>
        <p className="text-xs mt-3 min-h-[2.5rem]">{hand?`Na mão: ${hand==='mover'?'Mover':'Pular'}. Toque numa caixa do circuito para colocar.`:msg||'Toque em Mover ou Pular para pegar a peça.'}</p></div>
      <div className="card p-4 flex flex-col items-center gap-3">
        <h3 className="text-3xl">Montar circuito</h3>
        <div className="w-full overflow-x-auto flex lg:justify-center"><div data-t="board" className="relative shrink-0" style={{width:520,height:360,borderRadius:14,border:`3px solid ${INK}`,backgroundColor:'#E6EDFF',backgroundImage:'linear-gradient(#C6D4FF 1px,transparent 1px),linear-gradient(90deg,#C6D4FF 1px,transparent 1px)',backgroundSize:'40px 40px'}}>
          <svg width="514" height="354" className="absolute inset-0" aria-hidden="true">{PIPES.map((d,i)=>(<g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d} stroke={INK} strokeWidth="12"/><path d={d} stroke="#fff" strokeWidth="4" strokeDasharray="1 10"/></g>))}</svg>
          <BNode x={24} y={148} w={84} h={84} bg={SUN}><Ic n="bolt" s={40} f="#fff"/></BNode>
          <BNode x={150} y={134} w={112} h={112} bg={BLUE}><span style={{color:'#fff',fontSize:18}}>DESVIO</span><span className="rounded-lg px-1.5 py-0.5 text-[11px] leading-tight" style={{background:GREEN,border:`2px solid ${INK}`,fontFamily:'Nunito'}}>Obstáculo à frente?</span></BNode>
          <BNode x={306} y={34} w={92} h={92} bg={PINK}><span style={{fontSize:14}}>REPETIR</span><span className="flex items-center gap-1"><Step d={-1} l="Menos uma repetição"/><span className="disp text-xl w-7">{n}x</span><Step d={1} l="Mais uma repetição"/></span></BNode>
          <BNode x={428} y={38} w={84} h={84} bg={yes?pcol(yes):'transparent'} dash={!yes} onClick={()=>place('yes')} label="Peça do SE SIM"><span style={{fontSize:17}}>{yes?yes.toUpperCase():'toque'}</span></BNode>
          <BNode x={306} y={234} w={100} h={92} bg={no?pcol(no):'transparent'} dash={!no} onClick={()=>place('no')} label="Peça do SENÃO"><span style={{fontSize:17}}>{no?no.toUpperCase():'toque'}</span></BNode>
          <div className="absolute rounded-full" style={{left:446,top:258,width:44,height:44,background:'#fff',border:`5px solid ${INK}`,boxShadow:`3px 3px 0 ${INK}`}}/>
          <BTag x={32} y={116}>INÍCIO</BTag><BTag x={182} y={100}>SE SIM</BTag><BTag x={184} y={256}>SENÃO</BTag>
        </div></div>
        <Btn data-t="run" c={GREEN} className="text-2xl px-10" onClick={exec} disabled={busy}>Executar circuito</Btn></div>
      <div data-t="stage" className="card p-4">
        <h3 className="text-2xl text-center">Caminho do Nexi</h3><p className="text-center text-xs mb-2">Fase 5</p>
        <div className="rounded-full px-3 py-1 flex items-center gap-2 text-xs mb-3" style={{background:'#FFF6B8',border:`2px solid ${INK}`}}><Ic n="star" s={16} f={SUN} w={2.5}/>Objetivo: coletar as estrelas!</div>
        <div className="rounded-xl p-3 grid gap-1.5 justify-center" style={{background:INK,gridTemplateColumns:'repeat(5,40px)'}}>
          {GRID.flatMap((row,r)=>row.map((k,c)=>{
            const robot=r===2&&c===pos; const base={width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'};
            if(robot)return (<div key={r+'-'+c} style={{...base,border:'2px solid #fff'}}><Nexi s={34}/></div>);
            if(k==='lava')return (<div key={r+'-'+c} className="disp text-2xl" style={{...base,background:ORANGE,border:`3px solid ${INK}`}}>~</div>);
            if(k==='rock')return (<div key={r+'-'+c} style={{...base,background:'#8F9BD0',border:`3px solid ${INK}`}}><div style={{width:20,height:12,borderRadius:4,background:'#fff',border:`2px solid ${INK}`}}/></div>);
            if(k==='star'){const ok=got.includes(c);return (<div key={r+'-'+c} style={{...base,background:ok?'#fff':SUN,border:`3px solid ${INK}`}}>{ok?<Ic n="check" s={22} w={4}/>:<Ic n="star" s={24} f="#fff" w={2.5}/>}</div>);}
            return (<div key={r+'-'+c} style={{...base,border:'2px solid #fff'}}/>);}))}
        </div>
        <div className="flex items-center justify-between mt-3"><div className="flex items-center gap-1.5"><Ic n="star" s={26} f={SUN} w={2.5}/><span className="disp text-2xl">{got.length}/3</span></div>
          <Btn c={BLUE} className="!text-base !py-1 !px-4 !text-white" onClick={()=>setHelp(true)}>Ajuda</Btn></div></div>
    </div>
    {(res||help)&&<Modal onClose={()=>{setRes(null);setHelp(false)}}>
      {res?.t==='ok'?<>
        <div className="slap mx-auto w-36 h-36 rounded-full flex flex-col items-center justify-center" style={{background:PINK,border:'4px solid #fff',outline:`3px solid ${INK}`,boxShadow:`4px 4px 0 ${INK}`}}><span className="disp text-5xl" style={{color:'#fff'}}>∞</span><span className="text-xs text-white">Mestre do loop</span></div>
        <h3 className="text-3xl mt-5">Você chegou!</h3><p className="mt-1">As 3 estrelas são suas. +50 XP e uma figurinha nova no álbum.</p></>
      :<><Nexi s={72} mood={help||res.t!=='try'?'curioso':'pensando'}/><h3 className="text-3xl mt-2">{help?'Uma dica':res.t==='empty'?'Faltam peças':res.t==='lava'?'O robô parou na lava':'Quase lá!'}</h3>
        <p className="mt-1">{help?'O sensor pergunta se tem obstáculo à frente. Se SIM, o robô precisa pular a lava. Se SENÃO, ele anda. Depois, aumente o Repetir até pegar as 3 estrelas.':res.t==='empty'?'Coloque uma peça nas duas caixas tracejadas: SE SIM e SENÃO.':res.t==='lava'?'O sensor disse SIM ali, então o robô tem que pular. Troque a peça do SE SIM.':`O robô pegou ${res.g} de 3 estrelas. Tente aumentar o número de repetições.`}</p></>}
      <Btn className="mt-5" onClick={()=>{const w=res?.t==='ok';setRes(null);setHelp(false);if(w)go('nivel')}}>{res?.t==='ok'?'Continuar':'Entendi'}</Btn></Modal>}
  </div>);
}

