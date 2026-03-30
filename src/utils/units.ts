import { UnitRecord, UnitTypeKind } from "../types";

const TEXT_UNITS = new Set([
  "to taste",
  "shake",
  "good shake",
]);

export function formatAmount(value?: number, unitName?: string): string {
  const normalizedUnit = (unitName ?? "").trim().toLowerCase();

  if (normalizedUnit && TEXT_UNITS.has(normalizedUnit)) {
    return unitName ?? "";
  }

  if (value === undefined || value === null) {
    return unitName ?? "";
  }

  const rounded =
    Number.isInteger(value) ? `${value}` : `${Math.round(value * 100) / 100}`;

  return unitName ? `${rounded} ${unitName}` : rounded;
}

export function unitsCompatible(a?: UnitTypeKind, b?: UnitTypeKind): boolean {
  if (!a || !b) return true;
  return a === b;
}

export function getUnitById(units: UnitRecord[], unitId?: string) {
  return units.find((u) => u.id === unitId);
}

export function classifyWarning(
  existingKind?: UnitTypeKind,
  nextKind?: UnitTypeKind,
): string | null {
  if (!existingKind || !nextKind) return null;
  if (existingKind === nextKind) return null;
  return `Unit kind mismatch (${existingKind} vs ${nextKind})`;
}
