# Compatibilidade das regras do jogo

O backend aceita duas versões de mapas, estruturas e critérios de estrelas:

- **v1:** catálogo anterior às aulas visuais, preservado em `fases-v1.json`. Tentativas sem `estado.versaoRegras` continuam usando esse catálogo, inclusive a fase 6 antiga e a estrela por tempo.
- **v2:** catálogo das aulas visuais, preservado em `fases-v2.json`. Novas tentativas e rascunhos usam `versaoRegras: 2` dentro do estado; a terceira estrela considera peças de ação escritas.

O catálogo atual `fases.json` continua sendo gerado pelo frontend. Os catálogos numerados são históricos: não os sobrescreva para alterar regras. Uma futura alteração incompatível deve introduzir uma nova versão.

A API escolhe o catálogo pela versão do estado **antes** de validar e simular o circuito. Versão desconhecida, nula, fracionária ou de tipo incorreto é rejeitada. A sessão continua definindo o dono dos dados e as fases continuam respeitando o progresso anterior.

A fila existente não é reescrita. IDs e conteúdo de eventos antigos são mantidos, inclusive quando a confirmação de um envio anterior se perdeu. O servidor conserva a deduplicação e nunca reduz o melhor resultado já registrado.

A compatibilidade foi separada da atualização visual para permitir reverter a interface mantendo o recebimento de tentativas v1 e v2. Nenhuma migração do banco é necessária. Após uma reversão visual, estruturas que só existem na interface nova podem não ser representadas no editor antigo; o progresso já confirmado permanece e a API ainda aceita eventos v2 pendentes. Não limpe o armazenamento do navegador antes da sincronização.

A versão é metadado de compatibilidade informado pelo cliente, não prova de qual interface estava aberta. Clientes antigos continuam aceitos; não se trata de um mecanismo antitrapaça.
