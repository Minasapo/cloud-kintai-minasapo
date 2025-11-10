import {
  Box,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import useAdminOperationLogs from "@/hooks/useAdminOperationLogs/useAdminOperationLogs";

export default function AdminLogs() {
  const { logs, loading, error, nextToken, loadInitial, loadMore } =
    useAdminOperationLogs(30);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadInitial().catch(() => {});
  }, [loadInitial]);

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
                <div key={log.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`${log.action} — ${
                        log.resource ?? "(no resource)"
                      } ${log.resourceId ?? ""}`}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                          </Typography>
                          <Typography component="div" variant="body2">
                            {log.details ?? ""}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </div>
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
