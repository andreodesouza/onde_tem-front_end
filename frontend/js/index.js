// js/index.js

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://127.0.0.1:8000"               // URL usada quando você testa localmente
  : "https://onde-tem-back-end.onrender.com"; // URL usada quando o site estiver no ar (ex: Vercel/Render)

document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
  carregarSaloesDaAPI();
  configurarFiltrosCategorias();
  configurarBusca();
});

let map;
let marcadores = [];

function inicializarMapa() {
  const elementoMapa = document.getElementById("map");
  if (!elementoMapa) return;

  map = L.map("map", { zoomControl: false }).setView([-22.9345, -42.4951], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 15);
        L.marker([latitude, longitude]).addTo(map).bindPopup("Você está aqui!").openPopup();
      },
      () => {
        console.log("Geolocalização não permitida ou indisponível.");
      }
    );
  }
}

async function carregarSaloesDaAPI() {
  const containerCards = document.getElementById("container-cards");
  if (!containerCards) return;

  try {
    containerCards.innerHTML = "<p>A carregar estabelecimentos...</p>";

    const resposta = await fetch(`${API_URL}/api/saloes`);
    const saloes = resposta.ok ? await resposta.json() : [];

    containerCards.innerHTML = "";

    if (saloes.length === 0) {
      containerCards.innerHTML = "<p class='text-muted'>Nenhum salão encontrado no momento.</p>";
      return;
    }

    saloes.forEach((salao, index) => {
      // Normalizamos os serviços em minúsculas para facilitar a comparação do filtro
      const servicosTexto = (salao.servicos || "").toLowerCase();

      const cardHTML = `
        <div class="card-salao" data-index="${index}" data-servicos="${servicosTexto}">
            <img src="${salao.img || 'assets/img/icon-192.png'}" alt="${salao.nome}" class="card-img">
            <div class="card-body">
                <h3>${salao.nome}</h3>
                <p class="card-text">${salao.servicos}</p>
                <button class="btn-agendar" onclick="abrirAgendamento('${salao.id}', '${salao.nome}')">Agendar</button>
            </div>
        </div>`;
      containerCards.insertAdjacentHTML("beforeend", cardHTML);

      if (salao.lat && salao.lng) {
        const marker = L.marker([salao.lat, salao.lng]).addTo(map);
        marker.bindPopup(`<b>${salao.nome}</b><br>${salao.servicos}`);
        marcadores.push(marker);
      }
    });

  } catch (error) {
    console.error("Erro ao comunicar com o FastAPI:", error);
    containerCards.innerHTML = "<p class='text-danger'>Erro ao carregar dados do servidor.</p>";
  }
}

// Lógica de Filtro por Categorias corrigida e robusta
function configurarFiltrosCategorias() {
  const categorias = document.querySelectorAll(".category-item");

  categorias.forEach((item) => {
    item.addEventListener("click", () => {
      const filtro = item.getAttribute("data-categoria").toLowerCase().trim();
      const cards = document.querySelectorAll(".card-salao");

      // Atualiza a classe ativa visualmente
      categorias.forEach((c) => c.classList.remove("ativo"));
      item.classList.add("ativo");

      cards.forEach((card) => {
        const servicosCard = card.getAttribute("data-servicos") || "";

        if (filtro === "todos" || servicosCard.includes(filtro)) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

function configurarBusca() {
  const inputBusca = document.getElementById("input-busca");
  if (!inputBusca) return;

  inputBusca.addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".card-salao");

    cards.forEach((card) => {
      const titulo = card.querySelector("h3").innerText.toLowerCase();
      const servicos = card.querySelector(".card-text").innerText.toLowerCase();

      if (titulo.includes(termo) || servicos.includes(termo)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
}

let salaoAtualId = "";
let salaoAtualNome = "";

// Substitua a função antiga por esta:
function abrirAgendamento(salaoId, salaoNome) {
  // Redireciona para a página do salão passando o ID como parâmetro na URL
  window.location.href = `salao.html?id=${salaoId}`;
}

function fecharModalAgendamento() {
  const modal = document.getElementById("modal-agendamento");
  if (modal) {
    modal.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formAgendamento = document.getElementById("form-agendamento");
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = document.getElementById("data-agendamento").value;
      const hora = document.getElementById("hora-agendamento").value;

      if (!data || !hora) {
        alert("Por favor, selecione a data e a hora.");
        return;
      }

      try {
        const resposta = await fetch(`${API_URL}/api/agendamentos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            salao_id: salaoAtualId,
            data: data,
            hora: hora,
            cliente_email: "usuario@teste.com"
          })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert(`🎉 Sucesso!\n${resultado.mensagem}\n\nSalão: ${salaoAtualNome}\nData: ${data} às ${hora}`);
          fecharModalAgendamento();
          formAgendamento.reset();
        } else {
          alert(`❌ Erro: ${resultado.detail}`);
        }
      } catch (error) {
        console.error("Erro ao conectar com o servidor:", error);
        alert("Erro ao tentar registrar o agendamento.");
      }
    });
  }
});
