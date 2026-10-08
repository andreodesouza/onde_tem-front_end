const API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8000"
    : "https://onde-tem-back-end.onrender.com";

let emailRedefinicaoPendente = "";

// Função para exibir notificações flutuantes formatadas corretamente
function mostrarAviso(mensagem, tipo = "sucesso") {
    const toastAntigo = document.querySelector(".custom-toast");
    if (toastAntigo) toastAntigo.remove();

    let textoMensagem = mensagem;
    if (typeof mensagem === "object" && mensagem !== null) {
        textoMensagem = mensagem.detail || JSON.stringify(mensagem);
    }

    const toast = document.createElement("div");
    toast.className = `custom-toast ${tipo}`;

    const icone = tipo === "sucesso" ? "✨" : "⚠️";
    toast.innerHTML = `<span>${icone}</span> <span>${textoMensagem}</span>`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "fadeOutRight 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
    const formSolicitacao = document.getElementById("form-solicitacao-senha");
    const painelAtivacao = document.getElementById("painel-ativacao");
    const headerRedefinicao = document.getElementById("header-redefinicao");
    const formRedefinicao = document.getElementById("form-redefinicao");

    if (!formSolicitacao) return;

    // Ativa a validação em tempo real exatamente igual à de cadastro[cite: 11]
    ativarValidacaoEmTempoReal();

    // 1. Passo: Enviar o e-mail para solicitar o código de recuperação
    formSolicitacao.addEventListener("submit", async (e) => {
        e.preventDefault();
        const inputEmail = document.getElementById("email-redefinicao");
        emailRedefinicaoPendente = inputEmail.value.trim();

        if (!emailRedefinicaoPendente) {
            mostrarAviso("Insira o seu e-mail.", "erro");
            return;
        }

        try {
            const resposta = await fetch(`${API_URL}/api/solicitar-recuperacao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailRedefinicaoPendente })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                mostrarAviso(resultado.mensagem || "Código de recuperação enviado para o e-mail!", "sucesso");
                formSolicitacao.style.display = "none";
                if (headerRedefinicao) headerRedefinicao.style.display = "none";
                if (painelAtivacao) painelAtivacao.style.display = "block";
            } else {
                const erroMsg = resultado.detail || resultado.mensagem || "Erro ao solicitar recuperação.";
                mostrarAviso(erroMsg, "erro");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            mostrarAviso("Não foi possível conectar ao servidor.", "erro");
        }
    });

    // 2. Passo: Enviar o código de 6 dígitos e definir a nova senha
    if (formRedefinicao) {
        formRedefinicao.addEventListener("submit", async (e) => {
            e.preventDefault();
            const codigo = document.getElementById("codigo-ativacao").value.trim();
            const novaSenha = document.getElementById("nova-senha").value;
            const confirmarSenha = document.getElementById("confirmar-nova-senha").value;

            if (!novaSenha || !confirmarSenha) {
                mostrarAviso("Preencha a senha e a confirmação de senha.", "erro");
                return;
            }

            if (novaSenha !== confirmarSenha) {
                mostrarAviso("A senha e a confirmação de senha não coincidem.", "erro");
                return;
            }

            if (!validarForcaSenha(novaSenha)) {
                mostrarAviso("A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.", "erro");
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/api/redefinir-senha`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailRedefinicaoPendente,
                        codigo: codigo,
                        nova_senha: novaSenha
                    })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    mostrarAviso(resultado.mensagem || "Senha redefinida com sucesso!", "sucesso");
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    const erroMsg = resultado.detail || resultado.mensagem || "Código inválido ou expirado.";
                    mostrarAviso(erroMsg, "erro");
                }
            } catch (error) {
                console.error("Erro na redefinição:", error);
                mostrarAviso("Erro ao redefinir a senha.", "erro");
            }
        });
    }
});

function ativarValidacaoEmTempoReal() {
    const senhaInput = document.getElementById("nova-senha");
    const confirmarInput = document.getElementById("confirmar-nova-senha");
    const feedback = document.getElementById("senha-feedback");

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

function validarForcaSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    return regex.test(senha);
}