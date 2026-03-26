import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import {
  Box,
  Button,
  FormControlLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Page from "@shared/ui/page/Page";
import { useContext, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { fetchWorkflowById } from "@/entities/workflow/model/loader";
import { WorkflowFormProvider } from "@/features/workflow/application-form/model/WorkflowFormContext";
import {
  buildUpdateWorkflowInput,
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  CLOCK_CORRECTION_LABEL,
  validateWorkflowForm,
  type WorkflowFormState,
} from "@/features/workflow/application-form/model/workflowFormModel";
import WorkflowTypeFields from "@/features/workflow/application-form/ui/WorkflowTypeFields";
import { extractExistingWorkflowComments } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import { useWorkflowEditLoaderState } from "@/features/workflow/hooks/useWorkflowEditLoaderState";
import { sendWorkflowSubmissionNotification } from "@/features/workflow/notifications/sendWorkflowSubmissionNotification";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import type { WorkflowEditLoaderData } from "@/router/loaders/workflowEditLoader";
import { designTokenVar } from "@/shared/designSystem";
import { createLogger } from "@/shared/lib/logger";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

import styles from "./WorkflowEditPage.module.scss";

const ACTIONS_GAP = designTokenVar("spacing.sm", "8px");
const logger = createLogger("WorkflowEditPage");

export default function WorkflowEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workflow } = useLoaderData() as WorkflowEditLoaderData;
  const HEADER_GAP = designTokenVar("spacing.md", "12px");

  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify } = useLocalNotification();
  const {
    category,
    setCategory,
    applicationDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    absenceDate,
    setAbsenceDate,
    absenceReason,
    setAbsenceReason,
    paidReason,
    setPaidReason,
    overtimeDate,
    setOvertimeDate,
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeReason,
    setOvertimeReason,
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    draftMode,
    setDraftMode,
    applicant,
    existingComments,
    setExistingComments,
  } = useWorkflowEditLoaderState(workflow, staffs);
  const [dateError, setDateError] = useState("");
  const [absenceDateError, setAbsenceDateError] = useState("");
  const [overtimeDateError, setOvertimeDateError] = useState("");
  const [overtimeError, setOvertimeError] = useState("");
  const [customWorkflowTitleError, setCustomWorkflowTitleError] = useState("");
  const [customWorkflowContentError, setCustomWorkflowContentError] =
    useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formState: WorkflowFormState = {
      categoryLabel: category,
      startDate,
      endDate,
      absenceDate,
      paidReason,
      absenceReason,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeReason,
      customWorkflowTitle,
      customWorkflowContent,
    };

    const validation = validateWorkflowForm(formState);
    setDateError(validation.errors.dateError ?? "");
    setAbsenceDateError(validation.errors.absenceDateError ?? "");
    setOvertimeDateError(validation.errors.overtimeDateError ?? "");
    setOvertimeError(validation.errors.overtimeError ?? "");
    setCustomWorkflowTitleError(
      validation.errors.customWorkflowTitleError ?? "",
    );
    setCustomWorkflowContentError(
      validation.errors.customWorkflowContentError ?? "",
    );
    if (!validation.isValid) return;

    (async () => {
      try {
        if (!id) throw new Error("IDが不明です");
        let normalizedComments = existingComments;
        if (!draftMode) {
          const latest = await fetchWorkflowById(id);
          normalizedComments = extractExistingWorkflowComments(latest);
          setExistingComments(normalizedComments);
        }

        const baseInput = buildUpdateWorkflowInput({
          workflowId: id,
          draftMode,
          state: formState,
          existingComments: normalizedComments,
        });

        const updatedWorkflow = await updateWorkflow(baseInput);

        if (!draftMode) {
          try {
            const workflowApplicant =
              applicant ||
              staffs.find((s) => s.id === workflow.staffId) ||
              null;
            await sendWorkflowSubmissionNotification({
              staffs,
              applicant: workflowApplicant,
              workflow: updatedWorkflow,
            });
          } catch (mailError) {
            logger.error(
              "Failed to send workflow submission notification:",
              mailError,
            );
            void notify("メール送信エラー", {
              body: "管理者への通知メールの送信に失敗しました。",
              mode: "await-interaction",
              priority: "normal",
              tag: "workflow-mail-error",
            });
          }
        }

        void notify("保存しました", { mode: "auto-close" });
        setTimeout(() => navigate(`/workflow/${id}`), 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Workflow update failed:", message);
        void notify("エラー", {
          body: message,
          mode: "await-interaction",
          priority: "high",
        });
      }
    })();
  };

  const handleDraftToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDraftMode(checked);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const v = e.target.value as string;
    setCategory(v);
    if (v === "有給休暇申請") {
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      if (!paidReason) setPaidReason("私用のため");
    }
  };

  return (
    <Page
      title="編集"
      maxWidth="lg"
      showDefaultHeader={false}
    >
      <PageSection
        component="form"
        layoutVariant="dashboard"
        onSubmit={handleSave}
        sx={{ gap: 0 }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: HEADER_GAP,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              申請を編集
            </Typography>
            <Typography variant="body2" color="text.secondary">
              申請詳細を起点に、申請内容を更新します。
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => navigate(id ? `/workflow/${id}` : "/workflow")}
          >
            申請詳細へ戻る
          </Button>
        </Box>
        <DashboardInnerSurface>
          <div className={styles.formRows}>
            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <Typography variant="body2" color="text.secondary">
                  ID
                </Typography>
              </div>
              <div>
                <Typography variant="body1">{id ?? "—"}</Typography>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <Typography variant="body2" color="text.secondary">
                  種別
                </Typography>
              </div>
              <div>
              {id ? (
                // 編集時は種別の変更を想定しないためテキスト表示
                <Typography variant="body1">
                  {category || "（未設定）"}
                </Typography>
              ) : (
                <Select
                  value={category}
                  onChange={handleCategoryChange}
                  displayEmpty
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">
                    <em>種別を選択</em>
                  </MenuItem>
                  <ListSubheader>勤怠</ListSubheader>
                  <MenuItem value="有給休暇申請">有給休暇申請</MenuItem>
                  <MenuItem value="欠勤申請">欠勤申請</MenuItem>
                  <MenuItem value="残業申請">残業申請</MenuItem>
                  <MenuItem value={CLOCK_CORRECTION_LABEL}>
                    {CLOCK_CORRECTION_LABEL}
                  </MenuItem>
                  <MenuItem value={CLOCK_CORRECTION_CHECK_OUT_LABEL}>
                    {CLOCK_CORRECTION_CHECK_OUT_LABEL}
                  </MenuItem>
                  <MenuItem value="その他">その他</MenuItem>
                </Select>
              )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <Typography variant="body2" color="text.secondary">
                  申請者
                </Typography>
              </div>
              <div>
                <Typography>
                  {applicant
                    ? `${applicant.familyName} ${applicant.givenName}`
                    : "—"}
                </Typography>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <Typography variant="body2" color="text.secondary">
                  申請日
                </Typography>
              </div>
              <div>
                {id ? (
                  <Typography variant="body1">{applicationDate}</Typography>
                ) : (
                  <TextField
                    value={applicationDate}
                    InputProps={{ readOnly: true }}
                    size="small"
                    fullWidth
                  />
                )}
              </div>
            </div>

            <WorkflowFormProvider
              value={{
                category,
                disabled: false,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                dateError,
                paidReason,
                setPaidReason,
                absenceDate,
                setAbsenceDate,
                absenceDateError,
                absenceReason,
                setAbsenceReason,
                overtimeDate,
                setOvertimeDate,
                overtimeDateError,
                overtimeStart,
                setOvertimeStart,
                overtimeEnd,
                setOvertimeEnd,
                overtimeError,
                overtimeReason,
                setOvertimeReason,
                customWorkflowTitle,
                setCustomWorkflowTitle,
                customWorkflowContent,
                setCustomWorkflowContent,
                customWorkflowTitleError,
                customWorkflowContentError,
              }}
            >
              <WorkflowTypeFields />
            </WorkflowFormProvider>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>
                <Typography variant="body2" color="text.secondary">
                  下書き
                </Typography>
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Switch checked={draftMode} onChange={handleDraftToggle} />
                  }
                  label={draftMode ? "下書きとして保存" : ""}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formActions}>
                <Box sx={{ display: "flex", gap: ACTIONS_GAP }}>
                  <Button
                    size="small"
                    onClick={() =>
                      navigate(id ? `/workflow/${id}` : "/workflow")
                    }
                  >
                    申請詳細へ戻る
                  </Button>
                  <Button type="submit" variant="contained" size="small">
                    保存
                  </Button>
                </Box>
              </div>
            </div>
          </div>
        </DashboardInnerSurface>
      </PageSection>
    </Page>
  );
}
