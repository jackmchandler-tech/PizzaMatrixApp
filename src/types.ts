export type Id = string;
export type LibraryCategory = "sauces" | "cheeses" | "toppings" | "seasonings";
export type ShapeType = "round" | "rectangle";
export type UnitTypeKind = "mass" | "volume" | "count" | "length" | "text";

export interface LocationRecord {
  id: Id;
  name: string;
  sortOrder: number;
  isBuiltIn?: boolean;
}
export interface PersonRecord {
  id: Id;
  name: string;
  associatedName?: string;
  howMet?: string;
  note?: string;
  phone?: string;
}

export interface UnitRecord {
  id: Id;
  name: string;
  symbol: string;
  kind: UnitTypeKind;
  sortOrder: number;
  isBuiltIn?: boolean;
}

export interface SizeRecord {
  id: Id;
  name: string;
  shape: ShapeType;
  diameterInches?: number;
  lengthInches?: number;
  widthInches?: number;
  surfaceAreaSqIn: number;
  defaultServings?: number;
  defaultDoughWeight?: number;
}

export interface LibraryItem {
  id: Id;
  category: LibraryCategory;
  name: string;
  defaultLocationId?: Id;
  defaultUnitId?: Id;
  defaultMiseEnPlace?: string;
  notes?: string;
}

export interface DoughRecord {
  id: Id;
  name: string;
  defaultLocationId?: Id;
  defaultMiseEnPlace?: string;
  notes?: string;
}

export interface AmountBySize {
  sizeId: Id;
  value?: number;
  unitId?: Id;
  isDirect?: boolean;
}

export interface RecipeLine {
  id: Id;
  itemId: Id;
  amountBySize: AmountBySize[];
  pizzaSpecificMiseEnPlace?: string;
  notes?: string;
}

export interface PizzaRecipe {
  id: Id;
  name: string;
  description?: string;
  doughTypeId?: Id;
  sauceLine?: RecipeLine | null;
  primaryCheeseLine: RecipeLine;
  secondaryCheeseLines: RecipeLine[];
  toppingLines: RecipeLine[];
  seasoningLines: RecipeLine[];
  postBakeCheeseLines: RecipeLine[];
  postBakeToppingLines: RecipeLine[];
  postBakeSeasoningLines: RecipeLine[];
  servingsBySize: AmountBySize[];
  doughWeightBySize: AmountBySize[];
  notes?: string;
}

export interface PizzaPlanRow {
  id: Id;
  pizzaId?: Id;
  sizeId?: Id;
  quantity: number;
  notes?: string;
}

export interface PartyPlan {
  id: Id;
  eventName?: string;
  date?: string;
  diners: number;
  guestNames?: string; // NEW
  notes?: string;
  rows: PizzaPlanRow[];
  selectedGuestIds?: Id[];
}

export interface PartyHistoryRecord {
  id: Id;
  date?: string;
  diners: number;
  guestNames?: string;
  selectedGuestIds?: Id[];
  pizzas: {
    pizzaName: string;
    sizeName?: string;
    quantity: number;
  }[];
}

export interface IngredientPullRow {
  key: string;
  itemName: string;
  totalValue?: number;
  unitName?: string;
  unitKind?: UnitTypeKind;
  locationName?: string;
  usedFor: string[];
  sourcePizzaNames: string[];
  isCalculated?: boolean;
  pulled?: boolean;
  warnings: string[];
}

export interface MiseEnPlaceRow {
  id: string;
  pizzaName: string;
  task: string;
  itemName?: string;
  amountText?: string;
  locationName?: string;
  done?: boolean;
}

export interface CoverageSummary {
  diners: number;
  plannedServings: number;
  delta: number;
  needsMore: boolean;
}

export interface AppData {
  version: number;
  locations: LocationRecord[];
  units: UnitRecord[];
  sizes: SizeRecord[];
  sauces: LibraryItem[];
  cheeses: LibraryItem[];
  toppings: LibraryItem[];
  seasonings: LibraryItem[];
  doughs: DoughRecord[];
  pizzas: PizzaRecipe[];
  partyHistory: PartyHistoryRecord[]; // NEW
  people: PersonRecord[];
  activeParty: PartyPlan;
}
