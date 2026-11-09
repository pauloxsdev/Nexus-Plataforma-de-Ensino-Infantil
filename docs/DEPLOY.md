# Publicação no Render + Neon

A interface React e a API Spring Boot são servidas pela mesma aplicação no Render.
O PostgreSQL fica no Neon. O `Dockerfile` gera o frontend e o inclui no JAR.
Não é necessário hospedar o frontend separadamente nem executar Vite em produção.

## Ambiente publicado

Endereço público: https://nexus-app-9kau.onrender.com/.

A configuração utiliza Docker, PostgreSQL no Neon, health check em `/api/health`
e publicação manual. O plano gratuito pode suspender o serviço após inatividade;
consulte os limites atuais nos provedores antes de escolher uma instância.

O health check verifica a conexão com o banco. Ele não substitui os testes
funcionais nem comprova disponibilidade contínua, desempenho ou segurança.
As funcionalidades pendentes estão descritas em [Escopo e evolução](ESCOPO.md).

## 1. Contas e banco

1. Crie suas contas em https://render.com e https://neon.tech, preferencialmente
   vinculadas ao GitHub para facilitar a seleção do repositório no Render.
2. No Neon, crie um projeto PostgreSQL no plano gratuito. Escolha uma região também
   disponível no Render e use a mesma região nos dois serviços quando possível.
3. Anote, de forma privada, host, database, role e senha. Use inicialmente a conexão
   **direta**, sem `-pooler`, com o pool pequeno da aplicação.
4. Monte a URL JDBC, sem usuário ou senha dentro da URL:

```text
jdbc:postgresql://HOST_DO_NEON:5432/NOME_DO_BANCO?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory
```

Use o hostname completo fornecido pelo Neon, sem `https://`. Não cole a conexão
`postgresql://usuario:senha@...` diretamente em `DATABASE_URL`: Spring espera JDBC.
O driver valida o certificado e hostname com `verify-full`. A fábrica
`DefaultJavaSSLFactory` usa os certificados confiáveis do Java, evitando depender
de um arquivo local `root.crt`.

O banco novo não contém o professor, as turmas ou os alunos do PostgreSQL local.
Não há migração automática dos dados do seu computador.

## 2. Código e serviço Render

O Render precisa de uma revisão do GitHub que contenha `Dockerfile`, `.dockerignore`,
`render.yaml` e as configurações atualizadas do backend. Mudanças locais precisam ser enviadas ao repositório antes da publicação.

No painel Render, crie um **Web Service** a partir do repositório
`pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil`:

| Campo | Valor |
|---|---|
| Branch | main (com os arquivos de deploy publicados no GitHub) |
| Runtime / Language | Docker |
| Dockerfile | ./Dockerfile |
| Docker context | raiz do repositório |
| Instance type | Free, se disponível no painel |
| Region | próxima/igual à região do Neon |
| Health check | /api/health |
| Auto deploy | desativado |

Não preencha um comando `npm run dev` ou `mvn spring-boot:run`: o Dockerfile já
contém a compilação e o comando de inicialização. Também é possível criar um
Blueprint usando `render.yaml`; confira plano, região e variáveis antes de aplicar.

Configure no painel, sem colocar segredos em arquivos versionados:

| Variável | Valor |
|---|---|
| DATABASE_URL | URL JDBC da etapa 1 |
| DATABASE_USER | Role/usuário do Neon |
| DATABASE_PASSWORD | Senha do Neon |
| SECURE_COOKIE | true |
| BIND_ADDRESS | 0.0.0.0 |
| DB_POOL_MAX | 3 |
| DB_POOL_MIN | 0 |
| DB_IDLE_TIMEOUT | 30000 |

O Render fornece `PORT` e `RENDER_EXTERNAL_URL`. A aplicação usa essa URL como
origem permitida por padrão. Para domínio próprio, configure `APP_ORIGIN` com a
origem exata, por exemplo `https://nexus.exemplo.com`, sem barra final ou caminho.
Não use `APP_ORIGIN=http://localhost:5173` em produção.

Inicie a publicação e aguarde o build e a inicialização. O Flyway cria as tabelas
no banco configurado. Confira a URL pública e `/api/health`, que deve responder
`{"status":"ok"}`. Essa rota verifica conexão com o banco, mas não substitui o
roteiro funcional abaixo.

## 3. Primeiro professor no banco da nuvem

Faça pelo seu computador, com JDK 21 e Maven, evitando depender de shell pago no
Render. Não crie endpoint público de cadastro administrativo. Execute na raiz de
uma cópia atualizada do projeto.

Se ainda não tiver o JAR, gere-o:

