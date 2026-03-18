document.addEventListener('DOMContentLoaded', () => {
    // Registra o plugin de texto/porcentagem no Chart.js para o gráfico de pizza
    Chart.register(ChartDataLabels);
    
    // Chama as funções para desenhar os dois gráficos assim que a página carrega
    carregarDadosDoGrafico();     // Gráfico de Pizza (Total de votos)
    carregarGraficoFrequencia();  // Gráfico de Linhas (Horários)

    // Funcionalidade do botão Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear(); // Limpa o "cofre" do navegador
        window.location.href = 'login.html'; // Manda de volta pro login
    });
});

// Variáveis globais para guardar os gráficos e podermos atualizá-los
let meuGrafico;
let graficoLinha;

// ==========================================================
// GRÁFICO 1: PIZZA (DISTRIBUIÇÃO DE VOTOS E PORCENTAGEM)
// ==========================================================
async function carregarDadosDoGrafico() {
    try {
        const respostaParticipantes = await fetch('http://localhost:8081/participantes');
        const participantes = await respostaParticipantes.json();

        const nomes = [];
        const quantidadeVotos = [];

        // Para cada participante, busca a quantidade de votos
        for (const participante of participantes) {
            nomes.push(participante.nome);

            const respostaVotos = await fetch(`http://localhost:8081/votos/contagem/${participante.id}`);
            const totalVotos = await respostaVotos.json();
            
            quantidadeVotos.push(totalVotos);
        }

        desenharGrafico(nomes, quantidadeVotos);

    } catch (erro) {
        console.error("Erro ao carregar dados do painel admin:", erro);
        alert("Erro ao carregar os resultados do servidor.");
    }
}

function desenharGrafico(labelsNomes, dadosVotos) {
    const ctx = document.getElementById('graficoVotos').getContext('2d');

    if (meuGrafico) {
        meuGrafico.destroy(); // Apaga o antigo antes de desenhar o novo
    }

    // Calcula o total geral de votos somando tudo no array
    const totalGeralDeVotos = dadosVotos.reduce((a, b) => a + b, 0);

    meuGrafico = new Chart(ctx, {
        type: 'pie', // Gráfico de Pizza
        data: {
            labels: labelsNomes,
            datasets: [{
                label: 'Votos',
                data: dadosVotos,
                backgroundColor: [
                    '#e74c3c', // Vermelho
                    '#3498db', // Azul
                    '#f1c40f', // Amarelo
                    '#2ecc71', // Verde
                    '#9b59b6'  // Roxo
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que o gráfico cresça no espaço que demos
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 16 },
                        padding: 20
                    }
                },
                // Configuração do Plugin de Porcentagem
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14 // Tamanho do texto dentro da fatia
                    },
                    formatter: (value, context) => {
                        if (totalGeralDeVotos === 0) return '0%';
                        let porcentagem = ((value / totalGeralDeVotos) * 100).toFixed(1);
                        return `${value} votos\n(${porcentagem}%)`;
                    },
                    textShadowBlur: 4,
                    textShadowColor: 'rgba(0,0,0,0.5)',
                    textAlign: 'center'
                }
            }
        }
    });
}

// ==========================================================
// GRÁFICO 2: LINHAS (FREQUÊNCIA DE VOTOS POR HORÁRIO)
// ==========================================================
async function carregarGraficoFrequencia() {
    let labelsHorarios = [];
    let dadosVotos = [];

    try {
        // Tenta buscar o histórico real no seu Java
        const resposta = await fetch('http://localhost:8081/votos/historico');

        if (resposta.ok) {
            // O Java deve devolver algo como: {"08:00": 10, "09:00": 45, "10:00": 30}
            const historico = await resposta.json();
            labelsHorarios = Object.keys(historico);
            dadosVotos = Object.values(historico);
        } else {
            throw new Error("Rota não encontrada no Java ainda.");
        }
    } catch (erro) {
        // MODO DE SEGURANÇA: Dados de teste enquanto a rota do Java não fica pronta
        console.warn("Rota /historico não encontrada. Usando dados de teste para exibir o gráfico.");
        labelsHorarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
        dadosVotos = [12, 45, 30, 89, 65, 110, 95, 140];
    }

    desenharGraficoLinha(labelsHorarios, dadosVotos);
}

function desenharGraficoLinha(horarios, votos) {
    const ctx = document.getElementById('graficoFrequencia').getContext('2d');

    if (graficoLinha) {
        graficoLinha.destroy();
    }

    graficoLinha = new Chart(ctx, {
        type: 'line', // Gráfico de linha
        data: {
            labels: horarios,
            datasets: [{
                label: 'Votos Registrados',
                data: votos,
                borderColor: '#3498db', // Cor da linha (Azul)
                backgroundColor: 'rgba(52, 152, 219, 0.2)', // Preenchimento suave abaixo da linha
                borderWidth: 3,
                tension: 0.4, // Curva suave
                fill: true,
                pointBackgroundColor: '#e74c3c', // Bolinhas vermelhas
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                // Desligamos as porcentagens gigantes neste gráfico para não virar bagunça
                datalabels: { display: false } 
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#ecf0f1' } // Linhas de fundo mais suaves
                },
                x: {
                    grid: { display: false } // Tira as linhas verticais do fundo
                }
            }
        }
    });
}