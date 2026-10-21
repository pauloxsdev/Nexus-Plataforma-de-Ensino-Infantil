# Guia do código: onde mexer em cada coisa

## Quero mudar...
| Quero mudar | Arquivo |
|---|---|
| Uma cor do app (todas as telas) | `src/theme/tokens.js` |
| Estilo global (botão 3D, cartão, fundo quadriculado, animações) | `src/index.css` |
| Texto ou tela de uma página (Login, Base, Trilha, Álbum...) | `src/pages/NomeDaTela.jsx` |
| Texto dos tutoriais (balão do Nexi) | `src/data/tutoriais.js` |
| Rosto/expressões do Nexi | `src/components/Nexi.jsx` |
| Astronauta e acessórios | `src/components/Astro.jsx` (cores do traje em `tokens.js`) |
| Botão, barra de nível, janela (modal) | `src/components/Btn.jsx`, `Seg.jsx`, `Modal.jsx` |
| Ícones | `src/components/Icon.jsx` |
| Sons e vibração | `src/services/som.js` |
| Aparência dos blocos (cores, fonte, fundo) | `src/blockly/tema.js` |
| Criar/alterar um bloco | `src/blockly/blocos.js` (+ `programa.js` e `game/fase5.js`) |
| Regras da fase 5 (lava, estrelas, vitória) | `src/game/fase5.js` |
| Desenho do palco (grade, robô, estrelas) | `src/pages/Oficina.jsx` |
| Certificado em PDF | `src/services/certificado.js` |
| Salvar progresso offline / enviar à API | `src/services/sincronizacao.js` e `src/hooks/useConexao.js` |
| Abas de demonstração e ordem das telas | `src/App.jsx` |

## Como funciona a tela de blocos (a mais importante)
```
Aluno arrasta blocos
   -> Blockly (src/blockly/AreaBlockly.jsx) mantém os blocos na tela
   -> ao clicar em Executar: programa.js converte os blocos em uma lista simples
   -> fase5.js simula o robô e devolve os passos e o resultado
   -> Oficina.jsx anima o robô no palco e mostra a mensagem
```
- O código **não usa eval**: os blocos viram uma lista e uma função própria a executa.
- Os blocos do aluno ficam salvos no aparelho (`localStorage`, chave `nexus:fase5`) e voltam quando ele reabre.

## Como criar a fase 6 (exemplo de caminho)
1. Copie `game/fase5.js` para `fase6.js` e mude lava/estrelas.
2. Se precisar de bloco novo, siga os 3 passos de `blocos.js`.
3. Crie uma página nova a partir de `Oficina.jsx` com o desenho do palco da fase 6.
4. Escreva os testes em `fase6.test.js` (copie o de `fase5.test.js`).

## Dicas para não quebrar
- Rode `npm run dev` e deixe aberto: a página atualiza ao salvar.
- Rode `npm test` antes de enviar ao GitHub (testa as regras do jogo).
- Mexeu em uma cor? Troque em `tokens.js` (não escreva `#2B4DFF` direto nas telas).
- Faça commits pequenos e use uma branch por tarefa.