```powershell
npm ci
npm run build
mvn -f backend/pom.xml package -DskipTests
```

Em um terminal PowerShell separado do backend local:

```powershell
$env:DATABASE_URL = Read-Host 'URL JDBC do Neon (sem usuario ou senha)'
$env:DATABASE_USER = Read-Host 'Role/usuario do Neon'
$senhaBanco = Read-Host 'Senha do Neon' -AsSecureString
$env:DATABASE_PASSWORD = [System.Net.NetworkCredential]::new('', $senhaBanco).Password
$env:TEACHER_LOGIN = Read-Host 'Login do professor (minusculas)'
$senhaProfessor = Read-Host 'Senha do professor (minimo 12 caracteres)' -AsSecureString
$env:TEACHER_PASSWORD = [System.Net.NetworkCredential]::new('', $senhaProfessor).Password
try {
    java -jar backend/target/nexus-api-1.0.0.jar --provision-teacher
    if ($LASTEXITCODE -ne 0) { throw 'Provisionamento falhou. Confira o erro sem compartilhar segredos.' }
} finally {
    Remove-Item Env:TEACHER_PASSWORD, Env:TEACHER_LOGIN, Env:DATABASE_PASSWORD, Env:DATABASE_USER, Env:DATABASE_URL -ErrorAction SilentlyContinue
    Remove-Variable senhaBanco, senhaProfessor -ErrorAction SilentlyContinue
}
```

A senha do professor deve ter no mínimo 12 caracteres e no máximo 72 bytes.
O comando cria o professor e encerra o processo; não inicia o servidor web.
Se o login já existir, redefine a senha e revoga suas sessões. Não execute novamente
como simples teste de conexão. Não configure `TEACHER_PASSWORD` no serviço Render.

## 4. Conferência no endereço público

1. Abra a URL HTTPS do Render e confira a interface.
2. Entre como professor com o login criado **no Neon**.
3. Crie uma turma de teste e adicione um aluno; guarde o código de forma privada.
4. Entre como aluno, conclua a primeira fase e aguarde a confirmação do servidor.
5. Reabra a aplicação e confira o progresso.
6. Entre como professor e atualize o acompanhamento da turma.
7. Confira o site no celular. Use a URL pública, não `localhost`.
8. Saia da conta e confira que a área autenticada exige novo login.

Registre data, revisão do código e resultados. Ainda será necessário verificar
comportamento após repouso/inatividade do serviço gratuito. Esse plano pode
apresentar espera no primeiro acesso; não representa garantia de 99% de uptime
nem de resposta constante em dois segundos.

## 5. Alterar, publicar novamente e pausar

Desenvolva e teste localmente, envie a revisão escolhida ao GitHub e faça o deploy
manual no Render quando quiser disponibilizá-la. Auto deploy fica desativado para
que um push sozinho não publique a aplicação.

A disponibilidade de suspensão/retomada depende do plano e do painel do Render.
Use essa opção se oferecida quando precisar tirar o serviço do ar. Não exclua o
projeto Neon ou suas tabelas para interromper o site. Reiniciar/publicar a aplicação
não deve apagar o banco, mas mudanças de esquema precisam ser avaliadas antes de
uma reversão de versão. Faça backup antes de alterações destrutivas.

## Verificação da publicação

Antes de publicar, execute os testes pertinentes e gere o build. Depois, confirme
que o serviço inicia, que `/api/health` retorna `ok` e que os assets são carregados.
Verifique login, criação de turma/aluno e persistência de progresso conforme o
roteiro acima, registrando versão e ambiente de execução.

O build Docker empacota o backend com `-DskipTests`; os testes devem ser executados
separadamente antes da entrega. Um build local bem-sucedido não comprova o
funcionamento da instalação remota. Os testes Java de integração usam banco
exclusivo e descartável, nunca o Neon de produção.

## GitHub e troca de credenciais

Siga `GITHUB.md` para atualizar o código. Com Auto-Deploy Off, commit/push não
substituem a ação Manual Deploy no Render. Mudanças apenas em documentação e
regras de exclusão de arquivos não exigem republicar a aplicação em execução.

Se a senha do PostgreSQL for redefinida no Neon, atualize `DATABASE_PASSWORD` no
Render e nas sessões locais que usam esse banco. URLs do CLI Neon em `.env`
podem conter a senha antiga; atualize-as privadamente quando forem necessárias.
A senha do banco é independente da senha do professor. Nunca salve credenciais
em commits, capturas ou relatórios. Remover um segredo do arquivo atual não o
remove do histórico; se houver exposição, revogue/substitua a credencial.
