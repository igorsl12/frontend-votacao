function fazerLogin() {
    const emailDigitado = document.getElementById("email").value;
    const senhaDigitada = document.getElementById("senha").value;

    // Empacotamos os dados para enviar para a API
    const dadosLogin = {
        email: emailDigitado,
        senha: senhaDigitada
    };

    // Disparamos o POST para o Java
    fetch("http://localhost:8081/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosLogin)
    })
    .then(resposta => {
        if (resposta.ok) {
            return resposta.json(); // Se o Java disse "OK", extraímos os dados do usuário
        } else {
            throw new Error("Login falhou"); // Cai no catch lá embaixo
        }
    })
    .then(usuarioEncontrado => {
        // MÁGICA: Salva o usuário na "memória" do navegador para as outras telas saberem quem ele é!
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
        
        // Redireciona automaticamente para a tela de votação
        window.location.href = "index.html";
    })
    .catch(erro => {
        // Se deu erro, mostra a mensagem vermelha na tela
        document.getElementById("mensagem-erro").style.display = "block";
    });
}