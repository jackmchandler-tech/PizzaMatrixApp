import { useEffect, useMemo, useState } from "react";
import type {
  AppData,
  DoughRecord,
  LibraryCategory,
  LibraryItem,
  LocationRecord,
  SizeRecord,
  UnitRecord,
  UnitTypeKind,
} from "../types";
import { makeId } from "../seeds";

interface LibraryEditorProps {
  data: AppData;
  onChangeData: (updater: (current: AppData) => AppData) => void;
}

type SetupTab =
  | "sauces"
  | "cheeses"
  | "toppings"
  | "seasonings"
  | "doughs"
  | "sizes"
  | "locations"
  | "units";

function categoryLabel(category: LibraryCategory): string {
  if (category === "sauces") return "Sauces";
  if (category === "cheeses") return "Cheeses";
  if (category === "toppings") return "Toppings";
  return "Seasonings";
}

function getCollection(data: AppData, category: LibraryCategory): LibraryItem[] {
  if (category === "sauces") return data.sauces;
  if (category === "cheeses") return data.cheeses;
  if (category === "toppings") return data.toppings;
  return data.seasonings;
}

function setCollection(
  current: AppData,
  category: LibraryCategory,
  items: LibraryItem[],
): AppData {
  if (category === "sauces") return { ...current, sauces: items };
  if (category === "cheeses") return { ...current, cheeses: items };
  if (category === "toppings") return { ...current, toppings: items };
  return { ...current, seasonings: items };
}

function blankLibraryItem(category: LibraryCategory): LibraryItem {
  return {
    id: makeId(category.slice(0, -1)),
    category,
    name: "",
    defaultLocationId: undefined,
    defaultUnitId: undefined,
    defaultMiseEnPlace: "",
    notes: "",
  };
}

function blankLocation(sortOrder: number): LocationRecord {
  return {
    id: makeId("loc"),
    name: "",
    sortOrder,
  };
}

function blankUnit(sortOrder: number): UnitRecord {
  return {
    id: makeId("unit"),
    name: "",
    symbol: "",
    kind: "mass",
    sortOrder,
  };
}

function blankDough(): DoughRecord {
  return {
    id: makeId("dough"),
    name: "",
    defaultLocationId: undefined,
    defaultMiseEnPlace: "",
    notes: "",
  };
}

function collectIngredientUsage(
  data: AppData,
  category: LibraryCategory,
): Record<string, string[]> {
  const usage = new Map<string, Set<string>>();

  function track(itemId: string | undefined, pizzaName: string) {
    if (!itemId) return;
    if (!usage.has(itemId)) usage.set(itemId, new Set<string>());
    usage.get(itemId)!.add(pizzaName);
  }

  data.pizzas.forEach((pizza) => {
    if (category === "sauces") track(pizza.sauceLine?.itemId, pizza.name);

    if (category === "cheeses") {
      track(pizza.primaryCheeseLine.itemId, pizza.name);
      pizza.secondaryCheeseLines.forEach((line) => track(line.itemId, pizza.name));
      pizza.postBakeCheeseLines.forEach((line) => track(line.itemId, pizza.name));
    }

    if (category === "toppings") {
      pizza.toppingLines.forEach((line) => track(line.itemId, pizza.name));
      pizza.postBakeToppingLines.forEach((line) => track(line.itemId, pizza.name));
    }

    if (category === "seasonings") {
      pizza.seasoningLines.forEach((line) => track(line.itemId, pizza.name));
      pizza.postBakeSeasoningLines.forEach((line) => track(line.itemId, pizza.name));
    }
  });

  const result: Record<string, string[]> = {};
  usage.forEach((pizzaNames, itemId) => {
    result[itemId] = Array.from(pizzaNames).sort();
  });
  return result;
}

function collectDoughUsage(data: AppData): Record<string, string[]> {
  const usage = new Map<string, Set<string>>();

  data.pizzas.forEach((pizza) => {
    if (!pizza.doughTypeId) return;
    if (!usage.has(pizza.doughTypeId)) usage.set(pizza.doughTypeId, new Set<string>());
    usage.get(pizza.doughTypeId)!.add(pizza.name);
  });

  const result: Record<string, string[]> = {};
  usage.forEach((pizzaNames, doughId) => {
    result[doughId] = Array.from(pizzaNames).sort();
  });
  return result;
}

