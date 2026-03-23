document.addEventListener('DOMContentLoaded', async () => {
    
    const idLogado = localStorage.getItem('usuarioLogadoId');

    if (!idLogado) {
        window.location.href = 'login.html';
        return; 
    }

    // ==========================================
    // 1. BUSCA DADOS E FOTO DO USUÁRIO NO BANCO
    // ==========================================
    try {
        const respostaUser = await fetch(`http://localhost:8081/usuarios/${idLogado}`);
        if (respostaUser.ok) {
            const usuarioDB = await respostaUser.json();

            if (usuarioDB) {
                document.getElementById('user-name-menu').textContent = usuarioDB.nome;
                const emailTexto = (usuarioDB.email && usuarioDB.email !== "null") ? usuarioDB.email : "E-mail não informado";
                document.getElementById('user-email-menu').textContent = emailTexto;

                if (usuarioDB.foto) {
                    document.getElementById('user-avatar').src = `http://localhost:8081/images/${usuarioDB.foto}`;
                } else {
                    const nomeCodificado = encodeURIComponent(usuarioDB.nome);
                    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;
                }
            }
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do menu lateral:", erro);
    }

    // ==========================================
    // 2. BUSCA O HISTÓRICO DE VOTOS (CARREGAMENTO INICIAL)
    // ==========================================
    carregarHistorico(idLogado);

    // ==========================================
    // 3. FUNCIONALIDADE: LIMPAR VISUALIZAÇÃO (OCULTAR)
    // ==========================================
    const btnLimpar = document.getElementById('btn-limpar-historico');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', async () => {
            const confirmacao = confirm("Deseja ocultar seu histórico de visualização? Seus votos continuarão registrados e valendo para o resultado final.");
            
            if (!confirmacao) return;

            try {
                const resposta = await fetch(`http://localhost:8081/votos/usuario/${idLogado}/limpar-historico`, {
                    method: 'PUT' // Rota que marcamos como visivelNoHistorico = false
                });

                if (resposta.ok) {
                    alert("Histórico ocultado com sucesso!");
                    carregarHistorico(idLogado); // Recarrega a lista para mostrar a mensagem de vazio
                } else {
                    alert("Erro ao processar solicitação no servidor.");
                }
            } catch (erro) {
                console.error("Erro de conexão ao limpar histórico:", erro);
                alert("Erro de conexão com o servidor.");
            }
        });
    }

    // Funcionalidade de Sair
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); 
            window.location.href = 'login.html'; 
        });
    }
});

// ==========================================
// FUNÇÃO PARA CARREGAR / ATUALIZAR A TABELA
// ==========================================
async function carregarHistorico(idLogado) {
    try {
        const resposta = await fetch(`http://localhost:8081/votos/usuario/${idLogado}`);
        const historico = await resposta.json();

        const corpoTabela = document.getElementById('corpo-tabela-historico');
        const msgSemVotos = document.getElementById('msg-sem-votos');
        const areaTabela = document.getElementById('area-tabela');

        if (corpoTabela) corpoTabela.innerHTML = ''; 

        // Se o Java retornar lista vazia (porque deletamos ou ocultamos)
        if (historico.length === 0) {
            if (areaTabela) areaTabela.style.display = 'none';
            if (msgSemVotos) msgSemVotos.style.display = 'block';
        } else {
            // Se tiver votos, garante que a tabela apareça
            if (areaTabela) areaTabela.style.display = 'block';
            if (msgSemVotos) msgSemVotos.style.display = 'none';

            historico.forEach(voto => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: bold; color: #7f8c8d;">#${voto.idVoto}</td>
                    <td style="font-weight: bold; font-size: 1.1em;">${voto.nomeCandidato}</td>
                    <td>${voto.dataHora}</td>
                    <td><span class="badge-voto">Registrado</span></td>
                `;
                corpoTabela.appendChild(tr);
            });
        }
    } catch (erro) {
        console.error("Erro ao buscar histórico:", erro);
        const corpo = document.getElementById('corpo-tabela-historico');
        if (corpo) corpo.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar o histórico de votos.</td></tr>`;
    }
}