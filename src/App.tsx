import React, { useMemo, useState } from "react";
                          </details>
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="border p-2 align-top">{summary.sauce}</td>
                      <td className="border p-2 align-top">{summary.cheese}</td>
                      <td className="border p-2 align-top">{summary.toppings}</td>
                      <td className="border p-2 align-top">{summary.seasonings}</td>
                      <td className="border p-2 align-top">{summary.postBake}</td>
                      <td className="border p-2 align-top">
                        <textarea
                          value={row.notes ?? ""}
                          onChange={(e) => updatePlanRow(row.id, { notes: e.target.value })}
                          className="w-48 rounded border px-2 py-1"
                          rows={2}
                        />
                      </td>
                      <td className="border p-2 align-top">
                        <button className="rounded bg-red-600 text-white px-3 py-1" onClick={() => removePlanRow(row.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );

  function updatePlanPartyField<K extends keyof typeof data.activeParty>(key: K, value: (typeof data.activeParty)[K]) {
    const nextParty = { ...data.activeParty, [key]: value };
    const nextData = { ...data, activeParty: nextParty };
    const event = new CustomEvent("pizza-matrix-update-party", { detail: nextData });
    window.dispatchEvent(event);
  } // end of updatePlanPartyField()
} // end of PlannerScreen()

function AppInner() {
  const { data, setData } = useAppState();

  React.useEffect(() => {
    function handlePartyUpdate(event: Event) {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setData(customEvent.detail);
      }
    }

    window.addEventListener("pizza-matrix-update-party", handlePartyUpdate);
    return () => window.removeEventListener("pizza-matrix-update-party", handlePartyUpdate);
  }, [setData]);

  return <PlannerScreen />;
} // end of AppInner()

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
} // end of App()
// end of App.tsx
