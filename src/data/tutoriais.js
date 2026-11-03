// Textos dos tutoriais (o balão do Nexi). sel = o que fica destacado (data-t="..." nas telas).
// Sem "sel", o balão aparece no centro com o Nexi acenando.
export const TOUR = {
  login: [
    { t: 'Oi! Eu sou o Nexi!', d: 'Eu sou o seu guia. Vou mostrar, passo a passo, como entrar e jogar. Vamos nessa?' },
    { t: 'Modo de demonstração', d: 'Aqui você pode explorar as atividades sem fazer login. O progresso fica neste navegador.' },
    { sel: '[data-t=enter]', t: 'Hora de decolar!', d: 'Clique em Explorar demonstração. Você não precisa de nome, e-mail ou código.' },
  ],
  dash: [
    { t: 'Bem-vindo à sua base!', d: 'Aqui você vê as fases concluídas, suas estrelas e os dias em que jogou.' },
    { sel: '[data-t=menu]', t: 'O seu menu', d: 'Use esta barra para ir às Trilhas, à fase atual, ao Meu Nexus e às Conquistas. A setinha recolhe o menu.' },
    { sel: '[data-t=avatar]', t: 'Este é o seu Nexus!', d: 'Clique nele para mudar a forma, a cor, o rosto e o enfeite.' },
    { sel: '[data-t=xp]', t: 'Progresso da trilha', d: 'Veja quantas fases você concluiu e quantas ainda faltam.' },
    { sel: '[data-t=streak]', t: 'Dias seguidos', d: 'Execute um circuito com peças para registrar atividade. Tentativas no mesmo dia contam uma vez só.' },
    { sel: '[data-t=go]', t: 'Continue de onde parou', d: 'Este botão leva direto para a sua fase.' },
  ],
  avatar: [
    { t: 'Monte o seu Nexus', d: 'O Nexus é o seu personagem no jogo. Não existe Nexus certo ou errado: misture do seu jeito!' },
    { sel: '[data-t=av-forma]', t: 'Escolha uma forma', d: 'Bolinha, gota, estrela... clique numa para ver o seu Nexus mudar.' },
    { sel: '[data-t=av-cor]', t: 'Pinte o seu Nexus', d: 'Escolha a sua cor favorita.' },
    { sel: '[data-t=av-enfeite]', t: 'Um toque especial', d: 'Coroa, antena, halo... escolha um enfeite (ou nenhum!).' },
    { sel: '[data-t=av-sortear]', t: 'Sem ideias? Sorteie!', d: 'O botão Sortear monta um Nexus surpresa para você.' },
  ],
  courses: [
    { t: 'A sua trilha', d: 'Aqui ficam o mapa com as fases e as aulas. Aprenda nas aulas e pratique no mapa!' },
    { sel: '[data-t=abas]', t: 'Mapa ou Aulas?', d: 'Troque entre o Mapa da trilha e a lista de Aulas.' },
    { sel: '[data-t=now]', t: 'Você está aqui', d: 'O quadrado amarelo é a sua fase, com o seu Nexus em cima. Clique nele para ver a aula ou jogar.' },
    { sel: '[data-t=lock]', t: 'Quadrado trancado', d: 'Ele abre quando você completa a fase de antes.' },
  ],
  aula: [
    { t: 'Bem-vindo à aula!', d: 'Aqui você descobre a ideia da fase antes de jogar. Sem pressa e sem resposta pronta.' },
    { sel: '[data-t=aula-resumo]', t: 'A ideia em poucas palavras', d: 'Leia o resumo, olhe o desenho e anote a palavra nova.' },
    { sel: '[data-t=aula-tutorial]', t: 'Descubra sozinho', d: 'Teste cada ideia no jogo e marque quando fizer. Errar também ensina!' },
    { sel: '[data-t=aula-pista]', t: 'Travou? Peça uma pista', d: 'As pistas começam leves e vão ficando mais fortes. Tente sozinho primeiro!' },
    { sel: '[data-t=aula-ir]', t: 'Hora de jogar', d: 'Quando estiver pronto, vá para a fase e coloque a ideia em prática.' },
  ],
  work: [
    { t: 'Monte o circuito do seu Nexus', d: 'O Nexus só faz o que o circuito mandar. Você escolhe as peças dos espaços vazios.' },
    { sel: '[data-t=paleta]', t: '1. Pegue uma peça', d: 'Segure uma peça da lista e puxe com o mouse.' },
    { sel: '[data-t=circuito]', t: '2. Solte no circuito', d: 'Arraste até um espaço e solte. Ele acende em verde quando a peça está em cima. Para tirar, arraste para fora ou clique no ×.' },
    { sel: '[data-t=run]', t: '3. Executar', d: 'Clique em Executar (ou aperte Enter) para o Nexus seguir o circuito.' },
    { sel: '[data-t=palco]', t: 'O mapa da fase', d: 'Veja onde estão as estrelas, a lava e as pedras. Quanto menos passos e mais rápido, mais estrelas você ganha!' },
  ],
  ach: [
    { t: 'Suas conquistas', d: 'Cada conquista é um prêmio por algo que você aprendeu ou fez.' },
    { sel: '[data-t=conquistas-grid]', t: 'Coloridas e cinzas', d: 'As coloridas já são suas. As cinzas mostram quanto falta. Clique numa para ver como ganhar!' },
  ],
  teacher: [
    { t: 'Painel do professor', d: 'Aqui você acompanha a turma sem guardar nenhum nome no sistema.' },
    { sel: '[data-t=newcode]', t: 'Crie códigos', d: 'Gere um código para cada aluno e anote o nome dele no seu caderno.' },
    { sel: '[data-t=cert]', t: 'Certificado', d: 'Libera quando o aluno completa as 8 fases. O nome é digitado na hora e não vai para o servidor.' },
  ],
  nivel: [{ t: 'Seu progresso', d: 'Aqui estão suas fases concluídas e estrelas registradas. Veja também suas conquistas.' }],
};
