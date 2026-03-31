import { useMemo, useState } from "react";
import type { AppData, LibraryCategory, PizzaRecipe } from "../types";
import {
  createEmptyEditableLine,
  createEmptyEditablePizza,
  defaultUnitIdForCategory,
  editableToPizza,
  pizzaToEditable,
  type EditableAmountRow,
  type EditablePizzaRecipe,
  type EditableRecipeLine,
} from "../utils/pizzaEditor";

interface PizzaEditorProps {
  data: AppData;
  onSavePizza: (pizza: PizzaRecipe) => void;
  onDeletePizza: (pizzaId: string) => void;
}

function libraryForCategory(data: AppData, category: LibraryCategory) {
  if (category === "sauces") return data.sauces;
  if (category === "cheeses") return data.cheeses;
  if (category === "toppings") return data.toppings;
  return data.seasonings;
}

function AmountGrid({
  data,
  rows,
  onChange,
  label,
}: {
  data: AppData;
  rows: EditableAmountRow[];
  onChange: (rows: EditableAmountRow[]) => void;
  label: string;
}) {
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Size</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Value</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Unit</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Direct</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const size = data.sizes.find((entry) => entry.id === row.sizeId);
            return (
              <tr key={row.sizeId}>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>{size?.name ?? row.sizeId}</td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) =>
                      onChange(
                        rows.map((entry) =>
                          entry.sizeId === row.sizeId
                            ? { ...entry, value: e.target.value }
                            : entry,
                        ),
                      )
                    }
                  />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <select
                    value={row.unitId}
                    onChange={(e) =>
                      onChange(
                        rows.map((entry) =>
                          entry.sizeId === row.sizeId
                            ? { ...entry, unitId: e.target.value }
                            : entry,
                        ),
                      )
                    }
                  >
                    <option value="">Select</option>
                    {data.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input
                    type="checkbox"
                    checked={row.isDirect}
                    onChange={(e) =>
                      onChange(
                        rows.map((entry) =>
                          entry.sizeId === row.sizeId
                            ? { ...entry, isDirect: e.target.checked }
                            : entry,
                        ),
                      )
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RecipeLineEditor({
  data,
  title,
  category,
  line,
  onChange,
  onRemove,
  allowRemove = true,
}: {
  data: AppData;
  title: string;
  category: LibraryCategory;
  line: EditableRecipeLine;
  onChange: (line: EditableRecipeLine) => void;
  onRemove?: () => void;
  allowRemove?: boolean;
}) {
  const library = libraryForCategory(data, category);

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {allowRemove && onRemove ? (
          <button type="button" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <label>
          <div>Item</div>
          <select
            value={line.itemId}
            onChange={(e) => {
              const itemId = e.target.value;
              const defaultUnitId = defaultUnitIdForCategory(data, category, itemId);
              onChange({
                ...line,
                itemId,
                amountBySize: line.amountBySize.map((row) => ({
                  ...row,
                  unitId: row.unitId || defaultUnitId,
                })),
              });
            }}
          >
            <option value="">Select</option>
            {library.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <div>Pizza-specific mise en place</div>
          <input
            type="text"
            value={line.pizzaSpecificMiseEnPlace}
            onChange={(e) =>
              onChange({ ...line, pizzaSpecificMiseEnPlace: e.target.value })
            }
          />
        </label>
      </div>

      <AmountGrid
        data={data}
        rows={line.amountBySize}
        onChange={(rows) => onChange({ ...line, amountBySize: rows })}
        label="Amounts by size"
      />

      <div style={{ marginTop: 12 }}>
        <label>
          <div>Notes</div>
          <input
            type="text"
            value={line.notes}
            onChange={(e) => onChange({ ...line, notes: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

export function PizzaEditor({ data, onSavePizza, onDeletePizza }: PizzaEditorProps) {
  const [selectedPizzaId, setSelectedPizzaId] = useState("");
  const [draft, setDraft] = useState<EditablePizzaRecipe>(() => createEmptyEditablePizza(data));

  const selectedPizza = useMemo(
    () => data.pizzas.find((pizza) => pizza.id === selectedPizzaId),
    [data.pizzas, selectedPizzaId],
  );

  function startNewPizza() {
    setSelectedPizzaId("");
    setDraft(createEmptyEditablePizza(data));
  }

  function loadPizza(pizzaId: string) {
    setSelectedPizzaId(pizzaId);
    const pizza = data.pizzas.find((entry) => entry.id === pizzaId);
    if (pizza) {
      setDraft(pizzaToEditable(data, pizza));
    } else {
      setDraft(createEmptyEditablePizza(data));
    }
  }

  function duplicateCurrentPizza() {
    setSelectedPizzaId("");
    setDraft({
      ...draft,
      id: undefined,
      name: draft.name ? `${draft.name} Copy` : "Pizza Copy",
    });
  }

  function saveDraft() {
    if (!draft.name.trim()) {
      alert("Pizza name is required.");
      return;
    }

    if (!draft.primaryCheeseLine.itemId) {
      alert("Primary cheese is required.");
      return;
    }

    const savedPizza = editableToPizza(draft);
    onSavePizza(savedPizza);
    setSelectedPizzaId(savedPizza.id);
    setDraft(pizzaToEditable({ ...data, pizzas: [...data.pizzas, savedPizza] }, savedPizza));
  }

  function deleteCurrentPizza() {
    if (!selectedPizzaId) return;
    onDeletePizza(selectedPizzaId);
    startNewPizza();
  }

  function updateLineArray(
    lines: EditableRecipeLine[],
    index: number,
    nextLine: EditableRecipeLine,
  ) {
    return lines.map((line, lineIndex) => (lineIndex === index ? nextLine : line));
  }

  function removeLineArray(lines: EditableRecipeLine[], index: number) {
    return lines.filter((_, lineIndex) => lineIndex !== index);
  }

  return (
    <div>
      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button type="button" onClick={startNewPizza}>New Pizza</button>
          <button type="button" onClick={duplicateCurrentPizza}>Duplicate</button>
          <button type="button" onClick={saveDraft}>Save Pizza</button>
          <button type="button" onClick={deleteCurrentPizza} disabled={!selectedPizzaId}>
            Delete
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div>Load existing pizza</div>
            <select
              value={selectedPizzaId}
              onChange={(e) => loadPizza(e.target.value)}
            >
              <option value="">New pizza</option>
              {data.pizzas.map((pizza) => (
                <option key={pizza.id} value={pizza.id}>
                  {pizza.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div>Pizza name</div>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>
            <div>Description</div>
            <input
              type="text"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <label>
            <div>Notes</div>
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              rows={2}
              style={{ width: "100%" }}
            />
          </label>
        </div>
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Sauce</h3>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                sauceLine: draft.sauceLine ?? createEmptyEditableLine(data),
              })
            }
          >
            Add Sauce
          </button>
        </div>

        {draft.sauceLine ? (
          <RecipeLineEditor
            data={data}
            title="Sauce"
            category="sauces"
            line={draft.sauceLine}
            onChange={(line) => setDraft({ ...draft, sauceLine: line })}
            onRemove={() => setDraft({ ...draft, sauceLine: null })}
          />
        ) : (
          <div>No sauce defined.</div>
        )}
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <h3>Primary Cheese</h3>
        <RecipeLineEditor
          data={data}
          title="Primary Cheese"
          category="cheeses"
          line={draft.primaryCheeseLine}
          onChange={(line) => setDraft({ ...draft, primaryCheeseLine: line })}
          allowRemove={false}
        />
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Toppings</h3>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                toppingLines: [...draft.toppingLines, createEmptyEditableLine(data)],
              })
            }
          >
            Add Topping
          </button>
        </div>

        {draft.toppingLines.map((line, index) => (
          <RecipeLineEditor
            key={line.id}
            data={data}
            title={`Topping ${index + 1}`}
            category="toppings"
            line={line}
            onChange={(nextLine) =>
              setDraft({
                ...draft,
                toppingLines: updateLineArray(draft.toppingLines, index, nextLine),
              })
            }
            onRemove={() =>
              setDraft({
                ...draft,
                toppingLines: removeLineArray(draft.toppingLines, index),
              })
            }
          />
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3>Seasonings</h3>
          <button
            type="button"
            onClick={() =>
              setDraft({
                ...draft,
                seasoningLines: [...draft.seasoningLines, createEmptyEditableLine(data)],
              })
            }
          >
            Add Seasoning
          </button>
        </div>

        {draft.seasoningLines.map((line, index) => (
          <RecipeLineEditor
            key={line.id}
            data={data}
            title={`Seasoning ${index + 1}`}
            category="seasonings"
            line={line}
            onChange={(nextLine) =>
              setDraft({
                ...draft,
                seasoningLines: updateLineArray(draft.seasoningLines, index, nextLine),
              })
            }
            onRemove={() =>
              setDraft({
                ...draft,
                seasoningLines: removeLineArray(draft.seasoningLines, index),
              })
            }
          />
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <AmountGrid
            data={data}
            rows={draft.servingsBySize}
            onChange={(rows) => setDraft({ ...draft, servingsBySize: rows })}
            label="Servings by size"
          />
          <AmountGrid
            data={data}
            rows={draft.doughWeightBySize}
            onChange={(rows) => setDraft({ ...draft, doughWeightBySize: rows })}
            label="Dough weight by size"
          />
        </div>
      </div>

      {selectedPizza ? <div style={{ fontSize: 12 }}>Editing: {selectedPizza.name}</div> : null}
    </div>
  );
}
