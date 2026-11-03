# Nexus 2.0 – Front-end (React + Vite)

Protótipo navegável do front-end do Nexus, já separado em arquivos. Visual "Amarelinha" (papel quadriculado, contornos grossos, cores chapadas).

## Como rodar
Recomendado: Node.js 24 LTS. As ferramentas exigem Node.js 22.12+ na linha 22,
24.x ou 26+. Node.js 18 e 20 não são suportados pela versão atual do Vitest.

```bash
npm ci          # instala as versões registradas no package-lock.json
npm test        # executa os testes automatizados
npm run dev      # abre em http://localhost:5173
npm run build    # gera a pasta dist/ (publicável na Vercel)
```

Execute os comandos na pasta que contém `package.json` e `package-lock.json`.
Use `npm audit` para consultar os avisos de segurança atuais. Atualizações de
dependências devem ser verificadas com testes e build; evite aplicar
`npm audit fix --force` automaticamente, pois pode alterar versões principais.

## Telas e dispositivos

O layout se adapta a celular, tablet e desktop. No celular, abra a navegação em
**Abrir menu**. Na Oficina, paleta, mapa e circuito se reorganizam; ramos largos
podem ser rolados apenas dentro da região do circuito. Arrastar e soltar,
selecionar por toque/clique e os atalhos de teclado continuam disponíveis.
A adaptação não altera o modo de demonstração nem fornece autenticação ou backend.

## Estrutura
```
src/
  theme/tokens.js            cores (espelham as variáveis do Figma)
  index.css                  Tailwind + estilos globais (botão 3D, cartão, animações)
  components/                Btn, Seg (barra), Modal, Icon, Nexi (5 expressões), Astro (avatar), Tutorial
  context/AvatarContext.jsx  astronauta escolhido (cor + acessório)
  data/tutoriais.js          textos dos tutoriais de cada tela
  hooks/                     useConexao (online/offline), useSom (mudo)
  services/                  som.js (sons e vibração), certificado.js (jsPDF), sincronizacao.js (IndexedDB, esqueleto)
  game/                      motor do jogo e peças (sem React), com testes
  data/                      fases, tutoriais
  pages/                     Login, Base, Avatar, Trilha, Oficina (blocos), Nivel, Album, Professor
  App.jsx                    abas de DEMONSTRAÇÃO + montagem das telas
```

## O que é de verdade e o que é simulado
| Parte | Estado |
|---|---|
| Telas, tutoriais, avatar, nível, sons | funcionam |
| Oficina de circuito | 8 fases de lógica (sequência, repetição, SE/SENÃO), com motor próprio em `game/motor.js` |
| Certificado | gera PDF com jsPDF no navegador; o nome nunca sai do aparelho |
| Conexão / sincronização | rede observada pelo navegador; conclusões persistidas em fila IndexedDB. Envio ao servidor indisponível até integração com API |
| Acesso | demonstração sem login; não cria identidades. Área do professor e geração de códigos indisponíveis |
| Dados | progresso local da demonstração; não isolado por aluno. Sem turma real |
| Backend (Spring Boot + PostgreSQL), PWA (Workbox) | **ainda não ligados** |

## Próximos passos (onde plugar cada coisa)
1. **Mais fases**: veja `docs/GUIA-DO-CODIGO.md` (como criar uma fase em `src/data/fases.js`).
2. **Sincronização com servidor**: integrar um transporte real a `services/sincronizacao.js`. O transporte só pode retornar `{ confirmado: true, id }` após confirmação da API; a API deve ignorar eventos repetidos pelo ID. A fila IndexedDB já recebe conclusões de fase. Reconectar não comprova envio e não remove pendências. `navigator.onLine` não garante acesso ao servidor.
3. **PWA / Workbox**: adicionar `vite-plugin-pwa` e um `manifest` com os ícones do Nexi.
4. **Identidades e permissões (pendente de backend)**: autenticar alunos e professores, validar sessões e permissões no servidor, restringir códigos à turma do professor e isolar progresso/fila por identidade. O acesso atual é apenas uma demonstração; não restaurar a área do professor com base em flags no navegador.
5. **Rotas**: trocar as abas do topo por `react-router` (cada arquivo de `pages/` vira uma rota).
6. **Qualidade**: ESLint, testes (Vitest + Testing Library), acessibilidade (leitor de tela e teclado).

