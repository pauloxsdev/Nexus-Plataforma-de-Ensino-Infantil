# Backend Nexus: Spring Boot + PostgreSQL

## Escopo

A API autentica professores e alunos, mantém sessões no PostgreSQL e restringe
cada turma ao professor responsável. O aluno usa um código aleatório individual;
o sistema não pede nem armazena seu nome, e-mail ou data de nascimento.
A correspondência entre o apelido automático e o aluno fica com a escola.
O nome digitado no certificado continua somente no navegador.

Inclui criação/exclusão de turmas, criação/desativação/exclusão de alunos,
substituição de códigos, troca de senha do professor, progresso, atividade,
conquistas, avatar e rascunhos de circuito. O painel consulta dados de cada aluno;
não agrega o perfil conectado como se fosse uma turma. Não há ranking.

Não inclui hospedagem gerenciada, envio de e-mail, cadastro público de professores,
PWA, regras novas de XP/nível ou compartilhamento de uma turma entre professores.
O provisionamento e recuperação de senha são operações administrativas locais.

## Requisitos e execução no Windows

- Node.js 24 LTS, JDK **21 completo** (não apenas JRE), Maven 3.9+.
- Docker Desktop iniciado, com suporte a containers Linux, para o PostgreSQL.
- Execute os comandos na raiz do projeto, que contém `package.json`.

1. Copie `.env.example` para `.env`, escolha uma senha forte para `POSTGRES_PASSWORD`
   e guarde o arquivo somente no computador. `.env` está ignorado pelo Git.

```powershell
Copy-Item .env.example .env
notepad .env
docker compose up -d db
npm ci
npm run build
```

2. No PowerShell do backend, configure a conexão. A senha deve ser a mesma do `.env`.
   O Spring não lê `.env` automaticamente; Docker Compose e Spring têm configurações separadas.

```powershell
$env:JAVA_HOME = 'C:\caminho\do\jdk-21'
$env:DATABASE_URL = 'jdbc:postgresql://localhost:5432/nexus'
$env:DATABASE_USER = 'nexus'
$credencialBanco = Read-Host 'Senha do PostgreSQL' -AsSecureString
$env:DATABASE_PASSWORD = [System.Net.NetworkCredential]::new('', $credencialBanco).Password
$env:APP_ORIGIN = 'http://localhost:5173'
mvn -f backend/pom.xml package -DskipTests
```

3. Crie o primeiro professor. Escolha um usuário em letras minúsculas (3–80 caracteres,
   números, ponto, hífen e sublinhado permitidos) e uma senha com no mínimo 12 caracteres
   e no máximo 72 bytes. A senha não aparece no comando, no repositório ou nos logs.

```powershell
$env:TEACHER_LOGIN = Read-Host 'Usuário do professor'
$credencialProfessor = Read-Host 'Senha inicial do professor' -AsSecureString
$env:TEACHER_PASSWORD = [System.Net.NetworkCredential]::new('', $credencialProfessor).Password
java -jar backend/target/nexus-api-1.0.0.jar --provision-teacher
Remove-Item Env:TEACHER_PASSWORD
Remove-Item Env:TEACHER_LOGIN
```

Esse comando aplica as migrações, cria o professor e encerra o processo. Se o usuário
já existir, redefine a senha e revoga suas sessões. É também o procedimento de recuperação.
Não há senha padrão. Execute novamente com outro usuário para criar outro professor.

4. Inicie o servidor no mesmo PowerShell, que já contém a configuração do banco:

```powershell
java -jar backend/target/nexus-api-1.0.0.jar
```

5. Em outro PowerShell na raiz do projeto:

```powershell
npm run dev
```

Abra **http://localhost:5173/**. O Vite encaminha `/api` ao Spring na porta 8080.
Use exatamente esse endereço: `127.0.0.1`, outra porta ou um IP de rede precisam
corresponder a `APP_ORIGIN`, pois a API verifica a origem das alterações.

Pare o processo Java antes de gerar outra versão do JAR; não substitua o arquivo
enquanto ele estiver em execução.

Para servir também a interface pelo Spring, gere `npm run build` antes de empacotar,
configure `APP_ORIGIN=http://localhost:8080` e abra **http://localhost:8080/**.

## Fluxo de uso

