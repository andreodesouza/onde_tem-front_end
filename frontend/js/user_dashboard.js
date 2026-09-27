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

function filtrarAgendamentos() {
    const termo = document.getElementById("busca-procedimento").value.trim().toLowerCase();
    if (!termo) return agendamentos.slice();
    return agendamentos.filter((item) => item.servico.toLowerCase().includes(termo));
}

function renderListas() {
    const proximos = filtrarAgendamentos();
    const listaProximos = document.getElementById("lista-proximos");
    const listaTodos = document.getElementById("lista-todos");

    listaProximos.innerHTML = proximos.length
        ? proximos.map(renderItem).join("")
        : `<p class="lista-vazia">Nenhum procedimento encontrado.</p>`;

    const todos = agendamentos.concat(historico);
    listaTodos.innerHTML = todos.map(renderItem).join("");
    atualizarStats();
}

function mostrarView(nome) {
    document.querySelectorAll(".view").forEach((view) => {
        view.hidden = view.id !== `view-${nome}`;
    });

    document.querySelectorAll(".menu-item").forEach((botao) => {
        botao.classList.toggle("is-active", botao.dataset.view === nome);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = obterUsuario();
    const nome = nomeExibicao(usuario);

    document.getElementById("sidebar-nome").textContent = nome;
    document.getElementById("main-nome").textContent = nome;
    document.getElementById("perfil-nome").textContent = nome === "visitante" ? "—" : nome;
    document.getElementById("perfil-email").textContent = usuario && usuario.email ? usuario.email : "—";

    renderListas();

    document.getElementById("busca-procedimento").addEventListener("input", () => {
        mostrarView("dashboard");
        renderListas();
    });

    document.getElementById("lista-proximos").addEventListener("click", (evento) => {
        const botao = evento.target.closest(".btn-confirmar");
        if (!botao) return;

        const item = agendamentos.find((agendamento) => agendamento.id === Number(botao.dataset.id));
        if (!item) return;

        item.status = "agendado";
        renderListas();
    });

    document.getElementById("ver-todos").addEventListener("click", () => {
        document.getElementById("busca-procedimento").value = "";
        renderListas();
        mostrarView("agendamentos");
    });

    document.querySelectorAll(".menu-item").forEach((botao) => {
        botao.addEventListener("click", () => mostrarView(botao.dataset.view));
    });

    document.getElementById("btn-sair").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario_logado");
        window.location.href = "login.html";
    });
});
