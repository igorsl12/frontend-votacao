// app.js

// Quando a página carregar, busca os dados do back-end em Java
document.addEventListener('DOMContentLoaded', function() {
    
    // Supondo que você crie uma rota no Java chamada '/api/usuario/historico'
    fetch('/api/usuario/historico')
        .then(response => response.json())
        .then(dados => {
            // Preenche os dados do usuário
            document.getElementById('user-email').innerText = dados.usuario.email;
            
            // Preenche os cards
            document.getElementById('total-votos').innerText = dados.totalVotos;
            document.getElementById('favorito-info').innerText = `${dados.favorito.nome} (${dados.favorito.porcentagem}%)`;

            // Preenche a lista de votos
            const listaVotos = document.getElementById('lista-votos');
            listaVotos.innerHTML = ''; // Limpa o "Carregando..."

            if (dados.ultimosVotos.length === 0) {
                listaVotos.innerHTML = '<li class="vote-item">Você ainda não registrou nenhum voto.</li>';
                return;
            }

            // Cria um item na lista para cada voto vindo do banco
            dados.ultimosVotos.forEach(voto => {
                const li = document.createElement('li');
                li.className = 'vote-item';
                li.innerHTML = `
                    <span class="vote-name">Votou em: <strong>${voto.participanteNome}</strong></span>
                    <span class="vote-date">${voto.dataHora}</span>
                `;
                listaVotos.appendChild(li);
            });
        })
        .catch(erro => {
            console.error("Erro ao buscar dados do Java:", erro);
            document.getElementById('lista-votos').innerHTML = '<li class="vote-item">Erro ao carregar os votos.</li>';
        });
});