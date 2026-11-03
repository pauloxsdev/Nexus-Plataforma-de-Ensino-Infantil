import React from 'react';
import { act, create } from 'react-test-renderer';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useArrastar } from './useArrastar';

let root, api, janela, enviar, area;
function Tela() { api = useArrastar({ onSoltar: enviar, desabilitado: false }); return null; }
const ponteiro = (tipo, x, y) => {
  const e = new Event(tipo);
  Object.assign(e, { clientX: x, clientY: y });
  janela.dispatchEvent(e);
};
beforeEach(() => {
  vi.useFakeTimers();
  enviar = vi.fn();
  janela = new EventTarget();
  janela.innerHeight = 800;
  janela.scrollBy = vi.fn();
  area = { scrollWidth: 600, clientWidth: 300, scrollLeft: 0, getBoundingClientRect: () => ({ left: 0, right: 300, top: 200, bottom: 700 }) };
  vi.stubGlobal('window', janela);
  vi.stubGlobal('document', { elementFromPoint: () => null, querySelector: () => null, querySelectorAll: (s) => s === '[data-circuito-scroll]' ? [area] : [] });
  vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 16));
  vi.stubGlobal('cancelAnimationFrame', (id) => clearTimeout(id));
  act(() => { root = create(React.createElement(Tela)); });
});
afterEach(() => { act(() => root.unmount()); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('rola a página na borda durante o arrasto e cancela ao soltar', () => {
  act(() => api.iniciar('andar', 'paleta', { button: 0, clientX: 100, clientY: 400 }));
  act(() => ponteiro('pointermove', 100, 790));
  act(() => vi.advanceTimersByTime(48));
  expect(janela.scrollBy).toHaveBeenCalledWith(0, 10);
  act(() => ponteiro('pointerup', 100, 790));
  const chamadas = janela.scrollBy.mock.calls.length;
  act(() => vi.advanceTimersByTime(100));
  expect(janela.scrollBy).toHaveBeenCalledTimes(chamadas);
  expect(enviar).toHaveBeenCalledWith('andar', 'paleta', null);
});
it('rola somente a área horizontal do circuito ao atingir sua borda', () => {
  act(() => api.iniciar('andar', 'paleta', { button: 0, clientX: 100, clientY: 400 }));
  act(() => ponteiro('pointermove', 290, 400));
  act(() => vi.advanceTimersByTime(32));
  expect(area.scrollLeft).toBeGreaterThan(0);
  expect(janela.scrollBy).not.toHaveBeenCalled();
  act(() => ponteiro('pointercancel', 290, 400));
  const anterior = area.scrollLeft;
  act(() => vi.advanceTimersByTime(50));
  expect(area.scrollLeft).toBe(anterior);
  expect(enviar).not.toHaveBeenCalled();
});
it('um toque sem arrastar não inicia rolagem nem solta uma peça', () => {
  act(() => api.iniciar('andar', 'paleta', { button: 0, clientX: 100, clientY: 790 }));
  act(() => ponteiro('pointermove', 102, 791));
  act(() => vi.advanceTimersByTime(50));
  act(() => ponteiro('pointerup', 102, 791));
  expect(janela.scrollBy).not.toHaveBeenCalled();
  expect(enviar).not.toHaveBeenCalled();
});
