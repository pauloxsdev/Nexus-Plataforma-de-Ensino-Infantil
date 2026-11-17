# GitHub, cópia local e publicação

O GitHub guarda código e histórico. O Render executa a aplicação. O Neon mantém
o banco. Um commit não é backup do PostgreSQL e um push não publica o site quando
Auto-Deploy está desativado.

## Migrar da pasta ZIP sem perder alterações

Ao migrar de uma cópia ZIP para um clone Git, compare as alterações locais antes
de transferi-las. Preserve a pasta anterior como backup e copie somente os
arquivos de código que foram modificados intencionalmente.

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


## Retornar à interface anterior às aulas visuais

A atualização foi separada em compatibilidade da API e aulas/interface. Existem
três referências para identificar a versão desejada:

| Tag | Finalidade |
|---|---|
| `estavel-antes-novas-aulas-2026-11-17` | Código original da main antes desta atualização (`d35b195`). Referência histórica. |
| `retorno-seguro-aulas-2026-11-17` | Interface anterior com API compatível com tentativas v1 e v2. Ponto de retorno recomendado. |
| `aulas-visuais-v2-2026-11-17` | Commit das novas aulas e interface. |

Para desfazer **somente** as novas aulas/interface, comece em um clone limpo,
confira o histórico e crie um commit de reversão. Isso preserva a compatibilidade
com tentativas criadas antes ou depois da atualização:

```powershell
git status
git switch main
git pull --ff-only origin main
git fetch origin --tags
git revert --no-edit aulas-visuais-v2-2026-11-17
npm test
npm run build
# Execute também os testes Java conforme BACKEND.md, com banco descartável.
git push origin main
```

Se houver alterações locais ou conflitos com mudanças posteriores, pare para
revisá-los; não use push forçado ou reset destrutivo. No Render, publique a nova
revisão de reversão usando **Manual Deploy → Deploy latest commit**. GitHub e
Render precisam apontar para a revisão pretendida.

Para uma reversão emergencial somente do serviço, se o painel oferecer deploy de
um commit específico, escolha o commit da tag `retorno-seguro-aulas-2026-11-17`.
Depois alinhe a main com um commit de reversão antes do próximo deploy.

Não desfaça junto o commit de compatibilidade e não publique diretamente a tag
histórica `d35b195` depois de usar as aulas novas: o servidor original não reconhece
as estruturas v2. A versão de retorno recomendada mantém a aparência anterior e
aceita ambas as filas. Os novos modelos de circuito não aparecem no editor antigo;
a API preserva o progresso e consegue receber suas tentativas pendentes.

Nenhuma dessas operações é restauração do PostgreSQL. As tags guardam código;
progresso, usuários e outros dados persistidos permanecem no banco. Esta atualização
não adiciona migração de esquema.