1. Entre em **Sou professor**, crie uma turma e escolha o fuso de suas atividades.
2. Adicione um aluno. Anote o apelido automático e guarde o código exibido uma vez.
3. Saia e entre em **Sou aluno**, colando esse código (hífens/espaços são aceitos).
4. Monte e execute a fase 1. Aguarde a indicação de confirmação pelo servidor.
5. Saia, entre como professor, selecione a turma e clique em **Atualizar progresso**.
6. Teste outro aluno: o progresso anterior não deve aparecer.
7. Reabra a aplicação/outro navegador e entre com o mesmo código para recuperar os dados.
8. Teste **Novo código**: o antigo deixa de funcionar e as sessões desse aluno são revogadas.
9. Desativar um aluno bloqueia seu acesso, mas preserva os dados; excluir elimina os dados.
   Excluir uma turma elimina também seus alunos, eventos e sessões. A interface pede
   confirmação para exclusões e substituição de código.

O código é uma credencial, não um identificador público. Tem 128 bits aleatórios;
o banco armazena somente seu hash. Não coloque códigos em URLs ou capturas públicas.

## Persistência e sincronização

- Flyway cria o esquema com chaves estrangeiras e exclusões em cascata. O volume
  `nexus-db` preserva dados ao reiniciar o container. Não execute `down -v` para reiniciar:
  esse comando elimina o volume.
- Sessões opacas de 8 horas são persistidas no banco. Cookie `HttpOnly`, `SameSite=Strict`,
  e `Secure` em produção. Não há token de sessão em localStorage.
- As alterações de alunos usam uma fila IndexedDB com ID por evento e dono explícito.
  Eventos de demonstração e eventos antigos sem dono nunca são enviados como dados reais.
- A confirmação HTTP só ocorre depois da transação no PostgreSQL. Repetir o mesmo ID
  com o mesmo conteúdo não repete efeitos; alterar seu conteúdo retorna conflito.
- Eventos do mesmo aluno são serializados no banco. Repetir uma fase preserva a melhor
  pontuação. O backend não aceita escrita direta de estrelas ou conquistas obtidas.
- Cada tentativa contém o circuito, a duração e a data. O servidor valida as peças,
  as repetições e o desbloqueio; simula o jogo e calcula as estrelas com as regras existentes.
- Avatar e circuitos usam a última alteração **recebida pelo servidor**. Edições concorrentes
  do mesmo rascunho em aparelhos diferentes não são mescladas peça a peça.
- Na entrada, a fila desse aluno é reenviada antes de carregar o retrato do servidor.
  Nenhum progresso de demonstração é migrado automaticamente.
- Sem rede, uma sessão já aberta permite continuar as atividades e guardar alterações.
  Login, recuperação após recarregar e troca de identidade exigem o servidor. A aplicação
  ainda não é uma PWA e não promete abrir offline do zero.
- Sair exige confirmar a revogação no servidor. Se a rede falhar, a aplicação informa
  o erro e não declara que a sessão foi encerrada. Pendências locais permanecem para
  o próximo login do mesmo aluno. Limpar os dados do navegador elimina pendências não enviadas.
- Campos de perfil locais são conveniência, nunca autorização. A API deriva o dono da sessão.

## Datas e recompensas

A turma tem um fuso IANA (padrão `America/Sao_Paulo`). Cliente e servidor usam esse
fuso para dias civis do aluno, inclusive quando o dispositivo está em outro fuso.
Uma tentativa com alguma ação conta como atividade; abrir a aplicação e executar
um circuito vazio não contam. Várias tentativas no mesmo dia contam um dia.
Dias acumulados e consecutivos são métricas diferentes; a sequência termina hoje
ou ontem e se interrompe após um dia inteiro sem atividade.

O servidor aceita tentativas offline desde a criação do aluno, com tolerância de
cinco minutos de relógio; rejeita datas futuras além dessa tolerância. Horário e duração
continuam sendo informações do dispositivo, pois tentativas offline não têm cronômetro
confiável no servidor. A solução e a quantidade de passos são verificadas pelo backend;
a estrela por tempo não é prova antifraude. Não há ranking ou recompensa financeira.

O catálogo Java é gerado de `src/data/fases.js`, não editado separadamente:

```powershell
npm run backend:catalog
npm run backend:fixtures
```

