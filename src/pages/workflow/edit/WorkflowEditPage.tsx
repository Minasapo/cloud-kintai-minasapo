import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  ListSubheader,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import {
  GetWorkflowQuery,
  WorkflowCategory,
  type WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { GraphQLResult } from "aws-amplify/api";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatchV2 } from "@/app/hooks";
import { AuthContext } from "@/context/AuthContext";
import {
  buildUpdateWorkflowInput,
  validateWorkflowForm,
  type WorkflowFormState,
} from "@/features/workflow/application-form/model/workflowFormModel";
import WorkflowTypeFields from "@/features/workflow/application-form/ui/WorkflowTypeFields";
import { extractExistingWorkflowComments } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import useStaffs, { StaffType } from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateSlash, isoDateFromTimestamp } from "@/lib/date";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { CATEGORY_LABELS } from "@/lib/workflowLabels";

export default function WorkflowEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [absenceDateError, setAbsenceDateError] = useState("");
  const [paidReason, setPaidReason] = useState("");
  const [overtimeDate, setOvertimeDate] = useState("");
  const [overtimeDateError, setOvertimeDateError] = useState("");
  const [overtimeStart, setOvertimeStart] = useState("");
  const [overtimeEnd, setOvertimeEnd] = useState("");
  const [overtimeError, setOvertimeError] = useState("");
  const [overtimeReason, setOvertimeReason] = useState("");
  const [draftMode, setDraftMode] = useState(true);

  const { cognitoUser } = useContext(AuthContext);
  const { staffs } = useStaffs();
  const { update: updateWorkflow } = useWorkflows();
  const [applicant, setApplicant] = useState<StaffType | null | undefined>(
    undefined
  );
  const [existingComments, setExistingComments] = useState<
    WorkflowCommentInput[]
  >([]);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const resp = (await graphqlClient.graphql({
          query: getWorkflow,
          variables: { id },
          authMode: "userPool",
        })) as GraphQLResult<GetWorkflowQuery>;

        if (resp.errors) throw new Error(resp.errors[0].message);
        const w = resp.data?.getWorkflow;
        if (!w) return;

        // map category (enum -> label used in this form)
        if (w.category) {
          setCategory(
            CATEGORY_LABELS[w.category as WorkflowCategory] || w.category
          );
        }

        // application date: prefer overtime date if present, otherwise createdAt
        const appDate =
          w.overTimeDetails?.date || isoDateFromTimestamp(w.createdAt);
        setApplicationDate(formatDateSlash(appDate));

        // overtime fields
        if (w.overTimeDetails) {
          // keep ISO format (YYYY-MM-DD) for <input type="date"> controls
          setOvertimeDate(isoDateFromTimestamp(w.overTimeDetails.date));
          setOvertimeStart(w.overTimeDetails.startTime || "");
          setOvertimeEnd(w.overTimeDetails.endTime || "");
          setOvertimeReason(w.overTimeDetails.reason || "");
        }

        // status -> draftMode
        setDraftMode(w.status === WorkflowStatus.DRAFT);
        setExistingComments(extractExistingWorkflowComments(w));

        // applicant/staff from staffId
        if (w.staffId) {
          const s = staffs.find((st) => st.id === w.staffId);
          setApplicant(
            s || ({ id: w.staffId, familyName: "", givenName: "" } as StaffType)
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
    // we include staffs so that applicant can be resolved once staffs are loaded
  }, [id, staffs]);

  useEffect(() => {
    // 申請日は初期で今日に
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setApplicationDate(`${y}/${m}/${day}`);

    if (!cognitoUser?.id) return;
    const match = staffs.find((s) => s.cognitoUserId === cognitoUser.id);
    setApplicant(match || null);
  }, [cognitoUser, staffs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formState: WorkflowFormState = {
      categoryLabel: category,
      startDate,
      endDate,
      absenceDate,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeReason,
    };

    const validation = validateWorkflowForm(formState);
    setDateError(validation.errors.dateError ?? "");
    setAbsenceDateError(validation.errors.absenceDateError ?? "");
    setOvertimeDateError(validation.errors.overtimeDateError ?? "");
    setOvertimeError(validation.errors.overtimeError ?? "");
    if (!validation.isValid) return;

    (async () => {
      try {
        if (!id) throw new Error("IDが不明です");
        let normalizedComments = existingComments;
        if (!draftMode) {
          const resp = (await graphqlClient.graphql({
            query: getWorkflow,
            variables: { id },
            authMode: "userPool",
          })) as GraphQLResult<GetWorkflowQuery>;
          normalizedComments = extractExistingWorkflowComments(
            resp.data?.getWorkflow ?? null
          );
          setExistingComments(normalizedComments);
        }

        const baseInput = buildUpdateWorkflowInput({
          workflowId: id,
          draftMode,
          state: formState,
          existingComments: normalizedComments,
        });

        await updateWorkflow(baseInput);
        dispatch(setSnackbarSuccess("保存しました"));
        setTimeout(() => navigate(`/workflow/${id}`), 1000);
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        dispatch(setSnackbarError(msg));
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
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー", href: "/workflow" },
      ]}
      maxWidth="lg"
    >
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSave}>
          <Grid container rowSpacing={2} columnSpacing={1} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                ID
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography variant="body1">{id ?? "—"}</Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                種別
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
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
                  <MenuItem value="その他">その他</MenuItem>
                </Select>
              )}
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                申請者
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <Typography>
                {applicant
                  ? `${applicant.familyName} ${applicant.givenName}`
                  : "—"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                申請日
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
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
            </Grid>

            {/* 種別固有フィールド（共通コンポーネント） */}
            <WorkflowTypeFields
              category={category}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              dateError={dateError}
              paidReason={paidReason}
              setPaidReason={setPaidReason}
              absenceDate={absenceDate}
              setAbsenceDate={setAbsenceDate}
              absenceDateError={absenceDateError}
              overtimeDate={overtimeDate}
              setOvertimeDate={setOvertimeDate}
              overtimeDateError={overtimeDateError}
              overtimeStart={overtimeStart}
              setOvertimeStart={setOvertimeStart}
              overtimeEnd={overtimeEnd}
              setOvertimeEnd={setOvertimeEnd}
              overtimeError={overtimeError}
              overtimeReason={overtimeReason}
              setOvertimeReason={setOvertimeReason}
            />

            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">
                下書き
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              <FormControlLabel
                control={
                  <Switch checked={draftMode} onChange={handleDraftToggle} />
                }
                label={draftMode ? "下書きとして保存" : ""}
              />
            </Grid>

            <Grid item xs={12} sm={3} />
            <Grid item xs={12} sm={9}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => navigate(-1)}
                >
                  戻る
                </Button>
                <Button type="submit" variant="contained" size="small">
                  保存
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {/* notifications are handled globally by SnackbarGroup */}
    </Page>
  );
}