function LibraryItemEditor({
  data,
  category,
  items,
  onSaveItems,
}: {
  data: AppData;
  category: LibraryCategory;
  items: LibraryItem[];
  onSaveItems: (items: LibraryItem[]) => void;
}) {
  const [drafts, setDrafts] = useState<LibraryItem[]>(items);
  const usageByItemId = useMemo(() => collectIngredientUsage(data, category), [data, category]);

  useEffect(() => {
    setDrafts(items);
  }, [items, category]);

  function updateDraft(index: number, updates: Partial<LibraryItem>) {
    setDrafts((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  }

  function addItem() {
    setDrafts((current) => [...current, blankLibraryItem(category)]);
  }

  function removeItem(index: number) {
    const item = drafts[index];
    const usedBy = usageByItemId[item.id] ?? [];
    if (usedBy.length > 0) {
      alert(`Cannot remove "${item.name || "this item"}". It is used by: ${usedBy.join(", ")}`);
      return;
    }
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item) => ({
        ...item,
        category,
        name: item.name.trim(),
        defaultMiseEnPlace: item.defaultMiseEnPlace?.trim() || undefined,
        notes: item.notes?.trim() || undefined,
        defaultLocationId: item.defaultLocationId || undefined,
        defaultUnitId: item.defaultUnitId || undefined,
      }))
      .filter((item) => item.name);

    onSaveItems(cleaned);
    setDrafts(cleaned);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>{categoryLabel(category)}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addItem}>Add {categoryLabel(category).slice(0, -1)}</button>
          <button type="button" onClick={saveAll}>Save {categoryLabel(category)}</button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Location</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Unit</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Default mise en place</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Notes</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Used by pizzas</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((item, index) => {
            const usedBy = usageByItemId[item.id] ?? [];
            const isInUse = usedBy.length > 0;

            return (
              <tr key={item.id}>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.name} onChange={(e) => updateDraft(index, { name: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <select value={item.defaultLocationId ?? ""} onChange={(e) => updateDraft(index, { defaultLocationId: e.target.value || undefined })} style={{ width: "100%" }}>
                    <option value="">Select</option>
                    {data.locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <select value={item.defaultUnitId ?? ""} onChange={(e) => updateDraft(index, { defaultUnitId: e.target.value || undefined })} style={{ width: "100%" }}>
                    <option value="">Select</option>
                    {data.units.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.defaultMiseEnPlace ?? ""} onChange={(e) => updateDraft(index, { defaultMiseEnPlace: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.notes ?? ""} onChange={(e) => updateDraft(index, { notes: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>{usedBy.join(", ")}</td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <button type="button" onClick={() => removeItem(index)} disabled={isInUse}>Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DoughEditor({
  data,
  doughs,
  onSave,
}: {
  data: AppData;
  doughs: DoughRecord[];
  onSave: (doughs: DoughRecord[]) => void;
}) {
  const [drafts, setDrafts] = useState<DoughRecord[]>(doughs);
  const usageByDoughId = useMemo(() => collectDoughUsage(data), [data]);

  useEffect(() => {
    setDrafts(doughs);
  }, [doughs]);

  function updateDraft(index: number, updates: Partial<DoughRecord>) {
    setDrafts((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...updates } : item)),
    );
  }

  function addDough() {
    setDrafts((current) => [...current, blankDough()]);
  }

  function removeDough(index: number) {
    const item = drafts[index];
    const usedBy = usageByDoughId[item.id] ?? [];
    if (usedBy.length > 0) {
      alert(`Cannot remove "${item.name || "this dough"}". It is used by: ${usedBy.join(", ")}`);
      return;
    }
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        defaultMiseEnPlace: item.defaultMiseEnPlace?.trim() || undefined,
        notes: item.notes?.trim() || undefined,
        defaultLocationId: item.defaultLocationId || undefined,
      }))
      .filter((item) => item.name);

    onSave(cleaned);
    setDrafts(cleaned);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Doughs</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addDough}>Add Dough</button>
          <button type="button" onClick={saveAll}>Save Doughs</button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Location</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Default mise en place</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Notes</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Used by pizzas</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((item, index) => {
            const usedBy = usageByDoughId[item.id] ?? [];
            const isInUse = usedBy.length > 0;

            return (
              <tr key={item.id}>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.name} onChange={(e) => updateDraft(index, { name: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <select value={item.defaultLocationId ?? ""} onChange={(e) => updateDraft(index, { defaultLocationId: e.target.value || undefined })} style={{ width: "100%" }}>
                    <option value="">Select</option>
                    {data.locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.defaultMiseEnPlace ?? ""} onChange={(e) => updateDraft(index, { defaultMiseEnPlace: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <input type="text" value={item.notes ?? ""} onChange={(e) => updateDraft(index, { notes: e.target.value })} style={{ width: "100%" }} />
                </td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>{usedBy.join(", ")}</td>
                <td style={{ border: "1px solid #ccc", padding: 6 }}>
                  <button type="button" onClick={() => removeDough(index)} disabled={isInUse}>Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function blankSize(): SizeRecord {
  return {
    id: makeId("size"),
    name: "",
    shape: "round",
    surfaceAreaSqIn: 0,
    defaultServings: undefined,
    defaultDoughWeight: undefined,
  };
}

function calcSurfaceArea(size: SizeRecord): number {
  if (size.shape === "round") {
    const diameter = size.diameterInches ?? 0;
    if (diameter <= 0) return 0;
    return Math.PI * Math.pow(diameter / 2, 2);
  }

  const length = size.lengthInches ?? 0;
  const width = size.widthInches ?? 0;
  if (length <= 0 || width <= 0) return 0;
  return length * width;
}

function SizeEditor({
  sizes,
  onSave,
}: {
  sizes: SizeRecord[];
  onSave: (sizes: SizeRecord[]) => void;
}) {
  const [drafts, setDrafts] = useState<SizeRecord[]>(sizes);

  useEffect(() => {
    setDrafts(sizes);
  }, [sizes]);

  function updateDraft(index: number, updates: Partial<SizeRecord>) {
    setDrafts((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const next = { ...item, ...updates };
        next.surfaceAreaSqIn = calcSurfaceArea(next);
        return next;
      }),
    );
  }

  function addSize() {
    setDrafts((current) => [...current, blankSize()]);
  }

  function removeSize(index: number) {
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        surfaceAreaSqIn: calcSurfaceArea(item),
        defaultServings:
          typeof item.defaultServings === "number" && Number.isFinite(item.defaultServings)
            ? item.defaultServings
            : undefined,
        defaultDoughWeight:
          typeof item.defaultDoughWeight === "number" && Number.isFinite(item.defaultDoughWeight)
            ? item.defaultDoughWeight
            : undefined,
      }))
      .filter((item) => item.name && item.surfaceAreaSqIn > 0);

    onSave(cleaned);
    setDrafts(cleaned);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>Sizes</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addSize}>
            Add Size
          </button>
          <button type="button" onClick={saveAll}>
            Save Sizes
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Shape</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Diameter</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Length</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Width</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Default servings</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Default dough wt</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Area</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((item, index) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateDraft(index, { name: e.target.value })}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <select
                  value={item.shape}
                  onChange={(e) =>
                    updateDraft(index, {
                      shape: e.target.value as SizeRecord["shape"],
                      diameterInches: e.target.value === "round" ? item.diameterInches : undefined,
                      lengthInches: e.target.value === "rectangle" ? item.lengthInches : undefined,
                      widthInches: e.target.value === "rectangle" ? item.widthInches : undefined,
                    })
                  }
                >
                  <option value="round">round</option>
                  <option value="rectangle">rectangle</option>
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="number"
                  step="0.25"
                  value={item.diameterInches ?? ""}
                  disabled={item.shape !== "round"}
                  onChange={(e) =>
                    updateDraft(index, {
                      diameterInches: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="number"
                  step="0.25"
                  value={item.lengthInches ?? ""}
                  disabled={item.shape !== "rectangle"}
                  onChange={(e) =>
                    updateDraft(index, {
                      lengthInches: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="number"
                  step="0.25"
                  value={item.widthInches ?? ""}
                  disabled={item.shape !== "rectangle"}
                  onChange={(e) =>
                    updateDraft(index, {
                      widthInches: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="number"
                  step="0.25"
                  value={item.defaultServings ?? ""}
                  onChange={(e) =>
                    updateDraft(index, {
                      defaultServings: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="number"
                  step="0.25"
                  value={item.defaultDoughWeight ?? ""}
                  onChange={(e) =>
                    updateDraft(index, {
                      defaultDoughWeight:
                        e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                {Math.round(calcSurfaceArea(item) * 100) / 100}
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeSize(index)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocationEditor({
  locations,
  onSave,
}: {
  locations: LocationRecord[];
  onSave: (locations: LocationRecord[]) => void;
}) {
  const [drafts, setDrafts] = useState<LocationRecord[]>(locations);

  useEffect(() => {
    setDrafts(locations);
  }, [locations]);

  function updateDraft(index: number, updates: Partial<LocationRecord>) {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
  }

  function addLocation() {
    setDrafts((current) => [...current, blankLocation(current.length + 1)]);
  }

  function removeLocation(index: number) {
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item, index) => ({ ...item, name: item.name.trim(), sortOrder: index + 1 }))
      .filter((item) => item.name);

    onSave(cleaned);
    setDrafts(cleaned);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Locations</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addLocation}>Add Location</button>
          <button type="button" onClick={saveAll}>Save Locations</button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((item, index) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input type="text" value={item.name} onChange={(e) => updateDraft(index, { name: e.target.value })} style={{ width: "100%" }} />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeLocation(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UnitEditor({
  units,
  onSave,
}: {
  units: UnitRecord[];
  onSave: (units: UnitRecord[]) => void;
}) {
  const [drafts, setDrafts] = useState<UnitRecord[]>(units);

  useEffect(() => {
    setDrafts(units);
  }, [units]);

  function updateDraft(index: number, updates: Partial<UnitRecord>) {
    setDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item));
  }

  function addUnit() {
    setDrafts((current) => [...current, blankUnit(current.length + 1)]);
  }

  function removeUnit(index: number) {
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item, index) => ({ ...item, name: item.name.trim(), symbol: item.symbol.trim(), sortOrder: index + 1 }))
      .filter((item) => item.name);

    onSave(cleaned);
    setDrafts(cleaned);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Units</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addUnit}>Add Unit</button>
          <button type="button" onClick={saveAll}>Save Units</button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Symbol</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Kind</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((item, index) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input type="text" value={item.name} onChange={(e) => updateDraft(index, { name: e.target.value })} style={{ width: "100%" }} />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input type="text" value={item.symbol} onChange={(e) => updateDraft(index, { symbol: e.target.value })} style={{ width: "100%" }} />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <select value={item.kind} onChange={(e) => updateDraft(index, { kind: e.target.value as UnitTypeKind })} style={{ width: "100%" }}>
                  <option value="mass">mass</option>
                  <option value="volume">volume</option>
                  <option value="count">count</option>
                  <option value="length">length</option>
                  <option value="text">text</option>
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeUnit(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LibraryEditor({ data, onChangeData }: LibraryEditorProps) {
  const [currentTab, setCurrentTab] = useState<SetupTab>("sauces");

  const tabButtons = useMemo(
    () =>
      [
        { id: "sauces", label: "Sauces" },
        { id: "cheeses", label: "Cheeses" },
        { id: "toppings", label: "Toppings" },
        { id: "seasonings", label: "Seasonings" },
        { id: "doughs", label: "Doughs" },
        { id: "sizes", label: "Sizes" },
        { id: "locations", label: "Locations" },
        { id: "units", label: "Units" },
      ] as const,
    [],
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ border: "1px solid #ccc", padding: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabButtons.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ccc",
                backgroundColor: currentTab === tab.id ? "#dbeafe" : "#f8fafc",
                fontWeight: currentTab === tab.id ? 700 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {currentTab === "locations" ? (
        <LocationEditor
          locations={data.locations}
          onSave={(locations) => onChangeData((current) => ({ ...current, locations }))}
        />
      ) : currentTab === "units" ? (
        <UnitEditor
          units={data.units}
          onSave={(units) => onChangeData((current) => ({ ...current, units }))}
        />
      ) : currentTab === "doughs" ? (
        <DoughEditor
          data={data}
          doughs={data.doughs}
          onSave={(doughs) => onChangeData((current) => ({ ...current, doughs }))}
        />
      ) : currentTab === "sizes" ? (
        <SizeEditor
          sizes={data.sizes}
          onSave={(sizes) => onChangeData((current) => ({ ...current, sizes }))}
        />
      ) : (
        <LibraryItemEditor
          key={currentTab}
          data={data}
          category={currentTab}
          items={getCollection(data, currentTab)}
          onSaveItems={(items) =>
            onChangeData((current) => setCollection(current, currentTab, items))
          }
        />
      )}
    </div>
  );
}
