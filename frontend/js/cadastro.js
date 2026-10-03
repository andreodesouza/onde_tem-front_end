const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : "https://onde-tem-back-end.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const btnCliente = document.getElementById("btn-tipo-cliente");
    const btnEmpresa = document.getElementById("btn-tipo-empresa");
    const formCliente = document.getElementById("form-cad-cliente");
    const formEmpresa = document.getElementById("form-cad-empresa");

    if (!btnCliente || !btnEmpresa || !formCliente || !formEmpresa) {
        console.error("Elementos do formulário de cadastro não encontrados.");
        return;
    }

    ativarValidacaoEmTempoReal("cliente");
    ativarValidacaoEmTempoReal("empresa");

    btnCliente.addEventListener("click", () => {
        btnCliente.classList.add("active");
        btnEmpresa.classList.remove("active");
        formCliente.style.display = "flex";
        formEmpresa.style.display = "none";
    });

    btnEmpresa.addEventListener("click", () => {
        btnEmpresa.classList.add("active");
        btnCliente.classList.remove("active");
        formEmpresa.style.display = "flex";
        formCliente.style.display = "none";
    });

    formCliente.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validarCadastro("cliente")) {
            return;
        }

        const dados = {
            nome: document.getElementById("cad-nome").value.trim(),
            telefone: document.getElementById("cad-telefone").value.trim(),
            email: document.getElementById("cad-email-cliente").value.trim(),
            senha: document.getElementById("cad-senha-cliente").value,
            tipo: "cliente"
        };

        await enviarCadastro(dados);
    });

    formEmpresa.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validarCadastro("empresa")) {
            return;
        }

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

function ativarValidacaoEmTempoReal(tipo) {
    const senhaId = tipo === "cliente" ? "cad-senha-cliente" : "cad-senha-empresa";
    const confirmarId = tipo === "cliente" ? "cad-confirmar-senha-cliente" : "cad-confirmar-senha-empresa";
    const feedbackId = tipo === "cliente" ? "senha-feedback-cliente" : "senha-feedback-empresa";

    const senhaInput = document.getElementById(senhaId);
    const confirmarInput = document.getElementById(confirmarId);
    const feedback = document.getElementById(feedbackId);

    if (!senhaInput || !feedback) return;

    const atualizar = () => {
        const senha = senhaInput.value;
        const confirmar = confirmarInput ? confirmarInput.value : "";

        if (!senha) {
            feedback.textContent = "";
            feedback.style.color = "";
            return;
        }

        const regras = [
            senha.length >= 8,
            /[a-z]/.test(senha),
            /[A-Z]/.test(senha),
            /\d/.test(senha),
            /[^A-Za-z0-9]/.test(senha),
        ];

        const senhaValida = regras.every(Boolean);

        if (!senhaValida) {
            feedback.textContent = "Senha fraca: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.";
            feedback.style.color = "#d93025";
            return;
        }

        if (confirmar && senha !== confirmar) {
            feedback.textContent = "As senhas não coincidem.";
            feedback.style.color = "#d93025";
            return;
        }

        feedback.textContent = "Senha válida.";
        feedback.style.color = "#188038";
    };

    senhaInput.addEventListener("input", atualizar);
    confirmarInput?.addEventListener("input", atualizar);
}

function validarCadastro(tipo) {
    const senhaId = tipo === "cliente" ? "cad-senha-cliente" : "cad-senha-empresa";
    const confirmarId = tipo === "cliente" ? "cad-confirmar-senha-cliente" : "cad-confirmar-senha-empresa";

    const senha = document.getElementById(senhaId)?.value ?? "";
    const confirmarSenha = document.getElementById(confirmarId)?.value ?? "";

    if (!senha || !confirmarSenha) {
        alert("Preencha a senha e a confirmação de senha.");
        return false;
    }

    if (senha !== confirmarSenha) {
        alert("A senha e a confirmação de senha não coincidem.");
        return false;
    }

    if (!validarForcaSenha(senha)) {
        alert("A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.");
        return false;
    }

    return true;
}

function validarForcaSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(senha);
}

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