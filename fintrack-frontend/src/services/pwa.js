// Registra o Service Worker responsável pelo funcionamento offline.
// Só é registrado em produção: em desenvolvimento o cache atrapalha
// a atualização automática do Vite.
export function registrarServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!import.meta.env.PROD) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("Service Worker registrado"))
      .catch((error) =>
        console.error("Falha ao registrar o Service Worker:", error)
      );
  });
}
