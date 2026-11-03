# Relatório de implementação do backend

Este relatório registra o estado ao finalizar a implementação, antes da autorização
posterior do usuário para commit e push. A publicação da aplicação não faz parte dessa autorização.

## Estado inicial e escopo

O Git estava limpo no início, após o commit `d39eeba`. Existiam somente frontend,
perfis locais e fila IndexedDB; a área do professor estava desabilitada. O trabalho
implementou Spring Boot + PostgreSQL, conforme a arquitetura escolhida pelo usuário.
Nenhuma alteração anterior foi removida ou reaplicada. Não houve commit, push ou publicação.

## Arquivos e motivos

| Arquivo/grupo | Alteração | Motivo |
|---|---|---|
| `backend/pom.xml`, `NexusApplication.java`, `application.properties` | Aplicação Java 21/Spring Boot, JDBC, Flyway, configuração por ambiente, interface estática no JAR | Executar API e frontend juntos ou com Vite em desenvolvimento |
| `backend/.../Auth.java`, `ApiError.java` | Sessões no banco, cookie HttpOnly, CSRF/origem, limite de corpo e tentativas, erros sem dados internos | Autenticação e proteção no servidor |
| `backend/.../ProvisionTeacher.java` | Comando administrativo para criar/redefinir acesso; senha recebida por ambiente e hash BCrypt | Não disponibilizar cadastro público de professores ou senha fixa |
| `backend/.../ApiController.java` | Endpoints de autenticação, turmas, alunos, estados e eventos | Ligar as telas às operações reais |
| `backend/.../NexusService.java` | Autorização por dono, transações, confirmação idempotente, persistência e resumos individuais | Impedir mistura de alunos/turmas e duplicação de progresso |
| `backend/.../GameRules.java` | Validação do circuito, simulação das fases, estrelas e conquistas | Não confiar em estrelas/conclusões enviadas pelo cliente |
| `backend/.../V1__schema.sql` | Professores, turmas, alunos, sessões, eventos e limites; índices e chaves estrangeiras | Persistência e integridade no PostgreSQL |
| `scripts/export-*.mjs`, `backend/.../fases.json`, `game-fixtures.json` | Catálogo gerado da fonte frontend e casos de comparação | Evitar divergências no jogo |
| `src/App.jsx`, `pages/Login.jsx`, `pages/Professor.jsx` | Restauração de sessão, login real, turma, códigos, desativação/exclusão e progresso | Disponibilizar o professor com dados reais e acesso separado |
| `src/services/api.js`, `sessaoAluno.js`, `sincronizacao.js`, `hooks/useConexao.js` | Transporte HTTP, fila por identidade, sequência de envio e confirmação | Sincronização real e recuperação após falha de rede |
| `hooks/useDadoPerfil.js`, `pages/Oficina.jsx` | Eventos de edição de avatar/circuito e tentativas completas | Persistir recursos existentes sem importar dados da demonstração |
| `services/atividade.js`, `hooks/useAtividade.js` | Dias civis no fuso da turma | Coerência entre dispositivo e servidor |
| `pages/Trilha.jsx`, `components/BarraLateral.jsx` | Controles de teste somente na demo, apelido em vez do código secreto | Preservar progressão e não expor credenciais |
| Testes Java e JavaScript | Permissões, sincronização, datas, motor e catálogo | Verificação de regressões e limites de acesso |
| `compose.yaml`, `.env.example`, `.gitignore` | PostgreSQL local com volume, exemplo de configuração e exclusão de segredos/artefatos | Preparar execução reproduzível |
| `vite.config.js`, `package.json` | Proxy da API e geração do catálogo antes do build | Integrar desenvolvimento e empacotamento |
| `README.md`, `GUIA-DO-CODIGO.md`, `BACKEND.md` | Instruções, contratos HTTP, regras e limitações | Permitir revisão e execução local |

## Comportamento antes e depois

- Antes havia apenas demonstração. Agora o servidor identifica professor/aluno pela sessão;
  a demonstração permanece separada. O aluno não recebe operações de professor.
- Antes não havia turma real. Agora cada professor consulta exclusivamente suas turmas,
  com alunos inicialmente sem progresso. A tela trata esse estado vazio.
- Antes um evento salvo localmente não podia ser enviado. Agora a fila envia apenas o
  dono autenticado e só marca o evento após a transação confirmada pelo PostgreSQL.
- O servidor verifica peças, limites, fase anterior e resultado do motor. Repetições
  mantêm a melhor pontuação; eventos repetidos não concedem recompensas duplicadas.
