import React, { useState } from 'react';
import { Nexi } from '../components/Nexi';
import { Btn } from '../components/Btn';
import { api, definirSessao } from '../services/api';

export function Login({ entrar, autenticar }) {
  const [modo, setModo] = useState('aluno');
  const [codigo, setCodigo] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  const enviar = async (e) => {
    e.preventDefault(); setBusy(true); setErro('');
    try {
      const sessao = await api(`/auth/${modo}`, { method: 'POST', body: modo === 'aluno' ? { codigo } : { login, senha } });
      definirSessao(sessao); await autenticar(sessao);
    } catch (error) { setErro(error.message); } finally { setBusy(false); setSenha(''); }
  };
  return <div className="max-w-4xl mx-auto p-4 sm:p-5 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
    <div><Nexi s={84} /><h1 className="text-4xl sm:text-5xl mt-3">Conheça o Nexus</h1><p className="mt-3">Aprenda, experimente e continue sua trilha.</p></div>
    <div className="card p-4 sm:p-6">
      <div className="flex flex-wrap gap-2 mb-5">{['aluno', 'professor'].map((m) => <button key={m} className="btn !text-base" aria-pressed={modo === m} disabled={busy} onClick={() => { setModo(m); setErro(''); }}>{m === 'aluno' ? 'Sou aluno' : 'Sou professor'}</button>)}</div>
      <form onSubmit={enviar} className="grid gap-3">
        {modo === 'aluno' ? <label>Código do aluno<input aria-label="Código do aluno" className="w-full border-2 rounded-xl p-3" value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" maxLength={48} required /><span className="text-sm">Use o código entregue pelo professor. Não informe seu nome.</span></label> : <><label>Usuário do professor<input className="w-full border-2 rounded-xl p-3" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" maxLength={80} required /></label><label>Senha<input className="w-full border-2 rounded-xl p-3" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" required /></label><p className="text-sm">Para criar ou recuperar o acesso, procure o administrador da escola.</p></>}
        {erro && <p role="alert" className="text-red-800 break-words">{erro}</p>}
        <Btn disabled={busy} type="submit">{busy ? 'Entrando...' : 'Entrar'}</Btn>
      </form>
      <Btn data-t="enter" c="#fff" disabled={busy} className="w-full mt-6 !text-base" onClick={entrar}>Explorar demonstração</Btn>
      <p className="text-sm mt-3">A demonstração é separada dos alunos e salva somente neste navegador.</p>
    </div>
  </div>;
}
