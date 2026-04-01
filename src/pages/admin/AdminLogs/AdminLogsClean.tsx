import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import {
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ModelOperationLogFilterInput, Staff } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  formatOperationLogInlineValue,
  getOperationLogDisplaySummary,
  getOperationLogResourceDisplay,
} from "@/entities/operation-log/lib/operationLogDisplay";
import { getOperationLogLabel } from "@/entities/operation-log/lib/operationLogLabels";
import { OperationLogJsonDetails } from "@/entities/operation-log/ui/OperationLogJsonDetails";
import useAdminOperationLogs from "@/hooks/useAdminOperationLogs/useAdminOperationLogs";
import { PageContent } from "@/shared/ui/layout";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export default function AdminLogsClean() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [resourceFilter, setResourceFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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
            // treat fulfilled-but-empty and rejected results as null
            updates[id] = null;
          }
        });
        setStaffMap((prev) => ({ ...prev, ...updates }));
      } catch {
        // ignore; best-effort
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

  return (
    <PageContent width="full">
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <TextField
                size="small"
                label="Resource"
                value={resourceFilter}
                onChange={(event) => setResourceFilter(event.target.value)}
              />
              <TextField
                size="small"
                label="Actor"
                value={actorFilter}
                onChange={(event) => setActorFilter(event.target.value)}
                helperText="cognitoUserId"
              />
              <TextField
                size="small"
                label="Target"
                value={targetFilter}
                onChange={(event) => setTargetFilter(event.target.value)}
                helperText="cognitoUserId"
              />
              <TextField
                size="small"
                label="Action"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              />
              <TextField
                size="small"
                type="date"
                label="From"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Typography variant="body2" sx={{ mb: 2 }}>
              新形式ログを新しい順に表示します。詳細は各行の JSON
              パネルから確認できます。
            </Typography>

            {excludedInvalidRecords && (
              <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                一部の無効なログレコードを除外して表示しています
                {excludedInvalidRecordCount > 0
                  ? `（少なくとも ${excludedInvalidRecordCount} 件）`
                  : "。"}
              </Typography>
            )}

            <List>
              {logs.map((log) =>
                (() => {
                  const actorId = log.staffId as unknown;
                  const targetStaffId = log.targetStaffId as unknown;
                  const actorIdText = formatOperationLogInlineValue(actorId);
                  const targetIdText =
                    formatOperationLogInlineValue(targetStaffId);
                  const actorEntry =
                    isNonEmptyString(actorId) && actorId in staffMap
                      ? staffMap[actorId]
                      : undefined;
                  const targetEntry =
                    isNonEmptyString(targetStaffId) && targetStaffId in staffMap
                      ? staffMap[targetStaffId]
                      : undefined;
                  const actorLabel = (() => {
                    if (!actorIdText) {
                      return "Actor: -";
                    }
                    if (!isNonEmptyString(actorId)) {
                      return `Actor: ${actorIdText}`;
                    }
                    if (!(actorId in staffMap)) {
                      return "Actor: 読み込み中...";
                    }
                    if (actorEntry === null) {
                      return `Actor: ${actorIdText}`;
                    }
                    return `Actor: ${`${actorEntry?.familyName ?? ""} ${
                      actorEntry?.givenName ?? ""
                    }`.trim()}`;
                  })();
                  const targetLabel = (() => {
                    if (!targetIdText) {
                      return "Target: -";
                    }
                    if (!isNonEmptyString(targetStaffId)) {
                      return `Target: ${targetIdText}`;
                    }
                    if (!(targetStaffId in staffMap)) {
                      return "Target: 読み込み中...";
                    }
                    if (targetEntry === null) {
                      return `Target: ${targetIdText}`;
                    }
                    return `Target: ${`${targetEntry?.familyName ?? ""} ${
                      targetEntry?.givenName ?? ""
                    }`.trim()}`;
                  })();
                  const resourceLabel = getOperationLogResourceDisplay({
                    resource: log.resource as unknown,
                    resourceId: log.resourceId as unknown,
                    resourceKey: log.resourceKey as unknown,
                  });
                  const userAgentText = isNonEmptyString(log.userAgent)
                    ? log.userAgent
                    : null;

                  return (
                    <ListItem
                      key={log.id}
                      divider
                      alignItems="flex-start"
                      sx={{
                        py: 1.5,
                        px: { xs: 0, sm: 1 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      {/* 日時 + アクション */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: { xs: "flex-start", sm: "center" },
                          width: { xs: "100%", sm: 320 },
                          minWidth: { xs: 0, sm: 320 },
                          flexDirection: { xs: "column", sm: "row" },
                          gap: { xs: 0.5, sm: 0 },
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap={!isMobile}
                          title={
                            log.timestamp
                              ? dayjs(log.timestamp).format(
                                  "YYYY-MM-DD HH:mm:ss",
                                )
                              : undefined
                          }
                          sx={{ display: "block" }}
                        >
                          {log.timestamp
                            ? dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
                            : "-"}
                        </Typography>
                        <Chip
                          size="small"
                          label={getOperationLogLabel(log.action)}
                          sx={{ ml: { xs: 0, sm: 1 } }}
                        />
                      </Box>

                      {/* スタッフ名を独立列として表示 */}
                      <Box
                        sx={{
                          width: { xs: "100%", sm: 240 },
                          minWidth: { xs: 0, sm: 240 },
                          ml: { xs: 0, sm: 2 },
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {actorLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {targetLabel}
                        </Typography>
                      </Box>

                      {/* リソース情報 */}
                      <Box
                        sx={{
                          flex: 1,
                          ml: { xs: 0, sm: 2 },
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {resourceLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getOperationLogDisplaySummary(log)}
                        </Typography>
                      </Box>

                      {/* 詳細 */}
                      <Box
                        sx={{
                          width: { xs: "100%", sm: "40%" },
                          minWidth: { xs: 0, sm: 240 },
                          ml: { xs: 0, sm: 2 },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {getOperationLogDisplaySummary(log)}
                        </Typography>

                        {userAgentText && (
                          <Tooltip title={userAgentText} placement="top-start">
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "monospace",
                                mt: 1,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: { xs: "normal", sm: "nowrap" },
                                wordBreak: "break-word",
                              }}
                            >
                              {userAgentText.length > 140
                                ? `${userAgentText.slice(0, 137)}...`
                                : userAgentText}
                            </Typography>
                          </Tooltip>
                        )}

                        <OperationLogJsonDetails
                          log={log}
                          className="mt-3 flex flex-col gap-2"
                        />
                      </Box>
                    </ListItem>
                  );
                })(),
              )}
            </List>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {error && <Typography color="error">{error.message}</Typography>}

            {/* sentinel for infinite scroll */}
            <div ref={sentinelRef} style={{ height: 1 }} />
            {!nextToken && !loading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                これ以上ログはありません。
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>
    </PageContent>
  );
}
