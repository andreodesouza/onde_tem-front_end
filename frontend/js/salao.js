// js/salao.js

// Substitua pelo endereço real do backend quando estiver no ar (ou deixe localhost em dev)
const API_URL = "https://onde-tem-back-end.onrender.com";

let carrinhoServicos = [];

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const salaoId = urlParams.get("id");

  if (!salaoId) {
    alert("Nenhum salão selecionado!");
    window.location.href = "index.html";
    return;
  }

  carregarDadosSalao(salaoId);
});

async function carregarDadosSalao(id) {
  try {
    // CORREÇÃO: Adicionado o "/api" antes de /saloes/
    const res = await fetch(`${API_URL}/api/saloes/${id}`);
    if (!res.ok) throw new Error("Erro ao buscar dados do estabelecimento.");

    const salao = await res.json();
    renderizarDetalhes(salao);
    renderizarServicos(salao.servicos_detalhados || []);
  } catch (error) {
    console.error(error);
    document.getElementById("salao-nome").innerText = "Estabelecimento não encontrado.";
  }
}

function renderizarDetalhes(salao) {
  document.title = `${salao.nome} — Onde Tem?`;
  document.getElementById("salao-nome").innerText = salao.nome;
  document.getElementById("salao-banner").src = salao.img;
  document.getElementById("salao-especialidades").innerText = salao.servicos;
  document.getElementById("salao-endereco").innerText = `📍 ${salao.endereco || "Endereço não informado"}`;
  document.getElementById("salao-horario").innerText = `🕒 ${salao.horario || "Horário a consultar"}`;
  document.getElementById("salao-rating").innerText = salao.avaliacao?.toFixed(1) || "5.0";
  document.getElementById("salao-reviews").innerText = `(${salao.total_avaliacoes || 0})`;

  const btnWhats = document.getElementById("btn-whatsapp");
  if (salao.telefone) {
    const numLimpo = salao.telefone.replace(/\D/g, "");
    btnWhats.href = `https://wa.me/55${numLimpo}?text=Olá,%20vi%20o%20${encodeURIComponent(salao.nome)}%20no%20Onde%20Tem!`;
  } else {
    btnWhats.style.display = "none";
  }
}

function renderizarServicos(servicos) {
  const container = document.getElementById("lista-servicos");
  container.innerHTML = "";

  if (servicos.length === 0) {
    container.innerHTML = "<p>Nenhum serviço disponível no momento.</p>";
    return;
  }

  servicos.forEach(servico => {
    const card = document.createElement("div");
    card.className = "item-servico";

    card.innerHTML = `
      <div class="servico-detalhes">
        <h3>${servico.nome}</h3>
        <p>${servico.descricao}</p>
        <span class="servico-meta">⏱️ Duração média: ${servico.duracao_min} min</span>
      </div>
      <div class="servico-acao">
        <span class="servico-preco">R$ ${servico.preco.toFixed(2).replace('.', ',')}</span>
        <button class="btn-selecionar" id="btn-srv-${servico.id}" onclick="alternarServico('${servico.id}', '${servico.nome}', ${servico.preco})">
          Adicionar
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

function alternarServico(id, nome, preco) {
  const index = carrinhoServicos.findIndex(s => s.id === id);
  const btn = document.getElementById(`btn-srv-${id}`);

  if (index > -1) {
    carrinhoServicos.splice(index, 1);
    btn.classList.remove("selecionado");
    btn.innerText = "Adicionar";
  } else {
    carrinhoServicos.push({ id, nome, preco });
    btn.classList.add("selecionado");
    btn.innerText = "Remover";
  }

  atualizarResumo();
}

function atualizarResumo() {
  const containerResumo = document.getElementById("itens-selecionados");
  const elementoTotal = document.getElementById("valor-total");
  const btnContinuar = document.getElementById("btn-continuar-agendamento");

  if (carrinhoServicos.length === 0) {
    containerResumo.innerHTML = '<p class="empty-msg">Nenhum serviço selecionado ainda.</p>';
    elementoTotal.innerText = "R$ 0,00";
    btnContinuar.disabled = true;
    return;
  }

  containerResumo.innerHTML = "";
  let total = 0;

  carrinhoServicos.forEach(item => {
    total += item.preco;
    const linha = document.createElement("div");
    linha.className = "resumo-item";
    linha.innerHTML = `
      <span>${item.nome}</span>
      <strong>R$ ${item.preco.toFixed(2).replace('.', ',')}</strong>
    `;
    containerResumo.appendChild(linha);
  });

  elementoTotal.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
  btnContinuar.disabled = false;
}

document.getElementById("btn-continuar-agendamento").addEventListener("click", () => {
  // Salva os itens escolhidos no sessionStorage para a próxima tela de data/horário
  sessionStorage.setItem("agendamento_itens", JSON.stringify(carrinhoServicos));
  alert("Próxima etapa: Integração com calendário/horários disponíveis!");
});