`npm run build` atualiza o catálogo automaticamente. Ao mudar motor, fases ou regras,
regenere também os casos de comparação e execute os testes dos dois lados. Conquistas
seguem as regras atuais; mantenha `GameRules.awards` e `data/conquistas.js` coerentes.
Não foram criadas regras de XP ou nível.

## API

Todas as respostas de API têm `Cache-Control: no-store`. Erros usam `{ "erro": "mensagem" }`.
Alterações exigem JSON, `Origin` igual a `APP_ORIGIN`, `X-Nexus-Request: 1` e,
quando autenticado, `X-CSRF-Token` retornado pela sessão. Não há CORS aberto.

| Método e caminho | Acesso | Função |
|---|---|---|
| GET `/api/health` | Público | Disponibilidade da API e banco |
| POST `/api/auth/professor` | Público, limitado | Login `{login, senha}` |
| POST `/api/auth/aluno` | Público, limitado | Login `{codigo}` |
| GET `/api/session` | Autenticado | Identidade e token CSRF |
| POST `/api/auth/logout` | Autenticado | Revogar sessão |
| POST `/api/auth/password` | Professor | Trocar senha `{atual, nova}` e revogar sessões |
| GET/POST `/api/turmas` | Professor | Listar/criar suas turmas (`{nome, fuso}`) |
| DELETE `/api/turmas/{id}` | Dono | Excluir turma e seus registros |
| GET/POST `/api/turmas/{id}/alunos` | Dono | Consultar progresso/adicionar aluno |
| POST `/api/alunos/{id}/codigo` | Dono | Substituir código e revogar sessões |
| PATCH `/api/alunos/{id}` | Dono | Ativar/desativar (`{ativo}`) |
| DELETE `/api/alunos/{id}` | Dono | Excluir aluno e registros |
| GET `/api/aluno/estado` | Aluno | Recuperar seus dados |
| POST `/api/aluno/eventos` | Aluno | Aplicar evento idempotente |

Eventos `tentativa`: `{id, perfil:{tipo:"aluno",id}, tipo:"tentativa", faseId, estado:{slots,vezes}, segundos, ocorridoEm}`.
Eventos `dado`: `{id, perfil, tipo:"dado", chave, valor}`; chaves permitidas são `avatar`,
`conquistas` (somente marcação de visualização) e `circuito:trilha-principal:fase:N`.

## Testes com banco descartável

**Nunca aponte os testes ao banco de uso.** Eles exigem um banco chamado `nexus_test`
e limpam suas tabelas antes de cada cenário.

```powershell
docker compose exec db createdb -U nexus nexus_test
$env:TEST_DATABASE_URL = 'jdbc:postgresql://localhost:5432/nexus_test'
$env:TEST_DATABASE_PASSWORD = $env:DATABASE_PASSWORD
npm test
npm run backend:fixtures
mvn -f backend/pom.xml test
npm run build
mvn -f backend/pom.xml package -DskipTests
npm audit
```

Para somente comparar os motores, sem banco: `mvn -f backend/pom.xml test -Dtest=GameRulesTest`.

## Publicação e operação (não executadas automaticamente)

O artefato `backend/target/nexus-api-1.0.0.jar` pode servir interface e API na mesma
origem. Exige PostgreSQL persistente, JDK 21, HTTPS e variáveis de ambiente:
`DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `APP_ORIGIN`, `SECURE_COOKIE=true`.
Configure `BIND_ADDRESS=0.0.0.0` apenas quando a plataforma/container exigir.
Termine TLS no proxy da hospedagem; mantenha a API inacessível diretamente pela internet.
Não confie em cabeçalhos encaminhados de clientes externos.

Aplique atualizações de segurança do JDK e PostgreSQL. Restrinja credenciais do banco,
provisione professores por canal administrativo, configure backups e teste a restauração.
A escola precisa definir retenção, responsáveis pelo acesso e procedimento de exclusão.
Os registros são pseudonimizados; códigos e dados de aprendizagem ainda exigem proteção.
Nenhuma configuração técnica isolada representa certificação de conformidade com a LGPD.

O bloqueio de login aceita até 100 tentativas por IP a cada cinco minutos
(configurável por `LOGIN_IP_LIMIT`) e 20 por usuário de professor. Usa o endereço
remoto observado pela API; atrás de proxy
compartilhado, configure limitação de login também no proxy para evitar que usuários
legítimos compartilhem a mesma cota. Não há envio de e-mail, MFA ou recuperação automática.
