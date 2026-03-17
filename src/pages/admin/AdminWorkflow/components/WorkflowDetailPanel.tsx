import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GetWorkflowQuery, WorkflowStatus } from "@shared/api/graphql/types";
import { useCallback, useContext, useMemo } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@/entities/attendance/api/attendanceApi";
import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { designTokenVar } from "@/shared/designSystem";
import { createLogger } from "@/shared/lib/logger";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

import { useWorkflowApprovalActions } from "../hooks/useWorkflowApprovalActions";
import { useWorkflowDetailData } from "../hooks/useWorkflowDetailData";
import { useWorkflowDetailViewModel } from "../hooks/useWorkflowDetailViewModel";
import WorkflowCommentSection from "./WorkflowCommentSection";

const PANEL_BACKGROUND = designTokenVar("color.surface.primary", "#FFFFFF");
const PANEL_BORDER = designTokenVar("color.border.subtle", "#D7E0DB");
const PANEL_RADIUS = designTokenVar("radius.lg", "12px");
const HERO_BACKGROUND = designTokenVar(
  "component.adminWorkflow.detail.hero.background",
  "linear-gradient(135deg, rgba(15, 168, 94, 0.10), rgba(11, 109, 83, 0.04))"
);
const HERO_BORDER = designTokenVar(
  "component.adminWorkflow.detail.hero.border",
  "rgba(15, 168, 94, 0.18)"
);
const HERO_LABEL = designTokenVar("color.text.muted", "#5E7268");
const HERO_TITLE = designTokenVar("color.text.primary", "#1E2A25");
const HERO_ACCENT = designTokenVar("color.brand.primary.base", "#0FA85E");
const HERO_SUBTLE_BG = designTokenVar("color.surface.secondary", "#F5FAF7");
const SECTION_TITLE = designTokenVar("color.text.primary", "#1E2A25");
const LOADING_TEXT = designTokenVar("color.text.muted", "#5E7268");
const ERROR_TEXT = designTokenVar("color.feedback.danger.base", "#D7443E");
const PANEL_SPACING = designTokenVar("spacing.xl", "24px");
const HERO_SPACING = designTokenVar("spacing.lg", "16px");

const logger = createLogger("WorkflowDetailPanel");

