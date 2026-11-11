import React, { useState } from 'react';
import { Btn } from '../components/Btn';
import { Ic } from '../components/Icon';
import { Nexi } from '../components/Nexi';
import { NexusAvatar, NOMES } from '../components/NexusAvatar';
import { AvCtx } from '../context/AvatarContext';
import { catalogo, liberado, requisito, colecao } from '../data/personalizacao';
import { sfx } from '../services/som';

const SECOES = [['forma', 'Forma', 'O começo de um personagem único', 'av-forma'], ['cor', 'Cor', 'Uma paleta cheia de possibilidades', 'av-cor'], ['rosto', 'Rosto', 'Uma expressão para cada aventura', 'av-rosto'], ['acc', 'Enfeite', 'Pequenos tesouros das suas descobertas', 'av-enfeite']];
const nomeItem = (parte, i) => i.nome || NOMES[parte === 'acc' ? 'enfeite' : parte]?.[i.id] || i.id;
export function Avatar({ go, progresso }) {
  const [a, setA] = React.useContext(AvCtx);
  const [mensagem, setMensagem] = useState('Sua coleção cresce a cada descoberta.');
  const { livres, total } = colecao(progresso);
  const escolher = (parte, item) => {
    if (!liberado(item, progresso)) { setMensagem(`${nomeItem(parte, item)}: ${requisito(item)}.`); return; }
    sfx('tap'); setA({ ...a, [parte]: item.id }); setMensagem(`${nomeItem(parte, item)} equipado!`);
  };
  const sortear = () => {
    const novo = Object.fromEntries(Object.entries(catalogo).map(([parte, itens]) => {
      const opcoes = itens.filter(i => liberado(i, progresso));
      return [parte, opcoes[Math.floor(Math.random() * opcoes.length)].id];
    }));
    sfx('place'); setA(novo); setMensagem('Uma nova combinação com os seus itens desbloqueados!');
  };
  return <div className="max-w-6xl mx-auto p-4 sm:p-6">
    <div className="mb-6"><span className="eyebrow">ATELIÊ DE DESCOBERTAS</span><h2 className="text-3xl sm:text-4xl mt-2">Um Nexus com a sua cara</h2><p className="mt-2">Jogue, descubra e desbloqueie novas maneiras de se expressar.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 items-start">
      <aside className="avatar-preview lg:sticky lg:top-5">
        <div className="card avatar-stage"><span className="eyebrow">SEU PERSONAGEM</span><span aria-hidden="true" className="stage-spark">✦</span><div className="avatar-podium"><NexusAvatar s={190} {...a} /></div><h3 className="text-3xl">Meu Nexus</h3><p className="text-sm mt-2">Pronto para a próxima aventura!</p></div>
        <div className="collection-meter card mt-4 p-4"><div className="flex justify-between gap-2"><b>Sua coleção</b><span>{livres}/{total}</span></div><progress className="w-full mt-2" value={livres} max={total} aria-label="Itens desbloqueados" /><p className="text-xs mt-2">Itens iniciais + recompensas por fases e estrelas.</p></div>
        <div className="flex gap-3 mt-4"><Btn data-t="av-sortear" c="#fff" className="flex-1 !text-base" onClick={sortear}>Sortear</Btn><Btn className="flex-1 !text-base" onClick={() => go('dash')}>Pronto!</Btn></div>
        <div className="nexi-note mt-5"><Nexi s={66} /><p className="text-sm">Os cadeados contam o próximo desafio. Toque para descobrir!</p></div>
      </aside>
      <div className="min-w-0"><div role="status" aria-live="polite" className="wardrobe-message mb-4">{mensagem}</div>
        {SECOES.map(([parte, titulo, dica, t]) => <section key={parte} data-t={t} className="card wardrobe-section mb-5"><div className="flex flex-wrap items-baseline justify-between gap-2 mb-4"><div><h3 className="text-2xl">{titulo}</h3><p className="text-xs mt-1">{dica}</p></div><span className="collection-count">{catalogo[parte].filter(i => liberado(i, progresso)).length}/{catalogo[parte].length}</span></div>
          <div className="wardrobe-grid">{catalogo[parte].map(item => {
            const livre = liberado(item, progresso), selecionado = a[parte] === item.id;
            const nome = nomeItem(parte, item);
            return <button key={item.id} aria-pressed={selecionado} aria-disabled={!livre} aria-label={`${nome}. ${livre ? 'Disponível' : requisito(item)}`} title={requisito(item)} onClick={() => escolher(parte, item)} className={`wardrobe-item ${selecionado ? 'selected' : ''} ${!livre ? 'locked' : ''}`}>
              <span className="wardrobe-art">{parte === 'cor' ? <span className="color-swatch" style={{ background: item.id }} /> : <NexusAvatar s={62} {...a} {...{ [parte]: item.id }} />}</span>
              <span className="text-sm font-extrabold">{nome}</span>
              <span className="wardrobe-requirement">{!livre && <Ic n="lock" s={13} />}{livre ? selecionado ? 'Em uso' : 'Liberado' : requisito(item)}</span>
            </button>;
          })}</div>
        </section>)}
        <p className="text-sm">Repetir uma fase mantém sua melhor pontuação. As estrelas não são gastas ao personalizar.</p>
      </div>
    </div>
  </div>;
}
