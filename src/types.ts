export type Id = string;
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
  notes?: string;
  rows: PizzaPlanRow[];
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
  pizzas: PizzaRecipe[];
  activeParty: PartyPlan;
}
// end of types.ts
