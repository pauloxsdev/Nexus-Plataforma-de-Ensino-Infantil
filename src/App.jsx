import React, { useEffect, useState } from 'react';
import { SUN } from './theme/tokens';
import { Ic } from './components/Icon';
import { Tutorial } from './components/Tutorial';
import { TOUR } from './data/tutoriais';
import { AvCtx, AVATAR_PADRAO } from './context/AvatarContext';
import { useConexao } from './hooks/useConexao';
import { useAtividade } from './hooks/useAtividade';
import { useSom } from './hooks/useSom';
import { useProgresso } from './hooks/useProgresso';
import { useDadoPerfil } from './hooks/useDadoPerfil';
import { PERFIL_DEMO, chavePerfil } from './services/perfilLocal';
import { useConquistas } from './hooks/useConquistas';
import { api, definirSessao, csrfAtiva } from './services/api';
import { prepararAluno, enviarFila, encerrarPerfil } from './services/sessaoAluno';
import { Teacher } from './pages/Professor';
import { Login } from './pages/Login';
import { Dash } from './pages/Base';
import { Avatar } from './pages/Avatar';
import { Courses } from './pages/Trilha';
import { Aula } from './pages/Aula';
import { Work } from './pages/Oficina';
import { Nivel } from './pages/Nivel';
import { Ach } from './pages/Conquistas';
import { BarraLateral } from './components/BarraLateral';
import { FASES } from './data/fases';
import { AULAS } from './data/aulas';

function normalizarAvatar(valor) {
  return { ...AVATAR_PADRAO, ...(valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {}) };
}

export default function App() {
  const [sessao, setSessao] = useState(null), [carregando, setCarregando] = useState(true), [erro, setErro] = useState('');
  const autenticar = async (s) => { definirSessao(s); const pronta = s.papel === 'aluno' ? await prepararAluno(s) : s; setSessao(pronta); setErro(''); };
  useEffect(() => {
    let ativo = true;
    (async () => { try { const s = await api('/session'); if (ativo) await autenticar(s); } catch (e) { if (ativo && e.status !== 401) setErro(e.message); } finally { if (ativo) setCarregando(false); } })();
    return () => { ativo = false; };
  }, []);
  const sair = async (jaRevogada = false) => {
    if (sessao?.papel !== 'demo' && !jaRevogada) {
      // Uma falha de envio preserva a fila, mas não impede revogar a sessão online.
      if (sessao?.perfil) await enviarFila(sessao.perfil).catch(() => {});
      try { await api('/auth/logout', { method: 'POST' }); } catch (e) { if (e.status !== 401) throw e; }
    }
    encerrarPerfil(); definirSessao(null); setSessao(null);
  };
  if (carregando) return <p role="status" className="p-6">Verificando sessão...</p>;
  if (!sessao) return <>{erro && <p role="alert" className="p-4">{erro}</p>}<Login autenticar={autenticar} entrar={async () => { try { await api('/auth/logout', { method: 'POST' }); } catch (e) { if (e.status !== 401 && csrfAtiva()) { setErro(e.message); return; } } definirSessao(null); setSessao({ papel: 'demo', perfil: PERFIL_DEMO }); }} /></>;
  if (sessao.papel === 'professor') return <Teacher sair={sair} />;
  return <AppPerfil key={chavePerfil(sessao.perfil, 'sessao')} perfil={sessao.perfil} sessao={sessao} sair={sair} />;
}

