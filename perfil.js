let idLogado;

document.addEventListener('DOMContentLoaded', async () => {
    
    idLogado = localStorage.getItem('usuarioLogadoId');

    if (!idLogado) {
        window.location.href = 'login.html';
        return; 
    }

    // BUSCA OS DADOS FRESQUINHOS DIRETO DO BANCO DE DADOS
    try {
        const resposta = await fetch(`http://localhost:8081/usuarios/${idLogado}`);
        
        if (resposta.ok) {
            const usuarioDB = await resposta.json();

            // 1. Preenche os textos com os dados do banco
            document.getElementById('user-name-menu').textContent = usuarioDB.nome;
            document.getElementById('perfil-nome').textContent = usuarioDB.nome;
            document.getElementById('input-editar-nome').value = usuarioDB.nome;
            document.getElementById('perfil-id').value = `#${usuarioDB.id}`;

            const emailTexto = usuarioDB.email ? usuarioDB.email : "E-mail não informado";
            document.getElementById('user-email-menu').textContent = emailTexto;
            document.getElementById('perfil-email').textContent = emailTexto;

            // 2. Preenche o Nível de Acesso dinamicamente!
            const campoNivel = document.getElementById('perfil-nivel');
            campoNivel.value = usuarioDB.perfil;
            
            // Dá uma cor diferente se for ADMIN
            if (usuarioDB.perfil === 'ADMIN') {
                campoNivel.style.color = '#e74c3c'; // Vermelho
            } else {
                campoNivel.style.color = '#2ecc71'; // Verde
            }

            // 3. Atualiza os avatares com as iniciais do nome real da pessoa
            const nomeCodificado = encodeURIComponent(usuarioDB.nome);
            document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
            document.getElementById('perfil-avatar-grande').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff&size=120`;

        } else {
            console.error("Usuário não encontrado no banco.");
        }
    } catch (erro) {
        console.error("Erro de conexão ao buscar usuário:", erro);
    }

    // Funcionalidade do botão Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear(); 
        window.location.href = 'login.html'; 
    });
});

// A função de salvar o nome continua igualzinha!
async function atualizarNome() {
    const novoNome = document.getElementById('input-editar-nome').value.trim();
    const mensagem = document.getElementById('msg-edit-nome');

    if (!novoNome) {
        mensagem.style.display = 'block';
        mensagem.style.color = 'red';
        mensagem.innerText = 'O nome não pode ficar vazio!';
        return;
    }

    const dadosAtualizados = { nome: novoNome };

    try {
        const resposta = await fetch(`http://localhost:8081/usuarios/${idLogado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });

        if (resposta.ok) {
            localStorage.setItem('usuarioLogadoNome', novoNome);
            
            document.getElementById('user-name-menu').textContent = novoNome;
            document.getElementById('perfil-nome').textContent = novoNome;

            // Atualiza as letrinhas da foto na hora também
            const nomeCodificado = encodeURIComponent(novoNome);
            document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
            document.getElementById('perfil-avatar-grande').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff&size=120`;

            mensagem.style.display = 'block';
            mensagem.style.color = 'green';
            mensagem.innerText = 'Nome atualizado com sucesso!';
            setTimeout(() => { mensagem.style.display = 'none'; }, 3000);

        } else {
            mensagem.style.display = 'block';
            mensagem.style.color = 'red';
            mensagem.innerText = 'Erro ao atualizar o nome.';
        }
    } catch (erro) {
        mensagem.style.display = 'block';
        mensagem.style.color = 'red';
        mensagem.innerText = 'Erro de conexão com o servidor.';
    }
}