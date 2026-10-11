(() => {
  "use strict";

  const installButton = document.querySelector("#install-app-button");
  const updateBanner = document.querySelector("#app-update-banner");
  const applyUpdateButton = document.querySelector("#apply-app-update-button");
  const dismissUpdateButton = document.querySelector("#dismiss-app-update-button");
  let installPrompt = null;
  let waitingWorker = null;
  let dismissedWorker = null;
  let applyingUpdate = false;

  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    const showUpdate = (registration) => {
      if (!navigator.serviceWorker.controller || !registration.waiting || registration.waiting === dismissedWorker) return;
      waitingWorker = registration.waiting;
      updateBanner.hidden = false;
    };
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (applyingUpdate) window.location.reload();
    });
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" })
      .then((registration) => {
        showUpdate(registration);
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") showUpdate(registration);
          });
        });
        return registration.update();
      })
      .catch((error) => {
        console.error("Kindred couldn't check for app updates.", error);
      });
  }

  applyUpdateButton.addEventListener("click", async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      waitingWorker = registration?.waiting || waitingWorker;
      if (!waitingWorker) {
        updateBanner.hidden = true;
        return;
      }
      applyingUpdate = true;
      applyUpdateButton.disabled = true;
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } catch (error) {
      applyingUpdate = false;
      applyUpdateButton.disabled = false;
      console.error("Kindred couldn't apply the waiting app update.", error);
    }
  });

  dismissUpdateButton.addEventListener("click", () => {
    dismissedWorker = waitingWorker;
    waitingWorker = null;
    updateBanner.hidden = true;
  });

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