interface WorkflowDetailPanelProps {
  workflowId?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function WorkflowDetailPanel({
  workflowId,
  onBack,
  showBackButton = false,
}: WorkflowDetailPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify, canNotify } = useLocalNotification();
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const [createAttendance] = useCreateAttendanceMutation();
  const [getAttendanceByStaffAndDate] =
    useLazyGetAttendanceByStaffAndDateQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser, staffs]);

  const handleNewCommentNotification = useCallback(() => {
    if (!canNotify) return;
    void notify("新着コメントがあります", {
      body: "ワークフローに新しいコメントが投稿されました",
      tag: `workflow-comment-${workflowId ?? "unknown"}`,
      mode: "auto-close",
      priority: "high",
    });
  }, [canNotify, notify, workflowId]);

  const { workflow, setWorkflow, loading, error } = useWorkflowDetailData(
    workflowId,
    {
      currentStaffId,
      onNewComment: handleNewCommentNotification,
    }
  );
  const dispatch = useAppDispatchV2();

  const { staffName, applicationDate, approvalSteps } =
    useWorkflowDetailViewModel({
      workflow,
      staffs,
    });
  const categoryLabel = getWorkflowCategoryLabel(workflow);
  const isApproveDisabled =
    !workflow?.id ||
    workflow?.status === WorkflowStatus.APPROVED ||
    workflow?.status === WorkflowStatus.CANCELLED;
  const isRejectDisabled =
    !workflow?.id ||
    workflow?.status === WorkflowStatus.REJECTED ||
    workflow?.status === WorkflowStatus.CANCELLED;

  const { handleApprove, handleReject } = useWorkflowApprovalActions({
    workflow,
    cognitoUser,
    staffs,
    updateWorkflow: (input) =>
      updateWorkflow(input) as Promise<
        NonNullable<GetWorkflowQuery["getWorkflow"]>
      >,
    setWorkflow,
    notifySuccess: (message) => dispatch(setSnackbarSuccess(message)),
    notifyError: (message) => dispatch(setSnackbarError(message)),
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAttendanceByStaffAndDate,
    createAttendance,
    updateAttendance,
  });

  return (
    <Paper
      sx={{
        width: 1,
        p: { xs: 2.5, sm: 4 },
        borderRadius: PANEL_RADIUS,
        border: `1px solid ${PANEL_BORDER}`,
        backgroundColor: PANEL_BACKGROUND,
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: HERO_SPACING,
          mb: PANEL_SPACING,
          p: { xs: 2.5, sm: 3 },
          borderRadius: "16px",
          border: `1px solid ${HERO_BORDER}`,
          background: HERO_BACKGROUND,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", lg: "flex-start" },
            gap: PANEL_SPACING,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: 12,
                letterSpacing: "0.12em",
                fontWeight: 700,
                color: HERO_LABEL,
              }}
            >
              管理者ワークフロー詳細
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: HERO_TITLE,
                  lineHeight: 1.2,
                }}
              >
                申請内容の確認
              </Typography>
              <Chip
                label={categoryLabel}
                size="small"
                sx={{
                  fontWeight: 700,
                  color: HERO_ACCENT,
                  backgroundColor: HERO_SUBTLE_BG,
                  border: `1px solid ${HERO_BORDER}`,
                }}
              />
            </Box>
            <Typography sx={{ color: HERO_LABEL, lineHeight: 1.7 }}>
              申請者: {staffName || "—"} / 申請日: {applicationDate || "—"}
            </Typography>
            <Typography
              sx={{
                color: HERO_LABEL,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 13,
              }}
            >
              ID: {workflow?.id ?? workflowId ?? "—"}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "flex-end",
              gap: 1.25,
            }}
          >
            {showBackButton && onBack && (
              <Button
                size={isMobile ? "medium" : "small"}
                variant="outlined"
                sx={{
                  width: { xs: 1, sm: "auto" },
                  borderColor: HERO_BORDER,
                  color: HERO_TITLE,
                  backgroundColor: "rgba(255,255,255,0.72)",
                }}
                onClick={onBack}
              >
                一覧に戻る
              </Button>
            )}
            <Button
              size={isMobile ? "medium" : "small"}
              variant="contained"
              color="success"
              sx={{
                width: { xs: 1, sm: "auto" },
                minWidth: 96,
                boxShadow: "none",
              }}
              onClick={handleApprove}
              disabled={isApproveDisabled}
            >
              承認
            </Button>
            <Button
              size={isMobile ? "medium" : "small"}
              variant="contained"
              color="error"
              sx={{
                width: { xs: 1, sm: "auto" },
                minWidth: 96,
                boxShadow: "none",
              }}
              onClick={handleReject}
              disabled={isRejectDisabled}
            >
              却下
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              borderRadius: "12px",
              p: 1.75,
              backgroundColor: "rgba(255,255,255,0.72)",
            }}
          >
            <Typography variant="caption" sx={{ color: HERO_LABEL }}>
              現在ステータス
            </Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 700, color: HERO_TITLE }}>
              {workflow?.status ?? "—"}
            </Typography>
          </Box>
          <Box
            sx={{
              borderRadius: "12px",
              p: 1.75,
              backgroundColor: "rgba(255,255,255,0.72)",
            }}
          >
            <Typography variant="caption" sx={{ color: HERO_LABEL }}>
              承認ステップ
            </Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 700, color: HERO_TITLE }}>
              {approvalSteps.length} 件
            </Typography>
          </Box>
          <Box
            sx={{
              borderRadius: "12px",
              p: 1.75,
              backgroundColor: "rgba(255,255,255,0.72)",
            }}
          >
            <Typography variant="caption" sx={{ color: HERO_LABEL }}>
              コメント件数
            </Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 700, color: HERO_TITLE }}>
              {workflow?.comments?.filter(Boolean).length ?? 0} 件
            </Typography>
          </Box>
        </Box>
      </Box>

      {loading && <Typography sx={{ color: LOADING_TEXT }}>読み込み中...</Typography>}
      {error && <Typography sx={{ color: ERROR_TEXT }}>{error}</Typography>}

      {!loading && !error && (
        <Grid container spacing={3.5} alignItems="flex-start">
          <Grid item xs={12} lg={7.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1.5, fontWeight: 700, color: SECTION_TITLE }}
              >
                申請情報
              </Typography>
              <WorkflowMetadataPanel
                workflowId={workflow?.id ?? undefined}
                fallbackId={workflowId}
                category={workflow?.category ?? null}
                categoryLabel={categoryLabel}
                staffName={staffName}
                applicationDate={applicationDate}
                status={workflow?.status ?? null}
                overTimeDetails={workflow?.overTimeDetails ?? null}
                customWorkflowTitle={workflow?.customWorkflowTitle ?? null}
                customWorkflowContent={workflow?.customWorkflowContent ?? null}
                approvalSteps={approvalSteps}
              />
            </Box>
          </Grid>

          <Grid item xs={12} lg={4.5}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1.5, fontWeight: 700, color: SECTION_TITLE }}
              >
                コメントと対応履歴
              </Typography>
              <WorkflowCommentSection
                workflow={workflow}
                staffs={staffs}
                cognitoUser={cognitoUser}
                onWorkflowUpdated={setWorkflow}
                onSuccess={(message) => dispatch(setSnackbarSuccess(message))}
                onError={(message) => {
                  logger.error("Failed to send comment:", message);
                  dispatch(setSnackbarError(message));
                }}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}
