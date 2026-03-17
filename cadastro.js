function cadastrar() {
    const nome = document.getElementById("nome-cad").value;
    const email = document.getElementById("email-cad").value;
    const senha = document.getElementById("senha-cad").value;
    const mensagem = document.getElementById("mensagem-retorno");

    // Validação básica para ver se a pessoa não deixou nada em branco
    if(!nome || !email || !senha) {
        mensagem.style.display = "block";
        mensagem.style.color = "red";
        mensagem.innerText = "Preencha todos os campos!";
        return;
    }

    const novoUsuario = { nome, email, senha };

    fetch("http://localhost:8081/usuarios/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario)
    })
    .then(async resposta => {
        if (resposta.ok) {
            mensagem.style.display = "block";
            mensagem.style.color = "green";
            mensagem.innerText = "Conta criada com sucesso! Redirecionando...";
            
            // Espera 2 segundos e joga a pessoa para a tela de login
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            // Se der erro (ex: e-mail já existe), o Java manda uma mensagem de texto (text())
            const textoErro = await resposta.text();
            throw new Error(textoErro);
        }
    })
    .catch(erro => {
        mensagem.style.display = "block";
        mensagem.style.color = "red";
        // Mostra o erro exato que o Java mandou
        mensagem.innerText = erro.message;
    });
}