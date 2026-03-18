// Puxa o ID do cofre do navegador
const usuarioLogadoId = localStorage.getItem('usuarioLogadoId');

// Segurança extra: se tentar acessar a tela de votação sem estar logado, manda pro login
if (!usuarioLogadoId) {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Busca os dados que o login salvou
    const nomeLogado = localStorage.getItem('usuarioLogadoNome');
    const emailLogado = localStorage.getItem('usuarioLogadoEmail');
    const perfilLogado = localStorage.getItem('usuarioLogadoPerfil'); 

    // 2. A TRAVA DE SEGURANÇA: Se for ADMIN, expulsa pro painel correto!
    if (perfilLogado === 'ADMIN') {
        window.location.href = 'admin.html';
        return; // O return faz o código parar aqui
    }

    // 3. Atualiza os dados do usuário no menu lateral
    if (nomeLogado) {
        document.getElementById('user-name').textContent = nomeLogado;
        // BÔNUS: Atualiza a fotinha do menu lateral igual fizemos no perfil!
        const nomeCodificado = encodeURIComponent(nomeLogado);
        document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
    }

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
    fetch('http://localhost:8081/participantes')
        .then(response => response.json())
        .then(participantes => {
            const grid = document.getElementById('lista-participantes');
            grid.innerHTML = ''; // Limpa o "Carregando..."

            if (participantes.length === 0) {
                grid.innerHTML = '<p style="text-align: center; width: 100%; color: #7f8c8d;">Nenhum candidato cadastrado na votação ainda.</p>';
                return;
            }

            participantes.forEach(participante => {
                
                // LÓGICA DAS FOTOS: Usa a foto do banco, ou gera uma automática!
                let imagemExibicao = participante.urlFoto;
                if (!imagemExibicao || imagemExibicao.trim() === "") {
                    const nomeCod = encodeURIComponent(participante.nome);
                    imagemExibicao = `https://ui-avatars.com/api/?name=${nomeCod}&background=ecf0f1&color=2c3e50&size=200`;
                }

                const card = document.createElement('div');
                card.className = 'card-participante';
                
                // Card atualizado para exibir a imagem real
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
            document.getElementById('lista-participantes').innerHTML = '<p style="color: red;">Erro ao carregar os candidatos. Verifique se o servidor Java está rodando.</p>';
        });
}

// A função de registrar o voto (chamando o seu VotoController)
function registrarVoto(participanteId, nomeParticipante) {
    const url = `http://localhost:8081/votos/${participanteId}/${usuarioLogadoId}`;

    fetch(url, { method: 'POST' })
    .then(resposta => {
        if (resposta.ok) {
            mostrarAlerta(`Voto em ${nomeParticipante} registrado com sucesso!`, 'sucesso');
        } else {
            mostrarAlerta('Erro ao registrar o voto. Verifique os dados.', 'erro');
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
    
    // Adiciona cores dinâmicas no JS para garantir que fique visível
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