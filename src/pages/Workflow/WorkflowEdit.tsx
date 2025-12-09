import { GraphQLResult } from "@aws-amplify/api";
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
import Page from "@shared/ui/page/Page";
import { API } from "aws-amplify";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
  WorkflowComment,
  WorkflowStatus,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import WorkflowTypeFields from "@/components/Workflow/WorkflowTypeFields";
import { AuthContext } from "@/context/AuthContext";
import useStaffs, { StaffType } from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import { formatDateSlash, isoDateFromTimestamp } from "@/lib/date";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { CATEGORY_LABELS, REVERSE_CATEGORY } from "@/lib/workflowLabels";

export default function WorkflowEdit() {
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
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const resp = (await API.graphql({
          query: getWorkflow,
          variables: { id },
          authMode: "AMAZON_COGNITO_USER_POOLS",
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

        // store comments locally for potential append on submit
        // we attach them to a ref-like state (simple state is fine here)
        if (w.comments) {
          // keep original comments in component state for later use
          // 型は WorkflowComment だが API からの型は不明ここでは any として保持
          // useState で定義 below
        }

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
    // 簡易バリデーション
    if (category === "有給休暇申請") {
      if (!startDate || !endDate) {
        setDateError("開始日と終了日を入力してください");
        return;
      }
      if (startDate > endDate) {
        setDateError("開始日は終了日以前にしてください");
        return;
      }
      setDateError("");
    }
    if (category === "欠勤申請") {
      if (!absenceDate) {
        setAbsenceDateError("欠勤日を入力してください");
        return;
      }
      setAbsenceDateError("");
    }
    if (category === "残業申請") {
      if (!overtimeDate) {
        setOvertimeError("残業予定日を入力してください");
        return;
      }
      if (!overtimeStart || !overtimeEnd) {
        setOvertimeError("開始時刻と終了時刻を入力してください");
        return;
      }
      if (overtimeStart >= overtimeEnd) {
        setOvertimeError("開始時刻は終了時刻より前にしてください");
        return;
      }
      setOvertimeError("");
    }

    (async () => {
      try {
        if (!id) throw new Error("IDが不明です");
        // map label -> enum
        const mapCategory = (label: string): WorkflowCategory | undefined => {
          const v = REVERSE_CATEGORY[label];
          return (v as WorkflowCategory) || undefined;
        };

        const targetStatus = draftMode
          ? WorkflowStatus.DRAFT
          : WorkflowStatus.SUBMITTED;

        const baseInput: UpdateWorkflowInput = {
          id,
          category: mapCategory(category) || undefined,
          status: targetStatus,
          overTimeDetails:
            category === "残業申請"
              ? {
                  date: overtimeDate,
                  startTime: overtimeStart,
                  endTime: overtimeEnd,
                  reason: overtimeReason || "",
                }
              : undefined,
        };

        // 提出済みに変わる場合は system コメントを既存コメントに追加して送信
        if (targetStatus === WorkflowStatus.SUBMITTED) {
          // get existing workflow to extract comments
          const resp = (await API.graphql({
            query: getWorkflow,
            variables: { id },
            authMode: "AMAZON_COGNITO_USER_POOLS",
          })) as GraphQLResult<GetWorkflowQuery>;

          const existing = (resp.data?.getWorkflow?.comments ||
            []) as Array<WorkflowComment | null>;
          const newComment = {
            id: `c-${Date.now()}`,
            staffId: "system",
            text: `${category || "申請"}が提出されました。`,
            createdAt: new Date().toISOString(),
          };

          const filtered = existing.filter((c): c is WorkflowComment =>
            Boolean(c)
          );
          const commentsInput = filtered.map((c) => ({
            id: c.id,
            staffId: c.staffId,
            text: c.text,
            createdAt: c.createdAt,
          }));
          baseInput.comments = [...commentsInput, newComment];
        }

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
              overtimeDateError={overtimeError}
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
