document.addEventListener('DOMContentLoaded', async () => {
    // =========================================================
    // 1. IDENTIFICAÇÃO E FOTO DO ADMIN NO MENU
    // =========================================================
    const usuarioLogadoId = localStorage.getItem('usuarioLogadoId');
    
    if (!usuarioLogadoId) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const respostaUser = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${usuarioLogadoId}`);
        if (respostaUser.ok) {
            const usuarioDB = await respostaUser.json();
            
            // Lógica da foto: banco ou letrinhas
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
    // 2. CARREGAMENTO DA PÁGINA
    // =========================================================
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
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/participantes');
        const participantes = await resposta.json();
        
        const grid = document.getElementById('lista-participantes-admin');
        grid.innerHTML = ''; 

        if (participantes.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: span 3; color: #7f8c8d;">Nenhum candidato cadastrado.</p>';
            return;
        }

        participantes.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card-participante';
            
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
    let urlDaFotoSalva = ""; 

    if (!nome) {
        mostrarAlerta("O nome é obrigatório!", "erro");
        return;
    }

    // Se o Admin escolheu uma imagem, ela deve ser enviada para a rota de arquivos que você configurou no Java
    if (inputArquivo.files.length > 0) {
        const formData = new FormData();
        formData.append("arquivoFoto", inputArquivo.files[0]); 

        try {
            // Ajuste aqui se a sua rota de upload de participante for diferente da de usuários
            const respostaUpload = await fetch('https://api-votacao-zg4p.onrender.com/usuarios/upload-externo-opcional', { 
                method: 'POST',
                body: formData 
            });

            if (respostaUpload.ok) {
                const dadosUpload = await respostaUpload.json();
                urlDaFotoSalva = dadosUpload.urlCompleta; 
            }
        } catch (erro) {
            console.error("Erro no upload da imagem:", erro);
        }
    }

    try {
        const resposta = await fetch('https://api-votacao-zg4p.onrender.com/participantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, urlFoto: urlDaFotoSalva })
        });

        if (resposta.ok) {
            mostrarAlerta('Candidato adicionado com sucesso!', 'sucesso');
            inputNome.value = ''; 
            inputArquivo.value = ''; 
            carregarCardsParticipantes();
        } else {
            mostrarAlerta('Erro ao adicionar candidato.', 'erro');
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão.', 'erro');
    }
}

// ==========================================
// 3. EDITAR (Update)
// ==========================================
async function editarParticipante(id, nomeAtual) {
    const novoNome = prompt(`Digite o novo nome para "${nomeAtual}":`, nomeAtual);
    if (!novoNome || novoNome.trim() === nomeAtual) return;

    try {
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/participantes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome })
        });

        if (resposta.ok) {
            mostrarAlerta('Nome atualizado!', 'sucesso');
            carregarCardsParticipantes();
        }
    } catch (erro) {
        mostrarAlerta('Erro de conexão.', 'erro');
    }
}

// ==========================================
// 4. DELETAR (Delete)
// ==========================================
async function deletarParticipante(id, nome) {
    const confirmacao = confirm(`Remover ${nome}? Todos os votos dele sumirão!`);
    if (!confirmacao) return;

    try {
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/participantes/${id}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            mostrarAlerta('Removido com sucesso!', 'sucesso');
            carregarCardsParticipantes();
        }
    } catch (erro) {
        mostrarAlerta('Erro ao excluir.', 'erro');
    }
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    if (!divAlerta) return;

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
    }, 4000);
}