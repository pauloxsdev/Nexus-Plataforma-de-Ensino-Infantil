# Coerência entre o documento Projeto NEXUS 2.0 e o sistema

Revisão histórica de 4 de novembro de 2026, baseada no documento `Projeto NEXUS 2.0.docx`
enviado pelo responsável e no repositório no commit `d4dfd1a`. Naquela data, os
arquivos de deploy ainda estavam em preparação.
Este relatório não altera o documento original nem decide retirar requisitos.

## Atualização de publicação — 09/11/2026

Os arquivos de deploy foram enviados no commit `61d60d6`, e o responsável
confirmou a publicação no Render com PostgreSQL no Neon, além dos fluxos de
professor/aluno e persistência de progresso. Consulte `DEPLOY.md` para o registro
e seus limites. As menções abaixo a deploy pendente descrevem a situação de
04/11; a publicação posterior não resolve os requisitos funcionais pendentes.

## Conclusão

Há coerência no núcleo do jogo e na arquitetura React + Spring Boot + PostgreSQL.
Não há correspondência integral entre todos os requisitos/casos de uso e a entrega.
O documento mistura intenções, funcionalidades entregues e afirmações sem evidência.
É necessário distinguir correção de texto, decisão de escopo e desenvolvimento pendente.
A expressão "backend completo" não significa que todos os casos de uso do documento
acadêmico foram implementados: o backend entregue cobre autenticação, turmas básicas,
persistência, validação do jogo e sincronização.

## Requisitos funcionais

| Requisito | Estado no código | Evidência e diferença |
|---|---|---|
| RF01 — Gerar código | Parcial quanto à experiência especificada | `ApiController.code()` gera credencial de 128 bits, exibida como 32 caracteres hexadecimais agrupados. Geração, vínculo e unicidade existem; "código curto/simplificado" não corresponde ao tamanho atual. |
| RF02 — Login por código | Fluxo implementado; rapidez/usabilidade não validadas | `Login.jsx`, `/api/auth/aluno` e sessão persistida. Não houve comprovação com crianças de que digitar o código é rápido/fácil. |
| RF03 — Tutorial | Implementado; CU04 parcialmente atendido | `Tutorial.jsx` e `data/tutoriais.js`. O estado `seen` em `App.jsx` dura na sessão React; conclusão da introdução não é registrada permanentemente por aluno como diz CU04. |
| RF04 — Projetos | Parcial | Circuitos são recuperados por aluno/fase de `trilha-principal`. Não há criação de projetos nomeados, lista de projetos independentes ou exclusão de projeto, previstos no CU05 e no diagrama. Limpar um circuito não equivale a excluir um projeto. |
| RF05 — Salvar progresso | Implementado para fases/estrelas | `useProgresso.js`, `NexusService.event()`. Esclarecer que "nível atual" significa etapa/fase; não há nível numérico por XP. |
| RF06 — Perfil | Implementado no requisito básico; CU08 parcial | Avatar e conquistas existem. O tempo de dedicação citado no caso de uso não é apresentado nem consolidado como métrica. |
| RF07 — Progressão | Implementado no fluxo autenticado | Frontend e servidor verificam fase anterior. Liberação de teste é exclusiva da demonstração. |
| RF08 — Módulos | Implementado no recorte atual | Oito fases, aulas e conceitos progressivos em `fases.js`/`aulas.js`. Adequação da dificuldade ao público não foi comprovada. |
| RF09 — Progresso próprio | Implementado no requisito básico; CU07 parcial | Fases, estrelas, atividade e conquistas. Não há histórico de tempo de uso/dedicação exibido. Dias de atividade não equivalem a horas de estudo. |
| RF10 — Criar e editar turmas | Parcial | API permite GET/POST/DELETE de turmas; não há edição de turma nem interface correspondente. |
| RF11 — Configurar/agendar materiais | Pendente e contraditório no documento | Aulas predefinidas no código. Sem agendamento, visibilidade por professor ou CRUD de materiais. CU10 descreve acompanhamento, avaliações e comentários, que são outro conjunto de ações. |
| RF12 — Visualizar projetos da turma | Pendente para os circuitos | Professor recebe resumo individual de fases/estrelas/atividade. Não há endpoint ou tela para consultar o circuito de outro aluno. O diagrama também prevê edição/exclusão de projetos pelo professor, além do RF12. |

## Requisitos não funcionais

