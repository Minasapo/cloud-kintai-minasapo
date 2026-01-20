import { DailyReportCalendar } from "@features/attendance/daily-report";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { updateDailyReport } from "@shared/api/graphql/documents/mutations";
import {
  dailyReportsByStaffId,
  getDailyReport,
} from "@shared/api/graphql/documents/queries";
import type {
  DailyReportComment,
  DailyReportReaction,
  DailyReportsByStaffIdQuery,
  GetDailyReportQuery,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import { ModelSortDirection } from "@shared/api/graphql/types";
import type { GraphQLResult } from "aws-amplify/api";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import useCognitoUser from "@/hooks/useCognitoUser";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { useStaffs } from "@/hooks/useStaffs/useStaffs";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateSlash, formatDateTimeReadable } from "@/lib/date";
import { dashboardInnerSurfaceSx } from "@/shared/ui/layout";

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
  filters?: {
    statusFilter: string;
    staffFilter: string;
    startDate: string;
    endDate: string;
  };
  paginationState?: {
    page: number;
    rowsPerPage: number;
  };
  carouselState?: {
    filteredReports: AdminDailyReport[];
    currentIndex: number;
  };
};

const DATE_FORMAT = "YYYY-MM-DD";

const normalizeReactions = (
  entries?: (DailyReportReaction | null)[] | null,
): DailyReportReaction[] =>
  entries?.filter((entry): entry is DailyReportReaction => Boolean(entry)) ??
  [];

const normalizeComments = (
  entries?: (DailyReportComment | null)[] | null,
): DailyReportComment[] =>
  entries?.filter((entry): entry is DailyReportComment => Boolean(entry)) ?? [];

const sortReports = (items: AdminDailyReport[]) =>
  [...items].sort((a, b) => {
    if (a.date === b.date) {
      const aTime = a.updatedAt ?? "";
      const bTime = b.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    }
    return b.date.localeCompare(a.date);
  });

