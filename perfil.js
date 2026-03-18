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

            document.getElementById('user-name-menu').textContent = usuarioDB.nome;
            document.getElementById('perfil-nome').textContent = usuarioDB.nome;
            document.getElementById('input-editar-nome').value = usuarioDB.nome;
            document.getElementById('perfil-id').value = `#${usuarioDB.id}`;

            const emailTexto = usuarioDB.email ? usuarioDB.email : "E-mail não informado";
            document.getElementById('user-email-menu').textContent = emailTexto;
            document.getElementById('perfil-email').textContent = emailTexto;

            const campoNivel = document.getElementById('perfil-nivel');
            campoNivel.value = usuarioDB.perfil;
            
            if (usuarioDB.perfil === 'ADMIN') {
                campoNivel.style.color = '#e74c3c'; 
            } else {
                campoNivel.style.color = '#2ecc71'; 
            }

            const nomeCodificado = encodeURIComponent(usuarioDB.nome);
            document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
            document.getElementById('perfil-avatar-grande').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff&size=120`;

        } else {
            console.error("Usuário não encontrado no banco.");
        }
    } catch (erro) {
        console.error("Erro de conexão ao buscar usuário:", erro);
    }

    // Funcionalidade Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear(); 
        window.location.href = 'login.html'; 
    });

    // Funcionalidade Alterar Senha
    document.getElementById('form-senha').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;

        if (novaSenha !== confirmarSenha) {
            exibirMensagemSenha("As novas senhas não coincidem!", "red");
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:8081/usuarios/${idLogado}/senha`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senhaAtual: senhaAtual, novaSenha: novaSenha })
            });

            const textoResposta = await resposta.text();

            if (resposta.ok) {
                exibirMensagemSenha("Senha atualizada com sucesso!", "green");
                document.getElementById('form-senha').reset(); 
            } else {
                exibirMensagemSenha(textoResposta, "red"); 
            }
        } catch (erro) {
            exibirMensagemSenha("Erro de conexão com o servidor.", "red");
        }
    });

    // ==========================================
    // FUNCIONALIDADE: EXCLUIR CONTA (Protegido)
    // ==========================================
    const btnExcluir = document.getElementById('btn-excluir-conta');
    
    // Só tenta adicionar o evento de clique se o botão existir na tela!
    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            const confirmacao1 = confirm("Tem certeza que deseja excluir sua conta?");
            if (!confirmacao1) return;

            const confirmacao2 = confirm("Atenção! Esta ação é irreversível. Todos os seus dados serão apagados. Deseja continuar?");
            if (!confirmacao2) return;

            try {
                const resposta = await fetch(`http://localhost:8081/usuarios/${idLogado}`, {
                    method: 'DELETE'
                });

                if (resposta.ok) {
                    alert("Sua conta foi excluída com sucesso. Redirecionando...");
                    localStorage.clear(); // Limpa o "cofre" do navegador
                    window.location.href = 'login.html'; // Manda pro login
                } else {
                    alert("Erro ao tentar excluir a conta. Tente novamente mais tarde.");
                }
            } catch (erro) {
                alert("Erro de conexão com o servidor ao tentar excluir.");
            }
        });
    }
});

// Funções Auxiliares
async function atualizarNome() {
    const novoNome = document.getElementById('input-editar-nome').value.trim();
    const mensagem = document.getElementById('msg-edit-nome');

    if (!novoNome) {
        mensagem.style.display = 'block';
        mensagem.style.color = 'red';
        mensagem.innerText = 'O nome não pode ficar vazio!';
        return;
    }

    try {
        const resposta = await fetch(`http://localhost:8081/usuarios/${idLogado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome })
        });

        if (resposta.ok) {
            localStorage.setItem('usuarioLogadoNome', novoNome);
            
            document.getElementById('user-name-menu').textContent = novoNome;
            document.getElementById('perfil-nome').textContent = novoNome;

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

function exibirMensagemSenha(texto, cor) {
    const msgSenha = document.getElementById('msg-edit-senha');
    msgSenha.style.display = 'block';
    msgSenha.style.color = cor;
    msgSenha.innerText = texto;
    setTimeout(() => { msgSenha.style.display = 'none'; }, 4000);
}