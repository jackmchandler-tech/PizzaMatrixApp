import type {
  AmountBySize,
  AppData,
  CoverageSummary,
  IngredientPullRow,
  LibraryCategory,
  LibraryItem,
  MiseEnPlaceRow,
  PizzaPlanRow,
  PizzaRecipe,
  RecipeLine,
  SizeRecord,
} from "../types";
import { classifyWarning, formatAmount, getUnitById } from "./units";

export interface ResolvedAmount {
  value?: number;
  unitId?: string;
  isCalculated: boolean;
  reason?: string;
}

function findClosestDirectAmount(
  amounts: AmountBySize[],
  targetSize: SizeRecord,
  sizes: SizeRecord[],
): AmountBySize | undefined {
  const direct = amounts.filter((a) => a.value !== undefined && a.isDirect !== false);
  if (!direct.length) return undefined;

  const withArea = direct
    .map((entry) => ({
      entry,
      size: sizes.find((s) => s.id === entry.sizeId),
    }))
    .filter((row): row is { entry: AmountBySize; size: SizeRecord } => Boolean(row.size));

  withArea.sort((a, b) => {
    const aDelta = Math.abs(a.size.surfaceAreaSqIn - targetSize.surfaceAreaSqIn);
    const bDelta = Math.abs(b.size.surfaceAreaSqIn - targetSize.surfaceAreaSqIn);
    return aDelta - bDelta;
  });

  return withArea[0]?.entry;
}

function averageCoveragePerArea(
  amounts: AmountBySize[],
  sizes: SizeRecord[],
): { avgCoverage?: number; unitId?: string } {
  const direct = amounts.filter((a) => a.value !== undefined);
  const rows = direct
    .map((entry) => ({
      entry,
      size: sizes.find((s) => s.id === entry.sizeId),
    }))
    .filter(
      (row): row is { entry: AmountBySize; size: SizeRecord } =>
        Boolean(row.size) && row.entry.value !== undefined,
    );

  if (!rows.length) return {};

  const totalCoverage = rows.reduce(
    (sum, row) => sum + (row.entry.value as number) / row.size.surfaceAreaSqIn,
    0,
  );

  return {
    avgCoverage: totalCoverage / rows.length,
    unitId: rows[0].entry.unitId,
  };
}

export function resolveAmountForSize(
  amounts: AmountBySize[],
  targetSizeId: string | undefined,
  sizes: SizeRecord[],
): ResolvedAmount {
  if (!targetSizeId) return { isCalculated: false };

  const direct = amounts.find((a) => a.sizeId === targetSizeId && a.value !== undefined);
  if (direct) {
    return {
      value: direct.value,
      unitId: direct.unitId,
      isCalculated: false,
    };
  }

  const targetSize = sizes.find((s) => s.id === targetSizeId);
  if (!targetSize) return { isCalculated: false };

  const closest = findClosestDirectAmount(amounts, targetSize, sizes);
  const coverage = averageCoveragePerArea(amounts, sizes);

  if (coverage.avgCoverage !== undefined) {
    return {
      value: coverage.avgCoverage * targetSize.surfaceAreaSqIn,
      unitId: coverage.unitId ?? closest?.unitId,
      isCalculated: true,
      reason: "Calculated from average coverage by area",
    };
  }

  if (closest?.value !== undefined) {
    const closestSize = sizes.find((s) => s.id === closest.sizeId);
    if (closestSize) {
      const ratio = targetSize.surfaceAreaSqIn / closestSize.surfaceAreaSqIn;
      return {
        value: closest.value * ratio,
        unitId: closest.unitId,
        isCalculated: true,
        reason: "Calculated from closest entered size by area",
      };
    }
  }

  return { isCalculated: false };
}

export function resolveServingsForSize(
  pizza: PizzaRecipe,
  targetSizeId: string | undefined,
  sizes: SizeRecord[],
): number {
  const resolved = resolveAmountForSize(pizza.servingsBySize, targetSizeId, sizes);
  return resolved.value ?? 0;
}

