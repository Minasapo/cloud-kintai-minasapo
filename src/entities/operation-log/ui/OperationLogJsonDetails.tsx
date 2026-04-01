import { OperationLog } from "@shared/api/graphql/types";
import { useMemo } from "react";

import {
  parseOperationLogJson,
} from "@/entities/operation-log/model/canonicalOperationLog";

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

export function OperationLogJsonDetails({
  log,
  className,
}: {
  log: Pick<OperationLog, "before" | "after" | "diff" | "details" | "metadata">;
  className?: string;
}) {
  const sections = useMemo<JsonSection[]>(() => {
    const candidates: JsonSection[] = [
      { label: "Diff", value: parseOperationLogJson(log.diff) },
      { label: "Before", value: parseOperationLogJson(log.before) },
      { label: "After", value: parseOperationLogJson(log.after) },
      { label: "Details", value: parseOperationLogJson(log.details) },
      { label: "Metadata", value: parseOperationLogJson(log.metadata) },
    ];

    return candidates.filter((section) => section.value !== null);
  }, [log.after, log.before, log.details, log.diff, log.metadata]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {sections.map((section) => (
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
