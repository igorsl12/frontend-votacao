# 🗳️ Sistema de Votação  - Frontend

Este é o Front-end de um sistema de votação em tempo real, desenvolvido com foco em uma experiência de usuário fluida e responsiva. O sistema possui controle de acesso com diferentes níveis de privilégio (Eleitor e Administrador) e consome uma API RESTful construída em Java (Spring Boot).

## 🚀 Funcionalidades

O sistema é dividido em duas jornadas principais, dependendo do nível de acesso do usuário:

### 👤 Perfil: Eleitor
* **Autenticação:** Login seguro no sistema.
* **Votação:** Visualização dos candidatos no paredão e registro de votos dinâmicos.
* **Histórico de Votos:** Consulta de todos os votos registrados pelo usuário, com número de recibo e data/hora.
* **Gestão de Perfil:** * Atualização de nome (com reflexo imediato nos avatares gerados pela API UI-Avatars).
  * Alteração de senha com validação de segurança.
  * **Danger Zone:** Exclusão permanente da própria conta (com limpeza em cascata no banco de dados).

### 🛡️ Perfil: Administrador
* **Painel Exclusivo:** Proteção de rotas via JavaScript para impedir acesso de eleitores comuns.
* **Gestão de Candidatos (CRUD):** * Adição de novos participantes.
  * Upload de fotos diretamente para o servidor local ou geração de avatar automático.
  * Edição de nomes de candidatos existentes.
  * Remoção de candidatos (com alerta de exclusão de votos atrelados).
* **Gestão de Perfil Admin:** Alteração de dados e senha, com bloqueio de exclusão da própria conta para manter a integridade do sistema.
* **Resultados em Tempo Real:** *(Em desenvolvimento)* Acompanhamento de gráficos de votação.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído "Vanilla", sem o uso de frameworks pesados, para demonstrar domínio absoluto sobre os fundamentos da web:

* **HTML5:** Estrutura semântica.
* **CSS3:** Estilização responsiva, Flexbox, CSS Grid e variáveis (Custom Properties) para consistência visual.
* **JavaScript (ES6+):** Lógica assíncrona (`async/await`), consumo de APIs via `Fetch API`, manipulação do DOM e controle de estado local (`localStorage`).

## 📁 Estrutura do Projeto

```text
├── index.html              # Tela principal de votação
├── login.html              # Tela de autenticação e registro
├── admin.html              # Dashboard de resultados (Admin)
├── admin-gerenciar.html    # CRUD de candidatos (Admin)
├── configuracoes.html      # Configurações gerais (Eleitor)
├── historico.html          # Tabela de histórico de votos (Eleitor)
├── perfil.html             # Gestão de perfil (Eleitor)
├── perfil-admin.html       # Gestão de perfil (Admin)
├── style.css               # Folha de estilos global
└── *.js                    # Scripts individuais para cada view (perfil.js, votacao.js, etc.)
````
⚙️ Como Executar o Projeto

* Pré-requisito: Certifique-se de que o Back-end em Spring Boot do projeto esteja em execução na sua máquina, rodando na porta 8081 (http://localhost:8081).

* Clone este repositório.

* Como o projeto utiliza apenas HTML, CSS e JS puros, você não precisa instalar dependências (Node.js, npm, etc).

* Abra a pasta do projeto em sua IDE (como VS Code).

* Inicie um servidor estático local (recomenda-se a extensão Live Server do VS Code) no arquivo login.html.

* O navegador abrirá automaticamente a aplicação.

🔒 Segurança Front-end

* Verificação constante de tokens/IDs no localStorage para proteção de rotas.

* Redirecionamentos automáticos em caso de acessos indevidos.

* Limpeza de cache e armazenamento local ao realizar logout ou exclusão de conta.
