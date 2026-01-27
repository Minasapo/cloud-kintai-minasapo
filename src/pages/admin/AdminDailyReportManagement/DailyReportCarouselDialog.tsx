import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
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
import { useCallback, useContext, useEffect, useState } from "react";

import { AuthContext } from "@/context/AuthContext";
import useCognitoUser from "@/hooks/useCognitoUser";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import { formatDateSlash, formatDateTimeReadable } from "@/shared/lib/time";

import {
  type AdminComment,
  type AdminDailyReport,
  mapDailyReport,
  REACTION_META,
  type ReactionType,
  type ReportReaction,
  STATUS_META,
} from "./data";

interface DailyReportCarouselDialogProps {
  open: boolean;
  onClose: () => void;
  selectedReport: AdminDailyReport;
  filteredReports: AdminDailyReport[];
}

const normalizeReactions = (
  entries?: (DailyReportReaction | null)[] | null
): DailyReportReaction[] =>
  entries?.filter((entry): entry is DailyReportReaction => Boolean(entry)) ??
  [];

const normalizeComments = (
  entries?: (DailyReportComment | null)[] | null
): DailyReportComment[] =>
  entries?.filter((entry): entry is DailyReportComment => Boolean(entry)) ?? [];

interface PreloadedReport {
  report: AdminDailyReport;
  reactionEntries: DailyReportReaction[];
  commentEntries: DailyReportComment[];
}

