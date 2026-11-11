import React from 'react';
import imagem from '../assets/nexi.png';

export function Nexi({ s = 72, mood = 'feliz' }) {
  return <span className={`nexi nexi-${mood}`} style={{ width: s, height: s }}>
    <img src={imagem} alt="Nexi, seu guia de aventuras" draggable="false" />
  </span>;
}
