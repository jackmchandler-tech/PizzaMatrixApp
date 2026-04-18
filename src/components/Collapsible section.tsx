import { useEffect, useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  storageKey,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "open") setOpen(true);
      if (saved === "closed") setOpen(false);
    } catch {
      // ignore storage issues
    }
  }, [storageKey]);

  function toggle() {
    setOpen((current) => {
      const next = !current;
      try {
        localStorage.setItem(storageKey, next ? "open" : "closed");
      } catch {
        // ignore storage issues
      }
      return next;
    });
  }

  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: 8,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 14px",
          border: "none",
          background: "#f8fafc",
          cursor: "pointer",
          fontWeight: 700,
          textAlign: "left",
        }}
      >
        <span>{title}</span>
        <span>{open ? "▾" : "▸"}</span>
      </button>

      {open ? <div style={{ padding: 12 }}>{children}</div> : null}
    </div>
  );
}
