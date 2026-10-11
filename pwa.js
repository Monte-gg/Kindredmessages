(() => {
  "use strict";

  const installButton = document.querySelector("#install-app-button");
  let installPrompt = null;

  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("Kindred couldn't register its app support.", error);
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;
    installButton.disabled = true;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      installButton.hidden = true;
    } catch (error) {
      console.error("Kindred couldn't open the app install prompt.", error);
    } finally {
      installButton.disabled = false;
    }
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
  });
})();
