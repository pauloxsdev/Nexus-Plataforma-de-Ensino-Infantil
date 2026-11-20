# Publicação: Render + Neon

Sistema: https://nexus-app-9kau.onrender.com/

O Dockerfile compila o frontend e o inclui no JAR: interface e API ficam no Render,
com PostgreSQL no Neon. Não é necessário hospedar Vite separadamente.

## Configuração

Crie o banco no Neon, preferindo uma região próxima à do Render. Use inicialmente
a conexão direta (sem `-pooler`), com o pool pequeno da aplicação. Monte a URL
JDBC **sem usuário ou senha**:

```text
jdbc:postgresql://HOST_DO_NEON:5432/NOME_DO_BANCO?sslmode=verify-full&sslfactory=org.postgresql.ssl.DefaultJavaSSLFactory
```

O host não inclui `https://`. Essa configuração valida o certificado com o truststore
Java; não cole a URL `postgresql://usuario:senha@...` do Neon diretamente.
Um banco novo não recebe automaticamente os dados do seu computador.

No Render, crie um **Web Service** conectado ao repositório:

| Campo | Valor |
|---|---|
| Branch / Runtime | `main` / Docker |
| Root Directory | vazio (raiz do repositório) |
| Dockerfile / Context | `./Dockerfile` / `.` |
| Plano | Free, se disponível; confira os limites atuais |
| Health check | `/api/health` |
| Auto-Deploy | Off |

Não substitua o comando de inicialização do Dockerfile. O arquivo
[render.yaml](../render.yaml) também pode ser usado como Blueprint.

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL JDBC acima |
| `DATABASE_USER` / `DATABASE_PASSWORD` | Usuário e senha do Neon |
| `SECURE_COOKIE` / `BIND_ADDRESS` | `true` / `0.0.0.0` |
| `DB_POOL_MAX` / `DB_POOL_MIN` | `3` / `0` |
| `DB_IDLE_TIMEOUT` | `30000` |

Render fornece `PORT` e `RENDER_EXTERNAL_URL`; esta última é a origem padrão.
Para domínio próprio, defina `APP_ORIGIN` com a origem HTTPS exata, sem caminho
ou barra final. Não use localhost em produção nem exponha a API diretamente
contornando o proxy HTTPS. O Flyway aplica as migrações ao iniciar.

## Primeiro professor na nuvem

Em uma cópia atualizada, gere o JAR com Node.js, JDK 21 e Maven:

```powershell
npm ci
npm run build
mvn -f backend/pom.xml package -DskipTests
```

Em um PowerShell separado, configure o banco Neon e provisione o professor.
Login: 3–80 caracteres minúsculos, números, ponto, hífen ou sublinhado.
Senha: mínimo de 12 caracteres, máximo de 72 bytes.
**Um login existente terá a senha redefinida e as sessões revogadas.**

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

O comando encerra após o provisionamento; não abre servidor web.
Não configure `TEACHER_PASSWORD` no serviço Render nem use provisionamento como
teste de conexão. A senha do professor é independente da senha do banco.

## Atualizar e verificar

1. Revise `git status` e o diff; execute os [testes pertinentes](DESENVOLVIMENTO.md#testes) e o build. O Dockerfile usa `-DskipTests`, portanto seu build não comprova os testes.
2. Faça commit dos arquivos pretendidos e envie a branch correta ao GitHub. Para o deploy configurado, a revisão precisa estar na `main`.
3. No Render, escolha **Manual Deploy → Deploy latest commit** e confira o commit publicado.
4. Verifique `/api/health` (`{"status":"ok"}`), login, criação de turma/aluno de teste, conclusão de fase e recuperação do progresso após recarregar. Confira celular e saída da sessão.

Registre versão e resultado. Testes de integração usam exclusivamente banco
local descartável, nunca o Neon de produção. Alterações só em documentação não
exigem deploy. O modo gratuito pode demorar para despertar após inatividade.

## Reversão e operação

Para desfazer uma alteração publicada, prefira um commit de reversão após revisar
o histórico, testar e publicar a revisão resultante. Não use reset destrutivo ou
push forçado para substituir o histórico. Um commit guarda código, não o banco.

Para voltar especificamente à interface anterior às aulas visuais, a tag
`retorno-seguro-aulas-2026-11-17` aponta para `46c102a`, com API compatível com v1 e
v2. O commit da tag `aulas-visuais-v2-2026-11-17` (`9cf50f1`) pode ser revertido,
mas mudanças posteriores podem exigir resolução de conflitos. Não remova a
compatibilidade junto nem publique `d35b195` para receber tentativas v2. Estruturas
novas podem não aparecer no editor antigo; preserve eventos ainda não enviados.

Para pausar o site, use suspensão/retomada no Render se disponível; não exclua o
banco Neon. Planeje backups e teste a restauração, especialmente antes de migrações
incompatíveis ou destrutivas. Mantenha JDK e dependências atualizados.

Ao trocar a senha no Neon, atualize `DATABASE_PASSWORD` no Render e nos ambientes
locais. Nunca publique `.env`, senhas ou códigos de alunos; um segredo exposto deve
ser revogado, pois apagar o arquivo não o remove do histórico. Configure retenção
e exclusão de dados conforme o contexto de uso. Atrás de proxy compartilhado,
planeje também limitação de login no proxy: a API usa o IP remoto observado.
