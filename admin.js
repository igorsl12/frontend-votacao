document.addEventListener('DOMContentLoaded', async () => {
    // Registra o plugin de texto/porcentagem no Chart.js
    Chart.register(ChartDataLabels);
    
    // =========================================================
    // 1. IDENTIFICAÇÃO E FOTO DO ADMIN
    // =========================================================
    const usuarioLogadoId = localStorage.getItem('usuarioLogadoId');
    
    if (!usuarioLogadoId) {
        window.location.href = 'login.html';
        return;
    }

    // Busca dados do admin para atualizar a foto no menu
    try {
        const respostaUser = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${usuarioLogadoId}`);
        if (respostaUser.ok) {
            const usuarioDB = await respostaUser.json();
            
            // Se tiver foto customizada no banco, usa ela. Senão, usa o gerador de letras.
            if (usuarioDB.foto) {
                document.getElementById('user-avatar').src = `https://api-votacao-zg4p.onrender.com/images/${usuarioDB.foto}`;
            } else {
                const nomeCod = encodeURIComponent(usuarioDB.nome || "Admin");
                document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCod}&background=3498db&color=fff`;
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do administrador:", erro);
    }

    // =========================================================
    // 2. INICIALIZAÇÃO DO PAINEL
    // =========================================================
    
    // Pinta o botão de status corretamente assim que a página abre
    verificarStatusVotacao();

    // Carrega os gráficos
    carregarDadosDoGrafico();     // Pizza
    carregarGraficoFrequencia();  // Linhas

    // Funcionalidade do botão Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    // Clique para abrir/fechar votação
    const btnAlternar = document.getElementById('btn-alternar-votacao');
    if (btnAlternar) {
        btnAlternar.addEventListener('click', async () => {
            const confirmacao = confirm("Tem certeza que deseja alterar o status da votação agora?");
            if (!confirmacao) return;

            try {
                const resposta = await fetch('https://api-votacao-zg4p.onrender.com/configuracao/alternar', {
                    method: 'POST'
                });
                const novaConfig = await resposta.json();
                atualizarVisualDoStatus(novaConfig.votacaoAberta);
            } catch (erro) {
                alert("Erro ao alterar o status da votação.");
            }
        });
    }
});

// Variáveis globais para os gráficos
let meuGrafico;
let graficoLinha;

// ==========================================================
// GRÁFICOS
// ==========================================================
async function carregarDadosDoGrafico() {
    try {
        const respostaParticipantes = await fetch('https://api-votacao-zg4p.onrender.com/participantes');
        const participantes = await respostaParticipantes.json();

        const nomes = [];
        const quantidadeVotos = [];

        for (const participante of participantes) {
            nomes.push(participante.nome);
            const respostaVotos = await fetch(`https://api-votacao-zg4p.onrender.com/votos/contagem/${participante.id}`);
            const totalVotos = await respostaVotos.json();
            quantidadeVotos.push(totalVotos);
        }
        desenharGrafico(nomes, quantidadeVotos);
    } catch (erro) {
        console.error("Erro ao carregar gráfico de pizza:", erro);
    }
}

function desenharGrafico(labelsNomes, dadosVotos) {
    const ctx = document.getElementById('graficoVotos').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    const totalGeralDeVotos = dadosVotos.reduce((a, b) => a + b, 0);

    meuGrafico = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labelsNomes,
            datasets: [{
                data: dadosVotos,
                backgroundColor: ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value) => {
                        if (totalGeralDeVotos === 0) return '0%';
                        let porcentagem = ((value / totalGeralDeVotos) * 100).toFixed(1);
                        return `${value} vts\n(${porcentagem}%)`;
                    },
                    textAlign: 'center'
                }
            }
        }
    });
}

async function carregarGraficoFrequencia() {
    try {
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/votos/historico');
        if (resposta.ok) {
            const historico = await resposta.json();
            desenharGraficoLinha(Object.keys(historico), Object.values(historico));
        }
    } catch (erro) {
        const labelsMock = ['18:00', '19:00', '20:00', '21:00', '22:00'];
        const dadosMock = [10, 25, 80, 45, 30];
        desenharGraficoLinha(labelsMock, dadosMock);
    }
}

function desenharGraficoLinha(horarios, votos) {
    const ctx = document.getElementById('graficoFrequencia').getContext('2d');
    if (graficoLinha) graficoLinha.destroy();

    graficoLinha = new Chart(ctx, {
        type: 'line',
        data: {
            labels: horarios,
            datasets: [{
                label: 'Votos',
                data: votos,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { datalabels: { display: false }, legend: { display: false } }
        }
    });
}

// ==========================================
// STATUS DA VOTAÇÃO
// ==========================================
async function verificarStatusVotacao() {
    try {
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/configuracao');
        const config = await resposta.json();
        atualizarVisualDoStatus(config.votacaoAberta);
    } catch (erro) {
        console.error("Erro ao buscar status:", erro);
    }
}

function atualizarVisualDoStatus(isAberta) {
    const textoStatus = document.getElementById('texto-status');
    const faixaStatus = document.getElementById('faixa-status');
    const btnAlternar = document.getElementById('btn-alternar-votacao');

    if (!textoStatus || !faixaStatus || !btnAlternar) return;

    if (isAberta) {
        textoStatus.textContent = "ABERTO";
        textoStatus.style.color = "#2ecc71";
        faixaStatus.style.borderLeftColor = "#2ecc71";
        btnAlternar.textContent = "Encerrar Votação";
        btnAlternar.style.backgroundColor = "#e74c3c";
    } else {
        textoStatus.textContent = "ENCERRADO";
        textoStatus.style.color = "#e74c3c";
        faixaStatus.style.borderLeftColor = "#e74c3c";
        btnAlternar.textContent = "Reabrir Votação";
        btnAlternar.style.backgroundColor = "#2ecc71";
    }
}