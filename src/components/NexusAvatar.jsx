import React from 'react';
import { INK, SUN, PINK, BLUE, GREEN, ORANGE } from '../theme/tokens';

// O "Nexus" é o avatar do aluno: uma criatura abstrata, que o aluno monta com forma, cor, rosto e enfeite.
export const CORES_NEXUS = [SUN, PINK, BLUE, GREEN, ORANGE, '#9B7BFF', '#5ED6B0', '#5BC0FF'];
export const FORMAS = ['orbe', 'gota', 'bloco', 'estrela', 'nuvem', 'diamante'];
export const ROSTOS = ['feliz', 'curioso', 'piscando', 'animado', 'tranquilo', 'surpreso'];
export const ENFEITES = ['nenhum', 'antena', 'raio', 'coroa', 'folhas', 'chifres', 'halo', 'laco'];
export const NOMES = {
  forma: { orbe: 'Orbe', gota: 'Gota', bloco: 'Bloco', estrela: 'Estrela', nuvem: 'Nuvem', diamante: 'Diamante' },
  rosto: { feliz: 'Feliz', curioso: 'Curioso', piscando: 'Piscando', animado: 'Animado', tranquilo: 'Tranquilo', surpreso: 'Surpreso' },
  enfeite: { nenhum: 'Nenhum', antena: 'Antena', raio: 'Raio', coroa: 'Coroa', folhas: 'Folhas', chifres: 'Chifrinhos', halo: 'Halo', laco: 'Laço' },
};
const TOPO = { orbe: 16, gota: 12, bloco: 16, estrela: 8, nuvem: 15, diamante: 8 }; // onde fica o topo do corpo (para o enfeite)

const Forma = ({ forma, ...p }) => {
  if (forma === 'gota') return <path d="M40 10C40 10 62 34 62 50a22 22 0 0 1-44 0C18 34 40 10 40 10z" {...p} />;
  if (forma === 'bloco') return <rect x="14" y="16" width="52" height="52" rx="18" {...p} />;
  if (forma === 'estrela') return <path d="M40 8L48.5 28 70 30 53.5 44.5 58.5 66 40 54.5 21.5 66 26.5 44.5 10 30 31.5 28Z" {...p} />;
  if (forma === 'nuvem') return <g {...p}><circle cx="27" cy="47" r="16" /><circle cx="53" cy="47" r="16" /><circle cx="40" cy="34" r="18" /><rect x="27" y="47" width="26" height="16" /></g>;
  if (forma === 'diamante') return <path d="M40 8L70 42 40 76 10 42z" {...p} />;
  return <circle cx="40" cy="42" r="27" {...p} />;
};

const Rosto = ({ rosto }) => {
  const tr = { stroke: INK, strokeWidth: 3.6, strokeLinecap: 'round', fill: 'none' };
  return (
    <g transform="translate(0 3)">
      <circle cx="24" cy="48" r="3.6" fill={PINK} opacity=".55" /><circle cx="56" cy="48" r="3.6" fill={PINK} opacity=".55" />
      {rosto === 'curioso' && <><circle cx="30" cy="40" r="4" fill={INK} /><circle cx="50" cy="40" r="7" fill="#fff" stroke={INK} strokeWidth="3" /><circle cx="51" cy="41" r="3" fill={INK} /><circle cx="40" cy="53" r="3" fill={INK} /></>}
      {rosto === 'piscando' && <><circle cx="31" cy="40" r="3.4" fill={INK} /><path d="M44 41q5-6 10 0" {...tr} /><path d="M31 49q9 9 18 0" {...tr} /></>}
      {rosto === 'animado' && <><path d="M26 42q4-7 8 0M46 42q4-7 8 0" {...tr} /><path d="M31 49q9 13 18 0z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" /></>}
      {rosto === 'tranquilo' && <><path d="M26 41h9M45 41h9" {...tr} /><path d="M34 50q6 5 12 0" {...tr} /></>}
      {rosto === 'surpreso' && <><circle cx="31" cy="40" r="5" fill="#fff" stroke={INK} strokeWidth="3" /><circle cx="49" cy="40" r="5" fill="#fff" stroke={INK} strokeWidth="3" /><circle cx="31" cy="41" r="2" fill={INK} /><circle cx="49" cy="41" r="2" fill={INK} /><ellipse cx="40" cy="54" rx="4" ry="5" fill={INK} /></>}
      {(rosto === 'feliz' || !['curioso', 'piscando', 'animado', 'tranquilo', 'surpreso'].includes(rosto)) && <><circle cx="31" cy="40" r="3.4" fill={INK} /><circle cx="49" cy="40" r="3.4" fill={INK} /><path d="M31 49q9 9 18 0" {...tr} /></>}
    </g>
  );
};

const Enfeite = ({ tipo, t }) => {
  const traco = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' };
  if (tipo === 'antena') return <g><line x1="40" y1={t} x2="40" y2={t - 13} {...traco} strokeWidth="4" /><circle cx="40" cy={t - 17} r="5" fill={PINK} {...traco} /></g>;
  if (tipo === 'raio') return <path transform={`translate(40 ${t - 6})`} d="M4-16L-8 2H0L-4 18 12-4H4z" fill={SUN} {...traco} />;
  if (tipo === 'coroa') return <path transform={`translate(40 ${t + 4})`} d="M-14 0L-16-16-7-8 0-18 7-8 16-16 14 0z" fill={SUN} {...traco} />;
  if (tipo === 'folhas') return <g transform={`translate(40 ${t + 2})`}><ellipse cx="-8" cy="-9" rx="5" ry="10" transform="rotate(-30 -8 -9)" fill={GREEN} {...traco} /><ellipse cx="8" cy="-9" rx="5" ry="10" transform="rotate(30 8 -9)" fill={GREEN} {...traco} /></g>;
  if (tipo === 'chifres') return <path d={`M25 ${t + 8}l-4-15 13 9zM55 ${t + 8}l4-15-13 9z`} fill={ORANGE} {...traco} />;
  if (tipo === 'halo') return <g><ellipse cx="40" cy={t - 9} rx="15" ry="5" fill="none" stroke={INK} strokeWidth="9" /><ellipse cx="40" cy={t - 9} rx="15" ry="5" fill="none" stroke={SUN} strokeWidth="4.5" /></g>;
  if (tipo === 'laco') return <g transform={`translate(53 ${t + 5})`}><path d="M0 0L-12-8V8zM0 0L12-8V8z" fill={PINK} {...traco} /><circle r="3.6" fill={PINK} {...traco} /></g>;
  return null;
};

export function NexusAvatar({ s = 80, forma = 'orbe', cor = SUN, rosto = 'feliz', acc = 'nenhum', rotulo = 'Seu Nexus' }) {
  const t = TOPO[forma] ?? 16;
  return (
    <svg width={s} height={s} viewBox="-6 -12 92 96" role="img" aria-label={rotulo}>
      <Forma forma={forma} fill={INK} stroke={INK} strokeWidth="9" strokeLinejoin="round" />
      <Forma forma={forma} fill={cor} stroke="none" />
      <Rosto rosto={rosto} />
      <Enfeite tipo={acc} t={t} />
    </svg>
  );
}
