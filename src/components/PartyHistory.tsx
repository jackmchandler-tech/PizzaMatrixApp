import type { AppData } from "../types";

interface PartyHistoryProps {
  data: AppData;
  onLoadParty?: (partyId: string) => void;
}

export function PartyHistory({ data, onLoadParty }: PartyHistoryProps) {
  return (
    <div style={{ padding: 16 }}>
      <h2>Party History</h2>

      {data.partyHistory.length === 0 ? (
        <div>No saved parties yet.</div>
      ) : (
        data.partyHistory
          .slice()
          .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
          .map((party) => (
            <div
              key={party.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                marginBottom: 12,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div><strong>Date:</strong> {party.date || "—"}</div>
                  <div><strong>Diners:</strong> {party.diners}</div>
                  {party.guestNames ? (
                    <div><strong>Guests:</strong> {party.guestNames}</div>
                  ) : null}
                </div>

                {onLoadParty ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => onLoadParty(party.id)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: "#1d4ed8",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Load into Planner
                    </button>
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: 8 }}>
                <strong>Pizzas Served:</strong>
                <ul style={{ marginTop: 6 }}>
                  {party.pizzas.map((pizza, index) => (
                    <li key={index}>
                      {pizza.quantity} × {pizza.pizzaName}
                      {pizza.sizeName ? ` (${pizza.sizeName})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
      )}
    </div>
  );
}