function getLibraryCollection(data: AppData, category: LibraryCategory): LibraryItem[] {
  switch (category) {
    case "sauces":
      return data.sauces;
    case "cheeses":
      return data.cheeses;
    case "toppings":
      return data.toppings;
    case "seasonings":
      return data.seasonings;
    default:
      return [];
  }
}

function findLibraryItem(data: AppData, category: LibraryCategory, itemId: string): LibraryItem | undefined {
  return getLibraryCollection(data, category).find((item) => item.id === itemId);
}

function buildUsedForLabel(pizzaName: string, quantity: number): string {
  return quantity > 1 ? `${pizzaName} x${quantity}` : pizzaName;
}

function addOrMergeIngredientPull(
  map: Map<string, IngredientPullRow>,
  line: RecipeLine,
  item: LibraryItem,
  data: AppData,
  pizzaName: string,
  sizeId: string,
  quantity: number,
): void {
  const resolved = resolveAmountForSize(line.amountBySize, sizeId, data.sizes);
  const unit = getUnitById(data.units, resolved.unitId ?? item.defaultUnitId);
  const location = data.locations.find((loc) => loc.id === item.defaultLocationId);
  const mergeKey = `${item.name}__${unit?.name ?? ""}__${location?.name ?? ""}`;

  const warnings: string[] = [];
  const unitWarning = classifyWarning(unit?.kind, unit?.kind);
  if (unitWarning) warnings.push(unitWarning);

  if (!map.has(mergeKey)) {
    map.set(mergeKey, {
      key: mergeKey,
      itemName: item.name,
      totalValue: resolved.value !== undefined ? resolved.value * quantity : undefined,
      unitName: unit?.name,
      unitKind: unit?.kind,
      locationName: location?.name,
      usedFor: [buildUsedForLabel(pizzaName, quantity)],
      sourcePizzaNames: [pizzaName],
      isCalculated: resolved.isCalculated,
      warnings,
    });
    return;
  }

  const existing = map.get(mergeKey)!;
  if (resolved.value !== undefined) {
    existing.totalValue = (existing.totalValue ?? 0) + resolved.value * quantity;
  }
  existing.usedFor.push(buildUsedForLabel(pizzaName, quantity));
  existing.sourcePizzaNames.push(pizzaName);
  existing.isCalculated = existing.isCalculated || resolved.isCalculated;
  existing.warnings = [...existing.warnings, ...warnings];
}

function appendMiseEnPlaceRows(
  rows: MiseEnPlaceRow[],
  line: RecipeLine,
  item: LibraryItem,
  data: AppData,
  pizzaName: string,
  sizeId: string,
): void {
  const resolved = resolveAmountForSize(line.amountBySize, sizeId, data.sizes);
  const unit = getUnitById(data.units, resolved.unitId ?? item.defaultUnitId);
  const location = data.locations.find((loc) => loc.id === item.defaultLocationId);
  const effectivePrep = line.pizzaSpecificMiseEnPlace || item.defaultMiseEnPlace;

  if (effectivePrep) {
    rows.push({
      id: `${line.id}_prep_${pizzaName}`,
      pizzaName,
      task: effectivePrep,
      itemName: item.name,
      amountText: formatAmount(resolved.value, unit?.name),
      locationName: location?.name,
      done: false,
    });
  }
}

function processLineGroup(
  ingredientMap: Map<string, IngredientPullRow>,
  miseRows: MiseEnPlaceRow[],
  data: AppData,
  pizza: PizzaRecipe,
  row: PizzaPlanRow,
  group: RecipeLine[],
  category: LibraryCategory,
): void {
  if (!row.sizeId) return;

  group.forEach((line) => {
    const item = findLibraryItem(data, category, line.itemId);
    if (!item) return;
    addOrMergeIngredientPull(ingredientMap, line, item, data, pizza.name, row.sizeId!, row.quantity);
    appendMiseEnPlaceRows(miseRows, line, item, data, pizza.name, row.sizeId!);
  });
}

