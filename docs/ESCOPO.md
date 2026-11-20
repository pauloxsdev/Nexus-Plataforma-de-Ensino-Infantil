# Escopo e evolução

O NEXUS reúne atividades de lógica de programação, autenticação, gestão básica
de turmas, persistência individual e sincronização. Esta página diferencia
funcionalidades existentes, implementações parciais e evoluções previstas.
Os identificadores RF, RNF e RN permitem acompanhar os requisitos do projeto;
a classificação não constitui promessa de prazo para entrega.

A aplicação está publicada no Render com PostgreSQL no Neon. A disponibilidade
do site não significa que todos os requisitos de produto tenham sido concluídos.

## Requisitos funcionais

| Requisito | Estado no código | Evidência e diferença |
|---|---|---|
| RF01 — Gerar código | Parcial quanto à experiência especificada | `ApiController.code()` gera credencial de 128 bits, exibida como 32 caracteres hexadecimais agrupados. Geração, vínculo e unicidade existem; a simplificação da experiência de entrada permanece em avaliação. |
| RF02 — Login por código | Fluxo implementado; rapidez/usabilidade não validadas | `Login.jsx`, `/api/auth/aluno` e sessão persistida. Não houve comprovação com crianças de que digitar o código é rápido/fácil. |
| RF03 — Tutorial | Implementado; CU04 parcialmente atendido | `Tutorial.jsx` e `data/tutoriais.js`. O estado `seen` em `App.jsx` dura na sessão React; conclusão da introdução não é registrada permanentemente por aluno. |
| RF04 — Projetos | Parcial | Circuitos são recuperados por aluno/fase de `trilha-principal`. Não há criação de projetos nomeados, lista de projetos independentes ou exclusão de projeto, previstos para evolução. Limpar um circuito não equivale a excluir um projeto. |
| RF05 — Salvar progresso | Implementado para fases/estrelas | `useProgresso.js`, `NexusService.event()`. Esclarecer que "nível atual" significa etapa/fase; não há nível numérico por XP. |
| RF06 — Perfil | Implementado no requisito básico; CU08 parcial | Avatar e conquistas existem. O tempo de dedicação citado no caso de uso não é apresentado nem consolidado como métrica. |
| RF07 — Progressão | Implementado no fluxo autenticado | Frontend e servidor verificam fase anterior. Liberação de teste é exclusiva da demonstração. |
| RF08 — Módulos | Implementado no recorte atual | Oito fases, aulas e conceitos progressivos em `fases.js`/`aulas.js`. Adequação da dificuldade ao público não foi comprovada. |
| RF09 — Progresso próprio | Implementado no requisito básico; CU07 parcial | Fases, estrelas, atividade e conquistas. Não há histórico de tempo de uso/dedicação exibido. Dias de atividade não equivalem a horas de estudo. |
| RF10 — Criar e editar turmas | Parcial | API permite GET/POST/DELETE de turmas; não há edição de turma nem interface correspondente. |
| RF11 — Configurar/agendar materiais | Pendente | Aulas predefinidas no código. Sem agendamento, visibilidade por professor ou CRUD de materiais. Avaliações e comentários também permanecem fora da implementação atual. |
| RF12 — Visualizar projetos da turma | Pendente para os circuitos | Professor recebe resumo individual de fases/estrelas/atividade. Não há endpoint ou tela para consultar o circuito de outro aluno. Edição de circuitos de alunos pelo professor também não está disponível. |

## Requisitos não funcionais

| Requisito | Situação |
|---|---|
| RNF01 — Usabilidade infantil | Interface lúdica e controles visuais presentes. Não equivalem a validação com crianças nem a auditoria completa de acessibilidade/contraste. |
| RNF02 — PWA offline | Não atendido integralmente. Sem manifest, service worker ou Workbox integrado. A fila offline funciona para sessão já aberta; não assegura reabertura/login sem rede. |
| RNF03 — LGPD/anonimato | Há minimização, códigos e separação de acesso. Dados ligados ao aluno por código são pseudonimizados, não anonimizados. O nome pode ser associado externamente pelo professor. Código não coleta nome real, mas isso não comprova conformidade integral. |
| RNF04 — Resposta máxima de 2 s | Não comprovado. Definir operações, conexão/dispositivo de referência, carga e tratamento do primeiro acesso. Repouso de serviços gratuitos pode exceder essa meta. |
| RNF05 — Responsividade | Há registros históricos de verificação em cinco larguras. A nova reorganização móvel da Oficina ainda não integra esta revisão de documentação e aguarda testes visuais e de interação; os registros anteriores não validam essa alteração nem todos os dispositivos/navegadores. |
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

## Evoluções previstas

- Instalação como PWA e reabertura sem conexão.
- Criação e organização de projetos independentes, além dos circuitos por fase.
- Consulta de circuitos dos alunos pelo professor.
- Edição de turmas e gestão de aulas e materiais.
- Persistência da conclusão dos tutoriais.
- Emissão de certificados integrada à conclusão registrada.
- Definição de política de conflitos entre edições feitas em dispositivos diferentes.

A prioridade dessas evoluções depende da definição de escopo. Novas regras de
XP, nível e recompensas exigem definição pedagógica antes de implementação.
O motor atual é próprio; Blockly não está integrado à execução dos desafios.

## Avaliações necessárias

A interface e os testes técnicos não substituem avaliação com crianças e
professores. Permanecem necessárias validação de usabilidade e acessibilidade,
avaliação pedagógica e medições de tempo de resposta, memória e disponibilidade.
A consulta exploratória a universitários não equivale à avaliação com o
público-alvo nem comprova aprendizagem ou impacto social.

As práticas de minimização de dados e controle de acesso não comprovam,
isoladamente, conformidade integral com a LGPD. Políticas de retenção, operação
e tratamento de dados devem acompanhar o contexto de utilização.

## Documentação relacionada

- [Implementação e verificações](RELATORIO-BACKEND.md)
- [Dados, progresso e sincronização](DADOS-E-PROGRESSO.md)
- [Backend e contratos de acesso](BACKEND.md)
- [Publicação](DEPLOY.md)
