import React, { useEffect, useRef } from 'react';

// A janela rola por dentro para manter todo o conteúdo acessível em telas baixas.
export function Modal({ children, onClose, largo, titulo = 'Mensagem' }) {
  const caixa = useRef(null);
  const fechar = useRef(onClose);
  fechar.current = onClose;
  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    caixa.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      if (anterior?.isConnected) anterior.focus?.({ preventScroll: true });
    };
  }, []);
  const teclado = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); fechar.current?.(); }
    if (e.key !== 'Tab') return;
    const alvos = [...caixa.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href], select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter((el) => el.getClientRects().length);
    const primeiro = alvos[0], ultimo = alvos[alvos.length - 1];
    if (!primeiro) { e.preventDefault(); return; }
    if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === caixa.current)) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && (document.activeElement === ultimo || document.activeElement === caixa.current)) { e.preventDefault(); primeiro.focus(); }
  };
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-3 sm:p-4" style={{ background: 'rgba(16,26,74,.7)' }} onClick={onClose}>
      <div ref={caixa} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} onKeyDown={teclado}
        className={'card up w-full min-w-0 overflow-y-auto overscroll-contain p-4 sm:p-6 text-center ' + (largo ? 'max-w-3xl' : 'max-w-sm')}
        style={{ maxHeight: 'calc(100dvh - 2rem)' }} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
