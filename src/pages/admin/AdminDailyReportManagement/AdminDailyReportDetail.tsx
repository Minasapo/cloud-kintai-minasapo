import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { updateDailyReport } from "@shared/api/graphql/documents/mutations";
import { getDailyReport } from "@shared/api/graphql/documents/queries";
import type {
  DailyReportComment,
  DailyReportReaction,
  GetDailyReportQuery,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import useCognitoUser from "@/hooks/useCognitoUser";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { useStaffs } from "@/hooks/useStaffs/useStaffs";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateSlash, formatDateTimeReadable } from "@/lib/date";

import {
  type AdminComment,
  type AdminDailyReport,
  mapDailyReport,
  REACTION_META,
  type ReactionType,
  type ReportReaction,
  STATUS_META,
} from "./data";

type LocationState = {
  report?: AdminDailyReport;
};

const normalizeReactions = (
  entries?: (DailyReportReaction | null)[] | null
): DailyReportReaction[] =>
  entries?.filter((entry): entry is DailyReportReaction => Boolean(entry)) ??
  [];

const normalizeComments = (
  entries?: (DailyReportComment | null)[] | null
): DailyReportComment[] =>
  entries?.filter((entry): entry is DailyReportComment => Boolean(entry)) ?? [];

export default function AdminDailyReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const stateReportId = state?.report?.id ?? null;
  const { staffs, loading: isStaffLoading } = useStaffs();
  const { cognitoUser } = useCognitoUser();

  const buildStaffName = useCallback(
    (staffId: string) => {
      const staff = staffs.find((item) => item.id === staffId);
      if (!staff) return "スタッフ";
      const name = [staff.familyName, staff.givenName]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");
      return name || "スタッフ";
    },
    [staffs]
  );

  const [report, setReport] = useState<AdminDailyReport | null>(
    () => state?.report ?? null
  );
  const [isLoading, setIsLoading] = useState(!state?.report);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReportReaction[]>(
    () => report?.reactions ?? []
  );
  const [comments, setComments] = useState<AdminComment[]>(
    () => report?.comments ?? []
  );
  const [commentInput, setCommentInput] = useState<string>("");
  const [selectedReactions, setSelectedReactions] = useState<ReactionType[]>(
    []
  );
  const [reactionEntries, setReactionEntries] = useState<
    DailyReportReaction[] | null
  >(null);
  const [commentEntries, setCommentEntries] = useState<
    DailyReportComment[] | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSavingReaction, setIsSavingReaction] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState<string | null>(null);
  const [currentStaffName, setCurrentStaffName] = useState<string>("管理者");
  const [isResolvingCurrentStaff, setIsResolvingCurrentStaff] = useState(true);

  const fetchReport = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      const response = (await graphqlClient.graphql({
        query: getDailyReport,
        variables: { id },
        authMode: "userPool",
      })) as GraphQLResult<GetDailyReportQuery>;

      if (response.errors?.length) {
        const messages = response.errors.map((err) => err.message);
        throw new Error(messages.join("\n"));
      }

      const record = response.data?.getDailyReport;
      if (!record) {
        throw new Error("日報が見つかりませんでした。");
      }

      setReactionEntries(normalizeReactions(record.reactions));
      setCommentEntries(normalizeComments(record.comments));
      setReport(mapDailyReport(record, buildStaffName(record.staffId)));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。"
      );
      if (!stateReportId) {
        setReport(null);
      }
      setReactionEntries(null);
      setCommentEntries(null);
    } finally {
      setIsLoading(false);
    }
  }, [buildStaffName, id, stateReportId]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    setReport((prev) => {
      if (!prev) return prev;
      const nextAuthor = buildStaffName(prev.staffId);
      if (prev.author === nextAuthor) return prev;
      return { ...prev, author: nextAuthor };
    });
  }, [buildStaffName]);

  useEffect(() => {
    setReactions(report?.reactions ?? []);
    setComments(report?.comments ?? []);
    setCommentInput("");
  }, [report]);

  useEffect(() => {
    if (!reactionEntries || !currentStaffId) {
      setSelectedReactions([]);
      return;
    }
    setSelectedReactions(
      reactionEntries
        .filter((entry) => entry.staffId === currentStaffId)
        .map((entry) => entry.type as ReactionType)
    );
  }, [currentStaffId, reactionEntries]);

  useEffect(() => {
    if (cognitoUser === undefined) return;
    if (!cognitoUser) {
      setCurrentStaffId(null);
      setCurrentStaffName("管理者");
      setIsResolvingCurrentStaff(false);
      return;
    }

    let mounted = true;
    setIsResolvingCurrentStaff(true);

    const resolveStaff = async () => {
      try {
        const staff = await fetchStaff(cognitoUser.id);
        if (!mounted) return;
        if (staff) {
          const name = [staff.familyName, staff.givenName]
            .filter((part): part is string => Boolean(part && part.trim()))
            .join(" ");
          setCurrentStaffId(staff.id);
          setCurrentStaffName(name || "管理者");
        } else {
          setCurrentStaffId(null);
          setCurrentStaffName("管理者");
        }
      } catch {
        if (!mounted) return;
        setCurrentStaffId(null);
        setCurrentStaffName("管理者");
      } finally {
        if (mounted) {
          setIsResolvingCurrentStaff(false);
        }
      }
    };

    void resolveStaff();

    return () => {
      mounted = false;
    };
  }, [cognitoUser]);

  const handleToggleReaction = async (type: ReactionType) => {
    if (!report) return;
    if (!reactionEntries) {
      setActionError(
        "リアクション情報の取得中です。少し待ってから再度お試しください。"
      );
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError(
        "スタッフ情報が取得できないため、リアクションを登録できません。"
      );
      return;
    }
    if (isSavingReaction) return;

    setIsSavingReaction(true);
    setActionError(null);

    const hasReaction = reactionEntries.some(
      (entry) => entry.staffId === currentStaffId && entry.type === type
    );
    const timestamp = new Date().toISOString();
    const nextEntries = hasReaction
      ? reactionEntries.filter(
          (entry) => entry.staffId !== currentStaffId || entry.type !== type
        )
      : [
          ...reactionEntries,
          {
            __typename: "DailyReportReaction",
            staffId: currentStaffId,
            type,
            createdAt: timestamp,
          },
        ];

    try {
      const response = (await graphqlClient.graphql({
        query: updateDailyReport,
        variables: {
          input: {
            id: report.id,
            reactions: nextEntries.map(({ staffId, type, createdAt }) => ({
              staffId,
              type,
              createdAt,
            })),
            updatedAt: timestamp,
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          response.errors.map((error) => error.message).join("\n")
        );
      }

      const updated = response.data?.updateDailyReport;
      if (!updated) {
        throw new Error("リアクションの更新に失敗しました。");
      }

      setReactionEntries(normalizeReactions(updated.reactions));
      setCommentEntries(normalizeComments(updated.comments));
      setReport(mapDailyReport(updated, buildStaffName(updated.staffId)));
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "リアクションの登録に失敗しました。"
      );
    } finally {
      setIsSavingReaction(false);
    }
  };

  const handleSubmitComment = async () => {
    const body = commentInput.trim();
    if (!body) return;
    if (!report) return;
    if (!commentEntries) {
      setActionError(
        "コメント情報の取得中です。少し待ってから再度お試しください。"
      );
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError(
        "スタッフ情報が取得できないため、コメントを登録できません。"
      );
      return;
    }
    if (isSavingComment) return;

    setIsSavingComment(true);
    setActionError(null);

    const timestamp = new Date().toISOString();
    const newCommentEntry: DailyReportComment = {
      __typename: "DailyReportComment",
      id: `admin-comment-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      staffId: currentStaffId,
      authorName: currentStaffName,
      body,
      createdAt: timestamp,
    };
    const nextComments = [newCommentEntry, ...commentEntries];

    try {
      const response = (await graphqlClient.graphql({
        query: updateDailyReport,
        variables: {
          input: {
            id: report.id,
            comments: nextComments.map(
              ({
                id: commentId,
                staffId,
                authorName,
                body: commentBody,
                createdAt,
              }) => ({
                id: commentId,
                staffId,
                authorName,
                body: commentBody,
                createdAt,
              })
            ),
            updatedAt: timestamp,
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          response.errors.map((error) => error.message).join("\n")
        );
      }

      const updated = response.data?.updateDailyReport;
      if (!updated) {
        throw new Error("コメントの更新に失敗しました。");
      }

      setReactionEntries(normalizeReactions(updated.reactions));
      setCommentEntries(normalizeComments(updated.comments));
      setReport(mapDailyReport(updated, buildStaffName(updated.staffId)));
      setCommentInput("");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "コメントの登録に失敗しました。"
      );
    } finally {
      setIsSavingComment(false);
    }
  };

  const shouldShowLoading = !report && (isLoading || isStaffLoading);
  const chipsDisabled =
    !reactionEntries ||
    !currentStaffId ||
    isSavingReaction ||
    isResolvingCurrentStaff;
  const isCommentDisabled =
    !commentInput.trim() ||
    !currentStaffId ||
    !commentEntries ||
    isSavingComment ||
    isResolvingCurrentStaff;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {loadError && <Alert severity="error">{loadError}</Alert>}

        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {shouldShowLoading ? (
          <Paper sx={{ p: 4 }}>
            <Typography align="center">読み込み中...</Typography>
          </Paper>
        ) : !report ? (
          <Paper sx={{ p: 4 }}>
            <Stack spacing={2} alignItems="flex-start">
              <Typography variant="h6">日報が見つかりません</Typography>
              <Typography color="text.secondary">
                URLが正しいか、一覧から改めて選択してください。
              </Typography>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                戻る
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {report.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatDateSlash(report.date) || report.date} |{" "}
                    {report.author}
                  </Typography>
                  <Chip
                    label={STATUS_META[report.status].label}
                    color={STATUS_META[report.status].color}
                    size="small"
                  />
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary">
                最終更新: {formatDateTimeReadable(report.updatedAt) || "-"}
              </Typography>

              <Typography
                component="pre"
                sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
              >
                {report.content || "内容は登録されていません"}
              </Typography>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">リアクション</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(Object.keys(REACTION_META) as ReactionType[]).map(
                    (type) => {
                      const meta = REACTION_META[type];
                      const count =
                        reactions.find((reaction) => reaction.type === type)
                          ?.count ?? 0;
                      const isSelected = selectedReactions.includes(type);
                      return (
                        <Chip
                          key={type}
                          clickable
                          color={isSelected ? "primary" : undefined}
                          variant={isSelected ? "filled" : "outlined"}
                          label={`${meta.emoji} ${meta.label}${
                            count > 0 ? ` (${count})` : ""
                          }`}
                          disabled={chipsDisabled}
                          onClick={() => {
                            void handleToggleReaction(type);
                          }}
                        />
                      );
                    }
                  )}
                </Stack>
                {(!reactionEntries || isResolvingCurrentStaff) && (
                  <Typography color="text.secondary" variant="caption">
                    スタッフ情報およびリアクション履歴の取得完了後に操作できます。
                  </Typography>
                )}
                {reactions.length === 0 && (
                  <Typography color="text.secondary" variant="body2">
                    まだリアクションはありません。
                  </Typography>
                )}
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Typography variant="subtitle2">コメント</Typography>
                <Stack spacing={1}>
                  <TextField
                    value={commentInput}
                    onChange={(event) => {
                      if (actionError) setActionError(null);
                      setCommentInput(event.target.value);
                    }}
                    placeholder="コメントを入力"
                    multiline
                    minRows={3}
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      onClick={handleSubmitComment}
                      disabled={isCommentDisabled}
                    >
                      コメントを追加
                    </Button>
                  </Stack>
                  {(!commentEntries || isResolvingCurrentStaff) && (
                    <Typography color="text.secondary" variant="caption">
                      スタッフ情報およびコメント履歴の取得完了後に登録できます。
                    </Typography>
                  )}
                </Stack>

                {comments.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    まだコメントはありません。
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {comments.map((comment) => (
                      <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTimeReadable(comment.createdAt) ||
                              comment.createdAt}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 1 }}>{comment.body}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/daily-report")}
                >
                  一覧に戻る
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
