const rootElement = document.getElementById("root")!;
const ownerWindow = rootElement.ownerDocument.defaultView;
const startApp = async () => {
  if (!ownerWindow) {
    return;
  }
  ownerWindow.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
  if (import.meta.env.DEV) {
    const worker = ownerWindow.navigator.serviceWorker;
    if (worker) {
      try {
        const registrations = await worker.getRegistrations();
        const localRegistrations = registrations.filter(
          (registration) =>
            new ownerWindow.URL(registration.scope).origin ===
            ownerWindow.location.origin,
        );
        await Promise.all(
          localRegistrations.map((registration) => registration.unregister()),
        );
        if (worker.controller && localRegistrations.length) {
          ownerWindow.location.reload();
          return;
        }
      } catch {
        // The editor can still run when service worker access is unavailable.
      }
    }
  }
  try {
    const [React, { createRoot }, { default: ExcalidrawApp }] =
      await Promise.all([
        import("react"),
        import("react-dom/client"),
        import("./App"),
        import("./sentry"),
      ]);
    if (!import.meta.env.DEV) {
      const { registerSW } = await import("virtual:pwa-register");
      registerSW();
    }
    ownerWindow.sessionStorage.removeItem("gratitude-dev-import-retry");
    const root = createRoot(rootElement);
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(ExcalidrawApp),
      ),
    );
  } catch (error) {
    if (
      import.meta.env.DEV &&
      ownerWindow.sessionStorage.getItem("gratitude-dev-import-retry") !== "1"
    ) {
      ownerWindow.sessionStorage.setItem("gratitude-dev-import-retry", "1");
      ownerWindow.location.reload();
      return;
    }
    rootElement.textContent =
      "The editor could not load. Please refresh the page.";
    console.error("Gratitude Studio failed to load", error);
  }
};

void startApp();
