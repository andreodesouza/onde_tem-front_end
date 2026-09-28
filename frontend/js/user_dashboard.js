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
        return JSON.parse(localStorage.getItem("usuario_logado")) || null;
    } catch (error) {
        return null;
    }
}

function nomeExibicao(usuario) {
    if (!usuario) return "visitante";
    return usuario.nome || usuario.nome_fantasia || "visitante";
}

function atualizarStats() {
    document.getElementById("stat-agendamentos").textContent = String(agendamentos.length);
    document.getElementById("stat-confirmados").textContent = String(
        agendamentos.filter((item) => item.status === "agendado").length
    );
    document.getElementById("stat-finalizados").textContent = String(historico.length);
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
    return document.getElementById("busca-procedimento").value.trim().toLowerCase();
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

    listaProximos.innerHTML = proximos.length
        ? proximos.map(renderItem).join("")
        : `<p class="lista-vazia">Nenhum procedimento encontrado.</p>`;

    listaAgendamentos.innerHTML = visiveis.length
        ? visiveis.map(renderItem).join("")
        : `<p class="lista-vazia">Nenhum procedimento encontrado.</p>`;

    document.getElementById("ver-todos-agendamentos").textContent = listaCompleta ? "Ver menos" : "Ver todos >";
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

    document.querySelector(".conteudo").scrollTop = 0;
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = obterUsuario();
    const nome = nomeExibicao(usuario);

    document.getElementById("sidebar-nome").textContent = nome;
    document.getElementById("main-nome").textContent = nome;
    document.getElementById("agendamentos-nome").textContent = nome;
    document.getElementById("perfil-nome").textContent = nome === "visitante" ? "—" : nome;
    document.getElementById("perfil-email").textContent = usuario && usuario.email ? usuario.email : "—";

    renderListas();

    document.getElementById("busca-procedimento").addEventListener("input", () => {
        const viewAtiva = document.querySelector(".view:not([hidden])");
        if (!viewAtiva || viewAtiva.id !== "view-agendamentos") {
            mostrarView("dashboard");
        }
        renderListas();
    });

    function confirmarAgendamento(evento) {
        const botao = evento.target.closest(".btn-confirmar");
        if (!botao) return;

        const item = agendamentos.find((agendamento) => agendamento.id === Number(botao.dataset.id));
        if (!item) return;

        item.status = "agendado";
        renderListas();
    }

    document.getElementById("lista-proximos").addEventListener("click", confirmarAgendamento);
    document.getElementById("lista-agendamentos").addEventListener("click", confirmarAgendamento);

    document.getElementById("ver-todos").addEventListener("click", () => {
        document.getElementById("busca-procedimento").value = "";
        listaCompleta = true;
        renderListas();
        mostrarView("agendamentos");
    });

    document.getElementById("ver-todos-agendamentos").addEventListener("click", () => {
        listaCompleta = !listaCompleta;
        renderListas();
    });

    document.getElementById("lista-saloes").addEventListener("click", (evento) => {
        const favorito = evento.target.closest(".salao-favorito");
        if (!favorito) return;

        const salao = saloes.find((item) => item.id === Number(favorito.dataset.id));
        if (!salao) return;

        salao.favorito = !salao.favorito;
        renderSaloes();
    });

    document.querySelectorAll(".menu-item").forEach((botao) => {
        botao.addEventListener("click", () => {
            if (botao.dataset.view === "agendamentos") listaCompleta = false;
            mostrarView(botao.dataset.view);
            renderListas();
        });
    });

    document.getElementById("btn-sair").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario_logado");
        window.location.href = "login.html";
    });
});
