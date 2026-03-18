document.addEventListener('DOMContentLoaded', () => {
    carregarCardsParticipantes();

    // Captura o envio do formulário para adicionar alguém
    document.getElementById('form-adicionar').addEventListener('submit', adicionarParticipante);
    
    // Funcionalidade do botão Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });
});

// 1. LER (Read) - Puxa os dados e desenha os CARDS
async function carregarCardsParticipantes() {
    try {
        const resposta = await fetch('http://localhost:8081/participantes');
        const participantes = await resposta.json();
        
        const grid = document.getElementById('lista-participantes-admin');
        grid.innerHTML = ''; // Limpa o "Carregando..."

        if (participantes.length === 0) {
            grid.innerHTML = '<p style="text-align: center; width: 100%;">Nenhum participante no paredão.</p>';
            return;
        }

        participantes.forEach(p => {
            const card = document.createElement('div');
            // Usamos a classe do seu CSS que já deixa o visual de caixinha
            card.className = 'card-participante';
            
            // Montamos o HTML interno do card com a foto, nome e os dois botões
            card.innerHTML = `
                <img src="https://via.placeholder.com/120" class="foto-participante" alt="Foto">
                <h3>${p.nome}</h3>
                <p>ID: ${p.id}</p>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="editarParticipante(${p.id}, '${p.nome}')" style="background: #f1c40f; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold;">Editar</button>
                    <button onclick="deletarParticipante(${p.id}, '${p.nome}')" style="background: #e74c3c; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold;">Excluir</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao listar:', erro);
        document.getElementById('lista-participantes-admin').innerHTML = '<p>Erro ao carregar dados do servidor.</p>';
    }
}

// 2. CRIAR (Create)
async function adicionarParticipante(evento) {
    evento.preventDefault();
    const inputNome = document.getElementById('nome-novo-participante');
    const nome = inputNome.value;

    try {
        const resposta = await fetch('http://localhost:8081/participantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome })
        });

        if (resposta.ok) {
            mostrarAlerta('Participante adicionado com sucesso!', 'sucesso');
            inputNome.value = ''; 
            carregarCardsParticipantes(); // Recarrega os cards
        }
    } catch (erro) {
        mostrarAlerta('Erro ao adicionar.', 'erro');
    }
}

// 3. EDITAR (Update)
async function editarParticipante(id, nomeAtual) {
    const novoNome = prompt(`Digite o novo nome para "${nomeAtual}":`, nomeAtual);
    
    if (!novoNome || novoNome === nomeAtual) return;

    try {
        const resposta = await fetch(`http://localhost:8081/participantes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome })
        });

        if (resposta.ok) {
            mostrarAlerta('Nome atualizado!', 'sucesso');
            carregarCardsParticipantes();
        }
    } catch (erro) {
        mostrarAlerta('Erro ao editar.', 'erro');
    }
}

// 4. DELETAR (Delete)
async function deletarParticipante(id, nome) {
    const confirmacao = confirm(`Tem certeza que deseja remover ${nome} do paredão? Todos os votos dele também serão apagados!`);
    
    if (!confirmacao) return;

    try {
        const resposta = await fetch(`http://localhost:8081/participantes/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            mostrarAlerta('Participante removido do paredão!', 'sucesso');
            carregarCardsParticipantes();
        } else {
            mostrarAlerta('Erro ao remover participante.', 'erro');
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão.', 'erro');
    }
}

// Utilitário para alertas
function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    divAlerta.textContent = mensagem;
    divAlerta.className = `alerta ${tipo}`; 
    divAlerta.style.display = 'block';
    
    setTimeout(() => {
        divAlerta.className = 'alerta oculta';
        divAlerta.style.display = 'none';
    }, 3000);
}