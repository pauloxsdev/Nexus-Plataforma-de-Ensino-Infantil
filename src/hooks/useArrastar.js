import { useEffect, useRef, useState } from 'react';

// Arrastar e soltar com "pointer events": funciona com mouse, caneta e dedo (celular/tablet).
// (O arrastar nativo do HTML5 não funciona em telas de toque, por isso não é usado.)
//
//   iniciar(peca, origem, evento)  -> chame no onPointerDown da peça.
//                                     origem = 'paleta' (peça da bandeja) ou o id do espaço de onde a peça saiu
//   onSoltar(peca, origem, alvo)   -> chamado ao soltar; alvo = id do espaço escolhido, ou null se soltou fora
//   arrasto                        -> { peca, origem, x, y } enquanto arrasta (para desenhar a peça "fantasma")
//   volta                          -> peça soltando fora: o fantasma desliza de volta para a bandeja
//   sobre                          -> id do espaço que vai receber a peça (para destacar)
//   foiArrasto()                   -> true logo depois de um arrasto (para o onClick ignorar esse "clique")
const DISTANCIA_MINIMA = 6; // abaixo disso é um toque comum, não um arrasto
const MARGEM_IMA = 44;      // "ímã": soltar até 44 px longe de um espaço também encaixa nele

const reduzMovimento = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function espacoEm(x, y) {
  const dentro = document.elementFromPoint(x, y)?.closest('[data-slot]');
  if (dentro) return dentro.getAttribute('data-slot');
  let melhor = null, menor = MARGEM_IMA;
  document.querySelectorAll('[data-slot]').forEach((el) => {
    const r = el.getBoundingClientRect();
    const d = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
    if (d < menor) { menor = d; melhor = el.getAttribute('data-slot'); }
  });
  return melhor;
}

export function useArrastar({ onSoltar, desabilitado }) {
  const [arrasto, setArrasto] = useState(null);
  const [sobre, setSobre] = useState(null);
  const [volta, setVolta] = useState(null);
  const recente = useRef(false);
  const limpar = useRef(null);
  useEffect(() => () => limpar.current && limpar.current(), []);

  const voarDeVolta = (peca, x, y) => {
    const alvo = document.querySelector(`[data-peca="${peca}"]`);
    if (!alvo || reduzMovimento()) return;
    const r = alvo.getBoundingClientRect();
    setVolta({ peca, x, y, ida: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setVolta({ peca, x: r.left + r.width / 2, y: r.top + r.height / 2, ida: true })));
    setTimeout(() => setVolta(null), 320);
  };

  const iniciar = (peca, origem, e) => {
    if (desabilitado || (e.button !== undefined && e.button !== 0)) return;
    const x0 = e.clientX, y0 = e.clientY;
    let ativo = false;
    let ponto = { x: x0, y: y0 };
    let quadro;
    const velocidade = (p, inicio, fim) => p < inicio + 48 ? -Math.ceil((inicio + 48 - p) / 4)
      : p > fim - 48 ? Math.ceil((p - fim + 48) / 4) : 0;
    // O dedo pode ficar parado na borda enquanto o circuito se aproxima.
    // Só rola durante um arrasto real; tocar/selecionar não inicia rolagem.
    const rolar = () => {
      const dy = Math.max(-16, Math.min(16, velocidade(ponto.y, 0, window.innerHeight)));
      if (dy) window.scrollBy(0, dy);
      document.querySelectorAll('[data-circuito-scroll]').forEach((area) => {
        const r = area.getBoundingClientRect();
        if (ponto.y < r.top || ponto.y > r.bottom || ponto.x < r.left || ponto.x > r.right) return;
        const dx = Math.max(-16, Math.min(16, velocidade(ponto.x, r.left, r.right)));
        if (dx && area.scrollWidth > area.clientWidth) area.scrollLeft += dx;
      });
      setSobre(espacoEm(ponto.x, ponto.y));
      quadro = requestAnimationFrame(rolar);
    };
    const mover = (ev) => {
      ponto = { x: ev.clientX, y: ev.clientY };
      if (!ativo) { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < DISTANCIA_MINIMA) return; ativo = true; quadro = requestAnimationFrame(rolar); }
      setArrasto({ peca, origem, x: ev.clientX, y: ev.clientY });
      setSobre(espacoEm(ev.clientX, ev.clientY));
    };
    const remover = () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', fim);
      window.removeEventListener('pointercancel', fim);
      limpar.current = null;
    };
    function fim(ev) {
      remover();
      if (!ativo) return; // era só um toque: o onClick cuida
      recente.current = true; setTimeout(() => { recente.current = false; }, 80);
      setArrasto(null); setSobre(null);
      document.activeElement?.blur?.(); // o foco sai da peça: assim a tecla Enter volta a executar o circuito
      if (ev.type === 'pointercancel') return; // o navegador cancelou (ex.: rolagem): não faz nada
      const alvo = espacoEm(ev.clientX, ev.clientY);
      onSoltar(peca, origem, alvo);
      if (!alvo) voarDeVolta(peca, ev.clientX, ev.clientY);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', fim);
    window.addEventListener('pointercancel', fim);
    limpar.current = remover;
  };
  return { arrasto, sobre, volta, iniciar, foiArrasto: () => recente.current };
}
