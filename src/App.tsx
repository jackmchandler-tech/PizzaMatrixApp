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
import { APP_VERSION } from "./constants";

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
      const exists = current.pizzas.some((entry) => entry.id === pizza.id);

      return {
        ...current,
        pizzas: exists
          ? current.pizzas.map((entry) =>
              entry.id === pizza.id ? pizza : entry,
            )
          : [...current.pizzas, pizza],
      };
    });
  }

  function deletePizza(pizzaId: string) {
    setData((current) => ({
      ...current,
      pizzas: current.pizzas.filter((pizza) => pizza.id !== pizzaId),
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
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="flex items-baseline gap-2 text-2xl font-bold">
                <span>Pizza Matrix</span>
                <span className="text-xs font-normal text-slate-400">
                  v{APP_VERSION}
                </span>
              </h1>
              <p className="text-slate-600">
                Plan pizzas, track coverage, and manage setup data.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded px-4 py-2 text-white ${
                  currentView === "planner" ? "bg-blue-700" : "bg-slate-700"
                }`}
                onClick={() => setCurrentView("planner")}
              >
                Planner
              </button>

              <button
                className={`rounded px-4 py-2 text-white ${
                  currentView === "pizzaSetup"
                    ? "bg-blue-700"
                    : "bg-slate-700"
                }`}
                onClick={() => setCurrentView("pizzaSetup")}
              >
                Pizza Setup
              </button>

              <button
                className={`rounded px-4 py-2 text-white ${
                  currentView === "librarySetup"
                    ? "bg-blue-700"
                    : "bg-slate-700"
                }`}
                onClick={() => setCurrentView("librarySetup")}
              >
                Library Setup
              </button>

              <button
                className={`rounded px-4 py-2 text-white ${
                  currentView === "menu" ? "bg-blue-700" : "bg-slate-700"
                }`}
                onClick={() => setCurrentView("menu")}
              >
                Pizza Menu
              </button>

              <button
                className={`rounded px-4 py-2 text-white ${
                  currentView === "history" ? "bg-blue-700" : "bg-slate-700"
                }`}
                onClick={() => setCurrentView("history")}
              >
                History
              </button>

              <button
                className="rounded bg-slate-800 px-4 py-2 text-white"
                onClick={() => setShowPrintView(true)}
              >
                Print Friendly View
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <div>
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
          </div>
        </header>

        {currentView === "pizzaSetup" ? (
          <PizzaEditor
            data={data}
            onSavePizza={savePizza}
            onDeletePizza={deletePizza}
          />
        ) : currentView === "librarySetup" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <BackupManager data={data} onImportData={setData} />
            <LibraryEditor data={data} onChangeData={setData} />
          </div>
        ) : currentView === "menu" ? (
          <PizzaMenu data={data} />
        ) : currentView === "history" ? (
          <PartyHistory data={data} />
        ) : (
          <>
            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Date
                  </span>
                  <input
                    type="date"
                    value={data.activeParty.date ?? ""}
                    onChange={(e) =>
                      updateActiveParty({ date: e.target.value })
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Diners
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={data.activeParty.diners}
                    onChange={(e) =>
                      updateActiveParty({
                        diners: Number(e.target.value) || 0,
                      })
                    }
                    className="mt-1 w-full rounded border px-3 py-2"
                  />
                </label>

                <div className="rounded border p-3">
                  <div className="text-sm text-slate-500">
                    Planned servings
                  </div>
                  <div className="text-2xl font-semibold">
                    {Math.round(coverage.plannedServings * 100) / 100}
                  </div>
                </div>

                <div
                  className={`rounded border p-3 ${
                    coverage.needsMore
                      ? "border-red-400 bg-red-50"
                      : "border-green-400 bg-green-50"
                  }`}
                >
                  <div className="text-sm text-slate-500">Coverage</div>
                  <div className="text-lg font-semibold">
                    {coverage.needsMore
                      ? `Need more (${Math.abs(
                          Math.round(coverage.delta * 100) / 100,
                        )})`
                      : `Enough (+${Math.round(coverage.delta * 100) / 100})`}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold">Pizza Plan</h2>

                <div className="flex gap-2">
                  <button
                    className="rounded bg-emerald-700 px-3 py-1 text-white"
                    onClick={savePartyToHistory}
                  >
                    Save Party
                  </button>

                  <button
                    className="rounded bg-amber-700 px-3 py-1 text-white"
                    onClick={clearActiveParty}
                  >
                    New Party
                  </button>

                  <button
                    className="rounded border px-3 py-1"
                    onClick={() => setShowDescriptions((current) => !current)}
                  >
                    {showDescriptions ? "Hide descriptions" : "Show descriptions"}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1 text-left">Qty</th>
                      <th className="border px-2 py-1 text-left">Pizza</th>
                      <th className="border px-2 py-1 text-left">Size</th>
                      <th className="border px-2 py-1 text-left">Sauce</th>
                      <th className="border px-2 py-1 text-left">Cheese</th>
                      <th className="border px-2 py-1 text-left">Toppings</th>
                      <th className="border px-2 py-1 text-left">
                        Seasonings
                      </th>
                      <th className="border px-2 py-1 text-left">Post-bake</th>
                      <th className="border px-2 py-1 text-left">Notes</th>
                      <th className="border px-2 py-1 text-left">Remove</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.activeParty.rows.map((row) => {
                      const summary = summarizePlanRow(data, row);
                      const pizza = data.pizzas.find((p) => p.id === row.pizzaId);

                      return (
                        <>
                          <tr key={row.id}>
                            <td className="border px-2 py-1 align-top">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={
                                  qtyDrafts[row.id] ??
                                  String(row.quantity ?? 1)
                                }
                                onChange={(e) => {
                                  setQtyDrafts((current) => ({
                                    ...current,
                                    [row.id]: e.target.value,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const nextQuantity = sanitizeQuantityInput(
                                    e.target.value,
                                  );

                                  updatePlanRow(row.id, {
                                    quantity: nextQuantity,
                                  });

                                  setQtyDrafts((current) => {
                                    const next = { ...current };
                                    delete next[row.id];
                                    return next;
                                  });
                                }}
                                className="w-10 rounded border px-1 py-1 text-center"
                              />
                            </td>

                            <td className="border px-2 py-1 align-top">
                              <select
                                value={row.pizzaId ?? ""}
                                onChange={(e) =>
                                  updatePlanRow(row.id, {
                                    pizzaId: e.target.value || undefined,
                                  })
                                }
                                className="w-36 rounded border px-1 py-1"
                              >
                                <option value="">Select pizza</option>
                                {data.pizzas.map((pizzaOption) => (
                                  <option
                                    key={pizzaOption.id}
                                    value={pizzaOption.id}
                                  >
                                    {pizzaOption.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="border px-2 py-1 align-top">
                              <select
                                value={row.sizeId ?? ""}
                                onChange={(e) =>
                                  updatePlanRow(row.id, {
                                    sizeId: e.target.value || undefined,
                                  })
                                }
                                className="w-24 rounded border px-1 py-1"
                              >
                                <option value="">Select size</option>
                                {data.sizes.map((size) => (
                                  <option key={size.id} value={size.id}>
                                    {size.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="border px-2 py-1 align-top">
                              {summary.sauce}
                            </td>
                            <td className="border px-2 py-1 align-top">
                              {summary.cheese}
                            </td>
                            <td className="border px-2 py-1 align-top">
                              {summary.toppings}
                            </td>
                            <td className="border px-2 py-1 align-top">
                              {summary.seasonings}
                            </td>
                            <td className="border px-2 py-1 align-top">
                              {summary.postBake}
                            </td>

                            <td className="border px-2 py-1 align-top">
                              <textarea
                                value={row.notes ?? ""}
                                onChange={(e) =>
                                  updatePlanRow(row.id, {
                                    notes: e.target.value,
                                  })
                                }
                                className="w-40 rounded border px-1 py-1"
                                rows={1}
                              />
                            </td>

                            <td className="border px-2 py-1 align-top">
                              <button
                                className="rounded bg-red-600 px-2 py-1 text-white"
                                onClick={() => removePlanRow(row.id)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>

                          {showDescriptions && pizza?.description ? (
                            <tr key={`${row.id}_description`}>
                              <td
                                className="border px-2 py-1 align-top"
                                colSpan={10}
                              >
                                <strong>Description:</strong> {pizza.description}
                              </td>
                            </tr>
                          ) : null}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-2">
                <button
                  className="rounded bg-blue-700 px-3 py-1.5 text-white"
                  onClick={addPlanRow}
                >
                  Add Pizza Row
                </button>
              </div>
            </section>
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
