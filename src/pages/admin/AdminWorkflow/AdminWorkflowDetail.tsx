import { GraphQLResult } from "@aws-amplify/api";
import {
  Avatar,
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import StatusChip from "@shared/ui/chips/StatusChip";
import Page from "@shared/ui/page/Page";
import { API } from "aws-amplify";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ApprovalStatus,
  ApprovalStep,
  ApprovalStepInput,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
  WorkflowComment,
  WorkflowCommentInput,
  WorkflowStatus,
} from "@/API";
import { useAppDispatchV2 } from "@/app/hooks";
import { AuthContext } from "@/context/AuthContext";
import createOperationLogData from "@/hooks/useOperationLog/createOperationLogData";
import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import { formatDateSlash, isoDateFromTimestamp } from "@/lib/date";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { CATEGORY_LABELS } from "@/lib/workflowLabels";

export default function AdminWorkflowDetail() {
  const { id } = useParams() as { id?: string };
  const navigate = useNavigate();
  const { staffs } = useStaffs();
  const { cognitoUser } = useContext(AuthContext);
  const { update: updateWorkflow } = useWorkflows();

  const [workflow, setWorkflow] = useState<NonNullable<
    GetWorkflowQuery["getWorkflow"]
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = (await API.graphql({
          query: getWorkflow,
          variables: { id },
          authMode: "AMAZON_COGNITO_USER_POOLS",
        })) as GraphQLResult<GetWorkflowQuery>;

        if (resp.errors) throw new Error(resp.errors[0].message);

        if (!resp.data?.getWorkflow) {
          setError("指定されたワークフローが見つかりませんでした");
          setWorkflow(null);
        } else {
          setWorkflow(resp.data.getWorkflow);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const staffName = (() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  })();

  const approverInfo = useMemo(() => {
    if (!workflow?.staffId) return { mode: "any", items: [] as string[] };
    const applicant = staffs.find((s) => s.id === workflow.staffId);
    const mode = applicant?.approverSetting ?? null;
    if (!mode || mode === "ADMINS")
      return { mode: "any", items: ["管理者全員"] };

    if (mode === "SINGLE") {
      const singleId = applicant?.approverSingle;
      if (!singleId) return { mode: "single", items: ["未設定"] };
      const st = staffs.find(
        (s) => s.cognitoUserId === singleId || s.id === singleId
      );
      return {
        mode: "single",
        items: [st ? `${st.familyName} ${st.givenName}` : singleId],
      };
    }

    if (mode === "MULTIPLE") {
      const multiple = applicant?.approverMultiple ?? [];
      if (multiple.length === 0) return { mode: "any", items: ["未設定"] };
      const items = multiple.map((aid) => {
        const st = staffs.find((s) => s.cognitoUserId === aid || s.id === aid);
        return st ? `${st.familyName} ${st.givenName}` : aid || "";
      });
      const multipleMode = applicant?.approverMultipleMode ?? null;
      return { mode: multipleMode === "ORDER" ? "order" : "any", items };
    }

    return { mode: "any", items: ["管理者全員"] };
  }, [staffs, workflow]);

  const applicationDate =
    formatDateSlash(workflow?.overTimeDetails?.date) ||
    formatDateSlash(isoDateFromTimestamp(workflow?.createdAt));

  const approvalSteps = useMemo(() => {
    const base = [
      {
        id: "s0",
        name: staffName,
        role: "申請者",
        state: "",
        date: applicationDate,
        comment: "",
      },
    ];
    if (!workflow) return base;

    // If explicit approvalSteps exist on the workflow, display them with recorded decisions
    if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
      const steps = (workflow.approvalSteps as ApprovalStep[])
        .slice()
        .sort((a, b) => (a?.stepOrder ?? 0) - (b?.stepOrder ?? 0));
      steps.forEach((st, idx) => {
        const approverId = st.approverStaffId || "";
        const staff = staffs.find((s) => s.id === approverId);
        const name =
          approverId === "ADMINS"
            ? "管理者全員"
            : staff
            ? `${staff.familyName} ${staff.givenName}`
            : approverId || "未設定";
        const state = st.decisionStatus
          ? st.decisionStatus === ApprovalStatus.APPROVED
            ? "承認済み"
            : st.decisionStatus === ApprovalStatus.REJECTED
            ? "却下"
            : st.decisionStatus === ApprovalStatus.SKIPPED
            ? "スキップ"
            : "未承認"
          : "未承認";
        const date = st.decisionTimestamp
          ? new Date(st.decisionTimestamp).toLocaleString()
          : "";
        base.push({
          id: st.id ?? `s${idx + 1}`,
          name,
          role: "承認者",
          state,
          date,
          comment: st.approverComment ?? "",
        });
      });
      return base;
    }

    // Fallback: derive from applicant's current approver settings
    const isApproved = workflow.status === WorkflowStatus.APPROVED;
    if (approverInfo.mode === "any") {
      const hasSpecific =
        approverInfo.items.length > 0 && approverInfo.items[0] !== "管理者全員";
      base.push({
        id: "s1",
        name: hasSpecific ? approverInfo.items.join(" / ") : "管理者全員",
        role: hasSpecific ? "承認者（複数）" : "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }
    if (approverInfo.mode === "single") {
      base.push({
        id: "s1",
        name: approverInfo.items[0] ?? "未設定",
        role: "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }
    if (approverInfo.mode === "order") {
      approverInfo.items.forEach((it, idx) => {
        base.push({
          id: `s${idx + 1}`,
          name: it,
          role: `承認者`,
          state: isApproved ? "承認済み" : "未承認",
          date: isApproved ? applicationDate : "",
          comment: "",
        });
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }

    return base;
  }, [workflow, staffName, applicationDate, approverInfo]);

  const [messages, setMessages] = useState(
    [] as {
      id: string;
      sender: string;
      staffId?: string;
      text: string;
      time: string;
    }[]
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});
  const toggleExpanded = (id: string) =>
    setExpandedMessages((s) => ({ ...s, [id]: !s[id] }));

  const currentStaff = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((s) => s.cognitoUserId === cognitoUser.id);
  }, [cognitoUser, staffs]);

  const formatSender = (sender?: string) => {
    const s = sender ?? "";
    if (!s.trim()) return "システム";
    const low = s.trim().toLowerCase();
    if (low === "system" || low.startsWith("system") || low.includes("bot"))
      return "システム";
    return s;
  };

  const commentsToMessages = (
    comments?: Array<WorkflowComment | null> | null
  ) => {
    if (!comments)
      return [] as {
        id: string;
        sender: string;
        staffId?: string;
        text: string;
        time: string;
      }[];
    return comments
      .filter((c): c is WorkflowComment => Boolean(c))
      .map((c) => {
        const staff = staffs.find((s) => s.id === c.staffId);
        const sender = staff
          ? `${staff.familyName} ${staff.givenName}`
          : c.staffId || "システム";
        const time = c.createdAt ? new Date(c.createdAt).toLocaleString() : "";
        return {
          id: c.id || `c-${Date.now()}`,
          sender,
          staffId: c.staffId,
          text: c.text,
          time,
        };
      });
  };

  useEffect(() => {
    setMessages(commentsToMessages(workflow?.comments || []));
  }, [workflow, staffs]);

  const sendMessage = () => void handleSend();

  const handleSend = async () => {
    if (sending) return;
    if (!input.trim()) return;
    if (!workflow?.id) return;
    const currentStaffLocal = cognitoUser?.id
      ? staffs.find((s) => s.cognitoUserId === cognitoUser.id)
      : undefined;

    // Allow sending comments even if the staff record cannot be resolved.
    // Use the staff's id when available; otherwise leave staffId undefined so
    // the backend can decide how to store it. Provide an optimistic local
    // display name using the staff record or cognito username.
    const senderDisplay = currentStaffLocal
      ? `${currentStaffLocal.familyName} ${currentStaffLocal.givenName}`
      : cognitoUser
      ? `${cognitoUser.familyName ?? ""} ${
          cognitoUser.givenName ?? ""
        }`.trim() || "不明なユーザー"
      : "不明なユーザー";

    const newComment: WorkflowCommentInput = {
      id: `c-${Date.now()}`,
      // Ensure staffId is a string as required by the GraphQL input type.
      // Prefer the mapped staff.id; otherwise fall back to the cognito user id
      // so the backend still has a trace of who sent the comment. If neither
      // exists, use 'system' as a last resort.
      staffId: currentStaffLocal?.id ?? cognitoUser?.id ?? "system",
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };

    const existingInputs = (workflow.comments || [])
      .filter((c): c is WorkflowComment => Boolean(c))
      .map((c) => ({
        id: c.id,
        staffId: c.staffId,
        text: c.text,
        createdAt: c.createdAt,
      }));

    const inputForUpdate: UpdateWorkflowInput = {
      id: workflow.id,
      comments: [...existingInputs, newComment],
    };

    // Optimistically show the comment in UI while the update runs.
    const optimisticMsg = {
      id: newComment.id,
      sender: senderDisplay,
      staffId: newComment.staffId,
      text: newComment.text,
      time: new Date(newComment.createdAt).toLocaleString(),
    };
    setMessages((m) => [...m, optimisticMsg]);
    setInput("");
    setSending(true);
    try {
      const updated = await updateWorkflow(inputForUpdate);
      setWorkflow(updated as NonNullable<GetWorkflowQuery["getWorkflow"]>);
      setMessages(commentsToMessages(updated.comments || []));
      dispatch(setSnackbarSuccess("コメントを送信しました"));
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      dispatch(setSnackbarError(msg));
      // remove optimistic message on error
      setMessages((m) => m.filter((mm) => mm.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async () => {
    if (!workflow?.id) return;
    if (workflow?.status === WorkflowStatus.CANCELLED) {
      dispatch(setSnackbarError("キャンセル済みの申請には操作できません"));
      return;
    }
    if (!window.confirm("この申請を承認しますか？")) return;
    const currentStaffLocal = cognitoUser?.id
      ? staffs.find((s) => s.cognitoUserId === cognitoUser.id)
      : undefined;
    if (!currentStaffLocal?.id) {
      dispatch(
        setSnackbarError("承認を実行するユーザー情報が取得できませんでした。")
      );
      return;
    }

    try {
      // prepare approvalSteps
      let steps: ApprovalStepInput[] = [];
      if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
        steps = (workflow.approvalSteps as ApprovalStep[]).map((s) => ({
          id: s.id,
          approverStaffId: s.approverStaffId,
          decisionStatus: s.decisionStatus as ApprovalStatus,
          approverComment: s.approverComment ?? null,
          decisionTimestamp: s.decisionTimestamp ?? null,
          stepOrder: s.stepOrder ?? 0,
        }));
      } else if (
        workflow.assignedApproverStaffIds &&
        workflow.assignedApproverStaffIds.length > 0
      ) {
        steps = (workflow.assignedApproverStaffIds || []).map((aid, idx) => ({
          id: `s-${idx}-${workflow.id}`,
          approverStaffId: aid || "",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: idx,
        }));
      }

      // determine which step to update
      let idxToUpdate = -1;
      if (typeof workflow.nextApprovalStepIndex === "number") {
        idxToUpdate = workflow.nextApprovalStepIndex;
      } else {
        idxToUpdate = steps.findIndex(
          (st) => st.decisionStatus === ApprovalStatus.PENDING
        );
      }
      if (idxToUpdate < 0) {
        dispatch(
          setSnackbarError("承認可能なステップが見つかりませんでした。")
        );
        return;
      }

      // update the target step
      steps[idxToUpdate] = {
        ...steps[idxToUpdate],
        decisionStatus: ApprovalStatus.APPROVED,
        decisionTimestamp: new Date().toISOString(),
        approverComment: null,
      };

      // update summary arrays
      const approved = Array.from(
        new Set([...(workflow.approvedStaffIds || []), currentStaffLocal.id])
      );

      // determine finalization: ANY mode or all steps approved
      let isFinal = false;
      if (workflow.submitterApproverMultipleMode === "ANY") {
        isFinal = true;
      } else {
        const anyPending = steps.some(
          (s) => s.decisionStatus === ApprovalStatus.PENDING
        );
        if (!anyPending) isFinal = true;
      }

      const updatedStatus = isFinal ? WorkflowStatus.APPROVED : workflow.status;
      const finalDecisionTimestamp = isFinal
        ? new Date().toISOString()
        : workflow.finalDecisionTimestamp;

      const nextIdx = isFinal
        ? null
        : steps.findIndex((s) => s.decisionStatus === ApprovalStatus.PENDING);

      const existingComments = (workflow.comments || [])
        .filter((c): c is WorkflowComment => Boolean(c))
        .map((c) => ({
          id: c.id,
          staffId: c.staffId,
          text: c.text,
          createdAt: c.createdAt,
        }));
      const sysComment: WorkflowCommentInput = {
        id: `c-${Date.now()}`,
        staffId: "system",
        text: "申請を承認しました",
        createdAt: new Date().toISOString(),
      };

      const inputForUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        approvedStaffIds: approved,
        status: updatedStatus,
        finalDecisionTimestamp,
        nextApprovalStepIndex: nextIdx ?? undefined,
        comments: [...existingComments, sysComment],
      };

      const updated = (await updateWorkflow(inputForUpdate)) as NonNullable<
        GetWorkflowQuery["getWorkflow"]
      >;
      setWorkflow(updated);
      setMessages(commentsToMessages(updated.comments || []));
      dispatch(setSnackbarSuccess("承認しました"));
      try {
        await createOperationLogData({
          staffId: currentStaffLocal?.id ?? undefined,
          action: "approve_workflow",
          resource: "workflow",
          resourceId: updated.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workflowId: updated.id,
            category: updated.category ?? null,
            applicantStaffId: updated.staffId ?? null,
            result: "approved",
          }),
        });
      } catch (err) {
        console.error("Failed to create operation log for approve:", err);
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      dispatch(setSnackbarError(msg));
    }
  };

  const handleReject = async () => {
    if (!workflow?.id) return;
    if (workflow?.status === WorkflowStatus.CANCELLED) {
      dispatch(setSnackbarError("キャンセル済みの申請には操作できません"));
      return;
    }
    if (!window.confirm("この申請を却下しますか？")) return;
    const currentStaffLocal = cognitoUser?.id
      ? staffs.find((s) => s.cognitoUserId === cognitoUser.id)
      : undefined;
    if (!currentStaffLocal?.id) {
      dispatch(
        setSnackbarError("却下を実行するユーザー情報が取得できませんでした。")
      );
      return;
    }

    try {
      // prepare approvalSteps
      let steps: ApprovalStepInput[] = [];
      if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
        steps = (workflow.approvalSteps as ApprovalStep[]).map((s) => ({
          id: s.id,
          approverStaffId: s.approverStaffId,
          decisionStatus: s.decisionStatus as ApprovalStatus,
          approverComment: s.approverComment ?? null,
          decisionTimestamp: s.decisionTimestamp ?? null,
          stepOrder: s.stepOrder ?? 0,
        }));
      } else if (
        workflow.assignedApproverStaffIds &&
        workflow.assignedApproverStaffIds.length > 0
      ) {
        steps = (workflow.assignedApproverStaffIds || []).map((aid, idx) => ({
          id: `s-${idx}-${workflow.id}`,
          approverStaffId: aid || "",
          decisionStatus: ApprovalStatus.PENDING,
          approverComment: null,
          decisionTimestamp: null,
          stepOrder: idx,
        }));
      }

      // determine which step to update
      let idxToUpdate = -1;
      if (typeof workflow.nextApprovalStepIndex === "number") {
        idxToUpdate = workflow.nextApprovalStepIndex;
      } else {
        idxToUpdate = steps.findIndex(
          (st) => st.decisionStatus === ApprovalStatus.PENDING
        );
      }
      if (idxToUpdate < 0) {
        dispatch(
          setSnackbarError("却下可能なステップが見つかりませんでした。")
        );
        return;
      }

      // update the target step to rejected
      steps[idxToUpdate] = {
        ...steps[idxToUpdate],
        decisionStatus: ApprovalStatus.REJECTED,
        decisionTimestamp: new Date().toISOString(),
        approverComment: null,
      };

      const rejected = Array.from(
        new Set([...(workflow.rejectedStaffIds || []), currentStaffLocal.id])
      );

      const existingComments = (workflow.comments || [])
        .filter((c): c is WorkflowComment => Boolean(c))
        .map((c) => ({
          id: c.id,
          staffId: c.staffId,
          text: c.text,
          createdAt: c.createdAt,
        }));
      const sysComment: WorkflowCommentInput = {
        id: `c-${Date.now()}`,
        staffId: "system",
        text: "申請を却下しました",
        createdAt: new Date().toISOString(),
      };

      const inputForUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        rejectedStaffIds: rejected,
        status: WorkflowStatus.REJECTED,
        finalDecisionTimestamp: new Date().toISOString(),
        nextApprovalStepIndex: null,
        comments: [...existingComments, sysComment],
      };

      const updated = (await updateWorkflow(inputForUpdate)) as NonNullable<
        GetWorkflowQuery["getWorkflow"]
      >;
      setWorkflow(updated);
      setMessages(commentsToMessages(updated.comments || []));
      dispatch(setSnackbarSuccess("却下しました"));
      try {
        await createOperationLogData({
          staffId: currentStaffLocal?.id ?? undefined,
          action: "reject_workflow",
          resource: "workflow",
          resourceId: updated.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workflowId: updated.id,
            category: updated.category ?? null,
            applicantStaffId: updated.staffId ?? null,
            result: "rejected",
          }),
        });
      } catch (err) {
        console.error("Failed to create operation log for reject:", err);
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      dispatch(setSnackbarError(msg));
    }
  };

  return (
    <Page
      title="申請内容（管理者）"
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー管理", href: "/admin/workflow" },
      ]}
      maxWidth="lg"
    >
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Button size="small" sx={{ mr: 1 }} onClick={() => navigate(-1)}>
              一覧に戻る
            </Button>
          </Box>
          <Box>
            <Button
              size="small"
              variant="contained"
              color="success"
              sx={{ mr: 1 }}
              onClick={handleApprove}
              disabled={
                !workflow?.id ||
                workflow?.status === WorkflowStatus.APPROVED ||
                workflow?.status === WorkflowStatus.CANCELLED
              }
            >
              承認
            </Button>

            <Button
              size="small"
              variant="contained"
              color="warning"
              sx={{ mr: 1 }}
              onClick={handleReject}
              disabled={
                !workflow?.id ||
                workflow?.status === WorkflowStatus.REJECTED ||
                workflow?.status === WorkflowStatus.CANCELLED
              }
            >
              却下
            </Button>

            {/* 取り下げボタンは管理者画面では不要のため削除 */}
          </Box>
        </Box>

        {loading && <Typography>読み込み中...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <Grid
                container
                rowSpacing={2}
                columnSpacing={1}
                alignItems="center"
              >
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    ID
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography>{workflow?.id ?? id}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    種別
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography>
                    {workflow?.category
                      ? CATEGORY_LABELS[
                          workflow.category as WorkflowCategory
                        ] || workflow.category
                      : "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    申請者
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography>{staffName}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    申請日
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography>{applicationDate}</Typography>
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    ステータス
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <StatusChip status={workflow?.status} />
                </Grid>

                {workflow?.category === WorkflowCategory.OVERTIME && (
                  <>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        残業予定日
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography>
                        {formatDateSlash(workflow?.overTimeDetails?.date)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        残業予定時間
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography>
                        {workflow?.overTimeDetails?.startTime} -{" "}
                        {workflow?.overTimeDetails?.endTime}
                      </Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      承認フロー
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        {approvalSteps.map((s, idx) => {
                          const isApplicant = s.role === "申請者";
                          const active =
                            s.state === "承認済み"
                              ? "done"
                              : s.state === "未承認"
                              ? "pending"
                              : "";
                          return (
                            <Box
                              key={s.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: isApplicant
                                      ? "grey.300"
                                      : active === "done"
                                      ? "success.main"
                                      : "primary.main",
                                    color: "common.white",
                                    fontWeight: 700,
                                  }}
                                >
                                  {idx === 0 ? "申" : idx}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontWeight: 700 }}>
                                    {s.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {s.role} {s.date ? `・${s.date}` : ""}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ flexGrow: 1 }} />
                              {!isApplicant && (
                                <Box>
                                  <StatusChip status={s.state} />
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={5}>
              <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  コメント
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, maxHeight: 480, overflow: "auto" }}
                >
                  <Stack spacing={2}>
                    {messages.map((m) => {
                      const displayName = formatSender(m.sender);
                      const staff = m.staffId
                        ? staffs.find((s) => s.id === m.staffId)
                        : undefined;
                      const avatarText = staff
                        ? `${(staff.familyName || "").slice(0, 1)}${(
                            staff.givenName || ""
                          ).slice(0, 1)}` || displayName.slice(0, 1)
                        : displayName.slice(0, 1);
                      const isSystem = m.staffId === "system";

                      const isMine = Boolean(
                        currentStaff && m.staffId === currentStaff.id
                      );

                      const avatarBg = isSystem
                        ? "grey.500"
                        : isMine
                        ? "primary.main"
                        : "secondary.main";

                      const long =
                        (m.text.split("\n").length > 5 ||
                          m.text.length > 800) &&
                        !expandedMessages[m.id];

                      return (
                        <Box
                          key={m.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                            }}
                          >
                            {!isMine && (
                              <Avatar
                                sx={{
                                  bgcolor: avatarBg,
                                  width: 32,
                                  height: 32,
                                  fontSize: 12,
                                }}
                              >
                                {avatarText}
                              </Avatar>
                            )}
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {displayName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {m.time}
                            </Typography>
                            {isMine && (
                              <Avatar
                                sx={{
                                  bgcolor: avatarBg,
                                  width: 32,
                                  height: 32,
                                  fontSize: 12,
                                  ml: 1,
                                }}
                              >
                                {avatarText}
                              </Avatar>
                            )}
                          </Box>

                          <Paper
                            elevation={0}
                            sx={{
                              bgcolor: isMine ? "primary.main" : "grey.100",
                              color: isMine ? "common.white" : "text.primary",
                              p: 1.5,
                              borderRadius: 2,
                              maxWidth: "90%",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{
                                display: long ? "-webkit-box" : "block",
                                WebkitLineClamp: long ? 5 : "none",
                                WebkitBoxOrient: long ? "vertical" : "initial",
                                overflow: long ? "hidden" : "visible",
                              }}
                            >
                              {m.text}
                            </Typography>
                            {long && (
                              <Button
                                size="small"
                                onClick={() => toggleExpanded(m.id)}
                                sx={{ mt: 0.5 }}
                              >
                                {expandedMessages[m.id]
                                  ? "折りたたむ"
                                  : "もっと見る"}
                              </Button>
                            )}
                          </Paper>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>

                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-end",
                  }}
                >
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="メッセージを入力..."
                    helperText="Command+Enterで送信"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={sending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={sendMessage}
                            disabled={sending || !input.trim()}
                            sx={{ textTransform: "none", minWidth: 64 }}
                          >
                            送信
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Page>
  );
}
