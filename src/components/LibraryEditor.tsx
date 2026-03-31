import { useMemo, useState } from "react";
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
} // end of UnitEditor()

export function LibraryEditor({ data, onChangeData }: LibraryEditorProps) {
  const [currentTab, setCurrentTab] = useState<SetupTab>("sauces");

  const tabButtons = useMemo(
    () => [
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
          onSave={(locations) => onChangeData((current) => ({ ...current, locations }))}
        />
      ) : currentTab === "units" ? (
        <UnitEditor
          units={data.units}
          onSave={(units) => onChangeData((current) => ({ ...current, units }))}
        />
      ) : (
        <LibraryItemEditor
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
} // end of LibraryEditor()
