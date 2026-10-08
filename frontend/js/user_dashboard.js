// Força a recarga da página caso o utilizador use o botão "Voltar" do navegador
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});

const usuarioLogado = localStorage.getItem('usuarioLogado') ||
    localStorage.getItem('usuario_logado') ||
    sessionStorage.getItem('usuarioLogado');

if (!usuarioLogado) {
    // Cria a estrutura do Modal Moderno
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: 'Poppins', sans-serif;
        animation: fadeIn 0.3s ease;
    `;

    const modalBox = document.createElement('div');
    modalBox.style.cssText = `
        background: #ffffff;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 380px;
        text-align: center;
        transform: scale(0.9);
        animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    modalBox.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
        <h3 style="color: #2d3748; font-size: 20px; font-weight: 600; margin-bottom: 8px;">Acesso Restrito</h3>
        <p style="color: #718096; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
            Você precisa estar conectado à sua conta para aceder a esta página.
        </p>
        <button id="btn-ir-login" style="
            background: #6c5ce7;
            color: white;
            border: none;
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        ">Fazer Login</button>
    `;

    // Injeta estilos de animação na página
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);

    modalOverlay.appendChild(modalBox);
    document.body.appendChild(modalOverlay);

    // Redireciona ao clicar no botão ou automaticamente após 3 segundos
    const redirecionar = () => {
        window.location.href = 'login.html';
    };

    document.getElementById('btn-ir-login').addEventListener('click', redirecionar);
    setTimeout(redirecionar, 3000);

    // Interrompe a execução do resto do script caso não esteja logado
    throw new Error("Acesso negado.");
}

const agendamentos = [
    {
        id: 1,
        servico: "Corte de cabelo",
        data: "24 de maio 2026",
        hora: "10:00",
        duracao: "60 min",
        status: "agendado"
    },
    {
        id: 2,
        servico: "Corte de cabelo",
        data: "24 de maio 2026",
        hora: "10:00",
        duracao: "60 min",
        status: "pendente"
    }
];

const historico = [
    { id: 3, servico: "Manicure", data: "02 de maio 2026", hora: "14:00", duracao: "45 min", status: "finalizado" },
    { id: 4, servico: "Sobrancelha", data: "18 de abril 2026", hora: "16:30", duracao: "30 min", status: "finalizado" },
    { id: 5, servico: "Hidratação", data: "04 de abril 2026", hora: "11:00", duracao: "50 min", status: "finalizado" },
    { id: 6, servico: "Escova", data: "21 de março 2026", hora: "09:30", duracao: "40 min", status: "finalizado" }
];

const saloes = [
    {
        id: 1,
        nome: "Studio Bella Donna",
        nota: "4.8",
        endereco: "Avenida Sayonara nº 200",
        servicos: "Cabelo • Unhas • Hidratação",
        foto: "assets/img/saloes/bella.jpg",
        favorito: false
    },
    {
        id: 2,
        nome: "Espaço Lumière",
        nota: "4.9",
        endereco: "Rua das Acácias nº 85",
        servicos: "Cabelo • Escova • Coloração",
        foto: "assets/img/saloes/lumiere.jpg",
        favorito: false
    },
    {
        id: 3,
        nome: "Nail & Co",
        nota: "4.7",
        endereco: "Avenida Central nº 410",
        servicos: "Unhas • Sobrancelha • Spa",
        foto: "assets/img/saloes/nail.jpg",
        favorito: false
    },
    {
        id: 4,
        nome: "Casa da Beleza",
        nota: "4.6",
        endereco: "Rua do Comércio nº 122",
        servicos: "Cabelo • Barba • Hidratação",
        foto: "assets/img/saloes/casa.jpg",
        favorito: false
    }
];

let listaCompleta = false;

const iconeServico = `
<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
  <path d="M30 14c2-6 1-10-2-12 4 1 8 5 9 11" stroke="#472969" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 34c-4 1-8 5-8 10h22c0-6-3-10-8-12" stroke="#472969" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M20 33c-1-8 1-16 8-20 2 6 1 12-2 16" stroke="#472969" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="27" cy="22" r="5.5" stroke="#472969" stroke-width="1.6"/>
  <path d="M14 16l1.2 2.4 2.6.2-2 1.7.6 2.5L14 21.4 11.6 22.8l.6-2.5-2-1.7 2.6-.2L14 16z" fill="#472969"/>
  <path d="M36 20l.8 1.6 1.8.1-1.4 1.1.4 1.7-1.6-.9-1.6.9.4-1.7-1.4-1.1 1.8-.1L36 20z" fill="#472969"/>
</svg>`;

const iconeCalendario = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/>
  <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

const iconeRelogio = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" stroke-width="1.7"/>
  <path d="M12 8.2V12l2.6 1.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

function obterUsuario() {
    try {
        return JSON.parse(localStorage.getItem("usuario_logado") || localStorage.getItem("usuarioLogado")) || null;
    } catch (error) {
        return null;
    }
}

function chaveAvatar(usuario) {
    const id = usuario && (usuario.email || usuario.id || usuario.nome);
    return id ? `avatar_${id}` : "avatar_visitante";
}

function fotoSalva(usuario) {
    return localStorage.getItem(chaveAvatar(usuario)) || (usuario && usuario.foto) || "";
}

function aplicarAvatar(foto) {
    const temFoto = Boolean(foto);

    [
        ["btn-avatar", "avatar-img", "avatar-vazio"],
        ["avatar-perfil", "avatar-perfil-img", "avatar-perfil-vazio"]
    ].forEach(([caixaId, imgId, vazioId]) => {
        const caixa = document.getElementById(caixaId);
        const img = document.getElementById(imgId);
        const vazio = document.getElementById(vazioId);

        if (!caixa || !img || !vazio) return;

        caixa.classList.toggle("tem-foto", temFoto);
        vazio.hidden = temFoto;
        vazio.style.display = temFoto ? "none" : "";

        if (temFoto) {
            img.src = foto;
            img.hidden = false;
        } else {
            img.removeAttribute("src");
            img.hidden = true;
        }
    });

    const btnRemover = document.getElementById("btn-remover-foto");
    if (btnRemover) btnRemover.hidden = !temFoto;
}

function salvarFoto(usuario, foto) {
    const chave = chaveAvatar(usuario);
    if (foto) localStorage.setItem(chave, foto);
    else localStorage.removeItem(chave);

    if (!usuario) return;
    if (foto) usuario.foto = foto;
    else delete usuario.foto;
    localStorage.setItem("usuario_logado", JSON.stringify(usuario));
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function lerFotoArquivo(arquivo) {
    return new Promise((resolve, reject) => {
        if (!arquivo || !arquivo.type.startsWith("image/")) {
            reject(new Error("Escolha um arquivo de imagem."));
            return;
        }

        const leitor = new FileReader();
        leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
        leitor.onload = () => {
            const imagem = new Image();
            imagem.onerror = () => reject(new Error("Não foi possível ler a imagem."));
            imagem.onload = () => {
                const lado = 256;
                const canvas = document.createElement("canvas");
                canvas.width = lado;
                canvas.height = lado;
                const escala = Math.max(lado / imagem.width, lado / imagem.height);
                const largura = imagem.width * escala;
                const altura = imagem.height * escala;
                canvas.getContext("2d").drawImage(
                    imagem,
                    (lado - largura) / 2,
                    (lado - altura) / 2,
                    largura,
                    altura
                );
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            imagem.src = leitor.result;
        };
        leitor.readAsDataURL(arquivo);
    });
}

function mostrarMensagemSenha(texto, erro) {
    const msg = document.getElementById("form-senha-msg");
    if (!msg) return;
    msg.textContent = texto;
    msg.classList.toggle("is-erro", Boolean(erro));
    msg.hidden = !texto;
}

function nomeExibicao(usuario) {
    if (!usuario) return "visitante";
    return usuario.nome || usuario.nome_fantasia || "visitante";
}

function atualizarStats() {
    const elAgendados = document.getElementById("stat-agendamentos");
    const elConfirmados = document.getElementById("stat-confirmados");
    const elFinalizados = document.getElementById("stat-finalizados");

    if (elAgendados) elAgendados.textContent = String(agendamentos.length);
    if (elConfirmados) elConfirmados.textContent = String(agendamentos.filter((item) => item.status === "agendado").length);
    if (elFinalizados) elFinalizados.textContent = String(historico.length);
}

function acaoDoItem(item) {
    if (item.status === "pendente") {
        return `<button type="button" class="btn-confirmar" data-id="${item.id}">Confirmar</button>`;
    }

    if (item.status === "finalizado") {
        return `<span class="badge finalizado">Finalizado</span>`;
    }

    return `<span class="badge">Agendado</span>`;
}

function renderItem(item) {
    return `
    <article class="agendamento">
      <div class="agendamento-icone">${iconeServico}</div>
      <div class="agendamento-info">
        <div class="agendamento-meta">
          <span>${iconeCalendario} ${item.data}</span>
          <span>${iconeRelogio} ${item.hora}</span>
        </div>
        <h3>${item.servico}</h3>
        <p>${item.duracao}</p>
      </div>
      <div class="agendamento-acao">${acaoDoItem(item)}</div>
    </article>`;
}

function termoBusca() {
    const input = document.getElementById("busca-procedimento");
    return input ? input.value.trim().toLowerCase() : "";
}

function escapar(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function filtrarPorServico(lista) {
    const termo = termoBusca();
    if (!termo) return lista.slice();
    return lista.filter((item) => item.servico.toLowerCase().includes(termo));
}

function filtrarSaloes() {
    const termo = termoBusca();
    if (!termo) return saloes.slice();
    return saloes.filter((salao) => {
        const campos = `${salao.nome} ${salao.endereco} ${salao.servicos}`.toLowerCase();
        return campos.includes(termo);
    });
}

const iconeCoracao = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 19.4l-1.1-1C6.2 14.2 3.5 11.7 3.5 8.6 3.5 6.2 5.3 4.4 7.7 4.4c1.4 0 2.7.6 3.6 1.7.9-1.1 2.2-1.7 3.6-1.7 2.4 0 4.2 1.8 4.2 4.2 0 3.1-2.7 5.6-7.4 9.8L12 19.4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
</svg>`;

const iconeEstrela = `
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 3.6l2.2 4.6 5 .7-3.6 3.5.9 5.1L12 15.1 7.5 17.5l.9-5.1L4.8 8.9l5-.7L12 3.6z"/>
</svg>`;

function renderSalao(salao) {
    const ativo = salao.favorito ? " is-ativo" : "";
    const pressionado = salao.favorito ? "true" : "false";
    const rotulo = salao.favorito ? "Remover dos favoritos" : "Salvar nos favoritos";

    return `
    <article class="salao">
      <div class="salao-capa">
        <img src="${escapar(salao.foto)}" alt="">
        <button type="button" class="salao-favorito${ativo}" data-id="${salao.id}" aria-pressed="${pressionado}" aria-label="${escapar(rotulo)}: ${escapar(salao.nome)}">
          ${iconeCoracao}
        </button>
        <div class="salao-info">
          <div class="salao-linha">
            <h3>${escapar(salao.nome)}</h3>
            <span class="salao-nota">${iconeEstrela} ${escapar(salao.nota)}</span>
          </div>
          <p>${escapar(salao.endereco)}</p>
          <p>${escapar(salao.servicos)}</p>
        </div>
      </div>
      <div class="salao-acoes">
        <button type="button" class="btn-salao" data-acao="agendar" data-id="${salao.id}">Agendar</button>
        <button type="button" class="btn-salao" data-acao="perfil" data-id="${salao.id}">Conhecer perfil</button>
      </div>
    </article>`;
}

function renderSaloes() {
    const lista = document.getElementById("lista-saloes");
    if (!lista) return;
    const encontrados = filtrarSaloes();

    lista.innerHTML = encontrados.length
        ? encontrados.map(renderSalao).join("")
        : `<p class="saloes-vazio">Nenhum salão encontrado perto de você.</p>`;
}

function renderListas() {
    const proximos = filtrarPorServico(agendamentos);
    const listaProximos = document.getElementById("lista-proximos");
    const listaAgendamentos = document.getElementById("lista-agendamentos");
    const origem = listaCompleta ? agendamentos.concat(historico) : agendamentos;
    const visiveis = filtrarPorServico(origem);

    if (listaProximos) {
        listaProximos.innerHTML = proximos.length
            ? proximos.map(renderItem).join("")
            : `<p class="lista-vazia">Nenhum procedimento encontrado.</p>`;
    }

    if (listaAgendamentos) {
        listaAgendamentos.innerHTML = visiveis.length
            ? visiveis.map(renderItem).join("")
            : `<p class="lista-vazia">Nenhum procedimento encontrado.</p>`;
    }

    const verTodosAg = document.getElementById("ver-todos-agendamentos");
    if (verTodosAg) verTodosAg.textContent = listaCompleta ? "Ver menos" : "Ver todos >";

    renderSaloes();
    atualizarStats();
}

function mostrarView(nome) {
    document.querySelectorAll(".view").forEach((view) => {
        view.hidden = view.id !== `view-${nome}`;
    });

    document.querySelectorAll(".menu-item").forEach((botao) => {
        botao.classList.toggle("is-active", botao.dataset.view === nome);
    });

    const conteudo = document.querySelector(".conteudo");
    if (conteudo) conteudo.scrollTop = 0;
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = obterUsuario();
    const nome = nomeExibicao(usuario);

    const elSidebarNome = document.getElementById("sidebar-nome");
    const elMainNome = document.getElementById("main-nome");
    const elAgendamentosNome = document.getElementById("agendamentos-nome");
    const elPerfilNome = document.getElementById("perfil-nome");
    const elPerfilEmail = document.getElementById("perfil-email");
    const elPerfilTelefone = document.getElementById("perfil-telefone");

    if (elSidebarNome) elSidebarNome.textContent = nome;
    if (elMainNome) elMainNome.textContent = nome;
    if (elAgendamentosNome) elAgendamentosNome.textContent = nome;
    if (elPerfilNome) elPerfilNome.textContent = nome === "visitante" ? "—" : nome;
    if (elPerfilEmail) elPerfilEmail.textContent = usuario && usuario.email ? usuario.email : "—";
    if (elPerfilTelefone) elPerfilTelefone.textContent = usuario && usuario.telefone ? usuario.telefone : "—";

    aplicarAvatar(fotoSalva(usuario));
    renderListas();

    const buscaProc = document.getElementById("busca-procedimento");
    if (buscaProc) {
        buscaProc.addEventListener("input", () => {
            const viewAtiva = document.querySelector(".view:not([hidden])");
            if (!viewAtiva || viewAtiva.id !== "view-agendamentos") {
                mostrarView("dashboard");
            }
            renderListas();
        });
    }

    function confirmarAgendamento(evento) {
        const botao = evento.target.closest(".btn-confirmar");
        if (!botao) return;

        const item = agendamentos.find((agendamento) => agendamento.id === Number(botao.dataset.id));
        if (!item) return;

        item.status = "agendado";
        renderListas();
    }

    const listaProx = document.getElementById("lista-proximos");
    if (listaProx) listaProx.addEventListener("click", confirmarAgendamento);

    const listaAg = document.getElementById("lista-agendamentos");
    if (listaAg) listaAg.addEventListener("click", confirmarAgendamento);

    const btnVerTodos = document.getElementById("ver-todos");
    if (btnVerTodos) {
        btnVerTodos.addEventListener("click", () => {
            if (buscaProc) buscaProc.value = "";
            listaCompleta = true;
            renderListas();
            mostrarView("agendamentos");
        });
    }

    const btnVerTodosAg = document.getElementById("ver-todos-agendamentos");
    if (btnVerTodosAg) {
        btnVerTodosAg.addEventListener("click", () => {
            listaCompleta = !listaCompleta;
            renderListas();
        });
    }

    const listaSal = document.getElementById("lista-saloes");
    if (listaSal) {
        listaSal.addEventListener("click", (evento) => {
            const favorito = evento.target.closest(".salao-favorito");
            if (!favorito) return;

            const salao = saloes.find((item) => item.id === Number(favorito.dataset.id));
            if (!salao) return;

            salao.favorito = !salao.favorito;
            renderSaloes();
        });
    }

    document.querySelectorAll(".menu-item").forEach((botao) => {
        botao.addEventListener("click", () => {
            if (botao.dataset.view === "agendamentos") listaCompleta = false;
            mostrarView(botao.dataset.view);
            renderListas();
        });
    });

    const btnAvatar = document.getElementById("btn-avatar");
    if (btnAvatar) {
        btnAvatar.addEventListener("click", () => {
            mostrarView("perfil");
        });
    }

    const inputFoto = document.getElementById("input-foto");
    if (inputFoto) {
        inputFoto.addEventListener("change", async (evento) => {
            const arquivo = evento.target.files && evento.target.files[0];
            evento.target.value = "";
            if (!arquivo) return;

            try {
                const foto = await lerFotoArquivo(arquivo);
                salvarFoto(usuario, foto);
                aplicarAvatar(foto);
            } catch (error) {
                alert(error.message || "Não foi possível usar essa imagem.");
            }
        });
    }

    const btnRemoverFoto = document.getElementById("btn-remover-foto");
    if (btnRemoverFoto) {
        btnRemoverFoto.addEventListener("click", () => {
            salvarFoto(usuario, "");
            aplicarAvatar("");
        });
    }

    const formSenha = document.getElementById("form-senha");
    const btnTrocarSenha = document.getElementById("btn-trocar-senha");
    if (btnTrocarSenha && formSenha) {
        btnTrocarSenha.addEventListener("click", () => {
            formSenha.hidden = false;
            mostrarMensagemSenha("");
            const senhaAtual = document.getElementById("senha-atual");
            if (senhaAtual) senhaAtual.focus();
        });
    }

    const btnCancelarSenha = document.getElementById("btn-cancelar-senha");
    if (btnCancelarSenha && formSenha) {
        btnCancelarSenha.addEventListener("click", () => {
            formSenha.reset();
            formSenha.hidden = true;
            mostrarMensagemSenha("");
        });
    }

    if (formSenha) {
        formSenha.addEventListener("submit", (evento) => {
            evento.preventDefault();
            const atual = document.getElementById("senha-atual").value;
            const nova = document.getElementById("senha-nova").value;
            const confirma = document.getElementById("senha-confirma").value;

            if (nova.length < 6) {
                mostrarMensagemSenha("A nova senha precisa ter pelo menos 6 caracteres.", true);
                return;
            }

            if (nova !== confirma) {
                mostrarMensagemSenha("A confirmação não é igual à nova senha.", true);
                return;
            }

            if (nova === atual) {
                mostrarMensagemSenha("Escolha uma senha diferente da atual.", true);
                return;
            }

            if (!usuario) {
                mostrarMensagemSenha("Entre na sua conta para trocar a senha.", true);
                return;
            }

            if (usuario.senha && usuario.senha !== atual) {
                mostrarMensagemSenha("A senha atual não confere.", true);
                return;
            }

            usuario.senha = nova;
            localStorage.setItem("usuario_logado", JSON.stringify(usuario));
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            formSenha.reset();
            formSenha.hidden = true;
            mostrarMensagemSenha("Senha atualizada.");
        });
    }

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            // Limpa todas as chaves possíveis de sessão para evitar cache de login
            localStorage.removeItem("token");
            localStorage.removeItem("usuario_logado");
            localStorage.removeItem("usuarioLogado");
            sessionStorage.removeItem("usuarioLogado");
            window.location.href = "login.html";
        });
    }
});