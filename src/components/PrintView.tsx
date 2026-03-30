import { AppData } from "../types";
import {
  buildCoverageSummary,
  buildIngredientPullList,
  buildMiseEnPlaceList,
  summarizePlanRow,
} from "../utils/calculations";

export function PrintView({ data }: { data: AppData }) {
  const summary = buildCoverageSummary(data);
  const ingredientRows = buildIngredientPullList(data);
  const miseRows = buildMiseEnPlaceList(data);

  return (
    <div className="bg-white p-6 text-black print:p-0">
      <section className="mb-8 break-inside-avoid">
        <h1 className="text-2xl font-bold">Pizza Plan</h1>

        <div className="mt-2 text-sm">
          <div>Diners: {summary.diners}</div>
          <div>Planned servings: {Math.round(summary.plannedServings * 100) / 100}</div>
          <div>Difference: {Math.round(summary.delta * 100) / 100}</div>
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Qty</th>
              <th className="border p-2 text-left">Pizza</th>
              <th className="border p-2 text-left">Size</th>
              <th className="border p-2 text-left">Sauce</th>
              <th className="border p-2 text-left">Cheese</th>
              <th className="border p-2 text-left">Toppings</th>
              <th className="border p-2 text-left">Seasonings</th>
              <th className="border p-2 text-left">Post-bake</th>
              <th className="border p-2 text-left">Notes</th>
              <th className="border p-2 text-left">Servings</th>
            </tr>
          </thead>

          <tbody>
            {data.activeParty.rows.map((row,index) => {
              const summaryRow = summarizePlanRow(data, row);

              return (
                <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border p-2">{row.quantity}</td>
                  <td className="border p-2">{summaryRow.pizzaName}</td>
                  <td className="border p-2">{summaryRow.sizeName}</td>
                  <td className="border p-2">{summaryRow.sauce}</td>
                  <td className="border p-2">{summaryRow.cheese}</td>
                  <td className="border p-2">{summaryRow.toppings}</td>
                  <td className="border p-2">{summaryRow.seasonings}</td>
                  <td className="border p-2">{summaryRow.postBake}</td>
                  <td className="border p-2">{row.notes ?? ""}</td>
                  <td className="border p-2">
                    {Math.round(summaryRow.servings * 100) / 100}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold">Ingredient Pull List</h2>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Amt</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2 text-left">Location</th>
              <th className="border p-2 text-left">Used For</th>
              <th className="border p-2 text-left">Pulled</th>
            </tr>
          </thead>

          <tbody>
            {ingredientRows.map((row,index) => (
              <tr key={row.key} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border p-2">{row.itemName}</td>
                <td className="border p-2">
                  {row.totalValue !== undefined ? Math.round(row.totalValue * 100) / 100 : ""}
                </td>
                <td className="border p-2">{row.unitName ?? ""}</td>
                <td className="border p-2">{row.locationName ?? ""}</td>
                <td className="border p-2">{row.usedFor.join(", ")}</td>
                <td className="border p-2">☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="break-inside-avoid">
        <h2 className="text-xl font-bold">Mise en Place</h2>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Task</th>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Amount</th>
              <th className="border p-2 text-left">Pizza</th>
              <th className="border p-2 text-left">Done</th>
            </tr>
          </thead>

          <tbody>
            {miseRows.map((row,index) => (
              <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border p-2">{row.task}</td>
                <td className="border p-2">{row.itemName ?? ""}</td>
                <td className="border p-2">{row.amountText ?? ""}</td>
                <td className="border p-2">{row.pizzaName}</td>
                <td className="border p-2">☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
