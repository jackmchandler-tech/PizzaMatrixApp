import type {
  AppData,
  AmountBySize,
  DoughRecord,
  LibraryItem,
  PizzaPlanRow,
  PizzaRecipe,
  RecipeLine,
  SizeRecord,
} from "../types";
import { initialAppData, makeId } from "../seeds";

const STORAGE_KEY = "pizza-matrix-app-data";

function cloneInitialData(): AppData {
  return JSON.parse(JSON.stringify(initialAppData)) as AppData;
}

function normalizeAmountBySizeRows(
  rows: unknown,
  sizes: SizeRecord[],
): AmountBySize[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const r = row as Record<string, unknown>;

      return {
        sizeId: typeof r.sizeId === "string" ? r.sizeId : sizes[0]?.id ?? "",
        value: typeof r.value === "number" ? r.value : undefined,
        unitId: typeof r.unitId === "string" ? r.unitId : undefined,
        isDirect: typeof r.isDirect === "boolean" ? r.isDirect : true,
      } as AmountBySize;
    })
    .filter((row): row is AmountBySize => Boolean(row && row.sizeId));
}

function normalizeLibraryItems(
  items: unknown,
  category: LibraryItem["category"],
): LibraryItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;

      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) return null;

      return {
        id: typeof r.id === "string" ? r.id : makeId(category.slice(0, -1)),
        category,
        name,
        defaultLocationId:
          typeof r.defaultLocationId === "string" ? r.defaultLocationId : undefined,
        defaultUnitId:
          typeof r.defaultUnitId === "string" ? r.defaultUnitId : undefined,
        defaultMiseEnPlace:
          typeof r.defaultMiseEnPlace === "string" && r.defaultMiseEnPlace.trim()
            ? r.defaultMiseEnPlace.trim()
            : undefined,
        notes:
          typeof r.notes === "string" && r.notes.trim()
            ? r.notes.trim()
            : undefined,
      } as LibraryItem;
    })
    .filter((item): item is LibraryItem => Boolean(item));
}

function normalizeDoughs(doughs: unknown, fallback: DoughRecord[]): DoughRecord[] {
  if (!Array.isArray(doughs) || doughs.length === 0) return fallback;

  return doughs
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const name = typeof r.name === "string" ? r.name.trim() : "";
      if (!name) return null;

      return {
        id: typeof r.id === "string" ? r.id : makeId("dough"),
        name,
        defaultLocationId:
          typeof r.defaultLocationId === "string" ? r.defaultLocationId : undefined,
        defaultMiseEnPlace:
          typeof r.defaultMiseEnPlace === "string" && r.defaultMiseEnPlace.trim()
            ? r.defaultMiseEnPlace.trim()
            : undefined,
        notes:
          typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined,
      } as DoughRecord;
    })
    .filter((item): item is DoughRecord => Boolean(item));
}

function normalizeSizes(rawSizes: unknown, seedSizes: SizeRecord[]): SizeRecord[] {
  const imported = Array.isArray(rawSizes) ? rawSizes : [];

  if (imported.length === 0) return seedSizes;

  return imported
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const r = item as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : makeId("size");
      const seed = seedSizes.find((s) => s.id === id);

      return {
        id,
        name:
          typeof r.name === "string" && r.name.trim()
            ? r.name.trim()
            : seed?.name ?? "Size",
        shape:
          r.shape === "round" || r.shape === "rectangle"
            ? r.shape
            : seed?.shape ?? "round",
        diameterInches:
          typeof r.diameterInches === "number"
            ? r.diameterInches
            : seed?.diameterInches,
        lengthInches:
          typeof r.lengthInches === "number" ? r.lengthInches : seed?.lengthInches,
        widthInches:
          typeof r.widthInches === "number" ? r.widthInches : seed?.widthInches,
        surfaceAreaSqIn:
          typeof r.surfaceAreaSqIn === "number"
            ? r.surfaceAreaSqIn
            : seed?.surfaceAreaSqIn ?? 0,
        defaultServings:
          typeof r.defaultServings === "number"
            ? r.defaultServings
            : seed?.defaultServings,
      } as SizeRecord;
    })
    .filter((item): item is SizeRecord => Boolean(item));
}

function normalizeRecipeLine(raw: unknown, sizes: SizeRecord[]): RecipeLine | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.itemId !== "string" || !r.itemId) return null;

  return {
    id: typeof r.id === "string" ? r.id : makeId("line"),
    itemId: r.itemId,
    amountBySize: normalizeAmountBySizeRows(r.amountBySize, sizes),
    pizzaSpecificMiseEnPlace:
      typeof r.pizzaSpecificMiseEnPlace === "string" &&
      r.pizzaSpecificMiseEnPlace.trim()
        ? r.pizzaSpecificMiseEnPlace.trim()
        : undefined,
    notes:
      typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined,
  };
}

function normalizeRecipeLineArray(raw: unknown, sizes: SizeRecord[]): RecipeLine[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((line) => normalizeRecipeLine(line, sizes))
    .filter((line): line is RecipeLine => line !== null);
}

