import type {
  AmountBySize,
  AppData,
  LibraryCategory,
  PizzaRecipe,
  RecipeLine,
} from "../types";
import { makeId } from "../seeds";

export interface EditableAmountRow {
  sizeId: string;
  value: string;
  unitId: string;
  isDirect: boolean;
}

export interface EditableRecipeLine {
  id: string;
  itemId: string;
  amountBySize: EditableAmountRow[];
  pizzaSpecificMiseEnPlace: string;
  notes: string;
}

export interface EditablePizzaRecipe {
  id?: string;
  name: string;
  description: string;
  doughTypeId: string;
  sauceLine: EditableRecipeLine | null;
  primaryCheeseLine: EditableRecipeLine;
  secondaryCheeseLines: EditableRecipeLine[];
  toppingLines: EditableRecipeLine[];
  seasoningLines: EditableRecipeLine[];
  postBakeCheeseLines: EditableRecipeLine[];
  postBakeToppingLines: EditableRecipeLine[];
  postBakeSeasoningLines: EditableRecipeLine[];
  servingsBySize: EditableAmountRow[];
  doughWeightBySize: EditableAmountRow[];
  notes: string;
}

function defaultAmountsForSizes(data: AppData, defaultUnitId = ""): EditableAmountRow[] {
  return data.sizes.map((size) => ({
    sizeId: size.id,
    value: "",
    unitId: defaultUnitId,
    isDirect: true,
  }));
}

export function createEmptyEditableLine(
  data: AppData,
  itemId = "",
  defaultUnitId = "",
): EditableRecipeLine {
  return {
    id: makeId("line"),
    itemId,
    amountBySize: defaultAmountsForSizes(data, defaultUnitId),
    pizzaSpecificMiseEnPlace: "",
    notes: "",
  };
}

export function createEmptyEditablePizza(data: AppData): EditablePizzaRecipe {
  return {
    name: "",
    description: "",
    doughTypeId: data.doughs[0]?.id ?? "",
    sauceLine: null,
    primaryCheeseLine: createEmptyEditableLine(data),
    secondaryCheeseLines: [],
    toppingLines: [],
    seasoningLines: [],
    postBakeCheeseLines: [],
    postBakeToppingLines: [],
    postBakeSeasoningLines: [],
    servingsBySize: defaultAmountsForSizes(data, "unit_each"),
    doughWeightBySize: defaultAmountsForSizes(data, "unit_oz"),
    notes: "",
  };
}

function toEditableAmountRows(data: AppData, rows: AmountBySize[]): EditableAmountRow[] {
  return data.sizes.map((size) => {
    const existing = rows.find((row) => row.sizeId === size.id);
    return {
      sizeId: size.id,
      value: existing?.value !== undefined ? String(existing.value) : "",
      unitId: existing?.unitId ?? "",
      isDirect: existing?.isDirect !== false,
    };
  });
}

function toEditableRecipeLine(data: AppData, line: RecipeLine): EditableRecipeLine {
  return {
    id: line.id,
    itemId: line.itemId,
    amountBySize: toEditableAmountRows(data, line.amountBySize),
    pizzaSpecificMiseEnPlace: line.pizzaSpecificMiseEnPlace ?? "",
    notes: line.notes ?? "",
  };
}

export function pizzaToEditable(data: AppData, pizza: PizzaRecipe): EditablePizzaRecipe {
  return {
    id: pizza.id,
    name: pizza.name,
    description: pizza.description ?? "",
    doughTypeId: pizza.doughTypeId ?? data.doughs[0]?.id ?? "",
    sauceLine: pizza.sauceLine ? toEditableRecipeLine(data, pizza.sauceLine) : null,
    primaryCheeseLine: toEditableRecipeLine(data, pizza.primaryCheeseLine),
    secondaryCheeseLines: pizza.secondaryCheeseLines.map((line) => toEditableRecipeLine(data, line)),
    toppingLines: pizza.toppingLines.map((line) => toEditableRecipeLine(data, line)),
    seasoningLines: pizza.seasoningLines.map((line) => toEditableRecipeLine(data, line)),
    postBakeCheeseLines: pizza.postBakeCheeseLines.map((line) => toEditableRecipeLine(data, line)),
    postBakeToppingLines: pizza.postBakeToppingLines.map((line) => toEditableRecipeLine(data, line)),
    postBakeSeasoningLines: pizza.postBakeSeasoningLines.map((line) => toEditableRecipeLine(data, line)),
    servingsBySize: toEditableAmountRows(data, pizza.servingsBySize),
    doughWeightBySize: toEditableAmountRows(data, pizza.doughWeightBySize),
    notes: pizza.notes ?? "",
  };
}

function parseNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function fromEditableAmountRows(rows: EditableAmountRow[]): AmountBySize[] {
  return rows.map((row) => ({
    sizeId: row.sizeId,
    value: parseNumber(row.value),
    unitId: row.unitId || undefined,
    isDirect: row.isDirect,
  }));
}

function fromEditableRecipeLine(line: EditableRecipeLine): RecipeLine {
  return {
    id: line.id || makeId("line"),
    itemId: line.itemId,
    amountBySize: fromEditableAmountRows(line.amountBySize),
    pizzaSpecificMiseEnPlace: line.pizzaSpecificMiseEnPlace.trim() || undefined,
    notes: line.notes.trim() || undefined,
  };
}

export function editableToPizza(editable: EditablePizzaRecipe): PizzaRecipe {
  return {
    id: editable.id || makeId("pizza"),
    name: editable.name.trim(),
    description: editable.description.trim() || undefined,
    doughTypeId: editable.doughTypeId || undefined,
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
}

export function defaultUnitIdForCategory(
  data: AppData,
  category: LibraryCategory,
  itemId: string,
): string {
  const collection =
    category === "sauces"
      ? data.sauces
      : category === "cheeses"
      ? data.cheeses
      : category === "toppings"
      ? data.toppings
      : data.seasonings;

  const item = collection.find((entry) => entry.id === itemId);
  return item?.defaultUnitId ?? "";
}
