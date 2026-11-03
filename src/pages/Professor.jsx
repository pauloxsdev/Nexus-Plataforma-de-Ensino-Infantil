import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Btn } from '../components/Btn';
import { Modal } from '../components/Modal';
import { FASES } from '../data/fases';

export function Teacher({ sair }) {
  const [turmas, setTurmas] = useState([]), [selecionada, setSelecionada] = useState('');
  const [alunos, setAlunos] = useState([]), [nome, setNome] = useState(''), [fuso, setFuso] = useState('America/Sao_Paulo');
  const [erro, setErro] = useState(''), [busy, setBusy] = useState(false), [credencial, setCredencial] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null), [senha, setSenha] = useState({ atual: '', nova: '' });
  const executar = async (fn) => { setBusy(true); setErro(''); try { await fn(); } catch (e) { setErro(e.message); } finally { setBusy(false); } };
  const atualizarTurmas = async () => { const lista = await api('/turmas'); setTurmas(lista); return lista; };
  const atualizarAlunos = async (id = selecionada) => { if (id) setAlunos(await api(`/turmas/${id}/alunos`)); };
  useEffect(() => { void executar(atualizarTurmas); }, []);
  useEffect(() => { let active = true; setAlunos([]); if (selecionada) { setBusy(true); api(`/turmas/${selecionada}/alunos`).then(v => { if (active) setAlunos(v); }).catch(e => { if (active) setErro(e.message); }).finally(() => { if (active) setBusy(false); }); } return () => { active = false; }; }, [selecionada]);
  const criar = (e) => { e.preventDefault(); void executar(async () => { const t = await api('/turmas', { method: 'POST', body: { nome, fuso } }); await atualizarTurmas(); setSelecionada(t.id); setNome(''); }); };
  const acao = (url, method, body) => executar(async () => { await api(url, { method, body }); await atualizarAlunos(); });
  return <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
    <header className="flex flex-wrap justify-between items-center gap-3"><h1 className="text-3xl sm:text-4xl">Área do professor</h1><Btn c="#fff" onClick={() => executar(sair)} disabled={busy}>Sair</Btn></header>
    <p>Dados reais das suas turmas. Alunos são identificados por apelidos automáticos; guarde a correspondência com nomes fora do sistema.</p>
    {erro && <p className="card p-4 text-red-800" role="alert">{erro}</p>}
    <form onSubmit={criar} className="card p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto] items-end gap-3"><label className="min-w-0">Nova turma<input className="w-full border-2 rounded-xl p-3" required maxLength={80} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Turma da manhã" /></label><label>Fuso das atividades<select className="block w-full border-2 rounded-xl p-3 max-w-full" value={fuso} onChange={e => setFuso(e.target.value)}>{['America/Sao_Paulo', 'America/Manaus', 'America/Rio_Branco', 'America/Noronha', 'Europe/Lisbon'].map(z => <option key={z}>{z}</option>)}</select></label><Btn type="submit" disabled={busy}>Criar turma</Btn></form>
    <label className="block">Turma<select aria-label="Turma" className="w-full border-2 rounded-xl p-3" value={selecionada} disabled={busy} onChange={e => setSelecionada(e.target.value)}><option value="">Selecione uma turma</option>{turmas.map(t => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
    {!turmas.length && !busy && <p className="card p-4">Você ainda não tem turmas. Crie a primeira acima.</p>}
    {selecionada && <>
      <div className="flex flex-wrap gap-3"><Btn disabled={busy} onClick={() => executar(async () => { const aluno = await api(`/turmas/${selecionada}/alunos`, { method: 'POST' }); setCredencial(aluno); await atualizarAlunos(); })}>Adicionar aluno</Btn><Btn disabled={busy} c="#fff" onClick={() => executar(() => atualizarAlunos())}>Atualizar progresso</Btn><Btn disabled={busy} c="#fff" onClick={() => setConfirmacao({ texto: 'Excluir esta turma e todos os seus alunos, sessões e registros? Esta ação não pode ser desfeita.', fn: async () => { await api(`/turmas/${selecionada}`, { method: 'DELETE' }); setSelecionada(''); await atualizarTurmas(); } })}>Excluir turma</Btn></div>
      {!alunos.length && !busy && <p className="card p-4">Esta turma ainda não tem alunos.</p>}
      <div className="grid gap-4 md:grid-cols-2">{alunos.map(a => <article key={a.id} className="card p-4 space-y-3 min-w-0">
        <h2 className="text-xl">{a.label} {!a.active && '(desativado)'}</h2>
        <p>{a.concluidas} de {a.totalFases} fases concluídas · {a.restantes} restantes · {a.estrelas} estrelas</p>
        <p>{a.diasAcumulados} {a.diasAcumulados === 1 ? 'dia' : 'dias'} de atividade · {a.diasConsecutivos} {a.diasConsecutivos === 1 ? 'dia consecutivo' : 'dias consecutivos'}</p><p className="text-sm">Última atividade: {a.ultimaAtividade ? a.ultimaAtividade.split('-').reverse().join('/') : 'Nenhuma registrada'}</p>
        <details><summary className="cursor-pointer py-2">Ver fases</summary><ul>{FASES.map(f => <li key={f.id}>{f.id}. {f.titulo}: {(a.progresso || {})[f.id] ? `${(a.progresso || {})[f.id]} estrelas` : 'Não concluída'}</li>)}</ul></details>
        <div className="flex flex-wrap gap-2"><Btn c="#fff" className="!text-sm" disabled={busy} onClick={() => setConfirmacao({ texto: 'Gerar outro código? O código anterior e as sessões abertas serão revogados.', fn: async () => setCredencial({ rotulo: a.label, ...await api(`/alunos/${a.id}/codigo`, { method: 'POST' }) }) })}>Novo código</Btn><Btn c="#fff" className="!text-sm" disabled={busy} onClick={() => acao(`/alunos/${a.id}`, 'PATCH', { ativo: !a.active })}>{a.active ? 'Desativar' : 'Ativar'}</Btn><Btn c="#fff" className="!text-sm" disabled={busy} onClick={() => setConfirmacao({ texto: `Excluir ${a.label} e seus registros permanentemente?`, fn: async () => { await api(`/alunos/${a.id}`, { method: 'DELETE' }); await atualizarAlunos(); } })}>Excluir aluno</Btn></div>
      </article>)}</div>
    </>}
    <details className="card p-4"><summary className="cursor-pointer py-2">Alterar minha senha</summary><form className="grid gap-3 mt-3" onSubmit={e => { e.preventDefault(); void executar(async () => { await api('/auth/password', { method: 'POST', body: senha }); await sair(true); }); }}><label>Senha atual<input className="block w-full border-2 rounded-xl p-3" type="password" autoComplete="current-password" required value={senha.atual} onChange={e => setSenha({ ...senha, atual: e.target.value })} /></label><label>Nova senha (mínimo 12 caracteres)<input className="block w-full border-2 rounded-xl p-3" type="password" minLength={12} autoComplete="new-password" required value={senha.nova} onChange={e => setSenha({ ...senha, nova: e.target.value })} /></label><Btn disabled={busy} type="submit">Alterar senha e encerrar sessões</Btn></form></details>
    {credencial && <Modal titulo="Código do aluno" onClose={() => setCredencial(null)}><h2 className="text-2xl">Código de {credencial.rotulo || 'acesso'}</h2><p className="mt-3">Guarde e entregue ao aluno. O código não poderá ser consultado novamente; você poderá gerar outro.</p><code className="block break-all bg-white border-2 rounded-xl p-3 my-4 select-all">{credencial.codigo.match(/.{1,4}/g).join('-')}</code><Btn onClick={() => setCredencial(null)}>Já guardei o código</Btn></Modal>}
    {confirmacao && <Modal titulo="Confirmar alteração" onClose={() => { if (!busy) setConfirmacao(null); }}><p>{confirmacao.texto}</p><div className="flex flex-wrap gap-3 mt-4"><Btn disabled={busy} onClick={() => executar(async () => { await confirmacao.fn(); setConfirmacao(null); })}>Confirmar</Btn><Btn c="#fff" disabled={busy} onClick={() => setConfirmacao(null)}>Cancelar</Btn></div>{erro && <p role="alert">{erro}</p>}</Modal>}
  </main>;
}
