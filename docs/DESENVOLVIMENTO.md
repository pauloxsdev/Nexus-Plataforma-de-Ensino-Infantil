# Desenvolvimento

## Executar o sistema completo

Requisitos: Node.js 24 LTS, JDK 21 completo, Maven 3.9+ e Docker com containers
Linux. Os comandos abaixo usam PowerShell e devem ser executados na raiz do
repositório. Para somente explorar a demonstração, siga o [README](../README.md).

### 1. Banco e build

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
# Defina POSTGRES_PASSWORD antes de continuar.
docker compose up -d db
npm ci
npm run build
```

O volume `nexus-db` preserva os dados. Alterar a senha no `.env` não redefine a
senha de um banco já inicializado. Não use `docker compose down -v` para reiniciar:
isso apaga o volume. Nunca versione `.env` ou seus backups.

### 2. Configurar a API

Com `java`, `javac` e `mvn` disponíveis e `JAVA_HOME` apontando para seu JDK 21:

```powershell
$env:DATABASE_URL = 'jdbc:postgresql://localhost:5432/nexus'
$env:DATABASE_USER = 'nexus'
$senhaBanco = Read-Host 'Senha definida no .env' -AsSecureString
$env:DATABASE_PASSWORD = [System.Net.NetworkCredential]::new('', $senhaBanco).Password
$env:APP_ORIGIN = 'http://localhost:5173'
mvn -f backend/pom.xml package -DskipTests
```

O Spring não lê `.env` automaticamente. O empacotamento acima não executa testes;
confira a seção de testes antes de entregar uma alteração.

### 3. Criar o professor

Não há senha padrão. Use login com 3–80 caracteres minúsculos, números, ponto,
hífen ou sublinhado; senha com pelo menos 12 caracteres e no máximo 72 bytes.
**Se o login já existir, o comando redefine a senha e revoga suas sessões.**

```powershell
$env:TEACHER_LOGIN = Read-Host 'Usuário do professor'
$credencialProfessor = Read-Host 'Senha inicial do professor' -AsSecureString
$env:TEACHER_PASSWORD = [System.Net.NetworkCredential]::new('', $credencialProfessor).Password
try {
    java -jar backend/target/nexus-api-1.0.0.jar --provision-teacher
    if ($LASTEXITCODE -ne 0) { throw 'Provisionamento falhou. Confira o erro antes de iniciar o servidor.' }
} finally {
    Remove-Item Env:TEACHER_PASSWORD, Env:TEACHER_LOGIN -ErrorAction SilentlyContinue
    Remove-Variable credencialProfessor -ErrorAction SilentlyContinue
}
```

### 4. Iniciar e conferir

Após o provisionamento bem-sucedido, execute no mesmo terminal:

```powershell
java -jar backend/target/nexus-api-1.0.0.jar
```

Em outro terminal, execute `npm run dev` e abra **http://localhost:5173**.
O Vite encaminha `/api` para a porta 8080. O endereço usado no navegador deve
corresponder exatamente a `APP_ORIGIN`.

Entre como professor, crie uma turma e um aluno, guarde o código exibido uma vez
e entre como aluno. Conclua uma fase, aguarde a confirmação, recarregue e confira
o resultado no painel do professor. Teste também a separação entre dois alunos.

Para servir tudo pelo JAR, gere o frontend antes de empacotar, configure
`APP_ORIGIN=http://localhost:8080` e abra essa URL. Pare o processo Java antes de
substituir o JAR. Publicação em nuvem: [DEPLOY.md](DEPLOY.md).

## Testes

```powershell
npm test
npm run build
mvn -f backend/pom.xml test -Dtest=GameRulesTest
```

O teste Java acima verifica o motor sem banco. Para a suíte completa, crie **uma
vez** o banco descartável `nexus_test` no PostgreSQL local e configure:

```powershell
docker compose exec db createdb -U nexus nexus_test
$env:TEST_DATABASE_URL = 'jdbc:postgresql://localhost:5432/nexus_test'
$env:TEST_DATABASE_PASSWORD = $env:DATABASE_PASSWORD
npm run backend:fixtures
mvn -f backend/pom.xml test
```

A integração usa o usuário `nexus` e limpa as tabelas antes de cada cenário.
**Nunca aponte a suíte ao banco de uso ou ao Neon de produção.** Os comandos são
procedimentos de verificação, não comprovantes de uma execução recente.

## Onde alterar

