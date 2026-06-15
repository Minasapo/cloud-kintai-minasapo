import { getOperationLogLabel } from "@entities/operation-log/lib/operationLogLabels";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type { OperationLog, Staff } from "@shared/api/graphql/types";
import { AppIconButton } from "@shared/ui/button";
import dayjs from "dayjs";

import { getOperationLogDisplaySummary } from "@/entities/operation-log/lib/operationLogDisplay";

import { OperationLogJsonDetails } from "../OperationLogJsonDetails";
import { isNonEmptyString } from "./lib/isNonEmptyString";
import { staffLabel } from "./lib/staffLabel";
import { operationLogDetailDialogStyles } from "./styles";

interface OperationLogDetailDialogProps {
  log: OperationLog | null;
  open: boolean;
  onClose: () => void;
  staffMap: Record<string, Staff | null>;
}

export function OperationLogDetailDialog({
  log,
  open,
  onClose,
  staffMap,
}: OperationLogDetailDialogProps) {
  if (!log) return null;

  const actionLabel = getOperationLogLabel(log.action);
  const summary = getOperationLogDisplaySummary(log);
  const summaryIsDistinct = summary !== actionLabel;
  const workDate =
    (log.resolvedWorkDate as string | null | undefined) ??
    ((log.metadata as Record<string, unknown> | null | undefined)?.[
      "workDate"
    ] as string | null | undefined);
  const actorText = staffLabel("操作者", log.staffId as unknown, staffMap);
  const targetText = staffLabel(
    "対象スタッフ",
    log.targetStaffId as unknown,
    staffMap,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle
        component="div"
        sx={operationLogDetailDialogStyles.dialogTitle}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={operationLogDetailDialogStyles.timestamp}
        >
          {log.timestamp
            ? dayjs(log.timestamp).format("YYYY-MM-DD HH:mm:ss")
            : "-"}
        </Typography>
        <Chip size="small" label={actionLabel} />
        <AppIconButton aria-label="閉じる" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </AppIconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Actor / Target */}
          <Box>
            <Typography variant="body2">{actorText}</Typography>
            <Typography variant="body2">{targetText}</Typography>
          </Box>

          <Divider />

          {/* Work date / Summary — only shown when there is meaningful info */}
          {(workDate || summaryIsDistinct) && (
            <Box>
              {workDate && (
                <Typography variant="body2">
                  勤務日: {dayjs(workDate).format("YYYY/MM/DD")}
                </Typography>
              )}
              {summaryIsDistinct && (
                <Typography variant="body2" color="text.secondary">
                  操作内容: {summary}
                </Typography>
              )}
            </Box>
          )}

          {/* IP / UserAgent */}
          {(isNonEmptyString(log.ipAddress) ||
            isNonEmptyString(log.userAgent)) && (
            <>
              <Divider />
              <Box>
                {isNonEmptyString(log.ipAddress) && (
                  <Typography variant="caption" display="block">
                    IPアドレス: {log.ipAddress}
                  </Typography>
                )}
                {isNonEmptyString(log.userAgent) && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={operationLogDetailDialogStyles.userAgent}
                  >
                    ユーザーエージェント: {log.userAgent}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {/* JSON sections */}
          <OperationLogJsonDetails log={log} className="flex flex-col gap-2" />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
