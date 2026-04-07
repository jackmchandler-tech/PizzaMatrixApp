import { useState } from "react";

const RELEASE_NOTES_TEXT = `1.1.3
- Changed Party History layout from stacked cards to a multi-column grid for faster scanning
- Added design direction for a Person Library to support guest history and guest-specific pizza lookup
- Established groundwork for linking guests to past parties and previously served pizzas

1.1.2
- Fixed missing ReleaseNotes component causing build error
- Added standalone ReleaseNotes modal component
- Integrated Instruction Manual and Release Notes into Library Setup screen
- Added ability to load a party from History into Planner

1.1.1
- Added New Party button with confirmation
- Added Pizza Menu and Party History screens
- Added guest names to planner
- Added version display

1.1.0
- Initial release with pizza planning, libraries, dough, and print view`;

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
