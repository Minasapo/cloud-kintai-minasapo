import {
  DailyReportCalendar,
  DailyReportFormChangeHandler,
  DailyReportFormData,
  DailyReportFormFields,
} from "@features/attendance/daily-report";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  createDailyReport,
  updateDailyReport,
} from "@shared/api/graphql/documents/mutations";
import { dailyReportsByStaffId } from "@shared/api/graphql/documents/queries";
import type {
  CreateDailyReportMutation,
  DailyReport as DailyReportModel,
  DailyReportComment,
  DailyReportReaction,
  DailyReportReactionType,
  DailyReportsByStaffIdQuery,
  UpdateDailyReportMutation,
} from "@shared/api/graphql/types";
import {
  DailyReportStatus,
  ModelSortDirection,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { GraphQLResult } from "aws-amplify/api";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useCognitoUser from "@/hooks/useCognitoUser";
import fetchStaff from "@/hooks/useStaff/fetchStaff";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateSlash, formatDateTimeReadable } from "@/lib/date";
import { dashboardInnerSurfaceSx, PageSection } from "@/shared/ui/layout";

type ReportStatus = DailyReportStatus;
type EditableStatus = Extract<ReportStatus, "DRAFT" | "SUBMITTED">;
type ReactionType = DailyReportReactionType;

interface ReportReaction {
  type: ReactionType;
  count: number;
}

interface AdminComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

interface DailyReportItem {
  id: string;
  staffId: string;
  date: string;
  author: string;
  title: string;
  content: string;
  status: ReportStatus;
  updatedAt?: string | null;
  createdAt?: string | null;
  reactions: ReportReaction[];
  comments: AdminComment[];
}

type DailyReportForm = DailyReportFormData;

const STATUS_META: Record<
  ReportStatus,
  { label: string; color: "default" | "info" | "success" }
> = {
  DRAFT: { label: "下書き", color: "default" },
  SUBMITTED: { label: "提出済", color: "info" },
  APPROVED: { label: "確認済", color: "success" },
};

const REACTION_META: Record<ReactionType, { label: string; emoji: string }> = {
  CHEER: { label: "GOOD", emoji: "👍" },
  CHECK: { label: "確認済", emoji: "✅" },
  THANKS: { label: "感謝", emoji: "🙌" },
  LOOK: { label: "見ました", emoji: "👀" },
};

const formatDateInput = (value: Date) => value.toISOString().slice(0, 10);
const buildDefaultTitle = (date: string) => (date ? `${date}の日報` : "日報");
const emptyForm = (
  initialDate?: string,
  initialAuthor?: string
): DailyReportForm => {
  const date = initialDate ?? formatDateInput(new Date());
  return {
    date,
    author: initialAuthor ?? "",
    title: buildDefaultTitle(date),
    content: "",
  };
};

const aggregateReactions = (
  entries?: (DailyReportReaction | null)[] | null
): ReportReaction[] => {
  if (!entries?.length) return [];
  const counts = new Map<ReactionType, number>();
  entries
    .filter((entry): entry is DailyReportReaction => Boolean(entry))
    .forEach((entry) => {
      const type = entry.type as ReactionType;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });
  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
};

const mapComments = (
  entries?: (DailyReportComment | null)[] | null
): AdminComment[] => {
  if (!entries?.length) return [];
  return entries
    .filter((entry): entry is DailyReportComment => Boolean(entry))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({
      id: entry.id,
      author: entry.authorName || "管理者",
      body: entry.body,
      createdAt: entry.createdAt,
    }));
};

const mapDailyReport = (
  record: DailyReportModel,
  authorFallback: string
): DailyReportItem => ({
  id: record.id,
  staffId: record.staffId,
  date: record.reportDate,
  author: authorFallback,
  title: record.title,
  content: record.content ?? "",
  status: record.status,
  updatedAt: record.updatedAt ?? record.createdAt ?? null,
  createdAt: record.createdAt ?? null,
  reactions: aggregateReactions(record.reactions),
  comments: mapComments(record.comments),
});

