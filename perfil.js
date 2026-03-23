let idLogado;
let perfilUsuarioLogado; // Guarda se o usuário é ADMIN ou comum
let imagemOriginal = ''; // Guarda a foto original caso o usuário cancele o upload
let temFotoCustomizada = false; // Avisa o sistema se o usuário já tem foto própria

document.addEventListener('DOMContentLoaded', async () => {
    
    idLogado = localStorage.getItem('usuarioLogadoId');

    if (!idLogado) {
        window.location.href = 'login.html';
        return; 
    }

    // BUSCA OS DADOS FRESQUINHOS DIRETO DO BANCO DE DADOS
    try {
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${idLogado}`);
        
        if (resposta.ok) {
            const usuarioDB = await resposta.json();
            perfilUsuarioLogado = usuarioDB.perfil; 

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

            // ==========================================
            // LÓGICA DE FOTO IGUAL PARA TODOS (ADMIN E ELEITOR)
            // ==========================================
            let fotoExibicao = usuarioDB.foto;
            const nomeCodificado = encodeURIComponent(usuarioDB.nome);
            const avatarLetras120 = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff&size=120`;
            const avatarLetras60 = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;

            if (fotoExibicao) {
                // Se tem foto no banco (Admin ou Eleitor), usa ela!
                const urlReal = `https://api-votacao-zg4p.onrender.com/images/${fotoExibicao}`;
                document.getElementById('perfil-avatar-grande').src = urlReal;
                document.getElementById('user-avatar').src = urlReal; 
                imagemOriginal = urlReal; 
                temFotoCustomizada = true;
            } else {
                // Se NÃO tem foto no banco (Admin ou Eleitor), usa as letrinhas!
                document.getElementById('perfil-avatar-grande').src = avatarLetras120;
                document.getElementById('user-avatar').src = avatarLetras60;
                imagemOriginal = avatarLetras120;
                temFotoCustomizada = false;
            }

            inicializarControlesUpload();

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
            const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${idLogado}/senha`, {
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

    // Funcionalidade Excluir Conta
    const btnExcluir = document.getElementById('btn-excluir-conta');
    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            const confirmacao1 = confirm("Tem certeza que deseja excluir sua conta?");
            if (!confirmacao1) return;

            const confirmacao2 = confirm("Atenção! Esta ação é irreversível. Todos os seus dados serão apagados. Deseja continuar?");
            if (!confirmacao2) return;

            try {
                const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${idLogado}`, {
                    method: 'DELETE'
                });

                if (resposta.ok) {
                    alert("Sua conta foi excluída com sucesso. Redirecionando...");
                    localStorage.clear(); 
                    window.location.href = 'login.html'; 
                } else {
                    alert("Erro ao tentar excluir a conta. Tente novamente mais tarde.");
                }
            } catch (erro) {
                alert("Erro de conexão com o servidor ao tentar excluir.");
            }
        });
    }
});

// ==========================================
// FUNÇÕES DE UPLOAD DE FOTO
// ==========================================
function inicializarControlesUpload() {
    const divControles = document.getElementById('controles-upload');
    const btnEscolherFoto = document.getElementById('btn-escolher-foto');
    const inputArquivo = document.getElementById('input-arquivo-foto');
    const divAcoes = document.getElementById('acoes-upload');

    if(divControles) divControles.style.display = 'flex';

    if(btnEscolherFoto && inputArquivo) {
        btnEscolherFoto.addEventListener('click', () => {
            inputArquivo.click();
        });

        inputArquivo.addEventListener('change', () => {
            const arquivo = inputArquivo.files[0];

            if (arquivo) {
                if (!arquivo.type.match('image.*')) {
                    alert("Por favor, selecione apenas arquivos de imagem (JPG, PNG, GIF).");
                    inputArquivo.value = ''; 
                    return;
                }

                const leitor = new FileReader();
                leitor.onload = (e) => {
                    document.getElementById('perfil-avatar-grande').src = e.target.result;
                }
                leitor.readAsDataURL(arquivo);

                btnEscolherFoto.style.display = 'none';
                divAcoes.style.display = 'flex';
            }
        });
    }
}

function cancelarUpload() {
    document.getElementById('perfil-avatar-grande').src = imagemOriginal;
    document.getElementById('input-arquivo-foto').value = '';
    document.getElementById('btn-escolher-foto').style.display = 'block';
    document.getElementById('acoes-upload').style.display = 'none';
}

async function fazerUploadFoto() {
    const inputArquivo = document.getElementById('input-arquivo-foto');
    const arquivo = inputArquivo.files[0];

    if (!arquivo) {
        alert("Nenhum arquivo selecionado.");
        return;
    }

    const formData = new FormData();
    formData.append("arquivoFoto", arquivo);

    try {
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${idLogado}/foto`, {
            method: 'POST',
            body: formData
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert("Sua foto de perfil foi atualizada com sucesso!");
            
            imagemOriginal = dados.urlCompleta;
            document.getElementById('user-avatar').src = dados.urlCompleta;
            document.getElementById('perfil-avatar-grande').src = dados.urlCompleta;
            temFotoCustomizada = true;
            
            document.getElementById('btn-escolher-foto').style.display = 'block';
            document.getElementById('acoes-upload').style.display = 'none';
            inputArquivo.value = '';
        } else {
            alert("Erro ao enviar a foto para o servidor.");
            cancelarUpload();
        }
    } catch (erro) {
        alert("Erro de conexão ao tentar enviar a foto.");
        console.error(erro);
        cancelarUpload();
    }
}

// ==========================================
// FUNÇÕES AUXILIARES 
// ==========================================
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
        const resposta = await fetch(`https://api-votacao-zg4p.onrender.com/usuarios/${idLogado}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome })
        });

        if (resposta.ok) {
            localStorage.setItem('usuarioLogadoNome', novoNome);
            
            document.getElementById('user-name-menu').textContent = novoNome;
            document.getElementById('perfil-nome').textContent = novoNome;

            // Se o usuário (qualquer um) NÃO tem foto customizada, atualiza as letrinhas azuis
            if (!temFotoCustomizada) {
                const nomeCodificado = encodeURIComponent(novoNome);
                const novaUrl = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
                document.getElementById('user-avatar').src = novaUrl;
                
                const avatarGrande = document.getElementById('perfil-avatar-grande');
                if (avatarGrande) {
                    avatarGrande.src = novaUrl + '&size=120';
                    imagemOriginal = novaUrl + '&size=120';
                }
            }

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