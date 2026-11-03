import React from 'react';
import { INK, PINK } from '../theme/tokens';
import { Btn } from '../components/Btn';
import { Nexi } from '../components/Nexi';
import { NexusAvatar, CORES_NEXUS, FORMAS, ROSTOS, ENFEITES, NOMES } from '../components/NexusAvatar';
import { AvCtx } from '../context/AvatarContext';
import { sfx } from '../services/som';

// "Meu Nexus": o aluno monta o seu avatar (uma criatura abstrata) com forma, cor, rosto e enfeite.
const Opcao = ({ sel, onClick, rotulo, children }) => (
  <button onClick={onClick} aria-pressed={sel} aria-label={rotulo} title={rotulo} className="rounded-2xl flex items-center justify-center hover:brightness-95"
    style={{ width: 74, height: 74, background: sel ? '#FFF6B8' : '#fff', border: `3px solid ${INK}`, outline: sel ? `4px solid ${PINK}` : 'none', outlineOffset: 2, boxShadow: `3px 3px 0 ${INK}` }}>{children}</button>
);
const Secao = ({ titulo, dica, t, children }) => (
  <section data-t={t} className="mb-5">
    <div className="flex flex-wrap items-baseline gap-2 mb-2"><h3 className="text-2xl">{titulo}</h3><span className="text-xs">{dica}</span></div>
    <div className="flex flex-wrap gap-3">{children}</div>
  </section>
);

export function Avatar({ go }) {
  const [a, setA] = React.useContext(AvCtx);
  const mudar = (parte) => { sfx('tap'); setA({ ...a, ...parte }); };
  const sortear = () => { const r = (l) => l[Math.floor(Math.random() * l.length)]; sfx('place'); setA({ forma: r(FORMAS), cor: r(CORES_NEXUS), rosto: r(ROSTOS), acc: r(ENFEITES) }); };
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
      <div className="lg:sticky lg:top-4">
        <h2 className="text-3xl sm:text-4xl">Meu Nexus</h2>
        <p className="mt-1 mb-4">Este é o seu personagem no jogo. Monte um Nexus que tenha a sua cara!</p>
        <div className="card p-5 flex flex-col items-center gap-2" style={{ background: '#FFF6B8' }}>
          <NexusAvatar s={210} {...a} />
          <span className="disp text-2xl rounded-full px-5" style={{ background: '#fff', border: `3px solid ${INK}` }}>Nexus</span>
        </div>
        <div className="flex gap-3 mt-4">
          <Btn data-t="av-sortear" c="#fff" className="flex-1 !text-base" onClick={sortear}>Sortear</Btn>
          <Btn className="flex-1 !text-base" onClick={() => go('dash')}>Pronto!</Btn>
        </div>
        <div className="flex items-end gap-2 mt-4"><Nexi s={52} mood="curioso" /><p className="text-sm">Dica do Nexi: não existe Nexus certo ou errado. Misture do jeito que quiser!</p></div>
      </div>
      <div>
        <Secao titulo="Forma" dica="o corpo do seu Nexus" t="av-forma">
          {FORMAS.map((k) => <Opcao key={k} sel={a.forma === k} rotulo={NOMES.forma[k]} onClick={() => mudar({ forma: k })}><NexusAvatar s={56} forma={k} cor={a.cor} rosto={a.rosto} acc="nenhum" rotulo={NOMES.forma[k]} /></Opcao>)}
        </Secao>
        <Secao titulo="Cor" dica="escolha a sua favorita" t="av-cor">
          {CORES_NEXUS.map((c) => <button key={c} aria-label="Escolher cor" aria-pressed={a.cor === c} onClick={() => mudar({ cor: c })} className="w-12 h-12 rounded-full hover:brightness-95" style={{ background: c, border: `3px solid ${INK}`, outline: a.cor === c ? `4px solid ${PINK}` : 'none', outlineOffset: 3 }} />)}
        </Secao>
        <Secao titulo="Rosto" dica="como o seu Nexus se sente" t="av-rosto">
          {ROSTOS.map((k) => <Opcao key={k} sel={a.rosto === k} rotulo={NOMES.rosto[k]} onClick={() => mudar({ rosto: k })}><NexusAvatar s={56} forma={a.forma} cor={a.cor} rosto={k} acc="nenhum" rotulo={NOMES.rosto[k]} /></Opcao>)}
        </Secao>
        <Secao titulo="Enfeite" dica="um toque especial" t="av-enfeite">
          {ENFEITES.map((k) => <Opcao key={k} sel={a.acc === k} rotulo={NOMES.enfeite[k]} onClick={() => mudar({ acc: k })}><NexusAvatar s={56} forma={a.forma} cor={a.cor} rosto={a.rosto} acc={k} rotulo={NOMES.enfeite[k]} /></Opcao>)}
        </Secao>
      </div>
    </div>
  );
}
