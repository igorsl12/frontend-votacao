document.addEventListener('DOMContentLoaded', async () => {
    
    const idLogado = localStorage.getItem('usuarioLogadoId');
    const nomeLogado = localStorage.getItem('usuarioLogadoNome');
    const emailLogado = localStorage.getItem('usuarioLogadoEmail');

    if (!idLogado) {
        window.location.href = 'login.html';
        return; 
    }

    // 1. Preenche o menu lateral
    document.getElementById('user-name-menu').textContent = nomeLogado;
    const emailTexto = (emailLogado && emailLogado !== "null" && emailLogado !== "undefined") ? emailLogado : "E-mail não informado";
    document.getElementById('user-email-menu').textContent = emailTexto;

    const nomeCodificado = encodeURIComponent(nomeLogado);
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${nomeCodificado}&background=3498db&color=fff`;

    // 2. Busca o histórico de votos desse usuário no Java
    try {
        const resposta = await fetch(`http://localhost:8081/votos/usuario/${idLogado}`);
        const historico = await resposta.json();

        const corpoTabela = document.getElementById('corpo-tabela-historico');
        const msgSemVotos = document.getElementById('msg-sem-votos');
        const areaTabela = document.getElementById('area-tabela');

        corpoTabela.innerHTML = ''; // Limpa a mensagem de "Carregando..."

        if (historico.length === 0) {
            // Se não tiver votos, esconde a tabela e mostra o botão para ir votar
            areaTabela.style.display = 'none';
            msgSemVotos.style.display = 'block';
        } else {
            // Se tiver votos, desenha as linhas da tabela
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
        document.getElementById('corpo-tabela-historico').innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar o histórico de votos.</td></tr>`;
    }

    // Funcionalidade de Sair
    document.getElementById('btn-sair').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear(); 
        window.location.href = 'login.html'; 
    });
});