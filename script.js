// 1. Antes de tudo, verificamos quem está logado na "memória" do navegador
const usuarioString = localStorage.getItem("usuarioLogado");
let usuarioLogado = null;

if (usuarioString) {
    // Transforma o texto salvo de volta em um objeto de usuário
    usuarioLogado = JSON.parse(usuarioString);
} else {
    // Se o espertinho tentou acessar o index.html direto sem logar, é chutado de volta!
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarParticipantes();
});

function carregarParticipantes() {
    fetch("http://localhost:8081/participantes")
        .then(resposta => resposta.json())
        .then(dados => {
            const container = document.getElementById("participantes-container");
            container.innerHTML = ""; 
            
            dados.forEach(participante => {
                const div = document.createElement("div");
                div.className = "card";
                
                // MÁGICA DA TELA: Só criamos o HTML dos números se o perfil for ADMIN!
                let htmlNumeros = "";
                if (usuarioLogado.perfil === "ADMIN") {
                    htmlNumeros = `
                        <h3 style="color: #ff4757; font-size: 32px; margin: 10px 0;">
                            <span id="pct-${participante.id}">0.00%</span>
                        </h3>
                        <p style="color: #666;">
                            Votos absolutos: <span id="votos-${participante.id}">0</span>
                        </p>
                    `;
                }

                // Desenhamos o cartão colando os números (se houver) e o botão de votar
                div.innerHTML = `
                    <h2>${participante.nome}</h2>
                    ${htmlNumeros}
                    <button onclick="votar(${participante.id})">VOTAR</button>
                `;
                container.appendChild(div);

                // Só vai ao banco buscar as contas se for ADMIN
                if (usuarioLogado.perfil === "ADMIN") {
                    atualizarContagem(participante.id);
                }
            });
        })
        .catch(erro => console.error("Erro ao carregar o Java:", erro));
}

function atualizarContagem(id) {
    fetch(`http://localhost:8081/votos/contagem/${id}`)
        .then(resposta => resposta.json())
        .then(total => {
            document.getElementById(`votos-${id}`).innerText = total;
        });

    fetch(`http://localhost:8081/votos/porcentagem/${id}`)
        .then(resposta => resposta.json())
        .then(porcentagem => {
            document.getElementById(`pct-${id}`).innerText = porcentagem.toFixed(2) + "%";
        });
}

function votar(participanteId) {
    // AQUI ESTÁ A CORREÇÃO DO VOTO: Pegamos o ID do usuário que está logado
    const usuarioId = usuarioLogado.id;

    // Enviamos a requisição com os dois números, exatamente como o Java está pedindo agora
    fetch(`http://localhost:8081/votos/${participanteId}/${usuarioId}`, {
        method: "POST"
    })
    .then(resposta => {
        if(resposta.ok) {
            alert("Voto registrado com sucesso!");
            
            // Se for o Admin votando, a tela já atualiza para ele ver o número subindo
            if (usuarioLogado.perfil === "ADMIN") {
                carregarParticipantes();
            }
        } else {
            alert("Erro ao computar o voto.");
        }
    })
    .catch(erro => console.error("Erro na conexão:", erro));
    
} 
function sair() {
    // Apaga o usuário da memória do navegador
    localStorage.removeItem("usuarioLogado");
    // Joga de volta para a tela de login
    window.location.href = "login.html";
}