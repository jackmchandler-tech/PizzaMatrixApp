import type {
    postBakeCheeseLines: pizza.postBakeCheeseLines.map((line) => toEditableRecipeLine(data, line)),
    postBakeToppingLines: pizza.postBakeToppingLines.map((line) => toEditableRecipeLine(data, line)),
    postBakeSeasoningLines: pizza.postBakeSeasoningLines.map((line) => toEditableRecipeLine(data, line)),
    servingsBySize: toEditableAmountRows(data, pizza.servingsBySize),
    doughWeightBySize: toEditableAmountRows(data, pizza.doughWeightBySize),
    notes: pizza.notes ?? "",
  };
} // end of pizzaToEditable()

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
} // end of parseNumber()

function fromEditableAmountRows(rows: EditableAmountRow[]): AmountBySize[] {
  return rows.map((row) => ({
    sizeId: row.sizeId,
    value: parseNumber(row.value),
    unitId: row.unitId || undefined,
    isDirect: row.isDirect,
  }));
} // end of fromEditableAmountRows()

function fromEditableRecipeLine(line: EditableRecipeLine): RecipeLine {
  return {
    id: line.id || makeId("line"),
    itemId: line.itemId,
    amountBySize: fromEditableAmountRows(line.amountBySize),
    pizzaSpecificMiseEnPlace: line.pizzaSpecificMiseEnPlace.trim() || undefined,
    notes: line.notes.trim() || undefined,
  };
} // end of fromEditableRecipeLine()

export function editableToPizza(editable: EditablePizzaRecipe): PizzaRecipe {
  return {
    id: editable.id || makeId("pizza"),
    name: editable.name.trim(),
    description: editable.description.trim() || undefined,
    sauceLine:
      editable.sauceLine && editable.sauceLine.itemId
        ? fromEditableRecipeLine(editable.sauceLine)
        : null,
    primaryCheeseLine: fromEditableRecipeLine(editable.primaryCheeseLine),
    secondaryCheeseLines: editable.secondaryCheeseLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    toppingLines: editable.toppingLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    seasoningLines: editable.seasoningLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    postBakeCheeseLines: editable.postBakeCheeseLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    postBakeToppingLines: editable.postBakeToppingLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    postBakeSeasoningLines: editable.postBakeSeasoningLines
      .filter((line) => line.itemId)
      .map((line) => fromEditableRecipeLine(line)),
    servingsBySize: fromEditableAmountRows(editable.servingsBySize),
    doughWeightBySize: fromEditableAmountRows(editable.doughWeightBySize),
    notes: editable.notes.trim() || undefined,
  };
} // end of editableToPizza()

export function defaultUnitIdForCategory(
  data: AppData,
  category: LibraryCategory,
  itemId: string,
): string {
  const collection = data[category];
  const item = collection.find((entry) => entry.id === itemId);
  return item?.defaultUnitId ?? "";
} // end of defaultUnitIdForCategory()
