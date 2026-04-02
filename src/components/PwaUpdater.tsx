import { useRegisterSW } from "virtual:pwa-register/react";

export function PwaUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
        maxWidth: 360,
        border: "1px solid #ccc",
        background: "#fff",
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {offlineReady ? (
        <>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Ready offline</div>
          <div style={{ marginBottom: 12 }}>
            Pizza Matrix is installed and ready to work offline.
          </div>
          <button type="button" onClick={() => setOfflineReady(false)}>
            OK
          </button>
        </>
      ) : null}

      {needRefresh ? (
        <>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Update available</div>
          <div style={{ marginBottom: 12 }}>
            A new version is available. Reload when convenient.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => updateServiceWorker(true)}>
              Reload
            </button>
            <button type="button" onClick={() => setNeedRefresh(false)}>
              Later
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
