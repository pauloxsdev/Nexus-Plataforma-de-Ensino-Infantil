# Guia do código

## Onde alterar cada recurso

| Recurso | Arquivos principais |
|---|---|
| Fases, mapas, peças permitidas, metas e estratégias alternativas | `src/data/fases.js` |
| Montagem e simulação dos programas | `src/game/motor.js` |
| Peças: identificadores, nomes, cores e símbolos | `src/game/pecas.js` |
| Estrelas por conclusão, movimentos e peças de ação | `src/game/avaliacao.js`, campo `ideal` em `fases.js` |
| Oficina e coordenação da tentativa | `src/pages/Oficina.jsx` |
| Circuito, espaços, REPETIR e SE/SENÃO | `src/components/Circuito.jsx` |
| Paleta e arraste por mouse/toque | `src/components/Paleta.jsx`, `src/hooks/useArrastar.js`, `src/components/PecaArrastada.jsx` |
| Mapa e personagem do aluno | `src/components/Palco.jsx` |
| Missão e resultado da fase | `src/components/MissaoFase.jsx`, `src/components/CaminhoPopup.jsx` |
| Execução passo a passo e pseudocódigo | `src/components/ExecucaoPrograma.jsx`, `src/components/CodigoPrograma.jsx` |
| Trilha e desbloqueio de fases | `src/pages/Trilha.jsx`, `src/hooks/useProgresso.js` |
| Conteúdo das aulas | `src/data/aulas.js`, `src/pages/Aula.jsx` |
| Experimentos e ilustrações | `src/components/LaboratorioAula.jsx`, `src/components/Ilustracao.jsx`, `src/components/BlocosPrograma.jsx` |
| Avatar e tela de personalização | `src/components/NexusAvatar.jsx`, `src/pages/Avatar.jsx` |
| Regras de desbloqueio dos cosméticos | `src/data/personalizacao.json`, `src/data/personalizacao.js` |
| Conquistas e sua apresentação | `src/data/conquistas.js`, `src/hooks/useConquistas.js`, `src/components/Emblema.jsx`, `src/pages/Conquistas.jsx` |
| Tutorial e guia Nexi | `src/components/Tutorial.jsx`, `src/data/tutoriais.js`, `src/components/Nexi.jsx`, `src/components/NexiApontando.jsx` |
| Cores, estilos e decorações | `src/theme/tokens.js`, `src/index.css`, `src/components/CabecalhoAventura.jsx` |
| Menu e navegação | `src/components/BarraLateral.jsx`, `src/App.jsx` |
| Sons e vibração | `src/services/som.js` |
| Geração de PDF, ainda sem integração às telas | `src/services/certificado.js` |
| Sessão, API e sincronização | `src/services/api.js`, `src/services/sessaoAluno.js`, `src/services/sincronizacao.js`, `src/hooks/useConexao.js` |
| Persistência do rascunho | `src/hooks/useCircuito.js`, `src/hooks/useDadoPerfil.js` |
| Autorização e persistência no servidor | `backend/src/main/java/br/com/nexus/ApiController.java`, `Auth.java`, `NexusService.java` no mesmo diretório |
| Validação do jogo e recompensas no servidor | `backend/src/main/java/br/com/nexus/GameRules.java` |

## Layout e interação

- As telas reorganizam cartões e colunas, sem largura mínima global de desktop.
- Abaixo de 768 px, o botão **Abrir menu** controla o menu lateral; Escape fecha esse menu. Em telas maiores, ele pode ser recolhido.
- A Oficina possui layouts vertical e horizontal. O escolhido em `App.jsx` é `layout="vertical"`; o parâmetro controla a direção do circuito fora da apresentação compacta.
- A reorganização móvel com mapa antes do circuito e paleta/comandos fixos no rodapé está em preparação, fora desta revisão de documentação. Ela ainda requer validação visual e de interação antes da integração e publicação.
- Em telas intermediárias, os painéis se reorganizam; no layout vertical, a partir de 1280 px ficam lado a lado. Ramos largos usam a região rolável do circuito.
- Arraste uma peça ou selecione-a por clique/toque e depois escolha o espaço. Tab e Enter permitem ativar controles; os atalhos da oficina devem ser conferidos em `Oficina.jsx` antes de serem alterados.
- Preserve rolagem, foco, tamanho dos alvos de toque e preferências de movimento reduzido ao modificar o layout. Verifique celulares, tablets e desktop; inspeção do CSS não substitui testes no navegador.

## Menu e personagens

Os itens do aluno ficam em `ITENS`, dentro de `BarraLateral.jsx`: Início, Trilhas,
Fase atual, Meu Nexus e Conquistas. As telas correspondentes ficam em `V`, no
`App.jsx`. A área do professor tem fluxo autenticado separado.

