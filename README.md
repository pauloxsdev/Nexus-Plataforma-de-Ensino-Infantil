# Nexus 2.0 – React + Spring Boot + PostgreSQL

Aplicação Nexus com frontend React e backend Spring Boot. Visual "Amarelinha" (papel quadriculado, contornos grossos, cores chapadas).

## Site publicado

https://nexus-app-9kau.onrender.com/

Frontend e API são publicados juntos no Render; os dados ficam no PostgreSQL do
Neon. O deploy é manual. O responsável confirmou em 09/11/2026 o acesso de
professor/aluno e o fluxo de progresso em produção; veja [o registro](docs/DEPLOY.md#estado-da-publicacao--09112026).

## Backend e acesso real

Consulte [o guia do backend](docs/BACKEND.md) para iniciar PostgreSQL e Spring Boot,
provisionar o primeiro professor e usar turmas, códigos de aluno e sincronização.
O modo de demonstração continua disponível, separado dos dados autenticados.

## Como rodar o frontend
Recomendado: Node.js 24 LTS. As ferramentas exigem Node.js 22.12+ na linha 22,
24.x ou 26+. Node.js 18 e 20 não são suportados pela versão atual do Vitest.

```bash
npm ci          # instala as versões registradas no package-lock.json
npm test        # executa os testes automatizados
npm run dev      # abre em http://localhost:5173
npm run build    # gera dist/, incluída no JAR pelo build Docker
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
O modo de demonstração permanece separado do acesso autenticado.

## Estrutura
```
src/
  theme/tokens.js            cores (espelham as variáveis do Figma)
  index.css                  Tailwind + estilos globais (botão 3D, cartão, animações)
  components/                Btn, Seg (barra), Modal, Icon, Nexi, NexusAvatar (avatar), Tutorial
  context/AvatarContext.jsx  estado e personalização do avatar
  data/tutoriais.js          textos dos tutoriais de cada tela
  hooks/                     useConexao (online/offline), useSom (mudo)
  services/                  som.js (sons e vibração), certificado.js (jsPDF), sincronizacao.js (fila IndexedDB + API)
  game/                      motor do jogo e peças (sem React), com testes
  data/                      fases, tutoriais
  pages/                     Login, Base, Avatar, Trilha, Oficina (blocos), Nivel, Conquistas, Aula, Professor
  App.jsx                    sessão, permissões, demonstração e montagem das telas
```

## Recursos

| Parte | Estado |
|---|---|
| Aulas, oficina e tutoriais | 8 fases, catálogo único em `src/data/fases.js` |
| Login | Professor com usuário/senha; aluno com código individual; sessão no servidor |
| Professor | Turmas próprias, gestão de alunos/códigos e progresso individual real |
| Progresso | Motor validado no servidor, melhor pontuação por fase, eventos idempotentes |
| Dados do aluno | Avatar, circuitos, atividade e conquistas persistidos no PostgreSQL |
| Offline | Fila local de alterações da sessão aberta; login e recarga autenticada exigem rede |
| Certificado | Gerador PDF isolado no navegador; emissão ainda não integrada às telas |
| XP/nível e PWA | Não implementados; dependem de regras de produto e trabalho específico |

## Regras do projeto (LGPD)
- Minimização: o aluno entra só com o código. O professor guarda o nome fora do sistema. Códigos e progresso são dados pseudonimizados e ainda exigem proteção.
- O nome no certificado fica só na memória do navegador (`services/certificado.js`).
- Sem ranking (Leaderboard descartado) e sem telas punitivas.

## Armazenamento por perfil

Avatar e progresso usam `nexus:v2:<tipo>:<id codificado>:avatar` e
`nexus:v2:<tipo>:<id codificado>:progresso`. A demonstração usa exclusivamente
`tipo=demo`, `id=local`; seus dados não pertencem a um aluno.
As chaves antigas `nexus:avatar` e `nexus:progresso` ficam preservadas, sem leitura
ou migração automática, pois não identificam o dono. Uma migração futura exige
atribuição explícita ao perfil correto.

No acesso autenticado, o perfil vem da sessão validada pelo servidor e remonta
`AppPerfil` ao trocar de identidade. A API verifica o dono de cada recurso.
Namespaces locais não são controle de acesso. Eventos antigos sem dono ou de
demonstração nunca são enviados como dados de um aluno real.

A Oficina persiste peças e contagens de repetição em
`nexus:v2:<tipo>:<id codificado>:circuito:<projeto codificado>:fase:<id>`.
A trilha atual usa o projeto `trilha-principal`; cada fase mantém seu rascunho.
Sair da tela ou recarregar restaura o circuito, e **Limpar** salva o estado inicial
somente desse perfil/projeto/fase. Ao restaurar, peças e espaços incompatíveis
com a fase são descartados e as repetições respeitam seus limites atuais.
Na demonstração, a persistência é local. Para alunos autenticados, alterações são enfileiradas e só aparecem como enviadas após confirmação da API.

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
- **Professor:** consulta os registros de cada aluno de suas próprias turmas. Turmas sem alunos mostram estado vazio.

Atividade usa `nexus:v2:<tipo>:<id>:atividade`; conquistas usam o mesmo namespace
com o sufixo `conquistas`. As chaves globais legadas não são importadas. Progresso
anterior por perfil é preservado: sem metadados antigos não é possível distinguir
uma conclusão jogada de uma antiga liberação de demonstração, nem inferir sua data.
Na demonstração, relógio e armazenamento são locais. No acesso autenticado, veja as regras de datas, validação de soluções e limites do relógio offline em `docs/BACKEND.md`.

## Publicação na nuvem

Para publicar a interface e a API juntas no Render, com PostgreSQL no Neon, siga
[docs/DEPLOY.md](docs/DEPLOY.md). O roteiro inclui variáveis, criação do professor
no banco da nuvem, validação e atualização manual.

## GitHub e manutenção

Veja [o fluxo de Git e publicação](docs/GITHUB.md) para clonar o repositório,
preservar a pasta ZIP anterior, revisar diferenças, fazer commit/push e publicar
manualmente. O `.env` e suas cópias não devem ser versionados.

A [revisão de coerência documental](docs/COERENCIA-DOCUMENTO-PROJETO.md) registra
as diferenças entre o documento acadêmico e o escopo implementado.
