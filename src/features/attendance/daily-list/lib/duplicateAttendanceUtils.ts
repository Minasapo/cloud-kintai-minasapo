import { DuplicateAttendanceDaily } from "@entities/attendance/model/useAttendanceDaily";

export function parseDuplicateListFromError(
  err: unknown,
  staffId: string,
  staffNameMap: Record<string, string>,
): DuplicateAttendanceDaily[] {
  const details =
    typeof err === "object" &&
    err !== null &&
    "details" in err &&
    typeof (err as { details?: unknown }).details === "object" &&
    (err as { details?: unknown }).details !== null
      ? ((
          err as {
            details: {
              duplicates?: unknown;
            };
          }
        ).details.duplicates ?? [])
      : [];

  if (!Array.isArray(details)) {
    return [];
  }

  return details
    .map((dup) => {
      if (
        !dup ||
        typeof dup !== "object" ||
        !("workDate" in dup) ||
        !("ids" in dup)
      ) {
        return null;
      }
      const candidate = dup as {
        workDate?: unknown;
        ids?: unknown;
        staffId?: unknown;
      };
      if (
        typeof candidate.workDate !== "string" ||
        !Array.isArray(candidate.ids)
      ) {
        return null;
      }
      const ids = candidate.ids.filter(
        (id): id is string => typeof id === "string",
      );
      return {
        staffId:
          typeof candidate.staffId === "string" ? candidate.staffId : staffId,
        staffName: staffNameMap[staffId] ?? staffId,
        workDate: candidate.workDate,
        ids,
      } satisfies DuplicateAttendanceDaily;
    })
    .filter(
      (dup): dup is DuplicateAttendanceDaily =>
        dup !== null && dup.ids.length > 1,
    );
}

export function mergeDuplicateAttendances(
  duplicateAttendances: DuplicateAttendanceDaily[],
  summaryDuplicateList: DuplicateAttendanceDaily[],
  loading: boolean,
): DuplicateAttendanceDaily[] {
  if (loading) {
    return [];
  }

  const unique = new Map<string, DuplicateAttendanceDaily>();
  [...duplicateAttendances, ...summaryDuplicateList].forEach((dup) => {
    const key = `${dup.staffId}-${dup.workDate}-${dup.ids.join("-")}`;
    if (!unique.has(key)) {
      unique.set(key, dup);
    }
  });
  return Array.from(unique.values());
}

export function buildDuplicateInfoByStaff(
  mergedDuplicateAttendances: DuplicateAttendanceDaily[],
): Record<string, DuplicateAttendanceDaily[]> {
  return mergedDuplicateAttendances.reduce<
    Record<string, DuplicateAttendanceDaily[]>
  >((acc, dup) => {
    const list = acc[dup.staffId] ?? [];
    list.push(dup);
    acc[dup.staffId] = list;
    return acc;
  }, {});
}