| Requisito | Situação |
|---|---|
| RNF01 — Usabilidade infantil | Interface lúdica e controles visuais presentes. Não equivalem a validação com crianças nem a auditoria completa de acessibilidade/contraste. |
| RNF02 — PWA offline | Não atendido integralmente. Sem manifest, service worker ou Workbox integrado. A fila offline funciona para sessão já aberta; não assegura reabertura/login sem rede. |
| RNF03 — LGPD/anonimato | Há minimização, códigos e separação de acesso. Dados ligados ao aluno por código são pseudonimizados, não anonimizados. O nome pode ser associado externamente pelo professor. Código não coleta nome real, mas isso não comprova conformidade integral. |
| RNF04 — Resposta máxima de 2 s | Não comprovado. Definir operações, conexão/dispositivo de referência, carga e tratamento do primeiro acesso. Repouso de serviços gratuitos pode exceder essa meta. |
| RNF05 — Responsividade | Implementada e verificada anteriormente em cinco larguras. Isso não comprova todos os dispositivos/navegadores ou acessibilidade completa. |
| RNF06 — Pouca RAM/computadores antigos | Não comprovado. Falta definir RAM/navegador/dispositivo mínimo e medir. Ajustes de memória da imagem de deploy não comprovam consumo do frontend no computador do aluno. |
| RNF07 — Sincronização automática | Implementada enquanto a aplicação está aberta: fila por dono, envio na reconexão/intervalo e confirmação transacional. Não é Background Sync de PWA com aplicação fechada. |
| RNF08 — Uptime de 99% | Não comprovado; não há monitoramento de produção nem SLA contratado. Plano gratuito não deve ser apresentado como garantia desse requisito. |

## Regras de negócio

| Regra | Correspondência |
|---|---|
| RN01 — Códigos curtos e únicos | Unicidade e geração segura implementadas; tamanho curto não atendido. Definir a experiência antes de alterar a credencial. |
| RN02 — Não exigir dados identificáveis | Não pede nome/e-mail do aluno. Trocar "anonimato garantido" por descrição de minimização e pseudonimização. |
| RN03 — Concluir anterior para desbloquear | Implementada para o aluno autenticado. |
| RN04 — Salvar localmente sem impedir uso | Implementada para sessão já aberta e armazenamento disponível. Não cobre reinício offline. |
| RN05 — Dado local mais recente vence | Divergente. Avatar/circuito usam a última alteração recebida no servidor, sem comparar versões/instantes de edição entre aparelhos. Progresso preserva a melhor pontuação; conquistas/dias são acumulados. Definir políticas por tipo de dado, não substituição indiscriminada. |
| RN06 — Professor vê suas turmas | Implementada na API, sem depender de esconder menus. |
| RN07 — Lógica no cliente | Preservada para execução e feedback. O backend também simula e valida para confirmar progresso; o documento deve mencionar ambos. |
| RN08 — Professor oculta/exibe aula | Pendente. |
| RN09 — Tentativas ilimitadas | Jogo permite tentar novamente sem game over; limites técnicos de login não são limite de tentativas do jogo. |

## Casos de uso e diagrama

- CU01 menciona código "expirado"; atualmente a credencial de aluno funciona até ser
  substituída, desativada ou excluída. A sessão expira em oito horas; são conceitos diferentes.
- CU02 deve exigir professor autenticado, com autorização sobre a turma. Sua pós-condição
  está como "Estar autentificado", embora o resultado correto seja código criado/vinculado.
- CU03 sugere geração automática dos códigos ao criar turma; hoje a turma começa vazia
  e o professor adiciona alunos individualmente, recebendo cada código uma vez.
- CU04 prevê registro da conclusão do tutorial; falta persistir esse registro.
- CU05 descreve projeto nomeado; o produto atual usa circuitos de fases predefinidas.
- CU07/CU08/CU09 incluem tempo de dedicação. O campo `segundos` de uma tentativa é usado
  para estrelas, mas não existe relatório de tempo total. O evento persistido guarda hash
  do payload e resultado, não um histórico completo de tempos de uso.
- CU09 inclui abrir projeto do aluno para inspecionar blocos; não existe no painel atual.
- CU10 mistura gerenciamento de aula com análise, avaliações e comentários. Definir os
  requisitos e separar acompanhamento de criação/agendamento/visibilidade de materiais.
- O diagrama de casos de uso foi inspecionado: inclui editar/excluir projetos pelo professor,
  não implementados e mais amplos que RF12. Também falta representar claramente o login
  do professor no modelo de acesso.
- O corpo do documento contém seções de diagrama de classe, objetos, atividades, sequência
  e arquitetura sem conteúdo correspondente identificado. Há um diagrama de casos de uso
  efetivamente incorporado. Não declarar a modelagem UML completa sem preencher/verificar
  as demais seções.

