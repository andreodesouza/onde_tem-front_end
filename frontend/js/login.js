// js/login.js

const API_URL = "https://onde-tem-back-end.onrender.com"; // Substitua pela sua URL do Render

document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const senha = document.getElementById("login-senha").value;
        const btnSubmit = formLogin.querySelector(".btn-start");

        try {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "A entrar...";

            const resposta = await fetch(`${API_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                }),
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                // Guarda os dados e o token da sessão
                localStorage.setItem("token", resultado.token);
                localStorage.setItem("usuario_logado", JSON.stringify(resultado.usuario));

                // Redireciona com base no tipo retornado pelo back-end
                if (resultado.usuario.tipo === "empresa") {
                    window.location.href = "salao_dashboard.html";
                } else {
                    window.location.href = "user_dashboard.html";
                }
            } else {
                alert(resultado.detail || "E-mail ou palavra-passe incorretos.");
            }
        } catch (error) {
            console.error("Erro ao conectar com o servidor:", error);
            alert("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Entrar";
        }
    });
});