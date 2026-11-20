# Dados, progresso e sincronização

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
Sair da tela ou recarregar restaura o circuito. **Limpar** remove as peças e
restaura as repetições iniciais da estratégia selecionada, mantendo essa estratégia
somente nesse perfil/projeto/fase. O estado inclui `estrutura` quando aplicável e
`versaoRegras`; eventos antigos já enfileirados não são reescritos. Ao restaurar, peças e espaços incompatíveis
com a fase são descartados e as repetições respeitam seus limites atuais.
Na demonstração, a persistência é local. Para alunos autenticados, alterações são enfileiradas e só aparecem como enviadas após confirmação da API.

## Indicadores locais

- **Atividade:** uma tentativa de execução com pelo menos uma peça/ação no circuito,
  bem-sucedida ou não. Abrir a aplicação, editar o avatar ou executar um circuito
  vazio não registra atividade. Datas são dias civis (`YYYY-MM-DD`) no fuso da
  turma para alunos autenticados e no fuso do navegador na demonstração; não se
  extrai o dia por conversão direta para UTC. Cada dia é registrado uma só vez por perfil.
- **Dias acumulados:** quantidade de datas registradas até hoje. **Sequência atual:**
  dias consecutivos terminando hoje ou ontem; um dia inteiro sem atividade a
  interrompe. A tela reavalia a data ao recuperar foco e a cada 30 segundos.
  Não se reconstrói histórico anterior ao início dos registros.
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
Na demonstração, relógio e armazenamento são locais. No acesso autenticado, veja
as regras de datas, validação de soluções e limites do relógio offline no
[guia do backend](BACKEND.md).
