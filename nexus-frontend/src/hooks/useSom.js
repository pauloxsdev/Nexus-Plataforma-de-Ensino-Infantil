import { useState } from 'react';
import { SND } from '../services/som';

// Liga/desliga os sons e a vibração do jogo.
export function useSom() {
  const [snd, setSnd] = useState(true);
  const toggle = () => { SND.on = !snd; setSnd(!snd); };
  return { snd, toggle };
}
