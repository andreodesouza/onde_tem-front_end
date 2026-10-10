const VAPID_PUBLIC_KEY = "SUA_CHAVE_VAPID_PUBLICA_AQUI";

if ("serviceWorker" in navigator && "PushManager" in window) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registado com sucesso:", registration.scope);
      inicializarNotificacoes(registration);
    } catch (err) {
      console.error("Falha ao registar o Service Worker:", err);
    }
  });
}

function inicializarNotificacoes(registration) {
  const btnNotificacao = document.getElementById("btn-notificacao");
  if (!btnNotificacao) return;

  btnNotificacao.addEventListener("click", async () => {
    const permissao = await Notification.requestPermission();
    if (permissao === "granted") {
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        // Envia a subscrição para o FastAPI
        await enviarSubscricaoParaBackend(subscription);
        alert("Notificações ativadas com sucesso!");
      } catch (error) {
        console.error("Erro ao subscrever às notificações:", error);
      }
    } else {
      alert("Permissão de notificação negada.");
    }
  });
}

async function enviarSubscricaoParaBackend(subscription) {
  const API_URL = "https://seu-backend-no-render.onrender.com"; // Substitua pela sua URL do Render
  await fetch(`${API_URL}/api/push-subscription`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}