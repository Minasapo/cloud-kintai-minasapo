import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Workflow as WorkflowType } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import { useEffect, useMemo, useState } from "react";

import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";

interface WorkflowCarouselDialogProps {
  open: boolean;
  onClose: () => void;
  selectedWorkflowId: string;
  filteredWorkflowIds: string[];
  workflowsById: Map<string, WorkflowType>;
  staffNamesById: Map<string, string>;
  onOpenInRightPanel: (workflowId: string) => void;
}

export default function WorkflowCarouselDialog({
  open,
  onClose,
  selectedWorkflowId,
  filteredWorkflowIds,
  workflowsById,
  staffNamesById,
  onOpenInRightPanel,
}: WorkflowCarouselDialogProps) {
  const initialIndex = useMemo(
    () =>
      Math.max(
        filteredWorkflowIds.findIndex(
          (workflowId) => workflowId === selectedWorkflowId,
        ),
        0,
      ),
    [filteredWorkflowIds, selectedWorkflowId],
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentWorkflowId = filteredWorkflowIds[currentIndex] ?? null;
  const currentWorkflow = currentWorkflowId
    ? workflowsById.get(currentWorkflowId)
    : undefined;

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < filteredWorkflowIds.length - 1;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "Enter" && currentWorkflowId) {
        event.preventDefault();
        onOpenInRightPanel(currentWorkflowId);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    open,
    canGoPrev,
    canGoNext,
    currentWorkflowId,
    onClose,
    onOpenInRightPanel,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">ワークフローをまとめて確認</Typography>
          <IconButton aria-label="閉じる" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {currentWorkflow ? (
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Chip
                size="small"
                label={`${currentIndex + 1} / ${filteredWorkflowIds.length}`}
              />
              <Tooltip title="右側で開く">
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<OpenInNewOutlinedIcon />}
                    onClick={() =>
                      currentWorkflowId && onOpenInRightPanel(currentWorkflowId)
                    }
                    disabled={!currentWorkflowId}
                  >
                    右側で開く
                  </Button>
                </span>
              </Tooltip>
            </Stack>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                申請種別
              </Typography>
              <Typography variant="body1">
                {getWorkflowCategoryLabel(currentWorkflow)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                申請者
              </Typography>
              <Typography variant="body1">
                {staffNamesById.get(currentWorkflow.staffId || "") || "不明"}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  申請日
                </Typography>
                <Typography variant="body1">
                  {currentWorkflow.createdAt
                    ? currentWorkflow.createdAt.split("T")[0]
                    : "-"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  ステータス
                </Typography>
                <StatusChip status={currentWorkflow.status} />
              </Box>
            </Stack>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                承認ステップ
              </Typography>
              <Typography variant="body2">
                {(currentWorkflow.approvalSteps?.length ?? 0) > 0
                  ? `${currentWorkflow.approvalSteps?.length} 件`
                  : "未設定"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                コメント
              </Typography>
              <Typography variant="body2">
                {(currentWorkflow.comments?.length ?? 0) > 0
                  ? `${currentWorkflow.comments?.length} 件`
                  : "コメントなし"}
              </Typography>
            </Box>

            <Stack direction="row" justifyContent="space-between">
              <Button
                startIcon={<ChevronLeftIcon />}
                onClick={handlePrev}
                disabled={!canGoPrev}
              >
                前へ
              </Button>
              <Button
                endIcon={<ChevronRightIcon />}
                onClick={handleNext}
                disabled={!canGoNext}
              >
                次へ
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Typography color="text.secondary">
            表示できるワークフローがありません。
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
