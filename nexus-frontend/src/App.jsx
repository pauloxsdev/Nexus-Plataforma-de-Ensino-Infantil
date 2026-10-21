import React, { useState } from 'react';
import { INK, SUN } from './theme/tokens';
import { Ic } from './components/Icon';
import { Tutorial } from './components/Tutorial';
import { TOUR } from './data/tutoriais';
import { AvCtx } from './context/AvatarContext';
import { useConexao } from './hooks/useConexao';
import { useSom } from './hooks/useSom';
import { Login } from './pages/Login';
import { Dash } from './pages/Base';
import { Avatar } from './pages/Avatar';
import { Courses } from './pages/Trilha';
import { Work } from './pages/Oficina';
import { Nivel } from './pages/Nivel';
import { Ach } from './pages/Album';
import { Teacher } from './pages/Professor';

// As abas do topo existem só para a DEMONSTRAÇÃO. No app real, trocar por react-router.
const tabs = [['login', 'Login'], ['dash', 'Base'], ['avatar', 'Astronauta'], ['courses', 'Trilha'], ['work', 'Blocos'], ['nivel', 'Nível 9'], ['ach', 'Álbum'], ['teacher', 'Professor']];

export default function App() {
  const [s, setS] = useState('login');
  const [seen, setSeen] = useState({});
  const [tour, setTour] = useState(true);
  const [av, setAv] = useState({ cor: SUN, acc: 'nenhum' });
  const { net, save, toggle: toggleNet, chip } = useConexao();
  const { snd, toggle: toggleSnd } = useSom();
  const go = (k) => { setS(k); setTour(!seen[k]); };
  const close = () => { setSeen({ ...seen, [s]: 1 }); setTour(false); };
  const V = { login: <Login go={go} />, dash: <Dash go={go} />, avatar: <Avatar go={go} />, courses: <Courses go={go} />, work: <Work save={save} go={go} />, nivel: <Nivel go={go} />, ach: <Ach />, teacher: <Teacher /> };
  return (
    <AvCtx.Provider value={[av, setAv]}>
      <div className="pb-28">
        <nav className="sticky top-0 z-40 flex gap-1 overflow-x-auto px-3 pt-2" style={{ background: INK }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => go(k)} className="disp whitespace-nowrap px-4 py-2 rounded-t-xl text-base" style={{ background: s === k ? '#E6EDFF' : 'transparent', color: s === k ? INK : '#fff' }}>{l}</button>
          ))}
          <div className="ml-auto flex gap-1 shrink-0 items-center pl-2 pb-1">
            {[[toggleNet, 'Internet: ' + (net.on ? 'ligada' : 'desligada')], [toggleSnd, 'Som: ' + (snd ? 'ligado' : 'mudo')]].map(([f, l]) => (
              <button key={l} onClick={f} className="text-xs rounded-full px-3 py-1.5" style={{ background: '#fff', color: INK, border: `2px solid ${SUN}` }}>{l}</button>
            ))}
          </div>
        </nav>
        {s !== 'login' && (
          <div className="flex justify-end px-4 pt-3">
            <span role="status" className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs" style={{ background: chip[1], border: `2px solid ${INK}` }}><Ic n={chip[0]} s={16} w={3} />{chip[2]}</span>
          </div>
        )}
        {/* keys diferentes: tela e tutorial NÃO podem repetir a mesma key */}
        <div key={'tela-' + s}>{V[s]}</div>
        {!tour && (
          <button onClick={() => setTour(true)} aria-label="Ajuda" className="btn fixed bottom-5 right-5 z-40 !p-0 w-14 h-14 flex items-center justify-center" style={{ background: SUN }}><Ic n="help" s={28} w={3.5} /></button>
        )}
        {tour && <Tutorial key={'tour-' + s} steps={TOUR[s]} onClose={close} />}
      </div>
    </AvCtx.Provider>
  );
}