export function buildCoverageSummary(data: AppData): CoverageSummary {
  const plannedServings = data.activeParty.rows.reduce((sum, row) => {
    if (!row.pizzaId || !row.sizeId) return sum;
    const pizza = data.pizzas.find((p) => p.id === row.pizzaId);
    if (!pizza) return sum;
    return sum + resolveServingsForSize(pizza, row.sizeId, data.sizes) * row.quantity;
  }, 0);

  const diners = data.activeParty.diners || 0;
  const delta = plannedServings - diners;

  return {
    diners,
    plannedServings,
    delta,
    needsMore: delta < 0,
  };
}

export function buildIngredientPullList(data: AppData): IngredientPullRow[] {
  const ingredientMap = new Map<string, IngredientPullRow>();

  data.activeParty.rows.forEach((row) => {
    if (!row.pizzaId || !row.sizeId) return;
    const pizza = data.pizzas.find((p) => p.id === row.pizzaId);
    if (!pizza) return;

    if (pizza.sauceLine) {
      processLineGroup(ingredientMap, [], data, pizza, row, [pizza.sauceLine], "sauces");
    }

    processLineGroup(ingredientMap, [], data, pizza, row, [pizza.primaryCheeseLine], "cheeses");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.secondaryCheeseLines, "cheeses");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.toppingLines, "toppings");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.seasoningLines, "seasonings");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.postBakeCheeseLines, "cheeses");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.postBakeToppingLines, "toppings");
    processLineGroup(ingredientMap, [], data, pizza, row, pizza.postBakeSeasoningLines, "seasonings");
  });

  return Array.from(ingredientMap.values()).sort((a, b) => {
    if ((a.locationName ?? "") !== (b.locationName ?? "")) {
      return (a.locationName ?? "").localeCompare(b.locationName ?? "");
    }
    return a.itemName.localeCompare(b.itemName);
  });
}
export function buildMiseEnPlaceList(data: AppData): MiseEnPlaceRow[] {
  const combinedMap = new Map<
    string,
    {
      id: string;
      task: string;
      itemName?: string;
      amountValue?: number;
      unitName?: string;
      pizzaNames: Set<string>;
    }
  >();

  const doughTasks: Record<string, number> = {};

  function addCombinedMiseRow(
    pizza: PizzaRecipe,
    row: PizzaPlanRow,
    line: RecipeLine,
    item: LibraryItem,
  ) {
    if (!row.sizeId) return;

    const resolved = resolveAmountForSize(line.amountBySize, row.sizeId, data.sizes);
    const unit = getUnitById(data.units, resolved.unitId ?? item.defaultUnitId);
    const effectivePrep = line.pizzaSpecificMiseEnPlace || item.defaultMiseEnPlace;

    if (!effectivePrep) return;

    const key = `${effectivePrep}__${item.name}__${unit?.name ?? ""}`;
    const existing = combinedMap.get(key);

    if (!existing) {
      combinedMap.set(key, {
        id: key,
        task: effectivePrep,
        itemName: item.name,
        amountValue:
          resolved.value !== undefined ? resolved.value * row.quantity : undefined,
        unitName: unit?.name,
        pizzaNames: new Set([pizza.name]),
      });
      return;
    }

    if (resolved.value !== undefined) {
      existing.amountValue = (existing.amountValue ?? 0) + resolved.value * row.quantity;
    }

    existing.pizzaNames.add(pizza.name);
  }

  function processCombinedGroup(
    pizza: PizzaRecipe,
    row: PizzaPlanRow,
    group: RecipeLine[],
    category: LibraryCategory,
  ) {
    group.forEach((line) => {
      const item = findLibraryItem(data, category, line.itemId);
      if (!item) return;
      addCombinedMiseRow(pizza, row, line, item);
    });
  }

  data.activeParty.rows.forEach((row) => {
    if (!row.pizzaId || !row.sizeId) return;
    const pizza = data.pizzas.find((p) => p.id === row.pizzaId);
    if (!pizza) return;

    const dough = resolveAmountForSize(pizza.doughWeightBySize, row.sizeId, data.sizes);
    if (dough.value !== undefined) {
      doughTasks[pizza.name] = (doughTasks[pizza.name] ?? 0) + dough.value * row.quantity;
    }

    if (pizza.sauceLine) {
      processCombinedGroup(pizza, row, [pizza.sauceLine], "sauces");
    }
    processCombinedGroup(pizza, row, [pizza.primaryCheeseLine], "cheeses");
    processCombinedGroup(pizza, row, pizza.secondaryCheeseLines, "cheeses");
    processCombinedGroup(pizza, row, pizza.toppingLines, "toppings");
    processCombinedGroup(pizza, row, pizza.seasoningLines, "seasonings");
    processCombinedGroup(pizza, row, pizza.postBakeCheeseLines, "cheeses");
    processCombinedGroup(pizza, row, pizza.postBakeToppingLines, "toppings");
    processCombinedGroup(pizza, row, pizza.postBakeSeasoningLines, "seasonings");
  });

  const rows: MiseEnPlaceRow[] = Object.values(doughTasks).length
    ? Object.entries(doughTasks).map(([pizzaName, totalDough]) => ({
        id: `dough_${pizzaName}`,
        pizzaName,
        task: "Make dough",
        amountText: formatAmount(totalDough, "oz"),
        done: false,
      }))
    : [];

  Array.from(combinedMap.values()).forEach((entry) => {
    rows.push({
      id: entry.id,
      pizzaName: Array.from(entry.pizzaNames).sort().join(", "),
      task: entry.task,
      itemName: entry.itemName,
      amountText: formatAmount(entry.amountValue, entry.unitName),
      done: false,
    });
  });

  return rows.sort((a, b) => {
    if (a.task !== b.task) return a.task.localeCompare(b.task);
    if ((a.itemName ?? "") !== (b.itemName ?? "")) {
      return (a.itemName ?? "").localeCompare(b.itemName ?? "");
    }
    return a.pizzaName.localeCompare(b.pizzaName);
  });
}

