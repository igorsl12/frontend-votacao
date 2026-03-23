// Puxa o ID do cofre do navegador
const usuarioLogadoId = localStorage.getItem('usuarioLogadoId');

// Segurança extra: se tentar acessar a tela de votação sem estar logado, manda pro login
if (!usuarioLogadoId) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Busca o perfil para travas de segurança
    const perfilLogado = localStorage.getItem('usuarioLogadoPerfil'); 

    // 2. A TRAVA DE SEGURANÇA: Se for ADMIN, expulsa pro painel correto!
    if (perfilLogado === 'ADMIN') {
        window.location.href = 'admin.html';
        return; 
    }

    // ==========================================
    // 3. BUSCA FOTO E DADOS REAIS DO USUÁRIO NO BANCO
    // ==========================================
    try {
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${usuarioLogadoId}`);
        if (resposta.ok) {
            const usuarioDB = await resposta.json();

            // Atualiza Nome e E-mail no Menu Lateral
            document.getElementById('user-name').textContent = usuarioDB.nome;
            const emailTexto = usuarioDB.email && usuarioDB.email !== "null" ? usuarioDB.email : "E-mail não informado";
            document.getElementById('user-email').textContent = emailTexto;

            // LÓGICA DA FOTO: Se tiver foto customizada no banco, usa. Senão, usa as iniciais.
            if (usuarioDB.foto) {
                document.getElementById('user-avatar').src = `https://api-votacao-zg4p.onrender.com/images/${usuarioDB.foto}`;
            } else {
                const nomeCodificado = encodeURIComponent(usuarioDB.nome);
                document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
            }
        }
    } catch (erro) { 
        console.error("Erro ao carregar dados do usuário logado:", erro); 
    }

    // 4. Verifica se o paredão está aberto ou fechado
    verificarStatusVotacao();
});

// ==========================================
// LÓGICA DE CONTROLE DE TELA (Aberto x Fechado)
// ==========================================
async function verificarStatusVotacao() {
    try {
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/configuracao');
        const config = await resposta.json();
        
        if (config.votacaoAberta) {
            // VOTAÇÃO ABERTA: Mostra os cards para votar
            document.getElementById('lista-participantes').style.display = 'grid';
            document.getElementById('secao-resultados').style.display = 'none';
            
            carregarParticipantes(); 
        } else {
            // VOTAÇÃO ENCERRADA: Mostra Gráfico e Relatório
            document.getElementById('lista-participantes').style.display = 'none';
            document.getElementById('secao-resultados').style.display = 'flex';
            
            document.getElementById('titulo-pagina').textContent = 'Resultados Finais';
            document.getElementById('subtitulo-pagina').textContent = 'A votação foi encerrada. Confira abaixo a porcentagem de votos de cada candidato!';
            
            carregarResultadosFinais(); 
        }
    } catch (erro) {
        console.error("Erro ao verificar status da votação:", erro);
        mostrarAlerta("Erro de comunicação com o servidor.", "erro");
    }
}

// ==========================================
// FUNÇÃO QUANDO A VOTAÇÃO ESTÁ ABERTA
// ==========================================
function carregarParticipantes() {
    fetch('https://api-votacao-zg4p.onrender.com/participantes')
        .then(response => response.json())
        .then(participantes => {
            const grid = document.getElementById('lista-participantes');
            grid.innerHTML = ''; 

            if (participantes.length === 0) {
                grid.innerHTML = '<p style="text-align: center; width: 100%; color: #7f8c8d; grid-column: span 3;">Nenhum candidato cadastrado na votação ainda.</p>';
                return;
            }

            participantes.forEach(participante => {
                let imagemExibicao = participante.urlFoto;
                if (!imagemExibicao || imagemExibicao.trim() === "") {
                    const nomeCod = encodeURIComponent(participante.nome);
                    imagemExibicao = `https://ui-avatars.com/api/?name=${nomeCod}&background=ecf0f1&color=2c3e50&size=200`;
                }

                const card = document.createElement('div');
                card.className = 'card-participante';
                
                card.innerHTML = `
                    <img src="${imagemExibicao}" alt="Foto de ${participante.nome}" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #3498db; margin-bottom: 15px;">
                    <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">${participante.nome}</h3>
                    <button class="btn-votar" onclick="registrarVoto(${participante.id}, '${participante.nome}')" style="background-color: #e74c3c; color: white; border: none; padding: 10px 30px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s;">
                        VOTAR
                    </button>
                `;
                grid.appendChild(card);
            });
        })
        .catch(erro => {
            console.error('Erro ao buscar participantes:', erro);
            document.getElementById('lista-participantes').innerHTML = '<p style="color: red; grid-column: span 3; text-align: center;">Erro ao carregar candidatos.</p>';
        });
}

