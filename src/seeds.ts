import type {
  AppData,
  Id,
  LibraryCategory,
  LibraryItem,
  LocationRecord,
  PizzaPlanRow,
  PizzaRecipe,
  RecipeLine,
  SizeRecord,
  UnitRecord,
} from "./types";

export function makeId(prefix = "id"): Id {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const seededLocations: LocationRecord[] = [
  { id: "loc_freezer", name: "Freezer", sortOrder: 1, isBuiltIn: true },
  { id: "loc_refrigerator", name: "Refrigerator", sortOrder: 2, isBuiltIn: true },
  { id: "loc_pantry", name: "Pantry", sortOrder: 3, isBuiltIn: true },
  { id: "loc_purchase", name: "Purchase", sortOrder: 4, isBuiltIn: true },
];

export const seededUnits: UnitRecord[] = [
  { id: "unit_g", name: "g", symbol: "g", kind: "mass", sortOrder: 1, isBuiltIn: true },
  { id: "unit_oz", name: "oz", symbol: "oz", kind: "mass", sortOrder: 2, isBuiltIn: true },
  { id: "unit_fl_oz", name: "fl oz", symbol: "fl oz", kind: "volume", sortOrder: 3, isBuiltIn: true },
  { id: "unit_to_taste", name: "to taste", symbol: "to taste", kind: "text", sortOrder: 4, isBuiltIn: true },
  { id: "unit_inches", name: "inches", symbol: "inches", kind: "length", sortOrder: 5, isBuiltIn: true },
  { id: "unit_each", name: "each", symbol: "ea", kind: "count", sortOrder: 6, isBuiltIn: true },
];

export const seededSizes: SizeRecord[] = [
  {
    id: "size_13_round",
    name: '13"',
    shape: "round",
    diameterInches: 13,
    surfaceAreaSqIn: Math.PI * Math.pow(13 / 2, 2),
  },
  {
    id: "size_15_round",
    name: '15"',
    shape: "round",
    diameterInches: 15,
    surfaceAreaSqIn: Math.PI * Math.pow(15 / 2, 2),
  },
  {
    id: "size_10x14_rect",
    name: '10x14"',
    shape: "rectangle",
    lengthInches: 14,
    widthInches: 10,
    surfaceAreaSqIn: 140,
  },
];

function makeLibraryItem(
  id: string,
  category: LibraryCategory,
  name: string,
  defaultLocationId?: string,
  defaultUnitId?: string,
  defaultMiseEnPlace?: string,
): LibraryItem {
  return { id, category, name, defaultLocationId, defaultUnitId, defaultMiseEnPlace };
}

function blankPlanRow(): PizzaPlanRow {
  return {
    id: makeId("planrow"),
    quantity: 1,
  };
}

function makeAmounts(
  entries: Array<{ sizeId: string; value: number; unitId: string; isDirect?: boolean }>,
) {
  return entries.map((entry) => ({
    sizeId: entry.sizeId,
    value: entry.value,
    unitId: entry.unitId,
    isDirect: entry.isDirect ?? true,
  }));
}

function makeRecipeLine(
  itemId: string,
  amountBySize: Array<{ sizeId: string; value: number; unitId: string; isDirect?: boolean }>,
  pizzaSpecificMiseEnPlace?: string,
  notes?: string,
): RecipeLine {
  return {
    id: makeId("line"),
    itemId,
    amountBySize: makeAmounts(amountBySize),
    pizzaSpecificMiseEnPlace,
    notes,
  };
}

const diavolaPizza: PizzaRecipe = {
  id: "pizza_diavola",
  name: "Diavola",
  description: "Tomato sauce, mozzarella, pepperoni, green olives, and pizza shake.",
  sauceLine: makeRecipeLine("sauce_pizza", [
    { sizeId: "size_13_round", value: 5, unitId: "unit_fl_oz" },
    { sizeId: "size_15_round", value: 6.5, unitId: "unit_fl_oz" },
    { sizeId: "size_10x14_rect", value: 5.25, unitId: "unit_fl_oz" },
  ]),
  primaryCheeseLine: makeRecipeLine("cheese_mozz", [
    { sizeId: "size_13_round", value: 7, unitId: "unit_oz" },
    { sizeId: "size_15_round", value: 9, unitId: "unit_oz" },
    { sizeId: "size_10x14_rect", value: 7.5, unitId: "unit_oz" },
  ]),
  secondaryCheeseLines: [],
  toppingLines: [
    makeRecipeLine("top_pepperoni", [
      { sizeId: "size_13_round", value: 2, unitId: "unit_oz" },
      { sizeId: "size_15_round", value: 2.75, unitId: "unit_oz" },
      { sizeId: "size_10x14_rect", value: 2.25, unitId: "unit_oz" },
    ]),
    makeRecipeLine(
      "top_green_olives",
      [
        { sizeId: "size_13_round", value: 8, unitId: "unit_each" },
        { sizeId: "size_15_round", value: 10, unitId: "unit_each" },
        { sizeId: "size_10x14_rect", value: 9, unitId: "unit_each" },
      ],
      "Crack olives in half",
    ),
  ],
  seasoningLines: [
    makeRecipeLine("season_pizza_shake", [
      { sizeId: "size_13_round", value: 1, unitId: "unit_to_taste" },
      { sizeId: "size_15_round", value: 1, unitId: "unit_to_taste" },
      { sizeId: "size_10x14_rect", value: 1, unitId: "unit_to_taste" },
    ]),
  ],
  postBakeCheeseLines: [],
  postBakeToppingLines: [],
  postBakeSeasoningLines: [],
  servingsBySize: makeAmounts([
    { sizeId: "size_13_round", value: 3, unitId: "unit_each" },
    { sizeId: "size_15_round", value: 4, unitId: "unit_each" },
    { sizeId: "size_10x14_rect", value: 3.5, unitId: "unit_each" },
  ]),
  doughWeightBySize: makeAmounts([
    { sizeId: "size_13_round", value: 16, unitId: "unit_oz" },
    { sizeId: "size_15_round", value: 20, unitId: "unit_oz" },
    { sizeId: "size_10x14_rect", value: 18, unitId: "unit_oz" },
  ]),
  notes: "Sample seeded pizza for testing.",
};

const greekPizza: PizzaRecipe = {
  id: "pizza_greek",
  name: "Greek",
  description:
    "Lemon garlic yogurt, mozzarella, chicken roulade, olives, pizza shake, feta, and spinach.",
  sauceLine: makeRecipeLine("sauce_yogurt", [
    { sizeId: "size_13_round", value: 4, unitId: "unit_fl_oz" },
    { sizeId: "size_15_round", value: 5.25, unitId: "unit_fl_oz" },
    { sizeId: "size_10x14_rect", value: 4.5, unitId: "unit_fl_oz" },
  ]),
  primaryCheeseLine: makeRecipeLine("cheese_mozz", [
    { sizeId: "size_13_round", value: 5, unitId: "unit_oz" },
    { sizeId: "size_15_round", value: 6.5, unitId: "unit_oz" },
    { sizeId: "size_10x14_rect", value: 5.5, unitId: "unit_oz" },
  ]),
  secondaryCheeseLines: [],
  toppingLines: [
    makeRecipeLine(
      "top_chicken_roulade",
      [
        { sizeId: "size_13_round", value: 4, unitId: "unit_oz" },
        { sizeId: "size_15_round", value: 5, unitId: "unit_oz" },
        { sizeId: "size_10x14_rect", value: 4.5, unitId: "unit_oz" },
      ],
      'Slice into 1/4" disks',
    ),
    makeRecipeLine(
      "top_green_olives",
      [
        { sizeId: "size_13_round", value: 12, unitId: "unit_each" },
        { sizeId: "size_15_round", value: 15, unitId: "unit_each" },
        { sizeId: "size_10x14_rect", value: 13, unitId: "unit_each" },
      ],
      "Chop olives",
    ),
  ],
  seasoningLines: [
    makeRecipeLine("season_pizza_shake", [
      { sizeId: "size_13_round", value: 1, unitId: "unit_to_taste" },
      { sizeId: "size_15_round", value: 1, unitId: "unit_to_taste" },
      { sizeId: "size_10x14_rect", value: 1, unitId: "unit_to_taste" },
    ]),
  ],
  postBakeCheeseLines: [
    makeRecipeLine(
      "cheese_feta",
      [
        { sizeId: "size_13_round", value: 3, unitId: "unit_oz" },
        { sizeId: "size_15_round", value: 4, unitId: "unit_oz" },
        { sizeId: "size_10x14_rect", value: 3.25, unitId: "unit_oz" },
      ],
      "Crumble",
    ),
  ],
  postBakeToppingLines: [
    makeRecipeLine(
      "top_spinach",
      [
        { sizeId: "size_13_round", value: 1, unitId: "unit_oz" },
        { sizeId: "size_15_round", value: 1.5, unitId: "unit_oz" },
        { sizeId: "size_10x14_rect", value: 1.25, unitId: "unit_oz" },
      ],
      "Saute",
    ),
  ],
  postBakeSeasoningLines: [],
  servingsBySize: makeAmounts([
    { sizeId: "size_13_round", value: 3, unitId: "unit_each" },
    { sizeId: "size_15_round", value: 4, unitId: "unit_each" },
    { sizeId: "size_10x14_rect", value: 3.5, unitId: "unit_each" },
  ]),
  doughWeightBySize: makeAmounts([
    { sizeId: "size_13_round", value: 16, unitId: "unit_oz" },
    { sizeId: "size_15_round", value: 20, unitId: "unit_oz" },
    { sizeId: "size_10x14_rect", value: 18, unitId: "unit_oz" },
  ]),
  notes: "Sample seeded pizza for testing.",
};

export const initialAppData: AppData = {
  version: 1,
  locations: seededLocations,
  units: seededUnits,
  sizes: seededSizes,
  sauces: [
    makeLibraryItem("sauce_pizza", "sauces", "Pizza sauce", "loc_freezer", "unit_fl_oz"),
    makeLibraryItem("sauce_yogurt", "sauces", "Lemon Garlic Yogurt", "loc_refrigerator", "unit_fl_oz"),
  ],
  cheeses: [
    makeLibraryItem("cheese_mozz", "cheeses", "Mozzarella", "loc_freezer", "unit_oz", "Grate cheese"),
    makeLibraryItem("cheese_feta", "cheeses", "Feta", "loc_refrigerator", "unit_oz", "Crumble"),
  ],
  toppings: [
    makeLibraryItem("top_pepperoni", "toppings", "Pepperoni", "loc_freezer", "unit_oz"),
    makeLibraryItem("top_green_olives", "toppings", "Green olives", "loc_pantry", "unit_each", "Crack olives in half"),
    makeLibraryItem("top_chicken_roulade", "toppings", "Chicken roulade", "loc_freezer", "unit_oz", 'Slice into 1/4" disks'),
    makeLibraryItem("top_spinach", "toppings", "Spinach", "loc_refrigerator", "unit_oz", "Saute"),
  ],
  seasonings: [
    makeLibraryItem("season_pizza_shake", "seasonings", "Pizza shake", "loc_pantry", "unit_to_taste"),
  ],
  pizzas: [diavolaPizza, greekPizza],
  activeParty: {
    id: makeId("party"),
    diners: 0,
    rows: [blankPlanRow()],
  },
};
