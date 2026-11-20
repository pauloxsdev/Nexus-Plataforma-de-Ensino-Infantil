<div align="center">

<img src="src/assets/nexi.png" alt="Nexi, o guia do NEXUS" width="150" />

# NEXUS 2.0

**Aprender lógica de programação, uma descoberta de cada vez.**

[Acessar o sistema](https://nexus-app-9kau.onrender.com/) · [Executar localmente](#executar-localmente) · [Documentação](#documentação)

</div>

**Sistema no Render:** https://nexus-app-9kau.onrender.com/

O NEXUS é uma plataforma educativa voltada ao público infantil. A criança monta
programas com peças visuais, observa o personagem executar as instruções e ajusta
a solução para alcançar o objetivo. O foco é aprender sequências, repetições e
condições antes de escrever a sintaxe de uma linguagem textual.

## Experimente

Abra o sistema e escolha **Explorar demonstração**. Conheça a primeira aula,
monte um circuito e execute o programa. A demonstração dispensa cadastro e salva
somente no navegador, separadamente dos alunos autenticados. O serviço gratuito
pode demorar para abrir após um período de inatividade.

## O que você encontra

- Oito fases com aulas **Veja, Preveja e Experimente**.
- Oficina por arraste ou clique/toque, pseudocódigo e execução passo a passo.
- Estrelas, conquistas e personalização desbloqueada pelo progresso.
- Área do professor com turmas, códigos individuais e acompanhamento dos alunos.
- Progresso por perfil e sincronização com confirmação do servidor.
- Interface adaptada a celular, tablet e desktop.

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Interface | React, Vite e Tailwind CSS |
| Jogo | Motor próprio em JavaScript e validação correspondente em Java |
| API | Java 21, Spring Boot e JDBC |
| Persistência | PostgreSQL, Flyway e IndexedDB com `idb` |
| Testes | Vitest e testes Java com PostgreSQL descartável para integração |
| Publicação | Docker, Render e Neon |

Em produção, o Spring Boot serve a interface e a API na mesma origem.

## Executar localmente

Para explorar a demonstração, use **Node.js 24 LTS** e npm:

```bash
git clone https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil.git
cd Nexus-Plataforma-de-Ensino-Infantil
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente **http://localhost:5173**.
Login e sincronização exigem também a API e o banco: siga o
[guia de desenvolvimento](docs/DESENVOLVIMENTO.md).

## Documentação

- [Desenvolvimento](docs/DESENVOLVIMENTO.md): instalação completa, testes e regras do código.
- [Publicação](docs/DEPLOY.md): Render, Neon, atualização e reversão.
- [Escopo](docs/ESCOPO.md): limitações e próximos passos.

## Autoria

- [@pauloxsdev](https://github.com/pauloxsdev)
- [@grazixzdev](https://github.com/grazixzdev)
- [@italosam07-ai](https://github.com/italosam07-ai)
- [@laadfere](https://github.com/laadfere)

Relate problemas pelas [issues](https://github.com/pauloxsdev/Nexus-Plataforma-de-Ensino-Infantil/issues),
com passos para reproduzir e capturas sem credenciais ou dados de alunos.
