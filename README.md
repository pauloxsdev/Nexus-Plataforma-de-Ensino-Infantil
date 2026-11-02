# Nexus 2.0 – Front-end (React + Vite)

Protótipo navegável do front-end do Nexus, já separado em arquivos. Visual "Amarelinha" (papel quadriculado, contornos grossos, cores chapadas).

## Como rodar
Precisa de Node.js 18 ou mais novo.

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/ (publicável na Vercel)
```

## Estrutura
```
src/
  theme/tokens.js            cores (espelham as variáveis do Figma)
  index.css                  Tailwind + estilos globais (botão 3D, cartão, animações)
  components/                Btn, Seg (barra), Modal, Icon, Nexi (5 expressões), Astro (avatar), Tutorial
  context/AvatarContext.jsx  astronauta escolhido (cor + acessório)
  data/tutoriais.js          textos dos tutoriais de cada tela
  hooks/                     useConexao (online/offline), useSom (mudo)
  services/                  som.js (sons e vibração), certificado.js (jsPDF), sincronizacao.js (IndexedDB, esqueleto)
  game/                      motor do jogo e peças (sem React), com testes
  data/                      fases, tutoriais
  pages/                     Login, Base, Avatar, Trilha, Oficina (blocos), Nivel, Album, Professor
  App.jsx                    abas de DEMONSTRAÇÃO + montagem das telas
```

## O que é de verdade e o que é simulado
| Parte | Estado |
|---|---|
| Telas, tutoriais, avatar, nível, sons | funcionam |
| Oficina de circuito | 8 fases de lógica (sequência, repetição, SE/SENÃO), com motor próprio em `game/motor.js` |
| Certificado | gera PDF com jsPDF no navegador; o nome nunca sai do aparelho |
| Conexão / sincronização | rede observada pelo navegador; conclusões persistidas em fila IndexedDB. Envio ao servidor indisponível até integração com API |
| Acesso | demonstração sem login; não cria identidades. Área do professor e geração de códigos indisponíveis |
| Dados | progresso local da demonstração; não isolado por aluno. Sem turma real |
| Backend (Spring Boot + PostgreSQL), PWA (Workbox) | **ainda não ligados** |

## Próximos passos (onde plugar cada coisa)
1. **Mais fases**: veja `docs/GUIA-DO-CODIGO.md` (como criar uma fase em `src/data/fases.js`).
2. **Sincronização com servidor**: integrar um transporte real a `services/sincronizacao.js`. O transporte só pode retornar `{ confirmado: true, id }` após confirmação da API; a API deve ignorar eventos repetidos pelo ID. A fila IndexedDB já recebe conclusões de fase. Reconectar não comprova envio e não remove pendências. `navigator.onLine` não garante acesso ao servidor.
3. **PWA / Workbox**: adicionar `vite-plugin-pwa` e um `manifest` com os ícones do Nexi.
4. **Identidades e permissões (pendente de backend)**: autenticar alunos e professores, validar sessões e permissões no servidor, restringir códigos à turma do professor e isolar progresso/fila por identidade. O acesso atual é apenas uma demonstração; não restaurar a área do professor com base em flags no navegador.
5. **Rotas**: trocar as abas do topo por `react-router` (cada arquivo de `pages/` vira uma rota).
6. **Qualidade**: ESLint, testes (Vitest + Testing Library), acessibilidade (leitor de tela e teclado).

## Regras do projeto (LGPD)
- Nenhum dado pessoal: o aluno entra só com o código. O professor guarda o nome fora do sistema.
- O nome no certificado fica só na memória do navegador (`services/certificado.js`).
- Sem ranking (Leaderboard descartado) e sem telas punitivas.
