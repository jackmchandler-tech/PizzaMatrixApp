import { useEffect, useMemo, useState } from "react";
import type {
  AppData,
  LibraryCategory,
  LibraryItem,
  LocationRecord,
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>{categoryLabel(category)}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addItem}>
            Add {categoryLabel(category).slice(0, -1)}
          </button>
          <button type="button" onClick={saveAll}>
            Save {categoryLabel(category)}
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Location
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Unit
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Default mise en place
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Notes
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Remove
            </th>
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
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <select
                  value={item.defaultLocationId ?? ""}
                  onChange={(e) =>
                    updateDraft(index, {
                      defaultLocationId: e.target.value || undefined,
                    })
                  }
                  style={{ width: "100%" }}
                >
                  <option value="">Select</option>
                  {data.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <select
                  value={item.defaultUnitId ?? ""}
                  onChange={(e) =>
                    updateDraft(index, {
                      defaultUnitId: e.target.value || undefined,
                    })
                  }
                  style={{ width: "100%" }}
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
                  type="text"
                  value={item.defaultMiseEnPlace ?? ""}
                  onChange={(e) =>
                    updateDraft(index, {
                      defaultMiseEnPlace: e.target.value,
                    })
                  }
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={item.notes ?? ""}
                  onChange={(e) => updateDraft(index, { notes: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeItem(index)}>
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
    setDrafts((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  }

  function addLocation() {
    setDrafts((current) => [...current, blankLocation(current.length + 1)]);
  }

  function removeLocation(index: number) {
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item, index) => ({
        ...item,
        name: item.name.trim(),
        sortOrder: index + 1,
      }))
      .filter((item) => item.name);

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
        <h3 style={{ margin: 0 }}>Locations</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addLocation}>
            Add Location
          </button>
          <button type="button" onClick={saveAll}>
            Save Locations
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Remove
            </th>
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
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeLocation(index)}>
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
    setDrafts((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  }

  function addUnit() {
    setDrafts((current) => [...current, blankUnit(current.length + 1)]);
  }

  function removeUnit(index: number) {
    setDrafts((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((item, index) => ({
        ...item,
        name: item.name.trim(),
        symbol: item.symbol.trim(),
        sortOrder: index + 1,
      }))
      .filter((item) => item.name);

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
        <h3 style={{ margin: 0 }}>Units</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addUnit}>
            Add Unit
          </button>
          <button type="button" onClick={saveAll}>
            Save Units
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Name
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Symbol
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Kind
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>
              Remove
            </th>
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
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={item.symbol}
                  onChange={(e) => updateDraft(index, { symbol: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <select
                  value={item.kind}
                  onChange={(e) =>
                    updateDraft(index, {
                      kind: e.target.value as UnitTypeKind,
                    })
                  }
                  style={{ width: "100%" }}
                >
                  <option value="mass">mass</option>
                  <option value="volume">volume</option>
                  <option value="count">count</option>
                  <option value="length">length</option>
                  <option value="text">text</option>
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removeUnit(index)}>
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

export function LibraryEditor({ data, onChangeData }: LibraryEditorProps) {
  const [currentTab, setCurrentTab] = useState<SetupTab>("sauces");

  const tabButtons = useMemo(
    () =>
      [
        { id: "sauces", label: "Sauces" },
        { id: "cheeses", label: "Cheeses" },
        { id: "toppings", label: "Toppings" },
        { id: "seasonings", label: "Seasonings" },
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
          onSave={(locations) =>
            onChangeData((current) => ({ ...current, locations }))
          }
        />
      ) : currentTab === "units" ? (
        <UnitEditor
          units={data.units}
          onSave={(units) => onChangeData((current) => ({ ...current, units }))}
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
