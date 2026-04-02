import { storageAdapter } from "../storage/storage";
import type { AppData } from "../types";

interface BackupManagerProps {
  data: AppData;
  onImportData: (nextData: AppData) => void;
}

export function BackupManager({ data, onImportData }: BackupManagerProps) {
  function exportBackup() {
    const json = storageAdapter.exportJson(data);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pizza-matrix-backup.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  async function importBackup(file: File) {
    const text = await file.text();
    const imported = await storageAdapter.importJson(text);
    onImportData(imported);
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" onClick={exportBackup}>
          Export Full Backup
        </button>

        <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>Import Full Backup</span>
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const confirmed = window.confirm(
                "Importing a backup will replace the current app data. Continue?",
              );
              if (!confirmed) return;

              try {
                await importBackup(file);
                alert("Backup imported.");
              } catch (error) {
                console.error(error);
                alert("Backup import failed. Please verify the file.");
              }

              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