- Códigos de aluno têm 128 bits aleatórios e são mostrados uma vez. Substituição e
  desativação revogam sessões. Senhas de professor usam BCrypt; não há senha padrão.
- Atividade e conquistas mantêm as regras existentes. Nomes de crianças não são enviados.
  Não foram inventadas regras de XP/nível, ranking ou dados de turma de demonstração.

## Verificações executadas neste ambiente

| Comando/procedimento | Objetivo | Resultado |
|---|---|---|
| `npm test` | Regressões do frontend e testes novos | 49 testes passaram, em 8 arquivos |
| `mvn -f backend/pom.xml package` com PostgreSQL `nexus_test` | Integração, autenticação, permissões e empacotamento | 14 testes passaram; JAR gerado |
| Comparação Java/JavaScript | Manter o motor pedagógico | 640 circuitos conferidos nos dois lados; incluídos nas suítes acima |
| Testes de API | Anônimo, papel errado, outra turma, outro aluno, CSRF, expiração, logout, troca de senha e limite de tentativas | Passaram |
| Testes de eventos | ID duplicado/conflitante, quatro reenvios concorrentes, progresso forjado, peças inválidas, fase bloqueada e data futura | Passaram |
| Testes de persistência | Avatar, rascunho, conquistas, repetição de fase, dias civis e interrupção de sequência | Passaram |
| Chromium ponta a ponta | Professor cria turma e dois alunos; aluno joga offline, reconecta, recarrega e troca de perfil; painel consulta resultado | Passou, sem erros JavaScript na rodada final |
| Professor em 360, 390, 768, 1024 e 1366 px | Reorganização e transbordamento horizontal | Sem transbordamento nos cenários medidos; imagens de celular e desktop inspecionadas |
| Demonstração em 360 e 1366 px | Circuito vazio, conclusão, atividade, recarga e liberação sem progresso | Passou; modo local preservado |
| Provisionamento administrativo | Criar professor sem abrir porta HTTP | Passou |
| `npm run build` | Build React de produção | Passou |
| HTTP GET do JAR | Servir o HTML com referência aos assets do build | Passou |
| `npm audit` | Auditoria das dependências JavaScript | Zero vulnerabilidades informadas |
| `git diff --check` | Formatação do diff | Sem problemas |

Durante a verificação, foi corrigida uma falha de renderização de aluno novo sem
objeto de progresso. Também houve rodadas interrompidas durante reinício/recompilação
do servidor de teste; a rodada integrada final foi repetida com o servidor estável.

## Testar localmente

Siga o procedimento completo de Windows em [BACKEND.md](BACKEND.md): instalar os
requisitos, configurar `.env`, iniciar PostgreSQL, definir variáveis de conexão,
gerar o JAR, provisionar o professor e iniciar API/Vite. Depois:

1. Entre como professor e crie uma turma e dois alunos.
2. Guarde o código exibido, saia e entre como primeiro aluno.
3. Complete a fase 1, aguarde a confirmação e recarregue.
4. Troque para o segundo aluno e confira que começa sem progresso.
5. Volte ao professor e atualize o painel.
6. Substitua um código e confira que o antigo não funciona.
7. Em uma sessão de aluno já aberta, interrompa a rede, jogue e reconecte.
8. Execute as suítes e o build conforme o guia, usando banco descartável para testes.

## Limites e pendências operacionais

- Não foi feita publicação, configuração de domínio/HTTPS, backup gerenciado ou teste
  no Windows do usuário. A validação ocorreu em Linux, PostgreSQL real e Chromium.
- A auditoria npm não cobre as dependências Java. Não foi realizada auditoria externa
  de segurança ou teste de carga.
- Professores são provisionados pelo administrador; recuperação de senha por e-mail,
  MFA e convite automático não foram implementados.
- Offline significa continuar uma sessão aberta; não inclui login offline ou PWA.
- O servidor verifica a solução, mas data e duração de tentativas offline dependem
  do relógio do dispositivo, com validações de limites descritas no guia.
- Para avatar/circuito, prevalece a última alteração recebida. Não existe edição
  colaborativa nem mesclagem de um circuito editado simultaneamente em dois aparelhos.
- Definições de retenção e operação da escola, hospedagem e futuras regras de XP/nível
  continuam sendo decisões separadas. O guia descreve configuração e responsabilidades.

## Git

Todas as alterações desta entrega são locais, posteriores a `d39eeba`. Os arquivos
Java compilados, bancos, credenciais temporárias e artefatos de teste não entram no Git.
O estado inicial estava limpo. Ao concluir, havia 17 arquivos rastreados modificados e
24 arquivos novos (41 no total, incluindo este relatório). Nenhum commit, push, merge
ou pull request foi realizado.
