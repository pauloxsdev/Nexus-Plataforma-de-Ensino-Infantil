<div align="center">

<img src="src/assets/nexi.png" alt="Nexi, o guia das atividades do NEXUS" width="160" />

# NEXUS 2.0

**Aprender lógica de programação, uma descoberta de cada vez.**

Desafios visuais para organizar instruções, explorar repetições e tomar decisões.

[Acessar o sistema](https://nexus-app-9kau.onrender.com/) · [Experimentar localmente](#executar-localmente) · [Documentação](#documentação)

</div>

**Sistema publicado no Render:** [https://nexus-app-9kau.onrender.com/](https://nexus-app-9kau.onrender.com/)

## O projeto

O NEXUS é uma plataforma educativa voltada ao público infantil. A criança monta
programas com peças de ação, observa o personagem executar suas instruções e
ajusta a solução para alcançar o objetivo de cada fase.

O foco é o raciocínio por trás da programação: sequência, direção, repetição,
condições e identificação de erros. As atividades usam comandos visuais e
pseudocódigo em português; não exigem escrever a sintaxe de uma linguagem textual.

## Conheça em poucos minutos

1. [Abra o sistema](https://nexus-app-9kau.onrender.com/) e escolha **Explorar demonstração**.
2. Conheça a trilha e abra a primeira aula.
3. Na oficina, monte as instruções por arraste ou seleção por clique/toque.
4. Execute o programa, observe o caminho e experimente outra solução.
5. Explore as conquistas e a personalização do personagem.

A demonstração dispensa cadastro e mantém os dados no navegador, separados dos
perfis autenticados. O serviço gratuito pode demorar para abrir após um período
de inatividade.

## Experiência de aprendizagem

| Recurso | Como funciona |
|---|---|
| Trilha de desafios | Oito fases apresentam sequências, mudanças de direção, repetições e condições. |
| Aulas visuais | Etapas **Veja, Preveja e Experimente**, exemplos interativos e perguntas com feedback. |
| Oficina | Montagem com peças, escolha de estratégia nas fases previstas e execução passo a passo. |
| Programa em português | Pseudocódigo aproxima as peças visuais da representação escrita das instruções. |
| Progresso | Estrelas, fases concluídas, conquistas e dias de atividade por perfil. |
| Personalização | Formas, cores, expressões e acessórios desbloqueados pelo progresso, sem compras. |
| Área do professor | Criação de turmas, códigos individuais de acesso e acompanhamento dos alunos. |

As estrelas consideram a conclusão e as metas de movimentos e peças de ação de
cada fase. Repetir uma fase preserva o melhor resultado, sem acumular a mesma
recompensa novamente. Não há ranking entre alunos nem sistema de XP.

## Arquitetura

```text
Navegador
  React + motor do jogo em JavaScript
  Armazenamento local por perfil + fila em IndexedDB
                   │ HTTP /api
                   ▼
Spring Boot / Java 21
  Sessões, permissões, validação do jogo e sincronização
                   │ JDBC
                   ▼
PostgreSQL
  Alunos, turmas, sessões e progresso
```

Em produção, o frontend compilado é incluído no JAR do Spring Boot: interface e
API compartilham a mesma origem. O backend valida as tentativas e confirma a
persistência dos eventos; a interface não determina sozinha as permissões ou a
pontuação dos alunos autenticados.

| Camada | Tecnologias |
|---|---|
| Interface | React 18, Vite e Tailwind CSS |
| Regras do jogo | JavaScript no cliente e validação correspondente em Java |
| API | Java 21, Spring Boot e JDBC |
| Banco e migrações | PostgreSQL e Flyway |
| Persistência no navegador | Armazenamento por perfil e IndexedDB com `idb` |
| Testes | Vitest, testes Java e integração com PostgreSQL descartável |
| Infraestrutura | Docker, Docker Compose, Render e Neon |

## Executar localmente

### Interface e demonstração

Use **Node.js 24 LTS** e npm. As versões compatíveis estão declaradas em
[`package.json`](package.json).

```bash
git clone https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil.git
cd Nexus-Plataforma-de-Ensino-Infantil
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente **http://localhost:5173**, e
selecione **Explorar demonstração**. Não é necessário configurar o banco para
explorar esse modo. Login e sincronização exigem a API.

### Sistema completo

Além do Node.js, use **JDK 21, Maven 3.9+ e PostgreSQL**. O projeto inclui
[`compose.yaml`](compose.yaml) para iniciar o banco local com Docker Compose.

Siga o [guia do backend](docs/BACKEND.md) para configurar as variáveis de ambiente,
iniciar o banco, empacotar a aplicação e provisionar uma conta de professor.
**Não há senha padrão nem credenciais públicas de professor.**

No desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:8080`.
Para servir também a interface pelo Spring Boot, gere o frontend antes do JAR:

```bash
npm run build
mvn -f backend/pom.xml package -DskipTests
```

Esse comando Maven empacota sem executar os testes. A configuração do banco e de
`APP_ORIGIN`, assim como o comando de inicialização, está no guia do backend.

## Verificação e manutenção

| Comando | Finalidade |
|---|---|
| `npm test` | Executar a suíte do frontend. |
| `npm run build` | Gerar `dist/` e atualizar os catálogos consumidos pelo backend. |
| `npm run preview` | Inspecionar o frontend compilado; não inicia a API. |
| `npm run backend:catalog` | Exportar fases e regras de personalização para o backend. |
| `npm run backend:fixtures` | Atualizar os casos de comparação dos motores do jogo. |
| `mvn -f backend/pom.xml test -Dtest=GameRulesTest` | Verificar as regras Java sem banco. |

Os testes de integração exigem um banco **descartável chamado `nexus_test`** e
limpam suas tabelas. Consulte a [configuração de testes](docs/BACKEND.md#testes-com-banco-descartável);
nunca utilize o banco de produção.

As regras e o catálogo precisam permanecer coerentes entre cliente e servidor.
Mudanças incompatíveis também devem respeitar as
[tentativas de versões anteriores ainda na fila](docs/COMPATIBILIDADE-JOGO.md).

## Organização do repositório

```text
src/
  components/     Componentes visuais e controles do jogo
  pages/          Telas de alunos e professores
  data/           Fases, aulas, tutoriais e personalização
  game/           Execução e avaliação dos programas
  hooks/          Estado, interações e progresso
  services/       Comunicação e persistência
backend/          API Java, migrações e testes
scripts/          Exportação de catálogos e casos de teste
docs/             Guias técnicos e escopo
Dockerfile        Build da interface e da API para produção
compose.yaml      PostgreSQL para desenvolvimento local
render.yaml       Configuração do serviço no Render
```

## Dados, acesso e limites

Alunos entram com um código individual fornecido pelo professor. O cadastro não
exige nome, e-mail ou data de nascimento. Professores acessam suas próprias turmas
com usuário e senha, e a API verifica as permissões.

Códigos de acesso são credenciais privadas. A separação por perfil e a coleta
reduzida de dados não equivalem a anonimato absoluto ou certificação de conformidade
com a LGPD. Não publique senhas, arquivos `.env` ou códigos de alunos no repositório.

Uma sessão já aberta permite continuar atividades sem rede e sincronizar depois.
Ainda não há PWA, login offline ou garantia de reabertura sem conexão. Projetos
independentes nomeados, gestão de materiais e certificados integrados às telas
permanecem fora da experiência atual; o gerador PDF existe como serviço isolado.

Avaliação pedagógica com crianças, auditoria completa de acessibilidade e medições
de desempenho continuam necessárias. O [escopo detalhado](docs/ESCOPO.md) registra
as implementações parciais e as evoluções previstas.

## Publicação

A aplicação usa **Render** para a interface/API e **Neon** para PostgreSQL. O
[`render.yaml`](render.yaml) mantém o deploy automático desativado: enviar código
ao GitHub não publica essa configuração automaticamente. A publicação deve ser
acionada no Render, conforme o [guia de deploy](docs/DEPLOY.md).

## Documentação

| Guia | Conteúdo |
|---|---|
| [Backend](docs/BACKEND.md) | Execução completa, autenticação, API e testes |
| [Guia do código](docs/GUIA-DO-CODIGO.md) | Componentes e regras do jogo |
| [Dados e progresso](docs/DADOS-E-PROGRESSO.md) | Perfis, indicadores e persistência |
| [Personalização](docs/PREVIA-NEXI.md) | Nexi, cosméticos e regras de desbloqueio |
| [Compatibilidade do jogo](docs/COMPATIBILIDADE-JOGO.md) | Versões de regras e eventos pendentes |
| [Publicação](docs/DEPLOY.md) | Docker, Render, Neon e variáveis de ambiente |
| [GitHub e manutenção](docs/GITHUB.md) | Revisão de mudanças e deploy manual |
| [Escopo](docs/ESCOPO.md) | Recursos existentes, limites e evolução |

## Autoria

Projeto desenvolvido pelos integrantes:

- [@pauloxsdev](https://github.com/pauloxsdev)
- [@grazixzdev](https://github.com/grazixzdev)
- [@italosam07-ai](https://github.com/italosam07-ai)
- [@laadfere](https://github.com/laadfere)

## Contato

Para relatar problemas, utilize as
[issues do repositório](https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil/issues),
com passos para reproduzir e capturas sem dados de alunos ou credenciais.