## Arquitetura e publicação

1. O texto de arquitetura identifica Java/Spring Boot e PostgreSQL, compatíveis com o código.
   A seção DevOps descreve outro backend, Node.js local/offline. Essa descrição deve ser
   substituída. Node.js é usado pelas ferramentas do frontend, não como servidor de negócio.
2. O texto diz "integramos Google Blockly". O jogo usa `src/game/motor.js` e componentes
   próprios. Blockly está declarado no `package.json`, sem uso identificado em `src`.
3. O texto diz que PWA/Workbox estão adotados e garantem uso sem internet. São pendências;
   IndexedDB e uma fila de eventos não implementam cache/reabertura da aplicação.
4. O texto apresenta Vercel e publicação automática a cada commit como prática realizada.
   Essa configuração não foi comprovada no repositório/conversa. O plano escolhido agora
   é Render + Neon, ainda sem publicação. O rascunho `render.yaml` deixa deploy automático
   desativado. Descrever como planejado até validar a hospedagem.
5. Não foi encontrado workflow de CI no repositório. Testes executados localmente/por agente
   e uso do GitHub não comprovam CI automatizada.
6. O certificado não é requisito funcional explícito da lista RF01–RF12, mas o README
   o apresenta como recurso. Existe apenas o serviço de geração: falta fluxo de emissão
   nas telas e vínculo à conclusão confirmada.

## Metodologia, pesquisa e texto acadêmico

- Resumo anuncia Scrum; metodologia afirma Kanban; aparecem sprints, Scrum Master e
  cerimônias. Uma combinação é possível, mas precisa refletir o processo real e ser explicada.
- Metodologia/arquitetura dizem Notion; colaboração diz Trello. Confirmar as ferramentas
  efetivamente usadas, sem escolher ou inventar uma para uniformizar o texto.
- Na tabela de papéis, "Duração da sprint" aparece como papel responsável por fornecer
  feedback pedagógico. Corrigir a categoria após confirmar quem desempenhou a função.
- Pesquisa declarada: 23 universitários, de 30/09 a 14/10/2026. É levantamento de opiniões,
  não teste de usabilidade do software com crianças/professores.
- Preservar percentuais e amostra informados até conferir dados de origem. Aprovação de
  uma proposta de login não comprova eficácia operacional nem conformidade jurídica.
- Impactos como aprendizagem, prevenção de envolvimento com drogas/criminalidade e redução
  de desigualdade devem ser objetivos/hipóteses enquanto não houver estudo que os sustente.
- Existem duas seções de decisões tecnológicas e texto de orientação como "preparei uma
  sugestão de texto dissertativo". Remover instruções de redação na versão final.
- Plano de testes, validação com usuários e conclusão ainda contêm orientações e campos
  provisórios. Preencher a parte técnica com evidências reais; a experiência da equipe e
  a pesquisa exigem informações dos autores.

## Evidências e limites desta revisão

O DOCX foi lido por extração de parágrafos/tabelas e o diagrama incorporado foi
inspecionado visualmente. A análise foi confrontada com `App.jsx`, páginas, serviços,
catálogo, API Java, persistência, README e guia do backend. Não foi modificada a cópia
original do documento, nem executada pesquisa com usuários.
Na revisão imediatamente anterior, `npm test` passou com 49 testes e `npm run build`
concluiu. Não houve nova execução de testes de backend, desempenho, disponibilidade
ou dispositivos nesta leitura do documento. Os resultados anteriores de integração
estão no relatório de implementação; não equivalem a uma auditoria integral.

## Encaminhamento proposto em 04/11/2026

1. Corrigir afirmações factuais de arquitetura, tecnologia, publicação e resultados.
2. Criar uma matriz de rastreabilidade com entregue/parcial/pendente, usando este relatório.
3. Decidir com a equipe quais pendências são obrigatórias para o MVP. Não remover RFs nem
   implementar políticas pedagógicas novas sem essa decisão.
4. Priorizar PWA se offline for compromisso central; depois projetos/visão do professor,
   edição de turmas, gestão de aulas, tutorial persistente e certificado conforme o escopo.
5. Definir métricas verificáveis para RNF04/RNF06/RNF08 e condições compatíveis com a hospedagem.
6. Validar Docker/Render/Neon e publicar somente a versão cujo escopo esteja explícito.

Na revisão original de 04/11 não houve deploy, commit ou push. A situação de
publicação foi atualizada na nota de 09/11 no início deste relatório.
