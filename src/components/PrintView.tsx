import React from "react";
                  <td className="border p-2">{summaryRow.seasonings}</td>
                  <td className="border p-2">{summaryRow.postBake}</td>
                  <td className="border p-2">{row.notes ?? ""}</td>
                  <td className="border p-2">{Math.round(summaryRow.servings * 100) / 100}</td>
                </tr>
      <section className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold">Ingredient Pull List</h2>
        <table className="w-full border-collapse mt-4 text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Total Amount</th>
              <th className="border p-2 text-left">Unit</th>
              <th className="border p-2 text-left">Location</th>
              <th className="border p-2 text-left">Used For</th>
              <th className="border p-2 text-left">Pulled</th>
            </tr>
          </thead>
          <tbody>
            {ingredientRows.map((row) => (
              <tr key={row.key}>
                <td className="border p-2">{row.itemName}</td>
                <td className="border p-2">{row.totalValue !== undefined ? Math.round(row.totalValue * 100) / 100 : ""}</td>
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
        <table className="w-full border-collapse mt-4 text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Task</th>
              <th className="border p-2 text-left">Item</th>
              <th className="border p-2 text-left">Amount</th>
              <th className="border p-2 text-left">Location</th>
              <th className="border p-2 text-left">Pizza</th>
              <th className="border p-2 text-left">Done</th>
            </tr>
          </thead>
          <tbody>
            {miseRows.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.task}</td>
                <td className="border p-2">{row.itemName ?? ""}</td>
                <td className="border p-2">{row.amountText ?? ""}</td>
                <td className="border p-2">{row.locationName ?? ""}</td>
                <td className="border p-2">{row.pizzaName}</td>
                <td className="border p-2">☐</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
