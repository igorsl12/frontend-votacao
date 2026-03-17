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
                div.innerHTML = `
                    <h2>${participante.nome}</h2>
                    <p style="font-size: 24px; font-weight: bold; color: #333;">
                        Votos: <span id="votos-${participante.id}">0</span>
                    </p>
                    <button onclick="votar(${participante.id})">VOTAR</button>
                `;
                container.appendChild(div);

                // Assim que desenha o cartão, já busca quantos votos ele tem
                atualizarContagem(participante.id);
            });
        })
        .catch(erro => console.error("Erro ao carregar o Java:", erro));
}

// Nova função que vai na rota que acabamos de criar no Java
function atualizarContagem(id) {
    fetch(`http://localhost:8081/votos/contagem/${id}`)
        .then(resposta => resposta.json())
        .then(total => {
            // Atualiza o número na tela
            document.getElementById(`votos-${id}`).innerText = total;
        });
}

function votar(id) {
    fetch(`http://localhost:8081/votos/${id}`, {
        method: "POST"
    })
    .then(resposta => {
        if(resposta.ok) {
            // Em vez de dar um alert chato, a tela atualiza o número instantaneamente!
            atualizarContagem(id);
        }
    })
    .catch(erro => console.error("Erro na conexão:", erro));
}