import { Box, Stack, Typography } from "@mui/material";
import { useIsMobile } from "@shared/lib/hooks/useIsMobile";
import { CenteredSpinner } from "@shared/ui/feedback";
import { PageContent } from "@shared/ui/layout";

import { OperationLogDetailDialog } from "@/entities/operation-log/ui/OperationLogDetailDialog";

import AdminLogsDesktopTable from "./AdminLogsDesktopTable";
import AdminLogsFilterBar from "./AdminLogsFilterBar";
import AdminLogsMobileList from "./AdminLogsMobileList";
import { useAdminLogsData } from "./useAdminLogsData";

export default function AdminLogsClean() {
  const isMobile = useIsMobile();
  const {
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
  } = useAdminLogsData();

  return (
    <PageContent width="full">
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Box>
            <AdminLogsFilterBar
              resourceFilter={resourceFilter}
              actorFilter={actorFilter}
              targetFilter={targetFilter}
              actionFilter={actionFilter}
              fromDate={fromDate}
              toDate={toDate}
              staffOptions={staffOptions}
              staffListLoading={staffListLoading}
              onResourceFilterChange={setResourceFilter}
              onActorFilterChange={(v) => setActorFilter(v ?? "")}
              onTargetFilterChange={(v) => setTargetFilter(v ?? "")}
              onActionFilterChange={setActionFilter}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
            />

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

            {isMobile ? (
              <AdminLogsMobileList
                logRows={logRows}
                onSelectLog={setSelectedLog}
              />
            ) : (
              <AdminLogsDesktopTable
                logRows={logRows}
                onSelectLog={setSelectedLog}
              />
            )}

            {loading && <CenteredSpinner size={24} />}

            {error && <Typography color="error">{error.message}</Typography>}

            <div ref={sentinelRef} style={{ height: 1 }} />
            {!nextToken && !loading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                これ以上ログはありません。
              </Typography>
            )}
          </Box>

          <OperationLogDetailDialog
            log={selectedLog}
            open={selectedLog !== null}
            onClose={() => setSelectedLog(null)}
            staffMap={staffMap}
          />
        </Stack>
      </Stack>
    </PageContent>
  );
}