## Regras do projeto (LGPD)
- Nenhum dado pessoal: o aluno entra só com o código. O professor guarda o nome fora do sistema.
- O nome no certificado fica só na memória do navegador (`services/certificado.js`).
- Sem ranking (Leaderboard descartado) e sem telas punitivas.

## Armazenamento por perfil

Avatar e progresso usam `nexus:v2:<tipo>:<id codificado>:avatar` e
`nexus:v2:<tipo>:<id codificado>:progresso`. A demonstração usa exclusivamente
`tipo=demo`, `id=local`; seus dados não pertencem a um aluno.
As chaves antigas `nexus:avatar` e `nexus:progresso` ficam preservadas, sem leitura
ou migração automática, pois não identificam o dono. Uma migração futura exige
atribuição explícita ao perfil correto.

Ao integrar o backend, o perfil deve vir da sessão autenticada, com ID estável
que inclua o escopo da escola quando necessário. Remonte `AppPerfil` com uma
`key` derivada desse perfil para reiniciar também os estados das telas.
Namespaces locais não são controle de acesso. Múltiplos alunos continuam
indisponíveis até autenticação e autorização no servidor. As novas conclusões
incluem o perfil no evento da fila; eventos legados sem dono e eventos de demo
não devem ser enviados como progresso de um aluno. A seleção e autorização da
fila por identidade devem ser implementadas na integração com a API.

A Oficina persiste peças e contagens de repetição em
`nexus:v2:<tipo>:<id codificado>:circuito:<projeto codificado>:fase:<id>`.
A trilha atual usa o projeto `trilha-principal`; cada fase mantém seu rascunho.
Sair da tela ou recarregar restaura o circuito, e **Limpar** salva o estado inicial
somente desse perfil/projeto/fase. Ao restaurar, peças e espaços incompatíveis
com a fase são descartados e as repetições respeitam seus limites atuais.
Essa persistência é local ao navegador; não representa envio ao servidor.

## Indicadores locais

- **Atividade:** uma tentativa de execução com pelo menos uma peça/ação no circuito,
  bem-sucedida ou não. Abrir a aplicação, editar o avatar ou executar um circuito
  vazio não registra atividade. Datas são dias civis locais (`YYYY-MM-DD`), sem
  converter por UTC. Cada dia é registrado uma só vez por perfil.
- **Dias acumulados:** quantidade de datas registradas até hoje. **Sequência atual:**
  dias consecutivos terminando hoje ou ontem; um dia inteiro sem atividade a
  interrompe. A tela reavalia a data ao recuperar foco e a cada 30 segundos.
  Não reconstruímos atividades anteriores a esta atualização.
- **Fases e estrelas:** o catálogo `FASES` define o total. Só IDs existentes com
  resultados de 1 a 3 estrelas entram no resumo. Repetir mantém o melhor resultado,
  sem somar a recompensa de novo. A liberação para experimentar apenas abre as
  fases na sessão de demonstração, sem gravar conclusões ou atividade.
- **Conquistas:** reutilizam as regras de `data/conquistas.js`; metade e total da
  trilha acompanham o catálogo. Desbloqueios e visualizações são registrados por
  perfil. Uma conquista ganha permanece registrada após interromper a sequência
  ou zerar as fases; esses eventos não tornam a conquista nova novamente.
- **Nível e XP:** não havia regra implementada. Os números e recompensas fictícios
  foram removidos; a antiga tela de nível apresenta somente o resumo registrado.
  Definir uma política de XP/nível é uma decisão futura, não uma dependência técnica
  que possa ser resolvida inventando números.
- **Professor:** continua indisponível; não há dados reais da turma nem agregação
  do aluno atual para representar outros alunos.

Atividade usa `nexus:v2:<tipo>:<id>:atividade`; conquistas usam o mesmo namespace
com o sufixo `conquistas`. As chaves globais legadas não são importadas. Progresso
anterior por perfil é preservado: sem metadados antigos não é possível distinguir
uma conclusão jogada de uma antiga liberação de demonstração, nem inferir sua data.
O relógio e o armazenamento são do dispositivo, sem validação pelo servidor.
