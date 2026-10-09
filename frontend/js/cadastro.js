const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : "https://onde-tem-back-end.onrender.com";

// Variável para guardar o e-mail durante o fluxo de ativação
let emailCadastroPendente = "";

// Função para exibir notificações modernas flutuantes
function mostrarAviso(mensagem, tipo = "sucesso") {
    const toastAntigo = document.querySelector(".custom-toast");
    if (toastAntigo) toastAntigo.remove();

    const toast = document.createElement("div");
    toast.className = `custom-toast ${tipo}`;

    const icone = tipo === "sucesso" ? "✨" : "⚠️";
    toast.innerHTML = `<span>${icone}</span> <span>${mensagem}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOutRight 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
    const btnCliente = document.getElementById("btn-tipo-cliente");
    const btnEmpresa = document.getElementById("btn-tipo-empresa");
    const formCliente = document.getElementById("form-cad-cliente");
    const formEmpresa = document.getElementById("form-cad-empresa");
    const painelAtivacao = document.getElementById("painel-ativacao");
    const headerCadastro = document.getElementById("header-cadastro");
    const formAtivacao = document.getElementById("form-ativacao");

    if (!btnCliente || !btnEmpresa || !formCliente || !formEmpresa) {
        console.error("Elementos do formulário de cadastro não encontrados.");
        return;
    }

    ativarValidacaoEmTempoReal("cliente");
    ativarValidacaoEmTempoReal("empresa");

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

    // Submissão do Cliente
    formCliente.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validarCadastro("cliente")) return;

        emailCadastroPendente = document.getElementById("cad-email-cliente").value.trim();

        const dados = {
            nome: document.getElementById("cad-nome").value.trim(),
            telefone: document.getElementById("cad-telefone").value.trim(),
            email: emailCadastroPendente,
            senha: document.getElementById("cad-senha-cliente").value,
            tipo: "cliente"
        };

        await enviarCadastro(dados, formCliente, headerCadastro, painelAtivacao);
    });

    // Submissão da Empresa
    formEmpresa.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validarCadastro("empresa")) return;

        emailCadastroPendente = document.getElementById("cad-email-empresa").value.trim();

        const dados = {
            nome_fantasia: document.getElementById("cad-fantasia").value.trim(),
            razao_social: document.getElementById("cad-razao").value.trim(),
            email: emailCadastroPendente,
            senha: document.getElementById("cad-senha-empresa").value,
            tipo: "empresa"
        };

        await enviarCadastro(dados, formEmpresa, headerCadastro, painelAtivacao);
    });

    // Submissão do Código de Ativação
    if (formAtivacao) {
        formAtivacao.addEventListener("submit", async (e) => {
            e.preventDefault();
            const codigo = document.getElementById("codigo-ativacao").value.trim();

            try {
                const resposta = await fetch(`${API_URL}/api/ativar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailCadastroPendente,
                        codigo: codigo
                    })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    mostrarAviso(resultado.mensagem, "sucesso");
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    mostrarAviso(resultado.detail || "Código inválido.", "erro");
                }
            } catch (error) {
                console.error("Erro na ativação:", error);
                mostrarAviso("Erro ao validar o código.", "erro");
            }
        });
    }
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
        mostrarAviso("Preencha a senha e a confirmação de senha.", "erro");
        return false;
    }

    if (senha !== confirmarSenha) {
        mostrarAviso("A senha e a confirmação de senha não coincidem.", "erro");
        return false;
    }

    if (!validarForcaSenha(senha)) {
        mostrarAviso("A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.", "erro");
        return false;
    }

    return true;
}

function validarForcaSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(senha);
}

async function enviarCadastro(dados, formAtivo, headerElement, painelAtivacao) {
    try {
        const resposta = await fetch(`${API_URL}/api/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            mostrarAviso(resultado.mensagem, "sucesso");
            formAtivo.style.display = "none";
            if (headerElement) headerElement.style.display = "none";
            if (painelAtivacao) painelAtivacao.style.display = "block";
        } else {
            mostrarAviso(resultado.detail || "Erro ao realizar cadastro.", "erro");
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        mostrarAviso("Não foi possível conectar ao servidor.", "erro");
    }
}