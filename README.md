# NEXUS 2.0

Plataforma educativa para aprender lógica de programação por meio de desafios
visuais. Crianças e adolescentes exploram sequências, repetições e resolução de
problemas montando circuitos em uma trilha de atividades.

**[Acesse o NEXUS](https://nexus-app-9kau.onrender.com/)** ·
[Execução local](docs/BACKEND.md) · [Arquitetura](docs/GUIA-DO-CODIGO.md) ·
[Escopo e evolução](docs/ESCOPO.md)

## Experimente

Na tela inicial, escolha **Explorar demonstração** para conhecer as atividades
sem criar uma conta. Nesse modo, os dados ficam somente no navegador e são
separados dos perfis autenticados.

Alunos entram com um código individual fornecido pelo professor. Professores
acessam suas turmas com usuário e senha; a criação dessas contas é administrativa.
Não há credenciais públicas de professor.

O serviço gratuito pode levar mais tempo para abrir após um período de inatividade.

## Funcionalidades

- Oito fases com aulas e tutoriais de lógica de programação.
- Oficina com montagem de circuitos por arrastar e soltar ou clique/toque.
- Avatar personalizável, estrelas, conquistas e registro de dias de atividade.
- Progressão por fases, preservando o melhor resultado a cada repetição.
- Área do professor com turmas, códigos de acesso e acompanhamento individual.
- Persistência de progresso e circuitos por aluno no PostgreSQL.
- Fila local de alterações e sincronização com confirmação do servidor.
- Layout responsivo para celular, tablet e desktop.

## Arquitetura e tecnologias

| Camada | Tecnologias e função |
|---|---|
| Interface | React, Vite e Tailwind CSS |
| Jogo | Motor próprio em JavaScript, com validação das tentativas também em Java |
| API | Java 21, Spring Boot, JDBC e sessões autenticadas |
| Persistência | PostgreSQL e migrações Flyway |
| Dados locais | Armazenamento por perfil e fila de eventos em IndexedDB |
| Testes | Vitest e testes Java de integração com PostgreSQL descartável |
| Publicação | Docker, Render e Neon |

O frontend é compilado e incluído no JAR do Spring Boot. A interface e a API são
servidas na mesma origem. O servidor verifica permissões, valida os resultados
do jogo e confirma a persistência dos eventos.

## Executar localmente

Requisitos: Node.js 24 LTS, JDK 21, Maven 3.9+ e PostgreSQL. O banco local pode ser
iniciado com Docker Compose. As versões atuais das ferramentas frontend aceitam
Node.js 22.12+ na linha 22, 24.x ou 26+.

```bash
git clone https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil.git
cd Nexus-Plataforma-de-Ensino-Infantil
npm ci
npm run dev
```

O Vite disponibiliza a interface em `http://localhost:5173`. Para login, turmas e
sincronização, configure e inicie também a API e o banco conforme o
[guia do backend](docs/BACKEND.md). A demonstração pode ser explorada sem login.

```bash
npm test
npm run build
```

O build gera `dist/` e exporta o catálogo de fases utilizado pelo backend.
Os testes de integração Java exigem um banco descartável: nunca utilize o banco
de produção. Consulte [os procedimentos de teste](docs/BACKEND.md).

## Dados e acesso

O cadastro do aluno não exige nome, e-mail ou data de nascimento. Os dados são
associados a códigos individuais e perfis separados. Professores acessam apenas
suas turmas, com verificação de autorização na API.

Os códigos são credenciais e devem ser mantidos privados. Essa abordagem reduz
a coleta de dados pessoais, mas não representa anonimato absoluto nem comprovação
isolada de conformidade com a LGPD. Não há ranking entre alunos.

## Escopo atual

O uso offline permite continuar atividades em uma sessão já aberta e sincronizar
posteriormente. Ainda não há PWA, login offline ou garantia de reabertura sem rede.

Projetos independentes nomeados, edição de turmas, gestão de materiais e emissão
de certificados integrada às telas são evoluções pendentes. O gerador PDF existe
como serviço isolado. Não há sistema de XP ou nível numérico implementado.

A avaliação pedagógica com o público-alvo, a auditoria completa de acessibilidade
e medições de disponibilidade e desempenho permanecem necessárias. Consulte o
[escopo detalhado](docs/ESCOPO.md).

## Documentação

| Guia | Conteúdo |
|---|---|
| [Backend](docs/BACKEND.md) | Configuração, autenticação, API e testes |
| [Código](docs/GUIA-DO-CODIGO.md) | Organização dos componentes e regras do jogo |
| [Dados e progresso](docs/DADOS-E-PROGRESSO.md) | Perfis, indicadores e persistência |
| [Publicação](docs/DEPLOY.md) | Docker, Render, Neon e variáveis de ambiente |
| [GitHub e manutenção](docs/GITHUB.md) | Clone, revisão de mudanças e deploy manual |
| [Escopo](docs/ESCOPO.md) | Recursos existentes, limites e evolução |
| [Verificações do backend](docs/RELATORIO-BACKEND.md) | Testes registrados na implementação |

## Autoria

Projeto de [pauloxsdev](https://github.com/pauloxsdev).
