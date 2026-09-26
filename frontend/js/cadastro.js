// js/cadastro.js

const API_URL = "https://onde-tem-back-end.onrender.com"; // Substitua pela sua URL do Render

document.addEventListener("DOMContentLoaded", () => {
    const btnCliente = document.getElementById("btn-tipo-cliente");
    const btnEmpresa = document.getElementById("btn-tipo-empresa");
    const formCliente = document.getElementById("form-cad-cliente");
    const formEmpresa = document.getElementById("form-cad-empresa");

    let tipoSelecionado = "cliente";

    // Alternar abas visualmente
    btnCliente.addEventListener("click", () => {
        tipoSelecionado = "cliente";
        btnCliente.classList.add("active");
        btnEmpresa.classList.remove("active");
        formCliente.style.display = "flex";
        formEmpresa.style.display = "none";
    });

    btnEmpresa.addEventListener("click", () => {
        tipoSelecionado = "empresa";
        btnEmpresa.classList.add("active");
        btnCliente.classList.remove("active");
        formEmpresa.style.display = "flex";
        formCliente.style.display = "none";
    });

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