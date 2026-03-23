document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');

    formCadastro.addEventListener('submit', async (evento) => {
        // Trava absoluta para a página não recarregar
        evento.preventDefault(); 

        const nome = document.getElementById("nome-cad").value;
        const email = document.getElementById("email-cad").value;
        const senha = document.getElementById("senha-cad").value;
        const mensagem = document.getElementById("mensagem-retorno"); 

        mensagem.style.display = "none"; 

        const novoUsuario = { nome, email, senha };

        try {
            const resposta = await fetch('https://api-votacao-zg4p.onrender.com/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoUsuario)
            });

            if (resposta.ok) {
                mensagem.style.display = "block";
                mensagem.style.color = "green";
                mensagem.innerText = "Cadastro realizado! Redirecionando...";
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } else if (resposta.status === 400) {
                mensagem.style.display = "block";
                mensagem.style.color = "red";
                mensagem.innerText = "E-mail já cadastrado!";
            } else {
                mensagem.style.display = "block";
                mensagem.style.color = "red";
                mensagem.innerText = "Erro inesperado ao cadastrar.";
            }

        } catch (erro) {
            console.error('Erro de requisição:', erro);
            mensagem.style.display = "block";
            mensagem.style.color = "red";
            mensagem.innerText = "Servidor indisponível no momento."; 
        }
    });
});