const sortReports = (items: DailyReportItem[]) =>
  [...items].sort((a, b) => {
    if (a.date === b.date) {
      const aTime = a.updatedAt ?? "";
      const bTime = b.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    }
    return b.date.localeCompare(a.date);
  });

export default function DailyReport() {
  const { cognitoUser, loading: isCognitoUserLoading } = useCognitoUser();
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [createForm, setCreateForm] = useState<DailyReportForm>(() =>
    emptyForm()
  );
  const [calendarDate, setCalendarDate] = useState<Dayjs>(() =>
    dayjs().startOf("day")
  );
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DailyReportForm | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<
    string | "create" | null
  >(null);
  const [authorName, setAuthorName] = useState<string>("");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [isInitialViewPending, setIsInitialViewPending] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const processedUserIdRef = useRef<string | null>(null);
  const { dateMap: reportsByDate, dateSet: reportedDateSet } = useMemo(() => {
    const dateMap = new Map<string, DailyReportItem>();
    const dateSet = new Set<string>();
    reports.forEach((report) => {
      if (!dateMap.has(report.date)) {
        dateMap.set(report.date, report);
      }
      dateSet.add(report.date);
    });
    return { dateMap, dateSet };
  }, [reports]);
  const isCreateMode = selectedReportId === "create";
  const resolvedAuthorName = authorName || "スタッフ";
  const canSubmit = Boolean(staffId && createForm.title.trim());
  const canEditSubmit = Boolean(editDraft && editDraft.title.trim());
  const selectedReport =
    selectedReportId && selectedReportId !== "create"
      ? reports.find((report) => report.id === selectedReportId) ?? null
      : null;
  const showInitialLoading = isInitialViewPending;
  const isSelectedReportSubmitted =
    selectedReport?.status === DailyReportStatus.SUBMITTED;
  useEffect(() => {
    const nextDateString = selectedReport
      ? selectedReport.date
      : isCreateMode
      ? createForm.date
      : null;

    if (!nextDateString) return;

    setCalendarDate((current) => {
      const nextDate = dayjs(nextDateString).startOf("day");
      return current.isSame(nextDate, "day") ? current : nextDate;
    });
  }, [selectedReport, isCreateMode, createForm.date]);

  useEffect(() => {
    if (isCognitoUserLoading) {
      return;
    }

    if (!cognitoUser?.id) {
      setAuthorName("スタッフ");
      setStaffId(null);
      setIsInitialViewPending(false);
      processedUserIdRef.current = null;
      return;
    }

    if (processedUserIdRef.current !== cognitoUser.id) {
      setIsInitialViewPending(true);
      processedUserIdRef.current = cognitoUser.id;
    }

    const currentUser = cognitoUser;
    const buildName = (family?: string | null, given?: string | null) =>
      [family, given]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join(" ");

    let mounted = true;

    async function load() {
      try {
        const staff = await fetchStaff(currentUser.id);
        if (!mounted) return;
        const staffName = buildName(
          staff?.familyName ?? null,
          staff?.givenName ?? null
        );
        const fallback = buildName(
          currentUser.familyName ?? null,
          currentUser.givenName ?? null
        );
        setAuthorName(staffName || fallback || "スタッフ");
        setStaffId(staff?.id ?? null);
        if (!staff?.id) {
          setIsInitialViewPending(false);
        }
      } catch {
        if (!mounted) return;
        const fallback = buildName(
          currentUser.familyName ?? null,
          currentUser.givenName ?? null
        );
        setAuthorName(fallback || "スタッフ");
        setStaffId(null);
        setIsInitialViewPending(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [cognitoUser, isCognitoUserLoading]);

  useEffect(() => {
    if (!authorName) return;
    setCreateForm((prev) =>
      prev.author === resolvedAuthorName
        ? prev
        : { ...prev, author: resolvedAuthorName }
    );
    setReports((prev) =>
      prev.map((report) => ({ ...report, author: resolvedAuthorName }))
    );
  }, [authorName, resolvedAuthorName]);

  const fetchReports = useCallback(async () => {
    if (!staffId) {
      setReports([]);
      setIsLoadingReports(false);
      setRequestError(null);
      setIsInitialViewPending(false);
      return;
    }

    setIsLoadingReports(true);
    setRequestError(null);
    try {
      const aggregated: DailyReportItem[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        const response = (await graphqlClient.graphql({
          query: dailyReportsByStaffId,
          variables: {
            staffId,
            sortDirection: ModelSortDirection.DESC,
            limit: 50,
            nextToken,
          },
          authMode: "userPool",
        })) as GraphQLResult<DailyReportsByStaffIdQuery>;

        if (response.errors?.length) {
          throw new Error(
            response.errors.map((error) => error.message).join("\n")
          );
        }

        const items =
          response.data?.dailyReportsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => item !== null
          ) ?? [];

        items.forEach((item) => {
          aggregated.push(mapDailyReport(item, resolvedAuthorName));
        });

        nextToken = response.data?.dailyReportsByStaffId?.nextToken;
      } while (nextToken);

      setReports(sortReports(aggregated));
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。"
      );
    } finally {
      setIsLoadingReports(false);
      setIsInitialViewPending(false);
    }
  }, [resolvedAuthorName, staffId]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (reports.length === 0) {
      setSelectedReportId("create");
      setEditingReportId(null);
      setEditDraft(null);
      return;
    }

    if (selectedReportId && selectedReportId !== "create") {
      const exists = reports.some((report) => report.id === selectedReportId);
      if (!exists) {
        setSelectedReportId(reports[0].id);
      }
      return;
    }

    const calendarKey = calendarDate.format("YYYY-MM-DD");
    const reportForCalendarDate = reportsByDate.get(calendarKey) ?? null;

    if (selectedReportId === "create" && reportForCalendarDate) {
      setSelectedReportId(reportForCalendarDate.id);
      return;
    }

    if (!selectedReportId) {
      setSelectedReportId(reportForCalendarDate?.id ?? reports[0].id);
    }
  }, [calendarDate, reports, reportsByDate, selectedReportId]);

  useEffect(() => {
    setEditingReportId(null);
    setEditDraft(null);
    setActionError(null);
  }, [selectedReportId]);

  const handleCalendarChange = (value: Dayjs | null) => {
    if (!value) return;
    const normalized = value.startOf("day");
    setCalendarDate(normalized);
    const dateKey = normalized.format("YYYY-MM-DD");
    const reportForDate = reportsByDate.get(dateKey);
    if (reportForDate) {
      setSelectedReportId(reportForDate.id);
      return;
    }
    setSelectedReportId("create");
    setCreateForm((prev) => {
      const prevDefaultTitle = buildDefaultTitle(prev.date);
      const nextDefaultTitle = buildDefaultTitle(dateKey);
      const shouldSyncTitle =
        prev.title.trim() === "" || prev.title === prevDefaultTitle;
      return {
        ...prev,
        date: dateKey,
        title: shouldSyncTitle ? nextDefaultTitle : prev.title,
      };
    });
  };

  const handleCreateChange: DailyReportFormChangeHandler = (field, value) => {
    setCreateForm((prev) => {
      if (field === "date") {
        const nextDate = value;
        const nextDefaultTitle = buildDefaultTitle(nextDate);
        const prevDefaultTitle = buildDefaultTitle(prev.date);
        const shouldSyncTitle =
          prev.title.trim() === "" || prev.title === prevDefaultTitle;
        return {
          ...prev,
          date: nextDate,
          title: shouldSyncTitle ? nextDefaultTitle : prev.title,
        };
      }
      if (field === "title") {
        return { ...prev, title: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleCreateSubmit = async (status: EditableStatus) => {
    if (!createForm.title.trim()) {
      setActionError("タイトルを入力してください。");
      return;
    }
    if (!staffId) {
      setActionError("スタッフ情報が取得できないため日報を作成できません。");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    const resolvedAuthor =
      (createForm.author || resolvedAuthorName).trim() || resolvedAuthorName;

    try {
      const response = (await graphqlClient.graphql({
        query: createDailyReport,
        variables: {
          input: {
            staffId,
            reportDate: createForm.date,
            title: createForm.title.trim(),
            content: createForm.content,
            status,
            updatedAt: new Date().toISOString(),
            reactions: [],
            comments: [],
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<CreateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          response.errors.map((error) => error.message).join("\n")
        );
      }

      const created = response.data?.createDailyReport;
      if (!created) {
        throw new Error("日報の作成に失敗しました。");
      }

      const mapped = mapDailyReport(created, resolvedAuthor);
      setReports((prev) =>
        sortReports([
          mapped,
          ...prev.filter((report) => report.id !== mapped.id),
        ])
      );
      setSelectedReportId(mapped.id);

      const resetDate = formatDateInput(new Date());
      setCreateForm(() => emptyForm(resetDate, resolvedAuthorName));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "日報の作成に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (report: DailyReportItem) => {
    setActionError(null);
    setEditingReportId(report.id);
    setEditDraft({
      date: report.date,
      author: report.author || resolvedAuthorName,
      title: report.title,
      content: report.content,
    });
  };

  const handleEditChange: DailyReportFormChangeHandler = (field, value) => {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveEdit = async (status: EditableStatus) => {
    if (!editingReportId || !editDraft) return;
    if (!editDraft.title.trim()) {
      setActionError("タイトルを入力してください。");
      return;
    }

    setIsUpdating(true);
    setActionError(null);

    try {
      const response = (await graphqlClient.graphql({
        query: updateDailyReport,
        variables: {
          input: {
            id: editingReportId,
            reportDate: editDraft.date,
            title: editDraft.title.trim(),
            content: editDraft.content,
            status,
            updatedAt: new Date().toISOString(),
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
        throw new Error("日報の更新に失敗しました。");
      }

      const mapped = mapDailyReport(updated, resolvedAuthorName);
      setReports((prev) =>
        sortReports(
          prev.map((report) => (report.id === mapped.id ? mapped : report))
        )
      );
      setEditingReportId(null);
      setEditDraft(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "日報の更新に失敗しました。"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditDraft(null);
    setActionError(null);
  };

  return (
    <Page title="日報" maxWidth="xl">
      <PageSection layoutVariant="dashboard">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" component="h1">
              日報
            </Typography>
          </Box>

          {requestError && (
            <Alert severity="error" onClose={() => setRequestError(null)}>
              {requestError}
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
                <Stack spacing={3}>
                  {actionError && (
                    <Alert
                      severity="error"
                      onClose={() => setActionError(null)}
                    >
                      {actionError}
                    </Alert>
                  )}
                  {showInitialLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="text" width="40%" height={32} />
                      <Skeleton variant="text" width="60%" height={48} />
                      <Skeleton variant="rectangular" height={160} />
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                      >
                        <Skeleton variant="rounded" width={120} height={36} />
                        <Skeleton variant="rounded" width={140} height={36} />
                        <Skeleton variant="rounded" width={140} height={36} />
                      </Stack>
                    </Stack>
                  ) : isCreateMode ? (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          新しい日報を登録
                        </Typography>
                        <Typography variant="h5">日報作成フォーム</Typography>
                      </Box>
                      <Divider />
                      <Box
                        component="form"
                        onSubmit={(event) => event.preventDefault()}
                      >
                        <Stack spacing={3}>
                          <DailyReportFormFields
                            form={createForm}
                            onChange={handleCreateChange}
                            resolvedAuthorName={resolvedAuthorName}
                          />
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="flex-end"
                            spacing={2}
                          >
                            <Button
                              type="button"
                              variant="text"
                              onClick={() => {
                                setActionError(null);
                                setCreateForm(() =>
                                  emptyForm(undefined, resolvedAuthorName)
                                );
                              }}
                            >
                              クリア
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              disabled={!canSubmit || isSubmitting}
                              onClick={() => {
                                void handleCreateSubmit(
                                  DailyReportStatus.DRAFT
                                );
                              }}
                            >
                              下書き保存
                            </Button>
                            <Button
                              type="button"
                              variant="contained"
                              disabled={!canSubmit || isSubmitting}
                              onClick={() => {
                                void handleCreateSubmit(
                                  DailyReportStatus.SUBMITTED
                                );
                              }}
                            >
                              提出する
                            </Button>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  ) : selectedReportId ? (
                    (() => {
                      const report = selectedReport;
                      if (!report) {
                        return (
                          <Typography color="text.secondary">
                            選択中の日報が見つかりません。
                          </Typography>
                        );
                      }
                      const statusMeta = STATUS_META[report.status];
                      const isEditing =
                        editingReportId === report.id && Boolean(editDraft);
                      const hasReactions = report.reactions.length > 0;
                      const hasComments = report.comments.length > 0;

                      return (
                        <Stack spacing={2}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                {formatDateSlash(report.date) || report.date} |{" "}
                                {report.author}
                              </Typography>
                              <Typography variant="h5">
                                {report.title}
                              </Typography>
                              {report.updatedAt && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  最終更新:{" "}
                                  {formatDateTimeReadable(report.updatedAt) ||
                                    "-"}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={statusMeta.label}
                              color={statusMeta.color}
                              sx={{
                                alignSelf: { xs: "flex-start", md: "center" },
                              }}
                            />
                          </Stack>

                          <Divider />

                          {isEditing && editDraft ? (
                            <Stack spacing={2}>
                              <DailyReportFormFields
                                form={editDraft}
                                onChange={handleEditChange}
                                resolvedAuthorName={resolvedAuthorName}
                              />
                            </Stack>
                          ) : (
                            <Typography
                              component="pre"
                              sx={{
                                whiteSpace: "pre-wrap",
                                fontFamily: "inherit",
                              }}
                            >
                              {report.content ||
                                "内容はまだ入力されていません。"}
                            </Typography>
                          )}

                          {hasReactions && (
                            <>
                              <Divider />
                              <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                  管理者からのリアクション
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  sx={{ mb: 2 }}
                                >
                                  {report.reactions.map((reaction) => {
                                    const meta = REACTION_META[reaction.type];
                                    if (!meta) return null;
                                    return (
                                      <Chip
                                        key={reaction.type}
                                        variant="outlined"
                                        size="small"
                                        label={`${meta.emoji} ${meta.label} ×${reaction.count}`}
                                      />
                                    );
                                  })}
                                </Stack>
                              </Box>
                            </>
                          )}

                          {hasComments && (
                            <>
                              <Divider />
                              <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                  管理者からのコメント
                                </Typography>
                                <Stack spacing={1}>
                                  {report.comments.map((comment) => (
                                    <Paper
                                      key={comment.id}
                                      variant="outlined"
                                      sx={{ p: 1.5 }}
                                    >
                                      <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                      >
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                        >
                                          {comment.author}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {formatDateTimeReadable(
                                            comment.createdAt
                                          ) || comment.createdAt}
                                        </Typography>
                                      </Stack>
                                      <Typography sx={{ mt: 0.5 }}>
                                        {comment.body}
                                      </Typography>
                                    </Paper>
                                  ))}
                                </Stack>
                              </Box>
                            </>
                          )}
                        </Stack>
                      );
                    })()
                  ) : (
                    <Typography color="text.secondary">
                      左側のリストから日報を選択してください。
                    </Typography>
                  )}

                  {!isCreateMode && selectedReportId && (
                    <Stack spacing={2}>
                      <Divider />
                      {editingReportId && editDraft ? (
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ xs: "stretch", sm: "center" }}
                        >
                          <Button
                            variant="outlined"
                            disabled={
                              !canEditSubmit ||
                              isUpdating ||
                              isSelectedReportSubmitted
                            }
                            onClick={() => {
                              void handleSaveEdit(DailyReportStatus.DRAFT);
                            }}
                          >
                            下書き保存
                          </Button>
                          <Button
                            variant="contained"
                            disabled={!canEditSubmit || isUpdating}
                            onClick={() => {
                              void handleSaveEdit(DailyReportStatus.SUBMITTED);
                            }}
                          >
                            提出する
                          </Button>
                          <Button variant="text" onClick={handleCancelEdit}>
                            キャンセル
                          </Button>
                        </Stack>
                      ) : (
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Button
                            variant="outlined"
                            disabled={isUpdating}
                            onClick={() => {
                              if (selectedReport) {
                                handleStartEdit(selectedReport);
                              }
                            }}
                          >
                            編集
                          </Button>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </PageSection>
    </Page>
  );
}
