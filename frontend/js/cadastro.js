// js/cadastro.js

const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"               // URL usada quando você testa localmente
    : "https://onde-tem-back-end.onrender.com"; // URL usada quando o site estiver no ar (ex: Vercel/Render)

document.addEventListener("DOMContentLoaded", () => {
    const btnCliente = document.getElementById("btn-tipo-cliente");
    const btnEmpresa = document.getElementById("btn-tipo-empresa");
    const formCliente = document.getElementById("form-cad-cliente");
    const formEmpresa = document.getElementById("form-cad-empresa");

    let tipoSelecionado = "cliente";

    function selecionarTipo(tipo) {
        tipoSelecionado = tipo;
        const empresa = tipo === "empresa";
        btnCliente.classList.toggle("active", !empresa);
        btnEmpresa.classList.toggle("active", empresa);
        formCliente.style.display = empresa ? "none" : "flex";
        formEmpresa.style.display = empresa ? "flex" : "none";
    }

    btnCliente.addEventListener("click", () => selecionarTipo("cliente"));
    btnEmpresa.addEventListener("click", () => selecionarTipo("empresa"));

    const params = new URLSearchParams(window.location.search);
    if (params.get("tipo") === "empresa") {
        selecionarTipo("empresa");
        const fantasia = document.getElementById("cad-fantasia");
        const responsavel = document.getElementById("cad-razao");
        const emailEmpresa = document.getElementById("cad-email-empresa");
        if (params.get("fantasia")) fantasia.value = params.get("fantasia");
        if (params.get("responsavel")) responsavel.value = params.get("responsavel");
        if (params.get("email")) emailEmpresa.value = params.get("email");
    } else if (params.get("tipo") === "cliente") {
        selecionarTipo("cliente");
    }

    // Enviar Cadastro de Cliente
    formCliente.addEventListener("submit", async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.getElementById("cad-nome").value.trim(),
            telefone: document.getElementById("cad-telefone").value.trim(),
            email: document.getElementById("cad-email-cliente").value.trim(),
            senha: document.getElementById("cad-senha-cliente").value,
            tipo: "cliente"
        };
        await enviarCadastro(dados);
    });

    // Enviar Cadastro de Empresa
    formEmpresa.addEventListener("submit", async (e) => {
        e.preventDefault();
        const dados = {
            nome_fantasia: document.getElementById("cad-fantasia").value.trim(),
            razao_social: document.getElementById("cad-razao").value.trim(),
            email: document.getElementById("cad-email-empresa").value.trim(),
            senha: document.getElementById("cad-senha-empresa").value,
            tipo: "empresa"
        };
        await enviarCadastro(dados);
    });
});

async function enviarCadastro(dados) {
    try {
        const resposta = await fetch(`${API_URL}/api/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            window.location.href = "login.html";
        } else {
            alert(resultado.detail || "Erro ao realizar cadastro.");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Não foi possível conectar ao servidor.");
    }
}