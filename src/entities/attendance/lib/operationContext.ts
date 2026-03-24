type AttendanceActionName =
  | "clock_in"
  | "clock_out"
  | "go_directly"
  | "return_directly"
  | "rest_start"
  | "rest_end"
  | "manual";

export const resolveClientTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";

export const resolveAppVersion = () =>
  import.meta.env.VITE_APP_VERSION ||
  import.meta.env.VITE_COMMIT_SHA ||
  "unknown";

const randomSuffix = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const buildAttendanceIdempotencyKey = ({
  action,
  staffId,
  occurredAt,
}: {
  action: AttendanceActionName;
  staffId: string;
  occurredAt: string;
}) => `${action}:${staffId}:${occurredAt}:${randomSuffix()}`;
