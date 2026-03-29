import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppData, PizzaPlanRow, PartyPlan } from "../types";
import { initialAppData, makeId } from "../seeds";
import { storageAdapter } from "../storage/storage";

interface AppStateValue {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addPlanRow(): void;
  updatePlanRow(rowId: string, updates: Partial<PizzaPlanRow>): void;
  removePlanRow(rowId: string): void;
  updateActiveParty(updates: Partial<PartyPlan>): void;
  saveNow(): Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialAppData);

  useEffect(() => {
    storageAdapter.load().then(setData);
  }, []);

  useEffect(() => {
    storageAdapter.save(data);
  }, [data]);

  function addPlanRow() {
    setData((current) => ({
      ...current,
      activeParty: {
        ...current.activeParty,
        rows: [...current.activeParty.rows, { id: makeId("planrow"), quantity: 1 }],
      },
    }));
  } // end of addPlanRow()

  function updatePlanRow(rowId: string, updates: Partial<PizzaPlanRow>) {
    setData((current) => ({
      ...current,
      activeParty: {
        ...current.activeParty,
        rows: current.activeParty.rows.map((row) =>
          row.id === rowId ? { ...row, ...updates } : row
        ),
      },
    }));
  } // end of updatePlanRow()

  function removePlanRow(rowId: string) {
    setData((current) => ({
      ...current,
      activeParty: {
        ...current.activeParty,
        rows: current.activeParty.rows.filter((row) => row.id !== rowId),
      },
    }));
  } // end of removePlanRow()

  function updateActiveParty(updates: Partial<PartyPlan>) {
    setData((current) => ({
      ...current,
      activeParty: {
        ...current.activeParty,
        ...updates,
      },
    }));
  } // end of updateActiveParty()

  async function saveNow() {
    await storageAdapter.save(data);
  } // end of saveNow()

  const value = useMemo(
    () => ({
      data,
      setData,
      addPlanRow,
      updatePlanRow,
      removePlanRow,
      updateActiveParty,
      saveNow,
    }),
    [data]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
} // end of AppStateProvider()

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return ctx;
} // end of useAppState()