O menu mostra o apelido do aluno ou identifica a demonstração, nunca o código
secreto. A preferência de recolhimento é local; sem preferência salva, começa
recolhido em larguras menores que 1280 px. Internet informa o estado da conexão;
não é um interruptor para simular rede. Som controla o áudio da aplicação.

**Nexus** é o avatar personalizável do aluno que percorre o mapa. **Nexi** é o robô
guia, cuja imagem compartilhada está em `src/assets/nexi.png`. Avatar, progresso
e circuitos são separados por perfil: na demonstração permanecem locais; para
alunos autenticados, são sincronizados com o servidor.

## Fluxo de uma tentativa

```text
Paleta → espaços do circuito → rascunho por perfil/fase
  → montarPrograma → simular
  → registrar tentativa com ação
  → ExecucaoPrograma: mapa, instruções e eventos passo a passo
  → CaminhoPopup: resultado, orientação e estrelas quando houver conclusão
```

`ExecucaoPrograma` permite pausar, avançar uma etapa ou ver o resultado. Tentativas
que falham também podem ser observadas até o erro. O motor é independente de React.

Na regra atual (v2), concluir concede uma estrela; atingir a meta de movimentos
concede outra; atingir a meta de peças de ação escritas concede a terceira. Peças
nos dois ramos contam, sem multiplicá-las pelo número de repetições. O tempo de
leitura não reduz a pontuação. `ideal` usa `{ passos, pecas }`.

O backend valida a tentativa com seu catálogo e motor antes de persistir o
resultado. A versão v1 continua aceita para eventos antigos e mantém seu critério
histórico de tempo. Consulte [Compatibilidade](COMPATIBILIDADE-JOGO.md).

## Criar ou modificar uma fase

1. Em `src/data/fases.js`, defina `id`, título, conceito, mundo, peças, circuito e textos. Mantenha IDs coerentes com a progressão sequencial, que usa a fase anterior/próxima.
2. Defina coordenadas `[x, y]` a partir de zero, direção inicial e posições de obstáculos/estrelas. Os mapas atuais são pequenos; dimensões maiores exigem revisão de layout e validação do servidor.
3. Defina `ideal: { passos, pecas }`. Se houver estratégias alternativas, cadastre seus circuitos e verifique a troca e restauração dos rascunhos.
4. Prepare a aula correspondente em `src/data/aulas.js` e atualize `LINHAS`, em `src/pages/Trilha.jsx`, para incluir a fase no mapa da trilha.
5. Adicione cenários de sucesso, erro e limites aos testes do motor. Mudanças nas peças ou regras exigem correspondência em `GameRules.java`; exportar o catálogo não implementa novas ações no servidor.
6. Para alterações incompatíveis em mapas, estruturas ou pontuação, planeje uma nova versão das regras. Preserve catálogos históricos e eventos já enfileirados; não sobrescreva os catálogos numerados para mudar a interpretação de tentativas antigas.
7. Execute `npm run backend:catalog` e `npm run backend:fixtures`. Revise os arquivos gerados e rode `npm test`, `npm run build` e os testes Java pertinentes conforme [BACKEND.md](BACKEND.md).
8. Confira trilha, aula, oficina, metas, rascunhos, conquistas e desbloqueios de cosméticos no navegador. Não altere apenas o número exibido de fases.

## Conteúdo pedagógico atual

1. Sequência.
2. Direção.
3. Escolha da peça adequada ao obstáculo.
4. Repetição.
5. Repetição de um padrão.
6. Decisão com SE/SENÃO.
7. Repetição e decisão combinadas.
8. Aplicação da regra em outro mapa.

As aulas usam Veja, Preveja e Experimente, com atividades visuais e pseudocódigo.
A progressão técnica não substitui avaliação pedagógica com o público-alvo.

## Indicadores e personalização

- `useProgresso.js` usa `FASES`, conta conclusões válidas e soma os melhores resultados.
- `atividade.js` calcula dias únicos e sequências. `useAtividade.js` usa o fuso da turma no acesso autenticado e o do navegador na demonstração.
- `useConquistas.js` registra desbloqueios e visualizações por perfil. Reabrir uma tela não concede novamente uma conquista.
- `personalizacao.json` define os requisitos dos cosméticos. `personalizacao.js` calcula as opções disponíveis; o servidor também verifica o desbloqueio antes de persistir o avatar.
- `Base.jsx`, `BarraLateral.jsx` e `Nivel.jsx` mostram indicadores registrados. Não há XP nem nível numérico.
- A liberação de todas as fases é exclusiva da demonstração e não concede estrelas. Zerar o progresso da demo preserva os registros de atividade e conquistas já obtidas.

Veja [Dados e progresso](DADOS-E-PROGRESSO.md) para persistência e
[Escopo](ESCOPO.md) para funcionalidades parciais e pendências.