export default function DailyReportCarouselDialog({
  open,
  onClose,
  selectedReport,
  filteredReports,
}: DailyReportCarouselDialogProps) {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs, loading: isStaffLoading } = useStaffs({ isAuthenticated });
  const { cognitoUser } = useCognitoUser();
  const [currentIndex, setCurrentIndex] = useState(
    filteredReports.findIndex((r) => r.id === selectedReport.id)
  );
  const [report, setReport] = useState<AdminDailyReport>(selectedReport);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preloadedReports, setPreloadedReports] = useState<
    Map<string, PreloadedReport>
  >(new Map());
  const [reactions, setReactions] = useState<ReportReaction[]>(
    selectedReport.reactions ?? []
  );
  const [comments, setComments] = useState<AdminComment[]>(
    selectedReport.comments ?? []
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

  const currentReport = filteredReports[currentIndex];

  const fetchReport = useCallback(async () => {
    if (!currentReport) return;

    // Check if report is already preloaded
    const preloaded = preloadedReports.get(currentReport.id);
    if (preloaded) {
      setReport(preloaded.report);
      setReactionEntries(preloaded.reactionEntries);
      setCommentEntries(preloaded.commentEntries);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const response = (await graphqlClient.graphql({
        query: getDailyReport,
        variables: { id: currentReport.id },
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

      const reactions = normalizeReactions(record.reactions);
      const comments = normalizeComments(record.comments);
      const mappedReport = mapDailyReport(
        record,
        buildStaffName(record.staffId)
      );

      setReactionEntries(reactions);
      setCommentEntries(comments);
      setReport(mappedReport);

      // Cache the fetched report
      setPreloadedReports((prev) =>
        new Map(prev).set(currentReport.id, {
          report: mappedReport,
          reactionEntries: reactions,
          commentEntries: comments,
        })
      );
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentReport, buildStaffName, preloadedReports]);

  useEffect(() => {
    if (open) {
      setCurrentIndex(
        filteredReports.findIndex((r) => r.id === selectedReport.id)
      );
      // Reset preloaded reports when dialog opens
      setPreloadedReports(new Map());
    }
  }, [open, selectedReport.id, filteredReports]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  // Preload all filtered reports in background
  useEffect(() => {
    if (!open || filteredReports.length === 0) return;

    let mounted = true;

    const preloadReports = async () => {
      // Preload reports in sequence to avoid overwhelming the server
      for (let i = 0; i < filteredReports.length; i++) {
        if (!mounted) break;

        const reportToPreload = filteredReports[i];
        // Skip if already preloaded or if it's the current report (will be loaded by fetchReport)
        if (
          preloadedReports.has(reportToPreload.id) ||
          reportToPreload.id === currentReport?.id
        ) {
          continue;
        }

        try {
          const response = (await graphqlClient.graphql({
            query: getDailyReport,
            variables: { id: reportToPreload.id },
            authMode: "userPool",
          })) as GraphQLResult<GetDailyReportQuery>;

          if (!mounted) break;

          if (response.errors?.length) {
            console.error(
              `Failed to preload report ${reportToPreload.id}:`,
              response.errors
            );
            continue;
          }

          const record = response.data?.getDailyReport;
          if (!record) {
            console.error(`Report ${reportToPreload.id} not found`);
            continue;
          }

          const reactions = normalizeReactions(record.reactions);
          const comments = normalizeComments(record.comments);
          const mappedReport = mapDailyReport(
            record,
            buildStaffName(record.staffId)
          );

          if (mounted) {
            setPreloadedReports((prev) =>
              new Map(prev).set(reportToPreload.id, {
                report: mappedReport,
                reactionEntries: reactions,
                commentEntries: comments,
              })
            );
          }

          // Add a small delay between requests to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `Error preloading report ${reportToPreload.id}:`,
            error
          );
        }
      }
    };

    void preloadReports();

    return () => {
      mounted = false;
    };
  }, [open, filteredReports, buildStaffName, currentReport, preloadedReports]);

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredReports.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="h6">日報を確認</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "inherit" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Carousel Navigation - Fixed */}
      <Box
        sx={{
          p: 2,
          bgcolor: "action.hover",
          borderBottom: 1,
          borderTop: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex <= 0}
            size="small"
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="body2"
            sx={{ minWidth: 80, textAlign: "center" }}
          >
            {currentIndex + 1} / {filteredReports.length}
          </Typography>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex >= filteredReports.length - 1}
            size="small"
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Scrollable Content */}
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: 3 }}>
          {isLoading || isStaffLoading ? (
            <Typography align="center" color="text.secondary">
              読み込み中...
            </Typography>
          ) : loadError ? (
            <Alert severity="error">{loadError}</Alert>
          ) : !report ? (
            <Alert severity="warning">日報が見つかりません</Alert>
          ) : (
            <Stack spacing={3}>
              {actionError && (
                <Alert severity="error" onClose={() => setActionError(null)}>
                  {actionError}
                </Alert>
              )}

              {/* Header */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {report.title}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Typography variant="body2" color="text.secondary">
                    {formatDateSlash(report.date) || report.date} |{" "}
                    {report.author}
                  </Typography>
                  <Chip
                    label={STATUS_META[report.status].label}
                    color={STATUS_META[report.status].color}
                    size="small"
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  最終更新: {formatDateTimeReadable(report.updatedAt) || "-"}
                </Typography>
              </Box>

              <Divider />

              {/* Content */}
              <Typography
                component="pre"
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
              >
                {report.content || "内容は登録されていません"}
              </Typography>

              <Divider />

              {/* Reactions */}
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
                          size="small"
                        />
                      );
                    }
                  )}
                </Stack>
                {reactions.length === 0 && (
                  <Typography color="text.secondary" variant="caption">
                    まだリアクションはありません。
                  </Typography>
                )}
              </Stack>

              <Divider />

              {/* Comments */}
              <Stack spacing={2}>
                <Typography variant="subtitle2">コメント</Typography>
                <TextField
                  value={commentInput}
                  onChange={(event) => {
                    if (actionError) setActionError(null);
                    setCommentInput(event.target.value);
                  }}
                  placeholder="コメントを入力"
                  multiline
                  minRows={2}
                  size="small"
                />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSubmitComment}
                    disabled={isCommentDisabled}
                  >
                    追加
                  </Button>
                </Stack>

                {comments.length === 0 ? (
                  <Typography color="text.secondary" variant="caption">
                    まだコメントはありません。
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {comments.map((comment) => (
                      <Paper
                        key={comment.id}
                        variant="outlined"
                        sx={{ p: 1.5 }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={2}
                        >
                          <Typography variant="caption" fontWeight={600}>
                            {comment.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTimeReadable(comment.createdAt) ||
                              comment.createdAt}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {comment.body}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
