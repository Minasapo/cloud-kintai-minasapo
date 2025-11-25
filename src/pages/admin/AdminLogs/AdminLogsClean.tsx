import {
  Box,
  Chip,
  CircularProgress,
  Container,
  List,
  ListItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

import { Staff } from "@/API";
import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import { getOperationLogLabel } from "@/constants/operationLogLabels";
import useAdminOperationLogs from "@/hooks/useAdminOperationLogs/useAdminOperationLogs";
import fetchStaff from "@/hooks/useStaff/fetchStaff";

export default function AdminLogsClean() {
  const { logs, loading, error, nextToken, loadInitial, loadMore } =
    useAdminOperationLogs(30);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadInitial().catch(() => {});
  }, [loadInitial]);

  const [staffMap, setStaffMap] = useState<Record<string, Staff | null>>({});

  useEffect(() => {
    const ids = Array.from(
      new Set(logs.map((l) => l.staffId).filter((id): id is string => !!id))
    );
    const missing = ids.filter((id) => !(id in staffMap));
    if (missing.length === 0) return;

    (async () => {
      try {
        const results = await Promise.allSettled(
          missing.map((id) => fetchStaff(id))
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
      { root: null, rootMargin: "200px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [nextToken, loadMore, loading]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Box>
          <CommonBreadcrumbs
            items={[{ label: "TOP", href: "/" }]}
            current="ログ管理"
          />
        </Box>

        <Stack spacing={1}>
          <Box>
            <Typography variant="h6">ログ管理</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              最新の 30
              件を表示します。スクロールで過去のログを順次読み込みます。
            </Typography>

            <List>
              {logs.map((log) => (
                <ListItem
                  key={log.id}
                  divider
                  alignItems="flex-start"
                  sx={{ py: 1 }}
                >
                  {/* 日時 + アクション */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: 320,
                      minWidth: 320,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={
                        log.timestamp
                          ? dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
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
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  {/* スタッフ名を独立列として表示 */}
                  <Box sx={{ width: 240, minWidth: 240, ml: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        if (!log.staffId) return "スタッフ情報なし";
                        // key exists in map means we've attempted to fetch (may be null on failure)
                        if (!(log.staffId in staffMap)) return "読み込み中...";
                        const entry = staffMap[log.staffId];
                        if (entry === null) return `スタッフ: ${log.staffId}`;
                        return `${entry!.familyName ?? ""} ${
                          entry!.givenName ?? ""
                        }`.trim();
                      })()}
                    </Typography>
                  </Box>

                  {/* リソース情報 */}
                  <Box sx={{ flex: 1, ml: 2 }}>
                    <Typography variant="subtitle2">
                      {log.resource ?? "(no resource)"} {log.resourceId ?? ""}
                    </Typography>
                  </Box>

                  {/* 詳細 */}
                  <Box sx={{ width: "40%", minWidth: 240, ml: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {log.details ?? ""}
                    </Typography>

                    {log.userAgent && (
                      <Tooltip title={log.userAgent} placement="top-start">
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            mt: 1,
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.userAgent.length > 140
                            ? `${log.userAgent.slice(0, 137)}...`
                            : log.userAgent}
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                </ListItem>
              ))}
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
    </Container>
  );
}
