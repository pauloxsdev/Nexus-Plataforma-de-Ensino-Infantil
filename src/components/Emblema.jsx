import React from 'react';
import { INK, SUN, PINK, BLUE, GREEN, ORANGE } from '../theme/tokens';
import { RARIDADES } from '../data/conquistas';

// Símbolos das conquistas (desenhados em uma caixa de 48x48)
const SIMBOLOS = {
  bandeira: <><path d="M15 7v34" /><path d="M15 9h21l-5 8 5 8H15z" fill={PINK} /></>,
  mapa: <><path d="M24 5c-8 0-13 6-13 13 0 10 13 25 13 25s13-15 13-25c0-7-5-13-13-13z" fill={BLUE} /><circle cx="24" cy="18" r="5" fill="#fff" /></>,
  trofeu: <><path d="M14 7h20v11a10 10 0 0 1-20 0z" fill={SUN} /><path d="M14 11H8v4a6 6 0 0 0 6 6M34 11h6v4a6 6 0 0 1-6 6M24 28v8M16 41h16" /></>,
  estrela: <path d="M24 5l5.600 11.500 12.400 1.800-9 8.800 2.100 12.400L24 33.600 12.900 39.500 15 27.100 6 18.300l12.400-1.800z" fill={SUN} />,
  alvo: <><circle cx="24" cy="24" r="18" fill="#fff" /><circle cx="24" cy="24" r="11" fill={PINK} /><circle cx="24" cy="24" r="4" fill={INK} /></>,
  coroa: <path d="M7 37l3-21 9 10 5-16 5 16 9-10 3 21z" fill={SUN} />,
  passos: <><path d="M6 41h11v-9h11v-9h11" /><path d="M32 11l8 6-8 6" /></>,
  loop: <><path d="M38 17a15 15 0 1 0 2 12" /><path d="M39 6v12H27" /></>,
  bifurcacao: <><path d="M24 42V28M24 28L12 15M24 28l12-13" /><circle cx="12" cy="12" r="5" fill={GREEN} /><circle cx="36" cy="12" r="5" fill={PINK} /><circle cx="24" cy="41" r="5" fill={SUN} /></>,
  chave: <><circle cx="14" cy="24" r="9" fill={SUN} /><path d="M23 24h19M35 24v8M42 24v6" /></>,
  rosto: <><circle cx="24" cy="24" r="17" fill={SUN} /><circle cx="18" cy="21" r="2.200" fill={INK} /><circle cx="30" cy="21" r="2.200" fill={INK} /><path d="M17 29q7 7 14 0" /></>,
  chama: <path d="M24 4c2 9 13 13 13 26a13 13 0 0 1-26 0c0-6 4-10 6-13 1 4 4 6 6 6 0-6-2-11 1-19z" fill={ORANGE} />,
};

// moldura muda com a raridade: bronze = círculo, prata = hexágono, ouro = estrela de 12 pontas, diamante = losango
const molduraOuro = (() => { const p = []; for (let i = 0; i < 24; i++) { const r = i % 2 ? 37 : 45; const a = (Math.PI * i) / 12 - Math.PI / 2; p.push(`${(48 + r * Math.cos(a)).toFixed(1)},${(48 + r * Math.sin(a)).toFixed(1)}`); } return p.join(' '); })();
const Moldura = ({ tipo, ...p }) => {
  if (tipo === 'prata') return <path d="M48 6L82 26V70L48 90L14 70V26Z" {...p} />;
  if (tipo === 'ouro') return <polygon points={molduraOuro} {...p} />;
  if (tipo === 'diamante') return <path d="M48 4L90 48 48 92 6 48Z" {...p} />;
  return <circle cx="48" cy="48" r="40" {...p} />;
};

export function Emblema({ simbolo, raridade = 'bronze', bloqueado = false, s = 96, titulo }) {
  const cor = bloqueado ? '#D8DEEE' : RARIDADES[raridade].cor;
  return (
    <svg width={s} height={s} viewBox="0 0 96 96" role="img" aria-label={titulo || simbolo}>
      <Moldura tipo={raridade} fill={INK} stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <Moldura tipo={raridade} fill={cor} stroke="none" />
      <circle cx="48" cy="48" r="27" fill="#fff" opacity={bloqueado ? 0.6 : 0.92} />
      <g transform="translate(24 24)" stroke={INK} strokeWidth="3.200" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={bloqueado ? 0.3 : 1}>{SIMBOLOS[simbolo]}</g>
      {bloqueado && <g transform="translate(60 60)"><circle cx="10" cy="10" r="13" fill="#fff" stroke={INK} strokeWidth="3" /><path d="M5 10V8a5 5 0 0 1 10 0v2M3.500 10h13v8h-13z" transform="translate(0 -2) scale(.85)" fill="none" stroke={INK} strokeWidth="2.600" strokeLinejoin="round" /></g>}
      {!bloqueado && (raridade === 'ouro' || raridade === 'diamante') && <path className="faisca" d="M76 12l2.500 6 6 2.500-6 2.500-2.500 6-2.500-6-6-2.500 6-2.500z" fill="#fff" stroke={INK} strokeWidth="1.500" />}
    </svg>
  );
}
