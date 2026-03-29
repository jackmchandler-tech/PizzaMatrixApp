import { AppData } from "../types";
import { initialAppData } from "../seeds";

const STORAGE_KEY = "pizza_matrix_app_data_v1";

export interface StorageAdapter {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  reset(): Promise<AppData>;
  exportJson(data: AppData): string;
  importJson(raw: string): Promise<AppData>;
}

class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<AppData> {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(initialAppData);
    }

    try {
      const parsed = JSON.parse(raw) as AppData;
      return parsed;
    } catch {
      return structuredClone(initialAppData);
    }
  } // end of load()

  async save(data: AppData): Promise<void> {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } // end of save()

  async reset(): Promise<AppData> {
    const next = structuredClone(initialAppData);
    await this.save(next);
    return next;
  } // end of reset()

  exportJson(data: AppData): string {
    return JSON.stringify(data, null, 2);
  } // end of exportJson()

  async importJson(raw: string): Promise<AppData> {
    const parsed = JSON.parse(raw) as AppData;
    await this.save(parsed);
    return parsed;
  } // end of importJson()
} // end of LocalStorageAdapter

export const storageAdapter: StorageAdapter = new LocalStorageAdapter();
// end of storage.ts