export default function AdminDailyReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const stateReportId = state?.report?.id ?? null;
  const { staffs, loading: isStaffLoading } = useStaffs();
  const { cognitoUser } = useCognitoUser();
  const [, setSearchParams] = useSearchParams();

  // Carousel state
  const [carouselReports] = useState<AdminDailyReport[]>(
    () => state?.carouselState?.filteredReports ?? [],
  );
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState<number>(
    () => state?.carouselState?.currentIndex ?? -1,
  );

  const buildStaffName = useCallback(
    (staffId: string) => {
      const staff = staffs.find((item) => item.id === staffId);
      if (!staff) return "スタッフ";
      const name = [staff.familyName, staff.givenName]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");
      return name || "スタッフ";
    },
    [staffs],
  );

  const [report, setReport] = useState<AdminDailyReport | null>(
    () => state?.report ?? null,
  );
  const [reports, setReports] = useState<AdminDailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(!state?.report);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<ReportReaction[]>(
    () => report?.reactions ?? [],
  );
  const [comments, setComments] = useState<AdminComment[]>(
    () => report?.comments ?? [],
  );
  const [commentInput, setCommentInput] = useState<string>("");
  const [selectedReactions, setSelectedReactions] = useState<ReactionType[]>(
    [],
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
  const [calendarDate, setCalendarDate] = useState<Dayjs>(() =>
    dayjs().startOf("day"),
  );
  const [staffIdForReports, setStaffIdForReports] = useState<string | null>(
    null,
  );

  const { dateMap: reportsByDate, dateSet: reportedDateSet } = useMemo(() => {
    const dateMap = new Map<string, AdminDailyReport>();
    const dateSet = new Set<string>();
    reports.forEach((r) => {
      if (!dateMap.has(r.date)) {
        dateMap.set(r.date, r);
      }
      dateSet.add(r.date);
    });
    return { dateMap, dateSet };
  }, [reports]);

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

      // Initialize staffIdForReports and calendarDate from the report
      if (!staffIdForReports) {
        setStaffIdForReports(record.staffId);
      }
      const reportDate = dayjs(record.reportDate, DATE_FORMAT);
      if (reportDate.isValid()) {
        setCalendarDate(reportDate.startOf("day"));
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。",
      );
      if (!stateReportId) {
        setReport(null);
      }
      setReactionEntries(null);
      setCommentEntries(null);
    } finally {
      setIsLoading(false);
    }
  }, [buildStaffName, id, stateReportId, staffIdForReports]);

  const fetchReports = useCallback(async () => {
    if (!staffIdForReports) {
      setReports([]);
      setIsLoadingReports(false);
      return;
    }

    setIsLoadingReports(true);
    try {
      const aggregated: AdminDailyReport[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        const response = (await graphqlClient.graphql({
          query: dailyReportsByStaffId,
          variables: {
            staffId: staffIdForReports,
            sortDirection: ModelSortDirection.DESC,
            limit: 50,
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<DailyReportsByStaffIdQuery>;

        if (response.errors?.length) {
          throw new Error(
            response.errors.map((error) => error.message).join("\n"),
          );
        }

        const items =
          response.data?.dailyReportsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? [];

        items.forEach((item) => {
          aggregated.push(mapDailyReport(item, buildStaffName(item.staffId)));
        });

        nextToken = response.data?.dailyReportsByStaffId?.nextToken;
      } while (nextToken);

      setReports(sortReports(aggregated));
    } catch {
      // Silently fail - reports list is supplementary
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, [buildStaffName, staffIdForReports]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

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
        .map((entry) => entry.type as ReactionType),
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

  const handleCalendarChange = useCallback(
    (newDate: Dayjs | null) => {
      if (!newDate || !staffIdForReports) return;

      const dateKey = newDate.format(DATE_FORMAT);
      setCalendarDate(newDate.startOf("day"));

      // Find report for the selected date
      const reportForDate = reportsByDate.get(dateKey);

      if (reportForDate) {
        // Navigate to the report for the selected date
        navigate(`/admin/daily-report/${reportForDate.id}?date=${dateKey}`, {
          replace: true,
        });
      } else {
        // No report for this date - stay on current page but update calendar
        setSearchParams({ date: dateKey }, { replace: true });
      }
    },
    [navigate, reportsByDate, staffIdForReports, setSearchParams],
  );

  const handleCarouselPrevious = useCallback(() => {
    if (currentCarouselIndex <= 0 || carouselReports.length === 0) return;

    const previousReport = carouselReports[currentCarouselIndex - 1];
    setCurrentCarouselIndex(currentCarouselIndex - 1);
    navigate(`/admin/daily-report/${previousReport.id}`, {
      state: {
        report: previousReport,
        filters: state?.filters,
        paginationState: state?.paginationState,
        carouselState: {
          filteredReports: carouselReports,
          currentIndex: currentCarouselIndex - 1,
        },
      },
      replace: true,
    });
  }, [currentCarouselIndex, carouselReports, navigate, state]);

  const handleCarouselNext = useCallback(() => {
    if (
      currentCarouselIndex >= carouselReports.length - 1 ||
      carouselReports.length === 0
    )
      return;

    const nextReport = carouselReports[currentCarouselIndex + 1];
    setCurrentCarouselIndex(currentCarouselIndex + 1);
    navigate(`/admin/daily-report/${nextReport.id}`, {
      state: {
        report: nextReport,
        filters: state?.filters,
        paginationState: state?.paginationState,
        carouselState: {
          filteredReports: carouselReports,
          currentIndex: currentCarouselIndex + 1,
        },
      },
      replace: true,
    });
  }, [currentCarouselIndex, carouselReports, navigate, state]);

  const handleToggleReaction = async (type: ReactionType) => {
    if (!report) return;
    if (!reactionEntries) {
      setActionError(
        "リアクション情報の取得中です。少し待ってから再度お試しください。",
      );
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError(
        "スタッフ情報が取得できないため、リアクションを登録できません。",
      );
      return;
    }
    if (isSavingReaction) return;

    setIsSavingReaction(true);
    setActionError(null);

    const hasReaction = reactionEntries.some(
      (entry) => entry.staffId === currentStaffId && entry.type === type,
    );
    const timestamp = new Date().toISOString();
    const nextEntries = hasReaction
      ? reactionEntries.filter(
          (entry) => entry.staffId !== currentStaffId || entry.type !== type,
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
          response.errors.map((error) => error.message).join("\n"),
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
          : "リアクションの登録に失敗しました。",
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
        "コメント情報の取得中です。少し待ってから再度お試しください。",
      );
      return;
    }
    if (!currentStaffId || isResolvingCurrentStaff) {
      setActionError(
        "スタッフ情報が取得できないため、コメントを登録できません。",
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
              }),
            ),
            updatedAt: timestamp,
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          response.errors.map((error) => error.message).join("\n"),
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
          : "コメントの登録に失敗しました。",
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1">日報詳細</Typography>
        </Box>

        {loadError && <Alert severity="error">{loadError}</Alert>}

        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={3}>
            <Box sx={dashboardInnerSurfaceSx}>
              <DailyReportCalendar
                value={calendarDate}
                onChange={handleCalendarChange}
                reportedDateSet={reportedDateSet}
                isLoadingReports={isLoadingReports}
                hasReports={reports.length > 0}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box sx={dashboardInnerSurfaceSx}>
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

                    {carouselReports.length > 0 && currentCarouselIndex >= 0 && (
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCarouselPrevious}
                          disabled={currentCarouselIndex <= 0}
                          sx={{ minWidth: 80 }}
                        >
                          前へ
                        </Button>
                        <Typography
                          variant="body2"
                          sx={{ minWidth: 60, textAlign: "center" }}
                        >
                          {currentCarouselIndex + 1} / {carouselReports.length}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleCarouselNext}
                          disabled={
                            currentCarouselIndex >= carouselReports.length - 1
                          }
                          sx={{ minWidth: 80 }}
                        >
                          次へ
                        </Button>
                      </Stack>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      最終更新:{" "}
                      {formatDateTimeReadable(report.updatedAt) || "-"}
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
                              reactions.find(
                                (reaction) => reaction.type === type,
                              )?.count ?? 0;
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
                          },
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
                            <Paper
                              key={comment.id}
                              variant="outlined"
                              sx={{ p: 2 }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={2}
                              >
                                <Typography variant="body2" fontWeight={600}>
                                  {comment.author}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDateTimeReadable(comment.createdAt) ||
                                    comment.createdAt}
                                </Typography>
                              </Stack>
                              <Typography sx={{ mt: 1 }}>
                                {comment.body}
                              </Typography>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent="flex-end"
                    >
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
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
