import type { FieldErrors } from "react-hook-form";

import { AttendanceEditInputs } from "@/pages/attendance/edit/common";

export const collectAttendanceErrorMessages = (
  fieldErrors: FieldErrors<AttendanceEditInputs>
) => {
  const messages = new Set<string>();

  const traverse = (error: unknown) => {
    if (!error) {
      return;
    }

    if (Array.isArray(error)) {
      error.forEach(traverse);
      return;
    }

    if (typeof error === "object") {
      const maybeMessage = (error as { message?: unknown }).message;
      if (typeof maybeMessage === "string") {
        messages.add(maybeMessage);
      }

      Object.values(error as Record<string, unknown>).forEach(traverse);
    }
  };

  traverse(fieldErrors);
  return Array.from(messages);
};
