document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoGrafico();
});

// Variável para guardar o gráfico e podermos atualizá-lo depois se precisarmos
let meuGrafico;

async function carregarDadosDoGrafico() {
    try {
        // 1. Busca a lista de participantes no Java
        const respostaParticipantes = await fetch('http://localhost:8081/participantes');
        const participantes = await respostaParticipantes.json();

        const nomes = [];
        const quantidadeVotos = [];

        // 2. Para cada participante, vamos buscar a quantidade de votos
        for (const participante of participantes) {
            nomes.push(participante.nome);

            // Chama a rota de contagem que você já tem no seu VotoController!
            const respostaVotos = await fetch(`http://localhost:8081/votos/contagem/${participante.id}`);
            const totalVotos = await respostaVotos.json();
            
            quantidadeVotos.push(totalVotos);
        }

        // 3. Monta o Gráfico na tela!
        desenharGrafico(nomes, quantidadeVotos);

    } catch (erro) {
        console.error("Erro ao carregar dados do painel admin:", erro);
        alert("Erro ao carregar os resultados do servidor.");
    }
}

function desenharGrafico(labelsNomes, dadosVotos) {
    const ctx = document.getElementById('graficoVotos').getContext('2d');

    // Se já existir um gráfico na tela, a gente apaga para desenhar o novo atualizado
    if (meuGrafico) {
        meuGrafico.destroy();
    }

    meuGrafico = new Chart(ctx, {
        type: 'pie', // 'pie' para gráfico de pizza. Você pode trocar para 'bar' (barras) ou 'doughnut' (rosca)
        data: {
            labels: labelsNomes, // Array com os nomes ex: ['Participante 1', 'Participante 2']
            datasets: [{
                label: 'Total de Votos',
                data: dadosVotos, // Array com os votos ex: [150, 50, 20]
                backgroundColor: [
                    '#e74c3c', // Vermelho
                    '#3498db', // Azul
                    '#f1c40f', // Amarelo
                    '#2ecc71', // Verde (caso tenha mais participantes)
                    '#9b59b6'  // Roxo
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Votos',
                    font: { size: 18 }
                }
            }
        }
    });
}