function AppPerfil({ perfil, sessao, sair }) {
  const [s, setS] = useState('dash');
  const [erroSaida, setErroSaida] = useState('');
  const [seen, setSeen] = useState({ work: 1 }); // na fase, quem abre sozinha é a MISSÃO (o tutorial fica no botão "?")
  const [tour, setTour] = useState(true);
  const [av, setAv] = useDadoPerfil(perfil, 'avatar', normalizarAvatar); // o Nexus do aluno (forma, cor, rosto e enfeite)
  const { net, save, chip } = useConexao(perfil);
  const { snd, toggle: toggleSnd } = useSom();
  const { feitas, estrelas, totalEstrelas, concluir, zerar, liberarTodas, demoLiberada, proximaId, totalFases, restantes } = useProgresso(FASES, perfil);
  const atividade = useAtividade(perfil, sessao.fuso);
  const codigo = perfil.tipo === 'aluno' ? sessao.rotulo : null;
  const [faseId, setFaseId] = useState(null);
  const [aulaId, setAulaId] = useState(1);
  const faseAtual = FASES.find((f) => f.id === (faseId ?? proximaId));

  const conquistas = useConquistas({
    fasesFeitas: feitas.length, feitas, totalEstrelas,
    tres: Object.values(estrelas).filter((n) => n >= 3).length,
    avatarMudou: JSON.stringify(av) !== JSON.stringify(AVATAR_PADRAO),
    dias: atividade.consecutivos, totalFases,
  }, perfil);

  const go = (k) => { if (k === 'login') { void sair().catch(e => setErroSaida(e.message)); return; } if (k === 'teacher') return; if (k === 'work' && faseId === null) setFaseId(proximaId); setS(k); setTour(!seen[k]); };
  const close = () => { setSeen({ ...seen, [s]: 1 }); setTour(false); };
  const jogar = (id) => { setFaseId(id); go('work'); };
  const abrirAula = (id) => { setAulaId(id); go('aula'); };
  const liberada = (id) => demoLiberada || id === 1 || feitas.includes(id - 1);

  const V = {
    dash: <Dash atividade={atividade} feitas={feitas.length} totalFases={totalFases} restantes={restantes} conquistas={conquistas.lista.filter((c) => c.desbloqueada).length} go={(k) => k === 'work' ? jogar(proximaId) : go(k)} estrelas={totalEstrelas} fase={FASES.find((f) => f.id === proximaId)} />,
    avatar: <Avatar go={go} />,
    courses: <Courses demoLiberada={demoLiberada} feitas={feitas} estrelas={estrelas} proximaId={proximaId} jogar={jogar} abrirAula={abrirAula} liberarTodas={perfil.tipo === 'demo' ? liberarTodas : null} zerar={perfil.tipo === 'demo' ? zerar : null} />,
    aula: (
      <Aula key={aulaId} fase={FASES.find((f) => f.id === aulaId)} aula={AULAS[aulaId]} estrelas={estrelas[aulaId]} status={feitas.includes(aulaId) ? 'done' : 'now'} total={FASES.length}
        onVoltar={() => go('courses')} onJogar={() => jogar(aulaId)}
        onOutra={{ anterior: aulaId > 1 ? () => abrirAula(aulaId - 1) : null, proxima: aulaId < FASES.length && liberada(aulaId + 1) ? () => abrirAula(aulaId + 1) : null }} />
    ),
    work: <Work key={faseAtual.id} fase={faseAtual} onAtividade={(tentativa) => { atividade.registrar(); if (perfil.tipo === 'aluno') void save({ tipo: 'tentativa', perfil, ...tentativa }); }} perfil={perfil} projetoId="trilha-principal" onConcluir={(id, estrelas) => { concluir(id, estrelas); if (perfil.tipo === 'demo') void save({ tipo: 'fase_concluida', perfil: { ...perfil }, codigo, faseId: id, estrelas }); }} irParaFase={jogar} go={go} layout="vertical" />,
    nivel: <Nivel go={go} feitas={feitas.length} total={totalFases} estrelas={totalEstrelas} />,
    ach: <Ach lista={conquistas.lista} novas={conquistas.novas} marcarVistas={conquistas.marcarVistas} />,
  };
  return (
    <AvCtx.Provider value={[av, setAv]}>
      <div className="flex min-h-screen flex-col md:flex-row">
        {s !== 'login' && (
          <BarraLateral dias={atividade.consecutivos} tela={s} ir={go} jogar={jogar} codigo={codigo} totalEstrelas={totalEstrelas} fasesFeitas={feitas.length} totalFases={FASES.length}
            faseAtualId={faseAtual.id} proximaId={proximaId} chip={chip} novas={conquistas.novas.length}
            config={{ internet: [net.on], som: [snd, toggleSnd] }} />
        )}
        <main className="flex-1 min-w-0 pb-24 md:pb-28 md:pl-3">
          {erroSaida && <p className="p-4 text-red-800" role="alert">{erroSaida}</p>}
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
