document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');

    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        const dadosLogin = {
            email: email,
            senha: senha
        };

        try {
            const resposta = await fetch('http://localhost:8081/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosLogin)
            });

            if (resposta.ok) {
                // 1. Pegamos os dados do usuário que o Java devolveu
                const usuario = await resposta.json();
                
                // 2. Salvamos o ID e o Nome no "cofre" do navegador (Local Storage)
                // Assim, a página index.html saberá quem está logado!
                localStorage.setItem('usuarioLogadoId', usuario.id);
                localStorage.setItem('usuarioLogadoNome', usuario.nome);
                localStorage.setItem('usuarioLogadoEmail', usuario.email); 

                // 3. Verificamos o perfil para fazer o redirecionamento correto
                // ATENÇÃO: Se na sua classe Java o atributo se chamar algo diferente de 'perfil',
                // como 'role' ou 'tipo', mude a palavra 'perfil' abaixo para bater exatamente!
                if (usuario.perfil === 'ADMIN') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
                
            } else {
                mostrarAlerta('E-mail ou senha incorretos!', 'erro');
            }
        } catch (erro) {
            console.error('Erro de conexão:', erro);
            mostrarAlerta('Erro ao conectar com o servidor.', 'erro');
        }
    });
});

function mostrarAlerta(mensagem, tipo) {
    const divAlerta = document.getElementById('mensagem-alerta');
    divAlerta.textContent = mensagem;
    divAlerta.className = `alerta ${tipo}`; 
    
    setTimeout(() => {
        divAlerta.className = 'alerta oculta';
    }, 4000);
}