# Guia do código: onde mexer em cada coisa

## Quero mudar...
| Quero mudar | Arquivo |
|---|---|
| **Uma fase** (mapa, peças, circuito, textos) ou **criar uma fase nova** | `src/data/fases.js` |
| Regras do jogo (andar, virar, pular, SE, REPETIR, lava, pedra) | `src/game/motor.js` |
| Uma peça nova (nome, cor, desenho) | `src/game/pecas.js` (+ `agir()` em `motor.js`) |
| Tela do jogo (3 painéis, botão Executar) | `src/pages/Oficina.jsx` |
| Desenho do circuito (caixas, canos, REPETIR, SE/SENÃO) | `src/components/Circuito.jsx` |
| Bandeja de peças (embaixo do circuito) | `src/components/Paleta.jsx` |
| **Arrastar e soltar** (mouse e toque) | `src/hooks/useArrastar.js` e `src/components/PecaArrastada.jsx` |
| Mapa e Nexi andando (palco) | `src/components/Palco.jsx` |
| Janela de **missão** no começo da fase | `src/components/MissaoFase.jsx` (os textos ficam em `fases.js`) |
| **Pop-up "Caminho do Nexi"** (Nexi andando, erro e acerto) | `src/components/CaminhoPopup.jsx` |
| **Estrelas por passos e tempo** (regra e metas) | `src/game/avaliacao.js` e o campo `ideal` de cada fase em `src/data/fases.js` |
| Trilha (amarelinha) e quais fases estão abertas | `src/pages/Trilha.jsx`, `src/hooks/useProgresso.js` |
| **Meu Nexus** (avatar do aluno: formas, cores, rostos, enfeites) | `src/components/NexusAvatar.jsx` (as listas no topo) e `src/pages/Avatar.jsx` |
| **Aulas** (resumo, dia a dia, experimentos, pistas, desafio) | `src/data/aulas.js` (um bloco por fase) |
| Desenhos das aulas | `src/components/Ilustracao.jsx` |
| Tela da aula | `src/pages/Aula.jsx` |
| **Conquistas** (regras, metas, raridade) | `src/data/conquistas.js` |
| Símbolos e molduras das conquistas | `src/components/Emblema.jsx` |
| Tela de conquistas (filtros, "Nova!", detalhe) | `src/pages/Conquistas.jsx` |
| **Tutorial** (balão, posição, atalhos de teclado) | `src/components/Tutorial.jsx` |
| Nexi apontando (bracinho animado) | `src/components/NexiApontando.jsx` e as classes `.ap-*` em `src/index.css` |
| Mapa da trilha (cenário, mundos, abas Mapa/Aulas) | `src/pages/Trilha.jsx` |
| Uma cor do app | `src/theme/tokens.js` |
| Estilo global (botão 3D, cartão, fundo quadriculado) | `src/index.css` |
| Textos dos tutoriais (botão ?) | `src/data/tutoriais.js` |
| Nexi (rosto) e astronauta | `src/components/Nexi.jsx`, `Astro.jsx` |
| Sons e vibração | `src/services/som.js` |
| Certificado em PDF | `src/services/certificado.js` |
| Salvar offline e enviar à API | `src/services/sincronizacao.js`, `src/hooks/useConexao.js` |
| **Menu lateral** (itens, cartão do aluno, Nexi do menu, recolher, botões de Internet e Som) | `src/components/BarraLateral.jsx` (as telas e a ordem ficam em `src/App.jsx`) |

## O Nexus é só para computador
- As telas são desenhadas para monitor (largura mínima de 1024 px em `src/index.css`). Se a janela ficar menor, a página **rola para o lado** em vez de virar um layout de celular.
- Não existem variantes de celular/tablet. Se isso mudar no futuro, é aqui que se começa: `src/index.css` (largura mínima) e as classes de cada tela em `src/pages/`.
- Atalhos de teclado na tela de jogo: teclas **1, 2, 3...** pegam a peça e **Enter** executa o circuito (`src/pages/Oficina.jsx`). Passar o mouse destaca botões e espaços.

