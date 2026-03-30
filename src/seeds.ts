import type {
  AppData,
  Id,
  LibraryCategory,
  LibraryItem,
  LocationRecord,
  PizzaPlanRow,
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
    name: '13" Round',
    shape: "round",
    diameterInches: 13,
    surfaceAreaSqIn: Math.PI * Math.pow(13 / 2, 2),
  },
  {
    id: "size_15_round",
    name: '15" Round',
    shape: "round",
    diameterInches: 15,
    surfaceAreaSqIn: Math.PI * Math.pow(15 / 2, 2),
  },
  {
    id: "size_10x14_rect",
    name: '10" x 14" Rectangle',
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
  pizzas: [],
  activeParty: {
    id: makeId("party"),
    diners: 0,
    rows: [blankPlanRow()],
  },
};
