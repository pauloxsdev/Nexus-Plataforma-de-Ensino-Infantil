import React, { useEffect, useState } from 'react';
import { SUN } from './theme/tokens';
import { Ic } from './components/Icon';
import { Tutorial } from './components/Tutorial';
import { TOUR } from './data/tutoriais';
import { AvCtx, AVATAR_PADRAO } from './context/AvatarContext';
import { useConexao } from './hooks/useConexao';
import { useSom } from './hooks/useSom';
import { useProgresso } from './hooks/useProgresso';
import { useConquistas } from './hooks/useConquistas';
import { Login } from './pages/Login';
import { Dash } from './pages/Base';
import { Avatar } from './pages/Avatar';
import { Courses } from './pages/Trilha';
import { Aula } from './pages/Aula';
import { Work } from './pages/Oficina';
import { Nivel } from './pages/Nivel';
import { Ach } from './pages/Conquistas';
import { Teacher } from './pages/Professor';
import { BarraLateral } from './components/BarraLateral';
import { FASES } from './data/fases';
import { AULAS } from './data/aulas';

const CHAVE_AVATAR = 'nexus:avatar';
const lerAvatar = () => { try { return { ...AVATAR_PADRAO, ...(JSON.parse(localStorage.getItem(CHAVE_AVATAR)) || {}) }; } catch { return AVATAR_PADRAO; } };

export default function App() {
  const [s, setS] = useState('login');
  const [seen, setSeen] = useState({ work: 1 }); // na fase, quem abre sozinha é a MISSÃO (o tutorial fica no botão "?")
  const [tour, setTour] = useState(true);
  const [av, setAv] = useState(lerAvatar); // o Nexus do aluno (forma, cor, rosto e enfeite)
  const { net, save, chip } = useConexao();
  const { snd, toggle: toggleSnd } = useSom();
  const { feitas, estrelas, totalEstrelas, concluir, zerar, liberarTodas, proximaId } = useProgresso(FASES.length);
  const [codigo, setCodigo] = useState('A1B2C'); // o código do aluno é a única "identidade" (LGPD)
  const [faseId, setFaseId] = useState(null);
  const [aulaId, setAulaId] = useState(1);
  const faseAtual = FASES.find((f) => f.id === (faseId ?? proximaId));

  useEffect(() => { try { localStorage.setItem(CHAVE_AVATAR, JSON.stringify(av)); } catch { /* ignora */ } }, [av]);
  const conquistas = useConquistas({
    fasesFeitas: feitas.length, feitas, totalEstrelas,
    tres: Object.values(estrelas).filter((n) => n >= 3).length,
    avatarMudou: JSON.stringify(av) !== JSON.stringify(AVATAR_PADRAO),
    dias: 7, // TODO: vir do backend quando existir
  });

  const go = (k) => { setS(k); setTour(!seen[k]); };
  const close = () => { setSeen({ ...seen, [s]: 1 }); setTour(false); };
  const jogar = (id) => { setFaseId(id); go('work'); };
  const abrirAula = (id) => { setAulaId(id); go('aula'); };
  const liberada = (id) => id === 1 || feitas.includes(id - 1);

  const V = {
    login: <Login go={go} entrar={(c) => { setCodigo(c); go('dash'); }} />,
    dash: <Dash go={go} estrelas={totalEstrelas} fase={FASES.find((f) => f.id === proximaId)} />,
    avatar: <Avatar go={go} />,
    courses: <Courses feitas={feitas} estrelas={estrelas} proximaId={proximaId} jogar={jogar} abrirAula={abrirAula} liberarTodas={liberarTodas} zerar={zerar} />,
    aula: (
      <Aula key={aulaId} fase={FASES.find((f) => f.id === aulaId)} aula={AULAS[aulaId]} estrelas={estrelas[aulaId]} status={feitas.includes(aulaId) ? 'done' : 'now'} total={FASES.length}
        onVoltar={() => go('courses')} onJogar={() => jogar(aulaId)}
        onOutra={{ anterior: aulaId > 1 ? () => abrirAula(aulaId - 1) : null, proxima: aulaId < FASES.length && liberada(aulaId + 1) ? () => abrirAula(aulaId + 1) : null }} />
    ),
    work: <Work key={faseAtual.id} fase={faseAtual} onConcluir={(id, estrelas) => { concluir(id, estrelas); void save({ tipo: 'fase_concluida', codigo, faseId: id, estrelas }); }} irParaFase={jogar} go={go} layout="vertical" />,
    nivel: <Nivel go={go} />,
    ach: <Ach lista={conquistas.lista} novas={conquistas.novas} marcarVistas={conquistas.marcarVistas} />,
    teacher: <Teacher />,
  };
  return (
    <AvCtx.Provider value={[av, setAv]}>
      <div className="flex min-h-screen">
        {s !== 'login' && (
          <BarraLateral tela={s} ir={go} jogar={jogar} codigo={codigo} totalEstrelas={totalEstrelas} fasesFeitas={feitas.length} totalFases={FASES.length}
            faseAtualId={faseAtual.id} proximaId={proximaId} chip={chip} novas={conquistas.novas.length}
            config={{ internet: [net.on], som: [snd, toggleSnd] }} />
        )}
        <main className="flex-1 min-w-0 pb-28 pl-3">
          {/* keys diferentes: tela e tutorial NÃO podem repetir a mesma key */}
          <div key={'tela-' + s}>{V[s]}</div>
        </main>
        {!tour && (
          <button onClick={() => setTour(true)} aria-label="Ajuda" className="btn fixed bottom-5 right-5 z-40 !p-0 w-14 h-14 flex items-center justify-center" style={{ background: SUN }}><Ic n="help" s={28} w={3.5} /></button>
        )}
        {tour && TOUR[s] && <Tutorial key={'tour-' + s} steps={TOUR[s]} onClose={close} />}
      </div>
    </AvCtx.Provider>
  );
}
