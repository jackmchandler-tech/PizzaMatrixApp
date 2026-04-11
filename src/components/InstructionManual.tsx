import { useState } from "react";
import { MANUAL_TEXT } from "../constants";

export function InstructionManual() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded bg-slate-700 px-3 py-2 text-white"
        onClick={() => setOpen(true)}
      >
        Instruction Manual
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
              width: "700px",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>Instruction Manual</h2>
              <button
                className="rounded bg-red-600 px-2 py-1 text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
              {MANUAL_TEXT}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