export function summarizePlanRow(
  data: AppData,
  row: PizzaPlanRow,
): {
  pizzaName: string;
  sizeName: string;
  sauce: string;
  cheese: string;
  toppings: string;
  seasonings: string;
  postBake: string;
  servings: number;
} {
  const pizza = data.pizzas.find((p) => p.id === row.pizzaId);
  const size = data.sizes.find((s) => s.id === row.sizeId);

  if (!pizza || !size) {
    return {
      pizzaName: "",
      sizeName: "",
      sauce: "",
      cheese: "",
      toppings: "",
      seasonings: "",
      postBake: "",
      servings: 0,
    };
  }

  const getName = (category: LibraryCategory, itemId?: string): string => {
    if (!itemId) return "";
    return getLibraryCollection(data, category).find((item) => item.id === itemId)?.name ?? "";
  };

  const toppings = pizza.toppingLines
    .map((line) => getName("toppings", line.itemId))
    .filter(Boolean)
    .join(", ");

  const seasonings = pizza.seasoningLines
    .map((line) => getName("seasonings", line.itemId))
    .filter(Boolean)
    .join(", ");

  const cheese = [
    getName("cheeses", pizza.primaryCheeseLine.itemId),
    ...pizza.secondaryCheeseLines.map((line) => getName("cheeses", line.itemId)),
  ]
    .filter(Boolean)
    .join(", ");

  const postBake = [
    ...pizza.postBakeCheeseLines.map((line) => getName("cheeses", line.itemId)),
    ...pizza.postBakeToppingLines.map((line) => getName("toppings", line.itemId)),
    ...pizza.postBakeSeasoningLines.map((line) => getName("seasonings", line.itemId)),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    pizzaName: pizza.name,
    sizeName: size.name,
    sauce: pizza.sauceLine ? getName("sauces", pizza.sauceLine.itemId) : "",
    cheese,
    toppings,
    seasonings,
    postBake,
    servings: resolveServingsForSize(pizza, size.id, data.sizes) * row.quantity,
  };
}
