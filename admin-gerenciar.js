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

// ==========================================
// 1. LER (Read) - Puxa os dados e desenha os CARDS
// ==========================================
async function carregarCardsParticipantes() {
    try {
        const resposta = await fetch('http://localhost:8081/participantes');
        const participantes = await resposta.json();
        
        const grid = document.getElementById('lista-participantes-admin');
        grid.innerHTML = ''; // Limpa o "Carregando..."

        if (participantes.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: span 3; color: #7f8c8d;">Nenhum candidato cadastrado.</p>';
            return;
        }

        participantes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card-participante';
            
            // LÓGICA DAS FOTOS: Usa a foto do banco, ou gera uma automática
            let imagemExibicao = p.urlFoto;
            if (!imagemExibicao || imagemExibicao.trim() === "") {
                const nomeCod = encodeURIComponent(p.nome);
                imagemExibicao = `https://ui-avatars.com/api/?name=${nomeCod}&background=ecf0f1&color=2c3e50&size=200`;
            }

            card.innerHTML = `
                <img src="${imagemExibicao}" alt="Foto de ${p.nome}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #3498db; margin-bottom: 15px;">
                <h3 style="color: #2c3e50; margin-bottom: 5px;">${p.nome}</h3>
                <p style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 15px;">ID do Sistema: #${p.id}</p>
                
                <div style="display: flex; gap: 10px; margin-top: auto; width: 100%;">
                    <button onclick="editarParticipante(${p.id}, '${p.nome}')" style="background: #f1c40f; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; transition: 0.2s;">Editar</button>
                    <button onclick="deletarParticipante(${p.id}, '${p.nome}')" style="background: #e74c3c; color: #fff; border: none; padding: 10px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; transition: 0.2s;">Excluir</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao listar:', erro);
        document.getElementById('lista-participantes-admin').innerHTML = '<p style="color: red; grid-column: span 3;">Erro ao carregar dados do servidor.</p>';
    }
}

// ==========================================
// 2. CRIAR (Create) - COM UPLOAD DE FOTO
// ==========================================
async function adicionarParticipante(evento) {
    evento.preventDefault();
    
    const inputNome = document.getElementById('nome-novo-participante');
    const inputArquivo = document.getElementById('input-arquivo-foto');
    
    const nome = inputNome.value.trim();
    let urlDaFotoSalva = ""; // Começa vazia por padrão

    if (!nome) {
        mostrarAlerta("O nome é obrigatório!", "erro");
        return;
    }

    // PASSO A: SE O ADMIN ESCOLHEU UMA IMAGEM, FAZ O UPLOAD PRO SERVIDOR JAVA
    if (inputArquivo.files.length > 0) {
        const formData = new FormData();
        formData.append("foto", inputArquivo.files[0]); 

        try {
            const respostaUpload = await fetch('http://localhost:8081/arquivos/upload', {
                method: 'POST',
                body: formData 
            });

            if (respostaUpload.ok) {
                const dadosUpload = await respostaUpload.json();
                urlDaFotoSalva = dadosUpload.url; // Salva o link que o Java gerou!
            } else {
                mostrarAlerta("Erro ao salvar a imagem no servidor.", "erro");
                return; // Para o cadastro se a foto falhar
            }
        } catch (erro) {
            console.error("Erro no servidor de imagens:", erro);
            mostrarAlerta("Falha de conexão ao enviar imagem.", "erro");
            return;
        }
    }

    // PASSO B: CADASTRA O PARTICIPANTE NO BANCO COM O NOME E O LINK DA FOTO
    try {
        const resposta = await fetch('http://localhost:8081/participantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, urlFoto: urlDaFotoSalva })
        });

        if (resposta.ok) {
            mostrarAlerta('Candidato adicionado com sucesso!', 'sucesso');
            // Limpa o formulário
            inputNome.value = ''; 
            inputArquivo.value = ''; 
            
            carregarCardsParticipantes(); // Recarrega os cards na tela
        } else {
            mostrarAlerta('Erro ao adicionar candidato no banco.', 'erro');
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão ao salvar candidato.', 'erro');
    }
}

// ==========================================
// 3. EDITAR (Update)
// ==========================================
async function editarParticipante(id, nomeAtual) {
    const novoNome = prompt(`Digite o novo nome para "${nomeAtual}":`, nomeAtual);
    
    if (!novoNome || novoNome.trim() === nomeAtual) return;

    try {
        const resposta = await fetch(`http://localhost:8081/participantes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome })
        });

        if (resposta.ok) {
            mostrarAlerta('Nome atualizado!', 'sucesso');
            carregarCardsParticipantes();
        } else {
            mostrarAlerta('Erro ao atualizar.', 'erro');
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão ao editar.', 'erro');
    }
}

// ==========================================
// 4. DELETAR (Delete)
// ==========================================
async function deletarParticipante(id, nome) {
    const confirmacao = confirm(`Tem certeza que deseja remover ${nome} da Votação? Todos os votos recebidos por ele também serão apagados!`);
    
    if (!confirmacao) return;

    try {
        const resposta = await fetch(`http://localhost:8081/participantes/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            mostrarAlerta('Participante removido da Votação!', 'sucesso');
            carregarCardsParticipantes();
        } else {
            mostrarAlerta('Erro ao remover participante.', 'erro');
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão ao excluir.', 'erro');
    }
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    divAlerta.textContent = mensagem;
    
    // Adiciona cores dinâmicas para garantir que fique visível
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
    }, 4000);
}