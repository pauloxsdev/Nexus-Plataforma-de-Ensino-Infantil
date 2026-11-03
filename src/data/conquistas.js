import { FASES } from './fases';
// Conquistas do Nexus. "atual(c)" diz quanto a criança já tem; "meta" é quanto precisa.
// c = { fasesFeitas, feitas: [ids], totalEstrelas, tres: fases com 3 estrelas, avatarMudou, dias }
// Para criar uma conquista nova, acrescente um item aqui (o símbolo vem de components/Emblema.jsx).
const conta = (c, ids) => ids.filter((i) => c.feitas.includes(i)).length;

export const RARIDADES = {
  bronze: { nome: 'Bronze', cor: '#E0975A' },
  prata: { nome: 'Prata', cor: '#C9D3EA' },
  ouro: { nome: 'Ouro', cor: '#FFD60A' },
  diamante: { nome: 'Diamante', cor: '#7FE7FF' },
};

export const CONQUISTAS = [
  { id: 'primeira', nome: 'Primeira missão', desc: 'Você deu o primeiro passo!', como: 'Complete a fase 1.', raridade: 'bronze', simbolo: 'bandeira', meta: 1, atual: (c) => conta(c, [1]) },
  { id: 'meunexus', nome: 'Um Nexus só seu', desc: 'Você deixou o seu Nexus com a sua cara.', como: 'Mude a forma, a cor, o rosto ou o enfeite do seu Nexus.', raridade: 'bronze', simbolo: 'rosto', meta: 1, atual: (c) => (c.avatarMudou ? 1 : 0) },
  { id: 'sequencia', nome: 'Mestre da sequência', desc: 'Ordem certa, caminho certo.', como: 'Complete as fases 1, 2 e 3.', raridade: 'bronze', simbolo: 'passos', meta: 3, atual: (c) => conta(c, [1, 2, 3]) },
  { id: 'fogo', nome: 'Sequência de fogo', desc: 'Sete dias seguidos aprendendo!', como: 'Jogue 7 dias seguidos.', raridade: 'prata', simbolo: 'chama', meta: 7, atual: (c) => c.dias },
  { id: 'caca1', nome: 'Caçador de estrelas I', desc: 'As primeiras estrelas já são suas.', como: 'Junte 5 estrelas.', raridade: 'bronze', simbolo: 'estrela', meta: 5, atual: (c) => c.totalEstrelas },
  { id: 'meio', nome: 'Meio caminho', desc: 'Metade da trilha já ficou para trás.', como: `Complete ${Math.ceil(FASES.length / 2)} fases.`, raridade: 'prata', simbolo: 'mapa', meta: Math.ceil(FASES.length / 2), atual: (c) => c.fasesFeitas },
  { id: 'loop', nome: 'Mestre do loop', desc: 'Repetir sem repetir o trabalho.', como: 'Complete as fases 4 e 5.', raridade: 'prata', simbolo: 'loop', meta: 2, atual: (c) => conta(c, [4, 5]) },
  { id: 'perfeito', nome: 'Perfeitinho', desc: 'Poucos passos e rapidinho: 3 estrelas!', como: 'Ganhe as 3 estrelas em uma fase.', raridade: 'prata', simbolo: 'alvo', meta: 1, atual: (c) => c.tres },
  { id: 'caca2', nome: 'Caçador de estrelas II', desc: 'O céu está ficando cheio!', como: 'Junte 12 estrelas.', raridade: 'prata', simbolo: 'estrela', meta: 12, atual: (c) => c.totalEstrelas },
  { id: 'decisao', nome: 'Mente de decisão', desc: 'SE... SENÃO... você já pensa assim.', como: 'Complete as fases 6 e 7.', raridade: 'ouro', simbolo: 'bifurcacao', meta: 2, atual: (c) => conta(c, [6, 7]) },
  { id: 'colecionador', nome: 'Colecionador de estrelas', desc: 'Muitas fases no capricho.', como: 'Ganhe as 3 estrelas em 4 fases.', raridade: 'ouro', simbolo: 'coroa', meta: 4, atual: (c) => c.tres },
  { id: 'completa', nome: 'Trilha completa', desc: 'Você chegou ao fim da trilha!', como: `Complete as ${FASES.length} fases.`, raridade: 'ouro', simbolo: 'trofeu', meta: FASES.length, atual: (c) => c.fasesFeitas },
  { id: 'caca3', nome: 'Caçador de estrelas III', desc: 'Quase todas as estrelas!', como: 'Junte 20 estrelas.', raridade: 'ouro', simbolo: 'estrela', meta: 20, atual: (c) => c.totalEstrelas },
  { id: 'regra', nome: 'Regra de ouro', desc: 'Uma regra que serve para muitos mapas.', como: 'Complete a fase 8.', raridade: 'diamante', simbolo: 'chave', meta: 1, atual: (c) => conta(c, [8]) },
];

export function avaliarConquistas(c) {
  return CONQUISTAS.map((original) => {
    const total = c.totalFases ?? FASES.length;
    const x = original.id === 'completa' ? { ...original, meta: total, como: `Complete as ${total} fases.` }
      : original.id === 'meio' ? { ...original, meta: Math.ceil(total / 2), como: `Complete ${Math.ceil(total / 2)} fases.` } : original;
    const atual = Math.max(0, Math.min(x.meta, x.atual(c)));
    return { ...x, atual, desbloqueada: x.meta > 0 && atual >= x.meta };
  });
}
