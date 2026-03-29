import { UnitRecord, UnitTypeKind } from "../types";

export function formatAmount(value?: number, unitName?: string): string {
  if (value === undefined || value === null) return "";
  const rounded = Number.isInteger(value) ? `${value}` : `${Math.round(value * 100) / 100}`;
  return unitName ? `${rounded} ${unitName}` : rounded;
} // end of formatAmount()

export function unitsCompatible(a?: UnitTypeKind, b?: UnitTypeKind): boolean {
  if (!a || !b) return true;
  return a === b;
} // end of unitsCompatible()

export function getUnitById(units: UnitRecord[], unitId?: string) {
  return units.find((u) => u.id === unitId);
} // end of getUnitById()

export function classifyWarning(existingKind?: UnitTypeKind, nextKind?: UnitTypeKind): string | null {
  if (!existingKind || !nextKind) return null;
  if (existingKind === nextKind) return null;
  return `Unit kind mismatch (${existingKind} vs ${nextKind})`;
} // end of classifyWarning()
// end of units.ts
