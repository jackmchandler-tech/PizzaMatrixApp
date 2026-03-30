import { AppStateProvider, useAppState } from "./context/AppState";
import { buildCoverageSummary, summarizePlanRow } from "./utils/calculations";
import { PrintView } from "./components/PrintView";

function PlannerScreen() {
  const {
    data,
    updatePlanRow,
    addPlanRow,
    removePlanRow,
    updateActiveParty,
  } = useAppState();

  const [showPrintView, setShowPrintView] = useState(false);
  const coverage = useMemo(() => buildCoverageSummary(data), [data]);

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
              <h1 className="text-2xl font-bold">Pizza Matrix</h1>
              <p className="text-slate-600">
                Plan pizzas, track coverage, and print prep sheets.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded bg-slate-800 px-4 py-2 text-white"
                onClick={() => setShowPrintView(true)}
              >
                Print Friendly View
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                type="date"
                value={data.activeParty.date ?? ""}
                onChange={(e) => updateActiveParty({ date: e.target.value })}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Diners</span>
              <input
                type="number"
                min={0}
                value={data.activeParty.diners}
                onChange={(e) =>
                  updateActiveParty({ diners: Number(e.target.value) || 0 })
                }
                className="mt-1 w-full rounded border px-3 py-2"
              />
            </label>

            <div className="rounded border p-3">
              <div className="text-sm text-slate-500">Planned servings</div>
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
                      Math.round(coverage.delta * 100) / 100
                    )})`
                  : `Enough (+${Math.round(coverage.delta * 100) / 100})`}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Pizza Plan</h2>
            <button
              className="rounded bg-blue-700 px-4 py-2 text-white"
              onClick={addPlanRow}
            >
              Add Pizza Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Qty</th>
                  <th className="border p-2 text-left">Pizza</th>
                  <th className="border p-2 text-left">Size</th>
                  <th className="border p-2 text-left">Info</th>
                  <th className="border p-2 text-left">Sauce</th>
                  <th className="border p-2 text-left">Cheese</th>
                  <th className="border p-2 text-left">Toppings</th>
                  <th className="border p-2 text-left">Seasonings</th>
                  <th className="border p-2 text-left">Post-bake</th>
                  <th className="border p-2 text-left">Notes</th>
                  <th className="border p-2 text-left">Remove</th>
                </tr>
              </thead>

              <tbody>
                {data.activeParty.rows.map((row) => {
                  const summary = summarizePlanRow(data, row);
                  const pizza = data.pizzas.find((p) => p.id === row.pizzaId);

                  return (
                    <tr key={row.id}>
                      <td className="border p-2 align-top">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            updatePlanRow(row.id, {
                              quantity: Number(e.target.value) || 1,
                            })
                          }
                          className="w-20 rounded border px-2 py-1"
                        />
                      </td>

                      <td className="border p-2 align-top">
                        <select
                          value={row.pizzaId ?? ""}
                          onChange={(e) =>
                            updatePlanRow(row.id, {
                              pizzaId: e.target.value || undefined,
                            })
                          }
                          className="w-48 rounded border px-2 py-1"
                        >
                          <option value="">Select pizza</option>
                          {data.pizzas.map((pizzaOption) => (
                            <option key={pizzaOption.id} value={pizzaOption.id}>
                              {pizzaOption.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border p-2 align-top">
                        <select
                          value={row.sizeId ?? ""}
                          onChange={(e) =>
                            updatePlanRow(row.id, {
                              sizeId: e.target.value || undefined,
                            })
                          }
                          className="w-48 rounded border px-2 py-1"
                        >
                          <option value="">Select size</option>
                          {data.sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border p-2 align-top">
                        {pizza?.description ? (
                          <details>
                            <summary className="cursor-pointer text-blue-700">
                              ⓘ
                            </summary>
                            <div className="mt-2 max-w-xs text-slate-600">
                              {pizza.description}
                            </div>
                          </details>
                        ) : null}
                      </td>

                      <td className="border p-2 align-top">{summary.sauce}</td>
                      <td className="border p-2 align-top">{summary.cheese}</td>
                      <td className="border p-2 align-top">
                        {summary.toppings}
                      </td>
                      <td className="border p-2 align-top">
                        {summary.seasonings}
                      </td>
                      <td className="border p-2 align-top">
                        {summary.postBake}
                      </td>

                      <td className="border p-2 align-top">
                        <textarea
                          value={row.notes ?? ""}
                          onChange={(e) =>
                            updatePlanRow(row.id, { notes: e.target.value })
                          }
                          className="w-48 rounded border px-2 py-1"
                          rows={2}
                        />
                      </td>

                      <td className="border p-2 align-top">
                        <button
                          className="rounded bg-red-600 px-3 py-1 text-white"
                          onClick={() => removePlanRow(row.id)}
                        >
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
} // end of PlannerScreen()

function AppInner() {
  return <PlannerScreen />;
} // end of AppInner()

export default function App() {
  return (
    <AppStateProvider>
      <AppInner />
    </AppStateProvider>
  );
} // end of App()
