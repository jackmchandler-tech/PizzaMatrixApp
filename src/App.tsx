import { useMemo, useState } from "react";
import { AppStateProvider, useAppState } from "./context/AppState";
import { buildCoverageSummary, summarizePlanRow } from "./utils/calculations";
import { PrintView } from "./components/PrintView";
import { PizzaEditor } from "./components/PizzaEditor";
import { LibraryEditor } from "./components/LibraryEditor";
import { BackupManager } from "./components/BackupManager";
import { PwaUpdater } from "./components/PwaUpdater";
import { PizzaMenu } from "./components/PizzaMenu";
import { PartyHistory } from "./components/PartyHistory";
import type { PizzaRecipe } from "./types";

function PlannerScreen() {
  const {
    data,
    setData,
    updatePlanRow,
    addPlanRow,
    removePlanRow,
    updateActiveParty,
  } = useAppState();

  const [showPrintView, setShowPrintView] = useState(false);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [currentView, setCurrentView] = useState<
    "planner" | "pizzaSetup" | "librarySetup" | "menu" | "history"
  >("planner");

  const coverage = useMemo(() => buildCoverageSummary(data), [data]);

  function sanitizeQuantityInput(raw: string): number {
    const match = raw.match(/\d+/);
    if (!match) return 1;

    const parsed = Number.parseInt(match[0], 10);
    if (!Number.isFinite(parsed) || parsed < 1) return 1;

    return parsed;
  }

  function savePizza(pizza: PizzaRecipe) {
    setData((current) => {
      const exists = current.pizzas.some((p) => p.id === pizza.id);
      return {
        ...current,
        pizzas: exists
          ? current.pizzas.map((p) => (p.id === pizza.id ? pizza : p))
          : [...current.pizzas, pizza],
      };
    });
  }

  function deletePizza(pizzaId: string) {
    setData((current) => ({
      ...current,
      pizzas: current.pizzas.filter((p) => p.id !== pizzaId),
      activeParty: {
        ...current.activeParty,
        rows: current.activeParty.rows.map((row) =>
          row.pizzaId === pizzaId ? { ...row, pizzaId: undefined } : row,
        ),
      },
    }));
  }

  function savePartyToHistory() {
    const party = data.activeParty;

    const pizzas = party.rows
      .filter((r) => r.pizzaId && r.sizeId)
      .map((r) => {
        const pizza = data.pizzas.find((p) => p.id === r.pizzaId);
        const size = data.sizes.find((s) => s.id === r.sizeId);

        return {
          pizzaName: pizza?.name ?? "",
          sizeName: size?.name,
          quantity: r.quantity,
        };
      });

    const record = {
      id: `history_${Math.random().toString(36).slice(2, 10)}`,
      date: party.date,
      diners: party.diners,
      guestNames: party.guestNames,
      pizzas,
    };

    setData((current) => ({
      ...current,
      partyHistory: [...current.partyHistory, record],
    }));
  }

  function clearActiveParty() {
    const hasContent =
      Boolean(data.activeParty.date) ||
      Boolean(data.activeParty.guestNames?.trim()) ||
      data.activeParty.diners > 0 ||
      data.activeParty.rows.some(
        (row) =>
          Boolean(row.pizzaId) ||
          Boolean(row.sizeId) ||
          (row.quantity ?? 1) !== 1 ||
          Boolean(row.notes?.trim()),
      );

    if (hasContent) {
      const confirmed = window.confirm(
        "Clear the current party and start a new one?",
      );
      if (!confirmed) return;
    }

    updateActiveParty({
      date: "",
      diners: 0,
      guestNames: "",
      notes: "",
      rows: Array.from({ length: 6 }).map(() => ({
        id: `planrow_${Math.random().toString(36).slice(2, 10)}`,
        quantity: 1,
      })),
    });

    setQtyDrafts({});
  }

  if (showPrintView) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="mb-4 flex gap-2 print:hidden">
          <button
            className="rounded bg-slate-800 px-4 py-2 text-white"
            onClick={() => setShowPrintView(false)}
          >
            Back
          </button>
          <button
            className="rounded bg-blue-700 px-4 py-2 text-white"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
        <PrintView data={data} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-wrap gap-2">
            {["planner", "pizzaSetup", "librarySetup", "menu", "history"].map(
              (v) => (
                <button
                  key={v}
                  className={`rounded px-4 py-2 text-white ${
                    currentView === v ? "bg-blue-700" : "bg-slate-700"
                  }`}
                  onClick={() => setCurrentView(v as any)}
                >
                  {v === "pizzaSetup"
                    ? "Pizza Setup"
                    : v === "librarySetup"
                    ? "Library Setup"
                    : v === "menu"
                    ? "Pizza Menu"
                    : v === "history"
                    ? "History"
                    : "Planner"}
                </button>
              ),
            )}

            <button
              className="rounded bg-slate-800 px-4 py-2 text-white"
              onClick={() => setShowPrintView(true)}
            >
              Print
            </button>
          </div>

          <div className="mt-4">
            <label>Guest Names</label>
            <textarea
              value={data.activeParty.guestNames || ""}
              onChange={(e) =>
                updateActiveParty({ guestNames: e.target.value })
              }
              rows={2}
              style={{ width: 300 }}
            />
          </div>
        </header>

        {currentView === "pizzaSetup" ? (
          <PizzaEditor
            data={data}
            onSavePizza={savePizza}
            onDeletePizza={deletePizza}
          />
        ) : currentView === "librarySetup" ? (
          <>
            <BackupManager data={data} onImportData={setData} />
            <LibraryEditor data={data} onChangeData={setData} />
          </>
        ) : currentView === "menu" ? (
          <PizzaMenu data={data} />
        ) : currentView === "history" ? (
          <PartyHistory data={data} />
        ) : (
          <>
            <div className="flex gap-2">
              <button onClick={savePartyToHistory}>Save Party</button>
              <button onClick={clearActiveParty}>New Party</button>
              <button onClick={() => setShowDescriptions((s) => !s)}>
                Toggle Descriptions
              </button>
            </div>

            <table>
              <tbody>
                {data.activeParty.rows.map((row) => {
                  const summary = summarizePlanRow(data, row);
                  return (
                    <tr key={row.id}>
                      <td>{row.quantity}</td>
                      <td>{summary.cheese}</td>
                      <td>
                        <button onClick={() => removePlanRow(row.id)}>
                          X
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  return <PlannerScreen />;
}

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
      <PwaUpdater />
    </AppStateProvider>
  );
}
