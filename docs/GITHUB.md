# GitHub, cópia local e publicação

O GitHub guarda código e histórico. O Render executa a aplicação. O Neon mantém
o banco. Um commit não é backup do PostgreSQL e um push não publica o site quando
Auto-Deploy está desativado.

## Migrar da pasta ZIP sem perder alterações

O ambiente deste chat não acessa a pasta Windows do responsável. As mudanças
feitas localmente, inclusive pelo CLI Neon, precisam ser comparadas antes de
serem transferidas. Não apague a pasta ZIP nem substitua seus arquivos em massa.

No PowerShell, confira o Git:

```powershell
git --version
```

Se não estiver instalado, use o instalador oficial em https://git-scm.com/downloads/win
e reabra o terminal. Clone em uma nova pasta, sem sobrescrever a antiga:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\source" | Out-Null
Set-Location "$env:USERPROFILE\source"
git clone https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil.git Nexus
Set-Location Nexus
git status
```

Se `Nexus` já existir, escolha outro nome; não remova a pasta existente.

Compare os arquivos de código que você alterou na pasta ZIP com os da cópia
clonada, usando a comparação do editor. Transfira somente mudanças intencionais.
Não copie `node_modules`, `dist`, `backend/target` ou uma pasta `.git` de outro local.
Não substitua automaticamente `package.json`/`package-lock.json` pelas versões
alteradas pelo CLI Neon: revise se essas dependências são necessárias. A aplicação
Spring usa o driver JDBC PostgreSQL, não depende de SDK JavaScript do Neon.

O arquivo `neon.ts`, se presente na pasta local, pode descrever políticas reais
do projeto Neon: revise seu conteúdo antes de decidir versioná-lo. Ele não é
necessário para executar o Dockerfile atual. A associação local `.neon` fica
ignorada. Nunca coloque senhas em `neon.ts`.

O `.env` e backups `.env.*` devem permanecer privados. Se precisar de um `.env`
na nova pasta, configure-o localmente e confira a exclusão com `git check-ignore`.
O Spring não lê esse arquivo automaticamente; siga `BACKEND.md` e `DEPLOY.md`.
Não reutilize a senha local do Docker como se fosse a senha do Neon.

## Atualizar e verificar

Comece pelo estado local, antes de buscar atualizações:

```powershell
git status
git fetch origin
git log --oneline HEAD..origin/main
```

Com o diretório limpo e sem commits locais divergentes:

```powershell
git pull --ff-only origin main
```

Se houver alterações locais ou divergência, revise-as primeiro. Não use
`reset --hard`, `clean -fd` ou push forçado para contornar esse estado.

Depois de alterar o código, execute as verificações pertinentes:

```powershell
npm ci
npm test
npm run build
```

Para backend, consulte os testes em `docs/BACKEND.md`. **Nunca aponte testes de
integração para o Neon de produção:** a suíte utiliza banco descartável e apaga
dados de teste. `mvn package -DskipTests` apenas empacota; não comprova os testes.

Antes de registrar:

```powershell
git status --short
git diff
git diff --check
git check-ignore .env .env.backup-teste .neon
```

O `.env.example` versionado contém apenas um exemplo sem credencial real. Ignore
não protege um arquivo já rastreado; confira o conteúdo que será enviado.

Adicione apenas os arquivos pretendidos, substituindo os caminhos de exemplo:

```powershell
git add caminho/do/arquivo1 caminho/do/arquivo2
git diff --cached --stat
git diff --cached
git commit -m "Descreva a alteracao"
git push origin main
```

Use a autenticação do Git/GitHub quando solicitada. Não cole token no comando ou
na URL do repositório. Se usar branches e pull requests, publique a branch e
integre a mudança à `main` antes do deploy configurado para essa branch.

## Publicar a versão escolhida

1. Confira o commit na `main` do GitHub.
2. No Render, abra o serviço e use **Manual Deploy → Deploy latest commit**.
3. Aguarde a conclusão e confira o commit publicado nos registros do deploy.
4. Verifique `/api/health` e os fluxos de professor/aluno no endereço público.
5. Registre o resultado e qualquer limitação observada.

Mudanças somente em documentação não exigem deploy. Alterações em código ou
configuração de execução exigem publicação para chegar ao site. O deploy não
transfere os dados do banco local ao Neon. Migrações de esquema precisam ser
compatíveis com a versão publicada e com eventual reversão; faça backup antes
de operações destrutivas.

## Limites da conferência de 09/11/2026

A conferência do agente cobre o checkout deste ambiente e sua referência no
GitHub. Não cobre arquivos que existem apenas no computador do responsável,
configurações privadas do Render/Neon ou todos os possíveis formatos de segredo.
A publicação e os testes funcionais remotos foram confirmados pelo responsável,
conforme `DEPLOY.md`. As alterações nesta revisão são documentais e de exclusão
de arquivos; não mudam regras pedagógicas, autenticação ou dados de produção.
