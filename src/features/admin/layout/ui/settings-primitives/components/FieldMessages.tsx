import type { ReactNode } from "react";

type FieldMessagesProps = {
  helperText?: ReactNode;
  errorText?: ReactNode;
};

export function FieldMessages({
  helperText,
  errorText,
}: FieldMessagesProps) {
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