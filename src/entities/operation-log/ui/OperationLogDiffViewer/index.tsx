import { buildDiffEntries } from "./lib/buildDiffEntries";
import { flattenObject } from "./lib/flattenObject";
import { isPlainObject } from "./lib/isPlainObject";

export type DiffKind = "changed" | "added" | "removed" | "unchanged";

export interface DiffEntry {
  key: string;
  beforeValue: string | null;
  afterValue: string | null;
  kind: DiffKind;
}

const CELL_CLASSES: Record<DiffKind, { before: string; after: string }> = {
  changed: {
    before: "bg-red-50 text-red-800",
    after: "bg-green-50 text-green-800",
  },
  added: {
    before: "bg-slate-50 text-slate-400 italic",
    after: "bg-green-50 text-green-800",
  },
  removed: {
    before: "bg-red-50 text-red-800",
    after: "bg-slate-50 text-slate-400 italic",
  },
  unchanged: {
    before: "bg-slate-50 text-slate-500",
    after: "bg-slate-50 text-slate-500",
  },
};

function DiffRow({ entry }: { entry: DiffEntry }) {
  const cls = CELL_CLASSES[entry.kind];
  const beforeText = entry.beforeValue ?? "(なし)";
  const afterText = entry.afterValue ?? "(なし)";

  return (
    <tr>
      <td className="w-1/4 border-b border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
        {entry.key}
      </td>
      <td
        className={`w-[37.5%] border-b border-l border-slate-200 px-3 py-1.5 font-mono text-xs break-all ${cls.before}`}
      >
        {beforeText}
      </td>
      <td
        className={`w-[37.5%] border-b border-l border-slate-200 px-3 py-1.5 font-mono text-xs break-all ${cls.after}`}
      >
        {afterText}
      </td>
    </tr>
  );
}

interface OperationLogDiffViewerProps {
  before: unknown;
  after: unknown;
}

export function OperationLogDiffViewer({
  before,
  after,
}: OperationLogDiffViewerProps) {
  if (!isPlainObject(before) && !isPlainObject(after)) {
    return null;
  }

  const flatBefore = isPlainObject(before) ? flattenObject(before) : {};
  const flatAfter = isPlainObject(after) ? flattenObject(after) : {};

  const entries = buildDiffEntries(flatBefore, flatAfter);

  const changedCount = entries.filter((e) => e.kind === "changed").length;
  const addedCount = entries.filter((e) => e.kind === "added").length;
  const removedCount = entries.filter((e) => e.kind === "removed").length;

  const hasDiff = changedCount > 0 || addedCount > 0 || removedCount > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="text-sm font-semibold text-slate-700">
          変更内容 (Before / After)
        </span>
        <div className="flex gap-2 text-xs">
          {!hasDiff && <span className="text-slate-500">変更なし</span>}
          {changedCount > 0 && (
            <span className="rounded bg-yellow-100 px-1.5 py-0.5 font-medium text-yellow-800">
              {changedCount}件変更
            </span>
          )}

          {removedCount > 0 && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700">
              {removedCount}件削除
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="w-1/4 px-3 py-2 text-xs font-semibold text-slate-500">
                フィールド
              </th>
              <th className="w-[37.5%] border-l border-slate-200 px-3 py-2 text-xs font-semibold text-red-600">
                変更前 (Before)
              </th>
              <th className="w-[37.5%] border-l border-slate-200 px-3 py-2 text-xs font-semibold text-green-700">
                変更後 (After)
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <DiffRow key={entry.key} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
