import { useState } from "react";
import { RELEASE_NOTES_TEXT } from "../constants";

export function ReleaseNotes() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded bg-slate-700 px-3 py-2 text-white"
        onClick={() => setOpen(true)}
      >
        Release Notes
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2>Release Notes</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ padding: "4px 8px" }}
              >
                Close
              </button>
            </div>

            <pre style={{ whiteSpace: "pre-wrap" }}>
              {RELEASE_NOTES_TEXT}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
