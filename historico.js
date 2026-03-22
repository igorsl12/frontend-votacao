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
            const usuarioDB = await respostaUser.ok ? await respostaUser.json() : null;

            if (usuarioDB) {
                // Atualiza Nome e E-mail no Menu Lateral
                document.getElementById('user-name-menu').textContent = usuarioDB.nome;
                const emailTexto = (usuarioDB.email && usuarioDB.email !== "null") ? usuarioDB.email : "E-mail não informado";
                document.getElementById('user-email-menu').textContent = emailTexto;

                // LÓGICA DA FOTO: Tem no banco? Usa a real. Não tem? Usa as iniciais.
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
    // 2. BUSCA O HISTÓRICO DE VOTOS
    // ==========================================
    try {
        const resposta = await fetch(`http://localhost:8081/votos/usuario/${idLogado}`);
        const historico = await resposta.json();

        const corpoTabela = document.getElementById('corpo-tabela-historico');
        const msgSemVotos = document.getElementById('msg-sem-votos');
        const areaTabela = document.getElementById('area-tabela');

        if (corpoTabela) corpoTabela.innerHTML = ''; 

        if (historico.length === 0) {
            if (areaTabela) areaTabela.style.display = 'none';
            if (msgSemVotos) msgSemVotos.style.display = 'block';
        } else {
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