// ==========================================
// FUNÇÃO QUANDO A VOTAÇÃO ESTÁ ENCERRADA
// ==========================================
async function carregarResultadosFinais() {
    try {
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/votos/resultados');
        const resultados = await resposta.json();

        resultados.sort((a, b) => b.votos - a.votos);

        const nomesGrafico = [];
        const votosGrafico = [];
        const coresGrafico = ['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#34495e'];

        let totalVotos = 0;
        resultados.forEach(candidato => {
            totalVotos += candidato.votos;
            nomesGrafico.push(candidato.nome);
            votosGrafico.push(candidato.votos);
        });

        const divRelatorio = document.getElementById('relatorio-resultados');
        if (divRelatorio) {
            divRelatorio.innerHTML = ''; 

            if (totalVotos === 0) {
                divRelatorio.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhum voto registrado.</p>';
            } else {
                resultados.forEach((candidato, index) => {
                    const porcentagem = ((candidato.votos / totalVotos) * 100).toFixed(1);
                    const cor = coresGrafico[index % coresGrafico.length];

                    const item = document.createElement('div');
                    item.style = `display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #f9fbfb; border-radius: 8px; border-left: 5px solid ${cor}; margin-bottom: 10px;`;
                    
                    item.innerHTML = `
                        <span style="font-weight: bold; font-size: 1.2em; color: #2c3e50;">${index + 1}º ${candidato.nome}</span>
                        <div style="text-align: right;">
                            <span style="display: block; font-weight: 900; color: ${cor}; font-size: 1.3em;">${porcentagem}%</span>
                            <span style="font-size: 0.9em; color: #7f8c8d;">${candidato.votos} votos</span>
                        </div>
                    `;
                    divRelatorio.appendChild(item);
                });
            }
        }

        const ctx = document.getElementById('graficoResultadosPublicos').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: nomesGrafico,
                datasets: [{
                    data: votosGrafico,
                    backgroundColor: coresGrafico,
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });

    } catch (erro) {
        console.error("Erro ao gerar gráfico final:", erro);
    }
}

// ==========================================
// AÇÃO DE VOTAR
// ==========================================
function registrarVoto(participanteId, nomeParticipante) {
    const url = `https://api-votacao-zg4p.onrender.com/votos/${participanteId}/${usuarioLogadoId}`;

    fetch(url, { method: 'POST' })
    .then(resposta => {
        if (resposta.ok) {
            mostrarAlerta(`Voto em ${nomeParticipante} registrado com sucesso!`, 'sucesso');
        } else {
            mostrarAlerta('Erro ao registrar o voto.', 'erro');
        }
    })
    .catch(erro => {
        mostrarAlerta('Erro de conexão com o servidor.', 'erro');
    });
}

// ==========================================
// UTILITÁRIO: ALERTA
// ==========================================
function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    divAlerta.textContent = mensagem;
    
    divAlerta.style.display = 'block';
    divAlerta.style.padding = '15px';
    divAlerta.style.marginBottom = '20px';
    divAlerta.style.borderRadius = '8px';
    divAlerta.style.fontWeight = 'bold';
    divAlerta.style.textAlign = 'center';
    
    if (tipo === 'sucesso') {
        divAlerta.style.backgroundColor = '#d4edda';
        divAlerta.style.color = '#155724';
        divAlerta.style.border = '1px solid #c3e6cb';
    } else {
        divAlerta.style.backgroundColor = '#f8d7da';
        divAlerta.style.color = '#721c24';
        divAlerta.style.border = '1px solid #f5c6cb';
    }
    
    setTimeout(() => {
        divAlerta.style.display = 'none';
    }, 3000);
}