## Menu lateral
- Itens: Início, Trilhas, Fase atual, Meu astronauta, Conquistas. Embaixo: Professor e Sair. Para criar um item, acrescente em `ITENS` (e a tela em `V` no `App.jsx`).
- O menu mostra só o **código** do aluno, nunca um nome real (LGPD).
- A setinha recolhe o menu (só ícones); a escolha fica salva. Em telas com menos de 1280 px ele já começa recolhido.
- Em telas baixas (menos de 820 px de altura) o cartão do Nexi some, para Professor e Sair sempre caberem.
- No fim do menu ficam os botões **Internet** (ligada/desligada) e **Som** (ligado/desligado). A internet mostra o estado de rede informado pelo navegador e não pode ser alternada pelo botão. As conclusões são gravadas em IndexedDB; o envio ao servidor está indisponível até integrar uma API.
- A bolinha rosa em **Conquistas** mostra quantas conquistas novas a criança ainda não viu.

## Layout do circuito: vertical ou horizontal
- O padrão é o **vertical** (peças | circuito de cima para baixo | mapa). O horizontal continua no código, mas sem botão: para testar, troque `layout="vertical"` por `layout="horizontal"` no `src/App.jsx`.
- **Horizontal:** o circuito corre da esquerda para a direita, com "fio de volta" no REPETIR e bifurcação no SE/SENÃO, e as peças ficam numa bandeja embaixo dele.
- Quando o grupo escolher um dos dois, basta apagar o outro: `direcao` em `src/components/Circuito.jsx`, `modo` em `src/components/Paleta.jsx` e `layout` em `src/pages/Oficina.jsx`.
- Os pontinhos que correm nos canos horizontais são a animação `.cano-h` em `src/index.css` (some se o aparelho pedir menos movimento).

## Nexus (aluno) e Nexi (guia)
- **Nexus** é o avatar do aluno: a criatura abstrata que ele monta em *Meu Nexus* e que **anda no mapa**. Fica salvo no aparelho.
- **Nexi** é o robozinho amarelo que **guia**: aparece nos tutoriais, nos avisos e no menu.
- Nos textos do jogo, quem anda é sempre "o Nexus".

## Como funciona o jogo
```
Criança escolhe uma peça (Paleta) e toca num espaço do circuito (Circuito)
   -> Oficina.jsx guarda isso em "estado"  { slots: {a:'andar'}, vezes: {r:3} }
   -> ao tocar em Executar: motor.js monta o programa (montarPrograma) e simula o Nexi (simular)
   -> abre o pop-up "Caminho do Nexi" (a tela escurece)
   -> DEU CERTO: o Nexi anda passo a passo no pop-up; depois aparecem as estrelas (avaliacao.js)
   -> DEU ERRADO: o Nexi NÃO anda; o pop-up explica o que aconteceu e o circuito marca "Parou aqui"
```
O motor não usa React: dá para testar sozinho (`npm test`).

## Como criar uma fase nova
1. Abra `src/data/fases.js` e copie uma fase parecida.
2. Mude `id` (próximo número), `titulo`, `conceito` e os textos (`historia`, `novo`, `dica`, `aprendeu`).
3. Monte o `mundo`: tamanho (até 5x5), onde o Nexi começa, lavas, pedras e estrelas. As posições são `[x, y]` começando em 0.
4. Escolha as `pecas` e desenhe o `circuito` com `esp`, `repetir` e `se`.
4b. Defina a meta de estrelas em `ideal: { passos, segundos }` (passos = quantas ações o Nexi faz na melhor solução).
5. Em `src/game/motor.test.js`, copie um teste e confira que a solução certa vence e as erradas não.
6. Na trilha, acrescente o número da fase em `LINHAS` (`src/pages/Trilha.jsx`).

## Ideia pedagógica das 8 fases
1 Sequência, 2 Direção, 3 Escolher a peça certa, 4 Repetição, 5 Repetir um padrão, 6 Decisão (SE/SENÃO), 7 Repetir + SE/SENÃO, 8 A mesma regra em outro mapa. Cada fase traz **uma** ideia nova.

## Dicas para não quebrar
- Deixe o `npm run dev` aberto: a página atualiza ao salvar.
- Rode `npm test` antes de enviar ao GitHub.
- Cor nova? Coloque em `tokens.js` (não escreva `#2B4DFF` direto nas telas).
- Faça commits pequenos e use uma branch por tarefa.
