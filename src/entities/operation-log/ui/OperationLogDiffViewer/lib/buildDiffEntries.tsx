import { DiffEntry, DiffKind } from "..";
import { displayValue } from "./displayValue";

export function buildDiffEntries(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): DiffEntry[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  const entries: DiffEntry[] = [];
  for (const key of allKeys) {
    const inBefore = key in before;
    const inAfter = key in after;

    if (!inBefore && inAfter) {
      entries.push({
        key,
        beforeValue: null,
        afterValue: displayValue(after[key]),
        kind: "added",
      });
    } else if (inBefore && !inAfter) {
      entries.push({
        key,
        beforeValue: displayValue(before[key]),
        afterValue: null,
        kind: "removed",
      });
    } else {
      const bv = displayValue(before[key]);
      const av = displayValue(after[key]);
      entries.push({
        key,
        beforeValue: bv,
        afterValue: av,
        kind: bv === av ? "unchanged" : "changed",
      });
    }
  }

  const kindOrder: Record<DiffKind, number> = {
    changed: 0,
    added: 1,
    removed: 2,
    unchanged: 3,
  };

  return entries.toSorted((a, b) => {
    const orderDiff = kindOrder[a.kind] - kindOrder[b.kind];
    if (orderDiff !== 0) return orderDiff;
    return a.key.localeCompare(b.key);
  });
}
