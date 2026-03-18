// Puxa o ID do cofre do navegador
const usuarioLogadoId = localStorage.getItem('usuarioLogadoId');

// Segurança extra: se tentar acessar a tela de votação sem estar logado, manda pro login
if (!usuarioLogadoId) {
    window.location.href = 'login.html';
}

// Assim que a tela carregar, ele atualiza os dados do usuário e busca o paredão
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Busca o nome e e-mail que o login.js salvou
    const nomeLogado = localStorage.getItem('usuarioLogadoNome');
    const emailLogado = localStorage.getItem('usuarioLogadoEmail');

    // 2. Atualiza o Nome
    if (nomeLogado) {
        document.getElementById('user-name').textContent = nomeLogado;
    }

    // 3. Atualiza o E-mail de forma separada e segura
    if (emailLogado && emailLogado !== "null" && emailLogado !== "undefined") {
        document.getElementById('user-email').textContent = emailLogado;
    } else {
        document.getElementById('user-email').textContent = "E-mail não informado";
    }

    // 4. Chama a função que desenha os cards dos participantes
    carregarParticipantes();
});

// Função que busca os participantes no seu ParticipanteController
function carregarParticipantes() {
    // Chama o seu @GetMapping
    fetch('http://localhost:8081/participantes')
        .then(response => response.json())
        .then(participantes => {
            const grid = document.getElementById('lista-participantes');
            grid.innerHTML = ''; // Limpa os cards falsos do HTML

            if (participantes.length === 0) {
                grid.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum participante cadastrado no paredão ainda.</p>';
                return;
            }

            // Para cada participante que vier do seu banco de dados, desenha um card
            participantes.forEach(participante => {
                const card = document.createElement('div');
                card.className = 'card-participante';
                
                card.innerHTML = `
                    <img src="https://via.placeholder.com/150" alt="Foto de ${participante.nome}" class="foto-participante">
                    <h3>${participante.nome}</h3>
                    <p>No Paredão</p>
                    <button class="btn-votar" onclick="registrarVoto(${participante.id}, '${participante.nome}')">VOTAR</button>
                `;
                
                grid.appendChild(card);
            });
        })
        .catch(erro => {
            console.error('Erro ao buscar participantes:', erro);
            document.getElementById('lista-participantes').innerHTML = '<p>Erro ao carregar o paredão. Verifique se o servidor Java está rodando.</p>';
        });
}

// A função de registrar o voto (chamando o seu VotoController)
function registrarVoto(participanteId, nomeParticipante) {
    console.log(`Enviando voto: Usuário ${usuarioLogadoId} votando no Participante ${participanteId}`);

    const url = `http://localhost:8081/votos/${participanteId}/${usuarioLogadoId}`;

    fetch(url, { method: 'POST' })
    .then(resposta => {
        if (resposta.ok) {
            mostrarAlerta(`Voto em ${nomeParticipante} registrado com sucesso!`, 'sucesso');
        } else {
            mostrarAlerta('Erro ao registrar o voto. Verifique se os IDs existem no banco.', 'erro');
        }
    })
    .catch(erro => {
        console.error('Erro na comunicação com o servidor:', erro);
        mostrarAlerta('Erro de conexão com o servidor.', 'erro');
    });
}

// Controle da mensagem verde/vermelha na tela
function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    divAlerta.textContent = mensagem;
    divAlerta.className = `alerta ${tipo}`; 
    
    setTimeout(() => {
        divAlerta.className = 'alerta oculta';
    }, 3000);
}