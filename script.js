const usuarioString = localStorage.getItem("usuarioLogado");
let usuarioLogado = null;
let graficoParedao = null; // Variável para o nosso gráfico

// 1. VERIFICAÇÃO DE LOGIN
if (usuarioString) {
    usuarioLogado = JSON.parse(usuarioString);
} else {
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    carregarParticipantes();
});

// 2. CARREGAR A TELA
function carregarParticipantes() {
    fetch("http://localhost:8081/participantes")
        .then(resposta => resposta.json())
        .then(dados => {
            const container = document.getElementById("participantes-container");
            container.innerHTML = ""; 
            
            let nomesParaGrafico = [];
            // Removemos a array votosParaGrafico daqui!
            let promessasDeVotos = [];
            
            if (usuarioLogado && usuarioLogado.perfil === "ADMIN") {
                const painelAdmin = document.getElementById("painel-admin");
                const areaGrafico = document.getElementById("area-grafico");
                if (painelAdmin) painelAdmin.style.display = "block";
                if (areaGrafico) areaGrafico.style.display = "block";
            }

            dados.forEach(participante => {
                const div = document.createElement("div");
                div.className = "card";
                
                let htmlNumeros = "";
                let botoesAdmin = "";

                if (usuarioLogado && usuarioLogado.perfil === "ADMIN") {
                    htmlNumeros = `
                        <h3 style="color: #ff4757; font-size: 32px; margin: 10px 0;">
                            <span id="pct-${participante.id}">0.00%</span>
                        </h3>
                        <p style="color: #666;">
                            Votos: <span id="votos-${participante.id}">0</span>
                        </p>
                    `;
                    
                    botoesAdmin = `
                        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                            <button onclick="editarParticipante(${participante.id}, '${participante.nome}')" style="background-color: #feca57; width: auto; padding: 5px 15px;">Editar</button>
                            <button onclick="excluirParticipante(${participante.id})" style="background-color: #ff9f43; width: auto; padding: 5px 15px;">Excluir</button>
                        </div>
                    `;
                    
                    // Guarda o nome na ordem certa (1, 2, 3...)
                    nomesParaGrafico.push(participante.nome);
                    
                    // A CORREÇÃO: Em vez de fazer o push bagunçado, nós guardamos a promessa de resposta
                    let promessa = fetch(`http://localhost:8081/votos/contagem/${participante.id}`)
                        .then(res => res.json());
                    
                    promessasDeVotos.push(promessa); // As promessas ficam na mesma ordem dos nomes
                }

                div.innerHTML = `
                    <h2>${participante.nome}</h2>
                    ${htmlNumeros}
                    <button onclick="votar(${participante.id})">VOTAR</button>
                    ${botoesAdmin}
                `;
                container.appendChild(div);

                if (usuarioLogado && usuarioLogado.perfil === "ADMIN") {
                    atualizarContagemTextos(participante.id);
                }
            });

            // A MÁGICA FINAL: O Promise.all pega as promessas, espera todas terminarem, 
            // e devolve a array de votos EXATAMENTE na mesma ordem em que as promessas foram criadas!
            if (usuarioLogado && usuarioLogado.perfil === "ADMIN" && promessasDeVotos.length > 0) {
                Promise.all(promessasDeVotos).then(votosNaOrdemCerta => {
                    desenharGrafico(nomesParaGrafico, votosNaOrdemCerta);
                });
            }
        })
        .catch(erro => console.error("Erro ao carregar participantes:", erro));
}

// 3. ATUALIZAR NÚMEROS
function atualizarContagemTextos(id) {
    fetch(`http://localhost:8081/votos/contagem/${id}`)
        .then(resposta => resposta.json())
        .then(total => {
            const el = document.getElementById(`votos-${id}`);
            if (el) el.innerText = total;
        });

    fetch(`http://localhost:8081/votos/porcentagem/${id}`)
        .then(resposta => resposta.json())
        .then(pct => {
            const el = document.getElementById(`pct-${id}`);
            if (el) el.innerText = pct.toFixed(2) + "%";
        });
}

// 4. COMPUTAR O VOTO
function votar(participanteId) {
    const usuarioId = usuarioLogado.id;

    fetch(`http://localhost:8081/votos/${participanteId}/${usuarioId}`, { method: "POST" })
    .then(resposta => {
        if(resposta.ok) {
            if (usuarioLogado.perfil === "ADMIN") {
                carregarParticipantes(); // Recarrega tela e gráfico
            } else {
                alert("Voto registrado com sucesso!");
            }
        }
    });
}

// NOVA FUNÇÃO DESENHAR GRÁFICO (Com paleta de cores expandida!)
function desenharGrafico(nomes, votos) {
    const canvas = document.getElementById('meuGrafico');
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    if (graficoParedao) graficoParedao.destroy();

    graficoParedao = new Chart(ctx, {
        type: 'pie', // Gráfico de Pizza
        data: {
            labels: nomes,
            datasets: [{
                data: votos,
                // A MÁGICA ESTÁ AQUI: Adicionamos mais cores para suportar até 5 participantes de uma vez!
                backgroundColor: ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#3742fa'], 
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function sair() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}


// ==========================================
// FUNÇÕES EXCLUSIVAS DO ADMINISTRADOR (CRUD)
// ==========================================

function adicionarParticipante() {
    const nome = document.getElementById("novo-participante").value;
    if (!nome) return alert("Digite o nome do novo participante!");

    fetch("http://localhost:8081/participantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome })
    })
    .then(resposta => {
        if (resposta.ok) {
            document.getElementById("novo-participante").value = ""; // Limpa a caixinha
            carregarParticipantes(); // Atualiza a tela na hora
        } else {
            alert("Erro ao adicionar no banco de dados.");
        }
    })
    .catch(erro => console.error("Erro na requisição:", erro));
}

function editarParticipante(id, nomeAtual) {
    const novoNome = prompt("Digite o novo nome para o participante:", nomeAtual);
    
    if (!novoNome || novoNome === nomeAtual) return;

    fetch(`http://localhost:8081/participantes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome })
    }).then(resposta => {
        if (resposta.ok) {
            carregarParticipantes(); // Atualiza a tela com o nome novo
        }
    });
}

function excluirParticipante(id) {
    if (!confirm("Atenção: Isso apagará o participante e TODOS os votos dele. Continuar?")) return;

    fetch(`http://localhost:8081/participantes/${id}`, {
        method: "DELETE"
    }).then(resposta => {
        if (resposta.ok) {
            carregarParticipantes(); // Remove o cartão da tela
        }
    });
}