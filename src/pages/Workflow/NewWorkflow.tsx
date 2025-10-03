import {
  Box,
  Button,
  Container,
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
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ApprovalStatus,
  ApprovalStepInput,
  ApproverMultipleMode,
  ApproverSettingMode,
  CreateWorkflowInput,
  WorkflowCategory,
  WorkflowStatus,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import Page from "@/components/Page/Page";
import WorkflowTypeFields from "@/components/Workflow/WorkflowTypeFields";
import { AuthContext } from "@/context/AuthContext";
import useStaffs, { StaffType } from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { REVERSE_CATEGORY } from "@/lib/workflowLabels";

export default function NewWorkflow() {
  const navigate = useNavigate();
  const [draftMode, setDraftMode] = useState(false);
  const [category, setCategory] = useState("");

  const [applicationDate, setApplicationDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [absenceDate, setAbsenceDate] = useState("");
  const [absenceDateError, setAbsenceDateError] = useState("");
  const [paidReason, setPaidReason] = useState("");
  const [overtimeStart, setOvertimeStart] = useState("");
  const [overtimeEnd, setOvertimeEnd] = useState("");
  const [overtimeError, setOvertimeError] = useState("");
  const [overtimeDate, setOvertimeDate] = useState("");
  const [overtimeDateError, setOvertimeDateError] = useState("");
  const [overtimeReason, setOvertimeReason] = useState("");

  const { cognitoUser } = useContext(AuthContext);
  const { staffs } = useStaffs();
  const [staff, setStaff] = useState<StaffType | null | undefined>(undefined);
  const { create: createWorkflow } = useWorkflows();
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    if (!cognitoUser?.id) return;
    const match = staffs.find((s) => s.cognitoUserId === cognitoUser.id);
    setStaff(match || null);
  }, [staffs, cognitoUser]);

  // 申請日は常に当日で自動設定する（スラッシュ区切り: YYYY/MM/DD）
  useEffect(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setApplicationDate(`${y}/${m}/${day}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // バリデーション: 有給休暇申請なら開始日/終了日のチェック
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
    // バリデーション: 欠勤申請なら欠勤日チェック
    if (category === "欠勤申請") {
      if (!absenceDate) {
        setAbsenceDateError("欠勤日を入力してください");
        return;
      }
      setAbsenceDateError("");
    }

    // バリデーション: 残業申請なら開始/終了時刻チェック
    if (category === "残業申請") {
      // 日付チェック
      if (!overtimeDate) {
        setOvertimeDateError("残業予定日を入力してください");
        return;
      }
      setOvertimeDateError("");
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
    // 申請者（staff）が取れていない場合はエラー
    if (!staff?.id) {
      dispatch(setSnackbarError("申請者情報が取得できませんでした。"));
      return;
    }

    // 送信時の申請日は今日に固定する
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todaySlash = `${y}/${m}/${d}`;
    setApplicationDate(todaySlash);

    // API の enum にマッピング（共有定義の逆引きを使う）
    const mapCategory = (label: string): WorkflowCategory => {
      const v = REVERSE_CATEGORY[label];
      return (v as WorkflowCategory) || WorkflowCategory.CUSTOM;
    };

    const apiStatus = draftMode
      ? WorkflowStatus.DRAFT
      : WorkflowStatus.SUBMITTED;

    // 残業申請で残業日が未入力なら今日を使う
    const overtimeDateToUse =
      category === "残業申請"
        ? overtimeDate || new Date().toISOString().slice(0, 10)
        : undefined;

    const input: CreateWorkflowInput = {
      staffId: staff.id,
      status: apiStatus,
      category: mapCategory(category),
      overTimeDetails:
        category === "残業申請"
          ? {
              date: overtimeDateToUse as string,
              startTime: overtimeStart,
              endTime: overtimeEnd,
              reason: overtimeReason || "",
            }
          : undefined,
      // 提出済みであればシステムコメントを追加
      comments:
        apiStatus === WorkflowStatus.SUBMITTED
          ? [
              {
                id: `c-${Date.now()}`,
                staffId: "system",
                text: `${category || "申請"}が提出されました。`,
                createdAt: new Date().toISOString(),
              },
            ]
          : undefined,
    };

    // --- 申請時に承認ステップをスナップショットとして保存する ---
    // staff の approverSetting を参照して approvalSteps / assignedApproverStaffIds を生成
    const approvalSteps: ApprovalStepInput[] = [];
    const assignedApproverStaffIds: Array<string> = [];

    if (staff?.approverSetting === ApproverSettingMode.SINGLE) {
      const target = staff.approverSingle;
      if (target) {
        const mapped = staffs.find(
          (s) => s.cognitoUserId === target || s.id === target
        );
        const approverId = mapped ? mapped.id : target;
        approvalSteps.push({
          id: `s-0-${Date.now()}`,
          approverStaffId: approverId,
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: 0,
        });
        assignedApproverStaffIds.push(approverId);
      }
    } else if (staff?.approverSetting === ApproverSettingMode.MULTIPLE) {
      const multiple = staff.approverMultiple || [];
      multiple.forEach((aid, idx) => {
        if (!aid) return;
        const mapped = staffs.find(
          (s) => s.cognitoUserId === aid || s.id === aid
        );
        const approverId = mapped ? mapped.id : aid;
        approvalSteps.push({
          id: `s-${idx}-${Date.now()}`,
          approverStaffId: approverId,
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: idx,
        });
        assignedApproverStaffIds.push(approverId);
      });
    } else if (staff?.approverSetting === ApproverSettingMode.ADMINS) {
      // 管理者全員モードは特別扱いとして 'ADMINS' を approverStaffId に入れておく
      approvalSteps.push({
        id: `s-admin-${Date.now()}`,
        approverStaffId: "ADMINS",
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: 0,
      });
      assignedApproverStaffIds.push("ADMINS");
    }

    if (approvalSteps.length > 0) {
      input.approvalSteps = approvalSteps;
      input.assignedApproverStaffIds = assignedApproverStaffIds;
      input.nextApprovalStepIndex = 0;
    }

    // 保存用に submitter 側のスナップショット情報も入れておく
    if (staff?.approverSetting) {
      input.submitterApproverSetting =
        staff.approverSetting as ApproverSettingMode;
      if (staff.approverSingle)
        input.submitterApproverId = staff.approverSingle;
      if (staff.approverMultiple && staff.approverMultiple.length > 0) {
        input.submitterApproverIds = staff.approverMultiple;
        if (staff.approverMultipleMode)
          input.submitterApproverMultipleMode =
            staff.approverMultipleMode as ApproverMultipleMode;
      }
    }

    (async () => {
      try {
        await createWorkflow(input);
        dispatch(setSnackbarSuccess("ワークフローを作成しました。"));
        navigate("/workflow", { replace: true });
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
    // 種別選択時の初期化処理等はここに記述（タイトル入力は廃止されたため削除済）
    // 有給のときは開始/終了を今日で初期化
    const today = new Date().toISOString().slice(0, 10);
    if (v === "有給休暇申請") {
      setStartDate(today);
      setEndDate(today);
      // 申請理由のデフォルト
      if (!paidReason) setPaidReason("私用のため");
    }
  };

  return (
    <Page
      title="新規作成"
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー", href: "/workflow" },
      ]}
      maxWidth="lg"
    >
      <Container>
        <Paper sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid
              container
              rowSpacing={2}
              columnSpacing={1}
              alignItems="center"
            >
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", pr: { sm: 1 } }}
                >
                  種別
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Select
                  value={category}
                  displayEmpty
                  onChange={handleCategoryChange}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">
                    <em>種別を選択</em>
                  </MenuItem>
                  <ListSubheader>勤怠</ListSubheader>
                  <MenuItem
                    value="有給休暇申請"
                    disabled
                    title="現在は残業申請のみ作成できます"
                  >
                    有給休暇申請
                  </MenuItem>
                  <MenuItem
                    value="欠勤申請"
                    disabled
                    title="現在は残業申請のみ作成できます"
                  >
                    欠勤申請
                  </MenuItem>
                  <MenuItem value="残業申請">残業申請</MenuItem>
                </Select>
              </Grid>

              {/* プレビュー機能は廃止されました */}

              {/* 申請者 */}
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", pr: { sm: 1 } }}
                >
                  申請者
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography variant="body1">
                  {staff ? `${staff.familyName} ${staff.givenName}` : "—"}
                </Typography>
              </Grid>

              {/* 申請日 */}
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", pr: { sm: 1 } }}
                >
                  申請日
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography variant="body1">{applicationDate}</Typography>
              </Grid>

              {/* タイトル入力は廃止されました（申請はテンプレート/種別で自動的にタイトルを決定します） */}

              {/* 説明: 削除済み */}

              {/* 種別固有フィールド（共通コンポーネント） */}
              <WorkflowTypeFields
                category={category}
                disabled={category === ""}
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
              {category === "その他" && (
                <>
                  <Grid item xs={12} sm={3}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "left", pr: { sm: 1 } }}
                    >
                      備考
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <TextField
                      size="small"
                      fullWidth
                      sx={{ "& .MuiInputBase-input": { padding: "6px 10px" } }}
                    />
                  </Grid>
                </>
              )}

              {/* 下書き */}
              <Grid item xs={12} sm={3}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "left", pr: { sm: 1 } }}
                >
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

              {/* ボタン（右カラムに詰める） */}
              <Grid item xs={12} sm={3} />
              <Grid item xs={12} sm={9}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={category === ""}
                  >
                    作成
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    size="small"
                  >
                    キャンセル
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Page>
  );
}
