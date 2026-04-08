import type { AppData } from "../types";

interface PartyHistoryProps {
  data: AppData;
  onLoadParty?: (partyId: string) => void;
}

export function PartyHistory({ data, onLoadParty }: PartyHistoryProps) {
  function guestLabel(
    selectedGuestIds?: string[],
    guestNames?: string,
  ): string {
    const linkedNames = (selectedGuestIds ?? [])
      .map((id) => data.people.find((person) => person.id === id)?.name)
      .filter((name): name is string => Boolean(name));

    if (linkedNames.length > 0 && guestNames?.trim()) {
      return `${linkedNames.join(", ")} | ${guestNames.trim()}`;
    }

    if (linkedNames.length > 0) {
      return linkedNames.join(", ");
    }

    return guestNames?.trim() || "";
  }

  const sortedHistory = data.partyHistory
    .slice()
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Party History</h2>

      {sortedHistory.length === 0 ? (
        <div>No saved parties yet.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {sortedHistory.map((party) => (
            <div
              key={party.id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                background: "#fff",
                borderRadius: 8,
                minHeight: 180,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <div>
                  <div>
                    <strong>Date:</strong> {party.date || "—"}
                  </div>
                  <div>
                    <strong>Diners:</strong> {party.diners}
                  </div>
                </div>

                {onLoadParty ? (
                  <button
                    type="button"
                    onClick={() => onLoadParty(party.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "#1d4ed8",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      height: "fit-content",
                    }}
                  >
                    Load
                  </button>
                ) : null}
              </div>

              {guestLabel(party.selectedGuestIds, party.guestNames) ? (
                <div style={{ marginBottom: 8 }}>
                  <strong>Guests:</strong>{" "}
                  {guestLabel(party.selectedGuestIds, party.guestNames)}
                </div>
              ) : null}

              <div>
                <strong>Pizzas:</strong>
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  {party.pizzas.map((pizza, index) => (
                    <li key={index}>
                      {pizza.quantity} × {pizza.pizzaName}
                      {pizza.sizeName ? ` (${pizza.sizeName})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