function normalizePizzas(
  rawPizzas: unknown,
  sizes: SizeRecord[],
  doughs: DoughRecord[],
): PizzaRecipe[] {
  if (!Array.isArray(rawPizzas)) return [];

  const fallbackDoughId = doughs[0]?.id;

  const result: PizzaRecipe[] = [];

  for (const item of rawPizzas) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;

    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;

    const primaryCheeseLine = normalizeRecipeLine(r.primaryCheeseLine, sizes);
    if (!primaryCheeseLine) continue;

    const pizza: PizzaRecipe = {
      id: typeof r.id === "string" ? r.id : makeId("pizza"),
      name,
      description:
        typeof r.description === "string" && r.description.trim()
          ? r.description.trim()
          : undefined,
      doughTypeId:
        typeof r.doughTypeId === "string" && r.doughTypeId
          ? r.doughTypeId
          : fallbackDoughId,
      sauceLine: normalizeRecipeLine(r.sauceLine, sizes),
      primaryCheeseLine,
      secondaryCheeseLines: normalizeRecipeLineArray(r.secondaryCheeseLines, sizes),
      toppingLines: normalizeRecipeLineArray(r.toppingLines, sizes),
      seasoningLines: normalizeRecipeLineArray(r.seasoningLines, sizes),
      postBakeCheeseLines: normalizeRecipeLineArray(r.postBakeCheeseLines, sizes),
      postBakeToppingLines: normalizeRecipeLineArray(r.postBakeToppingLines, sizes),
      postBakeSeasoningLines: normalizeRecipeLineArray(
        r.postBakeSeasoningLines,
        sizes,
      ),
      servingsBySize: normalizeAmountBySizeRows(r.servingsBySize, sizes),
      doughWeightBySize: normalizeAmountBySizeRows(r.doughWeightBySize, sizes),
      notes:
        typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined,
    };

    result.push(pizza);
  }

  return result;
}

function normalizePlanRows(rawRows: unknown): PizzaPlanRow[] {
  if (!Array.isArray(rawRows)) return [];

  return rawRows.map((row) => {
    const r = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
    return {
      id: typeof r.id === "string" ? r.id : makeId("planrow"),
      pizzaId: typeof r.pizzaId === "string" ? r.pizzaId : undefined,
      sizeId: typeof r.sizeId === "string" ? r.sizeId : undefined,
      quantity:
        typeof r.quantity === "number" && r.quantity >= 1
          ? Math.floor(r.quantity)
          : 1,
      notes:
        typeof r.notes === "string" && r.notes.trim() ? r.notes.trim() : undefined,
    };
  });
}

export function normalizeAppData(raw: unknown): AppData {
  const seed = cloneInitialData();
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const sizes = normalizeSizes(source.sizes, seed.sizes);
  const doughs = normalizeDoughs(source.doughs, seed.doughs);

  const normalized: AppData = {
    version: typeof source.version === "number" ? source.version : seed.version,
    locations: Array.isArray(source.locations)
      ? (source.locations as AppData["locations"])
      : seed.locations,
    units: Array.isArray(source.units)
      ? (source.units as AppData["units"])
      : seed.units,
    sizes,
    sauces: normalizeLibraryItems(source.sauces, "sauces"),
    cheeses: normalizeLibraryItems(source.cheeses, "cheeses"),
    toppings: normalizeLibraryItems(source.toppings, "toppings"),
    seasonings: normalizeLibraryItems(source.seasonings, "seasonings"),
    doughs,
    pizzas: normalizePizzas(source.pizzas, sizes, doughs),
    activeParty: {
      id:
        source.activeParty &&
        typeof source.activeParty === "object" &&
        typeof (source.activeParty as Record<string, unknown>).id === "string"
          ? ((source.activeParty as Record<string, unknown>).id as string)
          : seed.activeParty.id,
      eventName:
        source.activeParty &&
        typeof source.activeParty === "object" &&
        typeof (source.activeParty as Record<string, unknown>).eventName === "string"
          ? ((source.activeParty as Record<string, unknown>).eventName as string)
          : undefined,
      date:
        source.activeParty &&
        typeof source.activeParty === "object" &&
        typeof (source.activeParty as Record<string, unknown>).date === "string"
          ? ((source.activeParty as Record<string, unknown>).date as string)
          : undefined,
      diners:
        source.activeParty &&
        typeof source.activeParty === "object" &&
        typeof (source.activeParty as Record<string, unknown>).diners === "number"
          ? ((source.activeParty as Record<string, unknown>).diners as number)
          : 0,
      notes:
        source.activeParty &&
        typeof source.activeParty === "object" &&
        typeof (source.activeParty as Record<string, unknown>).notes === "string"
          ? ((source.activeParty as Record<string, unknown>).notes as string)
          : undefined,
      rows:
        source.activeParty && typeof source.activeParty === "object"
          ? normalizePlanRows((source.activeParty as Record<string, unknown>).rows)
          : seed.activeParty.rows,
    },
  };

  if (normalized.sauces.length === 0) normalized.sauces = seed.sauces;
  if (normalized.cheeses.length === 0) normalized.cheeses = seed.cheeses;
  if (normalized.toppings.length === 0) normalized.toppings = seed.toppings;
  if (normalized.seasonings.length === 0) normalized.seasonings = seed.seasonings;
  if (normalized.doughs.length === 0) normalized.doughs = seed.doughs;
  if (normalized.activeParty.rows.length === 0) {
    normalized.activeParty.rows = seed.activeParty.rows;
  }

  return normalized;
}

export const storageAdapter = {
  async load(): Promise<AppData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneInitialData();
      return normalizeAppData(JSON.parse(raw));
    } catch {
      return cloneInitialData();
    }
  },

  async save(data: AppData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  exportJson(data: AppData): string {
    return JSON.stringify(data, null, 2);
  },

  async importJson(json: string): Promise<AppData> {
    const parsed = JSON.parse(json);
    const normalized = normalizeAppData(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },
};
