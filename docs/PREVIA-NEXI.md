# Nexi e personalização por progresso

Registro técnico da atualização de 11/11/2026, baseada na revisão `9af2a65`. Os resultados de teste abaixo correspondem à validação local dessa atualização, não à versão atual nem à disponibilidade do serviço publicado.

## Interface

- `src/assets/nexi.png` e `src/components/Nexi.jsx`: arte do guia com fundo transparente. O componente compartilhado atualiza o login, menu, aulas, tutoriais, missões e mensagens. O personagem personalizável do aluno continua sendo o Nexus.
- `src/components/CabecalhoAventura.jsx` e `src/index.css`: cabeçalho ilustrado, fundo pontilhado, cores claras, cartões de descoberta, coleção e adaptações para telas menores. Decorações não recebem eventos de ponteiro; as preferências de movimento reduzido continuam respeitadas.
- `src/pages/Login.jsx`, `Base.jsx`, `Nivel.jsx`, `Conquistas.jsx` e `Professor.jsx`: apresentação mais preenchida, orientações e ilustrações nos estados vazios, preservando as ações existentes. O início também oferece acesso direto ao resumo de progresso.
- `src/pages/Avatar.jsx`: prévia do personagem, contagem de itens, grupos de opções, cadeados com requisitos, indicação do item equipado e mensagens acessíveis. O sorteio usa somente itens liberados.
- `src/data/tutoriais.js`: explicação das novas regras de personalização.

## Regras de desbloqueio

As regras abaixo são novas para os cosméticos. A pontuação do jogo, a avaliação das fases e os critérios das conquistas existentes permanecem iguais. Não há criação de XP, compras ou consumo de estrelas.

| Condição | Itens disponíveis |
| --- | --- |
| Desde o início | Orbe, bloco, amarelo (Sol), azul, rosto feliz, curioso e sem enfeite |
| 1 fase concluída | Gota, rosa, piscando e antena |
| 2 fases concluídas | Verde, animado e folhas |
| 3 fases concluídas | Estrela, laranja e laço |
| 4 fases concluídas | Nuvem, lilás e tranquilo |
| 5 fases concluídas | Menta e chifres |
| 6 fases concluídas | Surpreso |
| 9 estrelas acumuladas | Raio |
| Toda a trilha concluída | Diamante, céu e halo |
| 3 estrelas em todas as fases | Coroa |

São 28 itens ao todo, incluindo as opções iniciais. As fases precisam ser distintas: repetir a mesma fase mantém o melhor resultado, sem somar novamente as estrelas. Os totais de trilha e de pontuação máxima acompanham o catálogo de fases.

`src/data/personalizacao.json` é a fonte das regras; `personalizacao.js` calcula disponibilidade e normaliza o avatar. `App.jsx` usa o progresso do perfil ativo e impede equipar opções bloqueadas em qualquer tela que use o contexto do avatar. A demonstração continua separada dos alunos; liberar fases para experimentar não concede recompensas.

`Dockerfile` incorpora o catálogo gerado no estágio do frontend à aplicação Java. `scripts/export-catalog.mjs` copia o catálogo para `backend/src/main/resources/personalizacao.json` no prebuild. `GameRules.java` e `NexusService.java` aplicam as mesmas regras com o progresso validado pelo servidor, antes de persistir o avatar. Não foi criada tabela nem alterada a autenticação.

### Compatibilidade com avatares antigos

Uma opção escolhida antes desta atualização pode passar a exigir progresso. Se ainda estiver bloqueada, a interface exibe a opção inicial dessa categoria; o progresso não é apagado. Apenas visualizar não sobrescreve a preferência local antiga. Uma nova escolha grava a combinação disponível.

Eventos antigos na fila de sincronização podem conter cosméticos que antes eram livres. O backend substitui somente as opções conhecidas ainda bloqueadas pelas opções iniciais, evitando travar a fila. Valores inexistentes ou avatares incompletos continuam sendo recusados. As recompensas não são concedidas novamente ao abrir telas: a disponibilidade é derivada do progresso salvo.

## Verificações realizadas

| Comando ou procedimento | Resultado |
| --- | --- |
| `npm test` | 58 testes passaram, incluindo regras, seleção bloqueada, sorteio, perfil, reabertura e repetição de fase |
| `npm run build` | Build de produção aprovado; catálogo do backend exportado |
| `docker build` com CA e proxy do ambiente | Imagem de produção gerada, incluindo o catálogo de personalização |
| `mvn -f backend/pom.xml package`, Java 21, PostgreSQL descartável `nexus_test` | 20 testes passaram, incluindo 14 de integração; JAR gerado |
| Chromium: 360, 390, 768, 1024 e 1366 px | 161 verificações automáticas aprovadas; login, tutorial, início, progresso, personalização, conquistas, trilha, aula, oficina, missão e resultado |
| Fluxo autenticado com API Spring Boot e PostgreSQL locais | Professor criou turma e dois alunos. Aluno completou fase, equipou gota/antena e recuperou os dados em outro contexto de navegador. Segundo aluno continuou bloqueado |
| Arrastar no desktop e toque no celular | Montagem e execução do circuito funcionaram |
| Inspeção visual das capturas | Login, início, personalização e professor conferidos; fundo, arte, textos e controles preservados |
| `git diff --check` | Sem erros de whitespace |

As verificações utilizaram Java 21 e Maven, com banco de testes em um contêiner separado do banco de uso.

## Como conferir localmente

1. Use uma versão de Node compatível com `package.json`; execute `npm ci` se necessário.
2. Execute `npm run dev` e abra o endereço informado pelo Vite. Se o backend estiver desligado, o login pode mostrar indisponibilidade; a demonstração permite avaliar o visual sem autenticação.
3. Entre em **Explorar demonstração** e abra **Meu Nexus**. Verifique os 7 itens iniciais e os requisitos nos cadeados.
4. Complete a primeira fase com três peças de andar. Volte a **Meu Nexus**: gota, rosa, piscando e antena ficam disponíveis, totalizando 11 itens.
5. Equipe uma recompensa, recarregue a página e entre novamente na demonstração. Confira a persistência.
6. Para testar os alunos autenticados, siga `docs/BACKEND.md` com banco local. Nunca use o Neon publicado para executar a suíte de integração, que apaga as tabelas de seu banco descartável.
7. Execute `npm test` e `npm run build`. Para testes Java, use Java 21, Maven e `TEST_DATABASE_URL`/`TEST_DATABASE_PASSWORD` apontando para `nexus_test`, conforme a documentação do backend.

## Limites e publicação

Verificações de navegador feitas em Chromium, com tamanhos de viewport e toque emulado; não houve teste em aparelhos físicos, Safari ou Firefox. A arte é uma única expressão do novo Nexi; os textos e gestos do tutorial comunicam os diferentes estados.

As capturas usam demonstração ou registros fictícios locais. Nenhum dado de turma do ambiente publicado foi acessado ou alterado. A publicação deve ser acionada manualmente no Render após o envio da revisão ao GitHub, conforme `docs/DEPLOY.md`. Confirme o commit selecionado e o resultado do deploy no painel.
