import { useEffect, useState } from "react";
import type { AppData, PersonRecord } from "../types";

interface PeopleEditorProps {
  data: AppData;
  onChangeData: (updater: (current: AppData) => AppData) => void;
}

function makePersonId() {
  return `person_${Math.random().toString(36).slice(2, 10)}`;
}

function blankPerson(): PersonRecord {
  return {
    id: makePersonId(),
    name: "",
    associatedName: "",
    howMet: "",
    note: "",
    phone: "",
  };
}

export function PeopleEditor({ data, onChangeData }: PeopleEditorProps) {
  const [drafts, setDrafts] = useState<PersonRecord[]>(data.people);

  useEffect(() => {
    setDrafts(data.people);
  }, [data.people]);

  function updateDraft(index: number, updates: Partial<PersonRecord>) {
    setDrafts((current) =>
      current.map((person, personIndex) =>
        personIndex === index ? { ...person, ...updates } : person,
      ),
    );
  }

  function addPerson() {
    setDrafts((current) => [...current, blankPerson()]);
  }

  function removePerson(index: number) {
    setDrafts((current) => current.filter((_, personIndex) => personIndex !== index));
  }

  function saveAll() {
    const cleaned = drafts
      .map((person) => ({
        ...person,
        name: person.name.trim(),
        associatedName: person.associatedName?.trim() || undefined,
        howMet: person.howMet?.trim() || undefined,
        note: person.note?.trim() || undefined,
        phone: person.phone?.trim() || undefined,
      }))
      .filter((person) => person.name);

    onChangeData((current) => ({
      ...current,
      people: cleaned,
    }));

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
        <h3 style={{ margin: 0 }}>People</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={addPerson}>
            Add Person
          </button>
          <button type="button" onClick={saveAll}>
            Save People
          </button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Associated Name</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>How Met</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Phone</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Note</th>
            <th style={{ border: "1px solid #ccc", padding: 6, textAlign: "left" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((person, index) => (
            <tr key={person.id}>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={person.name}
                  onChange={(e) => updateDraft(index, { name: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={person.associatedName ?? ""}
                  onChange={(e) =>
                    updateDraft(index, { associatedName: e.target.value })
                  }
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={person.howMet ?? ""}
                  onChange={(e) => updateDraft(index, { howMet: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={person.phone ?? ""}
                  onChange={(e) => updateDraft(index, { phone: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <input
                  type="text"
                  value={person.note ?? ""}
                  onChange={(e) => updateDraft(index, { note: e.target.value })}
                  style={{ width: "100%" }}
                />
              </td>
              <td style={{ border: "1px solid #ccc", padding: 6 }}>
                <button type="button" onClick={() => removePerson(index)}>
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
