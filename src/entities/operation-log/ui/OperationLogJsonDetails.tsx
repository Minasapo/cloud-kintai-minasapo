import { OperationLog } from "@shared/api/graphql/types";
import { useMemo } from "react";

import { parseOperationLogJson } from "@/entities/operation-log/model/canonicalOperationLog";

import { OperationLogDiffViewer } from "./OperationLogDiffViewer";

type JsonSection = {
  label: string;
  value: unknown;
};

function JsonPre({ value }: { value: unknown }) {
  return (
    <pre className="m-0 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

type FullDiff = {
  mode: string;
  before: unknown;
  after: unknown;
};

function isFullDiff(value: unknown): value is FullDiff {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "before" in (value as object) &&
    "after" in (value as object)
  );
}

function resolveDiffSources(
  diff: unknown,
  before: unknown,
  after: unknown,
): { before: unknown; after: unknown } | null {
  if (isFullDiff(diff)) {
    return { before: diff.before, after: diff.after };
  }
  if (before !== null || after !== null) {
    return { before, after };
  }
  return null;
}

export function OperationLogJsonDetails({
  log,
  className,
}: {
  log: Pick<OperationLog, "before" | "after" | "diff" | "details" | "metadata">;
  className?: string;
}) {
  const diffSources = useMemo(() => {
    const parsedDiff = parseOperationLogJson(log.diff);
    const parsedBefore = parseOperationLogJson(log.before);
    const parsedAfter = parseOperationLogJson(log.after);
    return resolveDiffSources(parsedDiff, parsedBefore, parsedAfter);
  }, [log.diff, log.before, log.after]);

  const extraSections = useMemo<JsonSection[]>(() => {
    const candidates: JsonSection[] = [
      { label: "詳細", value: parseOperationLogJson(log.details) },
      { label: "メタデータ", value: parseOperationLogJson(log.metadata) },
    ];
    return candidates.filter((section) => section.value !== null);
  }, [log.details, log.metadata]);

  if (!diffSources && extraSections.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {diffSources && (
        <OperationLogDiffViewer
          before={diffSources.before}
          after={diffSources.after}
        />
      )}
      {extraSections.map((section) => (
        <details
          key={section.label}
          className="rounded-2xl border border-slate-200 bg-white"
        >
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-700">
            {section.label}
          </summary>
          <div className="border-t border-slate-200 p-3">
            <JsonPre value={section.value} />
          </div>
        </details>
      ))}
    </div>
  );
}
