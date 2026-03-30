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
    <div className="bg-white p-8 text-black print:p-0">
      <section className="mb-10 break-inside-avoid">
        <h1 className="mb-3 text-2xl font-bold">Pizza Plan</h1>

        <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded border border-slate-300 bg-slate-50 px-4 py-3">
            <div className="text-slate-600">Diners</div>
            <div className="text-lg font-semibold">{summary.diners}</div>
          </div>
          <div className="rounded border border-slate-300 bg-slate-50 px-4 py-3">
            <div className="text-slate-600">Planned servings</div>
            <div className="text-lg font-semibold">
              {Math.round(summary.plannedServings * 100) / 100}
            </div>
          </div>
          <div
            className={`rounded border px-4 py-3 ${
              summary.needsMore
                ? "border-red-300 bg-red-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            <div className="text-slate-600">Coverage</div>
            <div className="text-lg font-semibold">
              {summary.needsMore
                ? `Need more (${Math.abs(Math.round(summary.delta * 100) / 100)})`
                : `Enough (+${Math.round(summary.delta * 100) / 100})`}
            </div>
          </div>
        </div>

        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[7%]">
                Qty
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[14%]">
                Pizza
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[9%]">
                Size
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[12%]">
                Sauce
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[14%]">
                Cheese
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[16%]">
                Toppings
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[12%]">
                Seasonings
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[12%]">
                Post-bake
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[14%]">
                Notes
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[10%]">
                Servings
              </th>
            </tr>
          </thead>

          <tbody>
            {data.activeParty.rows.map((row, index) => {
              const summaryRow = summarizePlanRow(data, row);

              return (
                <tr
                  key={row.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {row.quantity}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.pizzaName}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.sizeName}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.sauce}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.cheese}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.toppings}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.seasonings}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {summaryRow.postBake}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {row.notes ?? ""}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 align-top">
                    {Math.round(summaryRow.servings * 100) / 100}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="mb-10 break-inside-avoid">
        <h2 className="mb-3 text-xl font-bold">Ingredient Pull List</h2>

        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[18%]">
                Item
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[10%]">
                Amt
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[10%]">
                Unit
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[16%]">
                Location
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[36%]">
                Used For
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[10%]">
                Pulled
              </th>
            </tr>
          </thead>

          <tbody>
            {ingredientRows.map((row, index) => (
              <tr
                key={row.key}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.itemName}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.totalValue !== undefined
                    ? Math.round(row.totalValue * 100) / 100
                    : ""}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.unitName ?? ""}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.locationName ?? ""}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.usedFor.join(", ")}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  ☐
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="break-inside-avoid">
        <h2 className="mb-3 text-xl font-bold">Mise en Place</h2>

        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[28%]">
                Task
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[22%]">
                Item
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[16%]">
                Amount
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[24%]">
                Pizza
              </th>
              <th className="border border-slate-300 bg-slate-200 px-4 py-3 text-left align-top w-[10%]">
                Done
              </th>
            </tr>
          </thead>

          <tbody>
            {miseRows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.task}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.itemName ?? ""}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.amountText ?? ""}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  {row.pizzaName}
                </td>
                <td className="border border-slate-300 px-4 py-3 align-top">
                  ☐
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
