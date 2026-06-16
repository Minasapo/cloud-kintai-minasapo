import useAdminOperationLogs from "@entities/operation-log/model/useAdminOperationLogs";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import fetchStaffs from "@entities/staff/model/useStaffs/fetchStaffs";
import {
  ModelOperationLogFilterInput,
  OperationLog,
  Staff,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildLogRow,
  isNonEmptyString,
  LogRow,
  StaffOption,
} from "./adminLogsTypes";

export function useAdminLogsData() {
  const [resourceFilter, setResourceFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffListLoading, setStaffListLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStaffs()
      .then((staffs) => {
        if (!active) return;
        setStaffList(staffs);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStaffListLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const staffOptions = useMemo<StaffOption[]>(
    () =>
      staffList
        .filter((staff) => isNonEmptyString(staff.cognitoUserId))
        .map((staff) => {
          const fullName =
            `${staff.familyName ?? ""} ${staff.givenName ?? ""}`.trim();
          return {
            label: fullName || staff.cognitoUserId,
            value: staff.cognitoUserId,
          };
        }),
    [staffList],
  );

  const operationLogFilter =
    useMemo<ModelOperationLogFilterInput | null>(() => {
      const filter: ModelOperationLogFilterInput = {};
      if (resourceFilter.trim()) {
        filter.resource = { eq: resourceFilter.trim() };
      }
      if (actorFilter.trim()) {
        filter.staffId = { eq: actorFilter.trim() };
      }
      if (targetFilter.trim()) {
        filter.targetStaffId = { eq: targetFilter.trim() };
      }
      if (actionFilter.trim()) {
        filter.action = { contains: actionFilter.trim() };
      }
      if (fromDate || toDate) {
        const from = fromDate
          ? dayjs(fromDate).startOf("day").toISOString()
          : "1970-01-01T00:00:00.000Z";
        const to = toDate
          ? dayjs(toDate).endOf("day").toISOString()
          : "9999-12-31T23:59:59.999Z";
        filter.timestamp = { between: [from, to] };
      }
      return Object.keys(filter).length > 0 ? filter : null;
    }, [
      actionFilter,
      actorFilter,
      fromDate,
      resourceFilter,
      targetFilter,
      toDate,
    ]);

  const {
    logs,
    excludedInvalidRecords,
    excludedInvalidRecordCount,
    loading,
    error,
    nextToken,
    loadInitial,
    loadMore,
  } = useAdminOperationLogs(30, operationLogFilter);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadInitial().catch(() => {});
  }, [loadInitial]);

  const [staffMap, setStaffMap] = useState<Record<string, Staff | null>>({});
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);

  useEffect(() => {
    const ids = Array.from(
      new Set(
        logs
          .flatMap((log) => [log.staffId, log.targetStaffId])
          .filter(isNonEmptyString),
      ),
    );
    const missing = ids.filter((id) => !(id in staffMap));
    if (missing.length === 0) return;
    (async () => {
      try {
        const results = await Promise.allSettled(
          missing.map((id) => fetchStaff(id)),
        );
        const updates: Record<string, Staff | null> = {};
        results.forEach((r, idx) => {
          const id = missing[idx];
          if (r.status === "fulfilled" && r.value) {
            updates[id] = r.value as Staff;
          } else {
            updates[id] = null;
          }
        });
        setStaffMap((prev) => ({ ...prev, ...updates }));
      } catch {
        // ignore
      }
    })();
  }, [logs]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && nextToken && !loading) {
            loadMore().catch(() => {});
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextToken, loadMore, loading]);

  const logRows = useMemo<LogRow[]>(
    () => logs.map((log, index) => buildLogRow(log, index, staffMap)),
    [logs, staffMap],
  );

  return {
    resourceFilter,
    setResourceFilter,
    actorFilter,
    setActorFilter,
    targetFilter,
    setTargetFilter,
    actionFilter,
    setActionFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    staffListLoading,
    staffOptions,
    logs,
    excludedInvalidRecords,
    excludedInvalidRecordCount,
    loading,
    error,
    nextToken,
    sentinelRef,
    staffMap,
    selectedLog,
    setSelectedLog,
    logRows,
  };
}