| Recurso | Arquivos/pastas |
|---|---|
| Fases, mapas e metas | `src/data/fases.js` |
| Aulas e experimentos | `src/data/aulas.js`, `src/pages/Aula.jsx`, `src/components/LaboratorioAula.jsx` |
| Motor, peças e estrelas | `src/game/` |
| Oficina e interação | `src/pages/Oficina.jsx`, `src/components/Circuito.jsx`, `src/components/Paleta.jsx`, `src/hooks/useArrastar.js` |
| Personagens | `src/components/NexusAvatar.jsx` (aluno), `src/components/Nexi.jsx` (guia) |
| Cosméticos e conquistas | `src/data/personalizacao.json`, `src/data/personalizacao.js`, `src/data/conquistas.js` |
| Navegação e estilos | `src/App.jsx`, `src/components/BarraLateral.jsx`, `src/index.css` |
| Persistência e sincronização | `src/hooks/useDadoPerfil.js`, `src/hooks/useCircuito.js`, `src/services/` |
| API, permissões e regras Java | `backend/src/main/java/br/com/nexus/` |
| Banco e configuração | `backend/src/main/resources/` |

Ao criar fases, atualize também a aula e `LINHAS` em `src/pages/Trilha.jsx`.
Mantenha IDs coerentes com a progressão sequencial. Mudanças de motor ou peças
precisam de implementação correspondente em `GameRules.java`.

## Regras que precisam permanecer coerentes

- **Estrelas v2:** conclusão, meta de movimentos e meta de peças de ação (`ideal: { passos, pecas }`). Ambos os ramos contam; repetições não multiplicam a contagem de peças escritas. Repetir uma fase preserva o melhor resultado.
- **Personalização:** opções são liberadas conforme `personalizacao.json`, sem gastar estrelas. Cliente e servidor verificam os requisitos. Não há XP ou nível numérico.
- **Atividade:** tentativa com alguma ação conta um dia, mesmo se falhar. Abrir o aplicativo ou executar um circuito vazio não conta. Alunos usam o fuso da turma; a demo usa o do navegador. Dias acumulados e sequência são diferentes, sem histórico inventado.
- **Perfis:** dados locais usam `nexus:v2:<tipo>:<id codificado>:<chave>`. A demo é `demo/local`; dados globais legados sem dono não são migrados automaticamente. O servidor deriva a identidade da sessão, não dessas chaves.
- **Rascunhos:** separados por perfil, projeto `trilha-principal` e fase. Limpar restaura a estratégia selecionada; trocar de estratégia limpa suas peças, preservando progresso e estrelas.
- **Sincronização:** fila IndexedDB por dono, reenvio com o mesmo ID e confirmação após a transação. Eventos antigos não são reescritos. Avatar/circuito usam a última alteração recebida pelo servidor; não há mesclagem entre aparelhos.
- **Offline:** somente continuidade de uma sessão aberta. Não há login offline/PWA; limpar dados do navegador perde pendências não enviadas. Sair exige confirmação de revogação no servidor.

### Catálogos e compatibilidade

`npm run build` exporta fases e personalização para o backend. Ao alterar regras,
execute também `npm run backend:fixtures` e os testes de ambos os motores.

O servidor mantém `fases-v1.json` e `fases-v2.json`: tentativas sem versão seguem
v1 (inclusive a antiga estrela por tempo); novos estados usam `versaoRegras: 2`,
com `estrutura` quando aplicável. Versões desconhecidas são recusadas. Não
sobrescreva catálogos históricos para introduzir mudanças incompatíveis: crie uma
nova versão e preserve a leitura das tentativas pendentes. A versão declarada
pelo cliente é compatibilidade, não comprovação da interface utilizada.

### Contrato da API

Consulte as rotas e campos em [ApiController.java](../backend/src/main/java/br/com/nexus/ApiController.java)
e o cliente em [api.js](../src/services/api.js). Há rotas de saúde, sessão,
autenticação, turmas, alunos e eventos; cada recurso exige o papel/dono adequado.
As alterações usam JSON, `Origin` correspondente a `APP_ORIGIN`,
`X-Nexus-Request: 1` e, quando autenticadas, `X-CSRF-Token` da sessão.

Sessões duram oito horas e usam cookies `HttpOnly`, `SameSite=Strict` e `Secure`
em produção. Não armazene credenciais em URLs ou capturas. Códigos substituídos
e alunos desativados têm sessões revogadas; excluir uma turma também exclui seus
alunos e registros. A API valida as tentativas, mas datas offline dependem do
relógio do dispositivo: aceita desde a criação do aluno e até cinco minutos no futuro.
