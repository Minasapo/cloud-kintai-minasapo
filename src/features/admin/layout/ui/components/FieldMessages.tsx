import type { ReactNode } from "react";

export function FieldMessages({
  helperText,
  errorText,
}: {
  helperText?: ReactNode;
  errorText?: ReactNode;
}) {
  if (!helperText && !errorText) {
    return null;
  }

  return (
    <p
      className={`m-0 text-xs leading-5 ${errorText ? "text-rose-600" : "text-slate-500"}`}
    >
      {errorText ?? helperText}
    </p>
  );
}