import { GraphQLResult } from "@aws-amplify/api";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { API } from "aws-amplify";
import { useCallback, useEffect, useState } from "react";

import type {
  CreateDailyReportMutation,
  DailyReport as DailyReportModel,
  DailyReportComment,
  DailyReportReaction,
  DailyReportReactionType,
  DailyReportsByStaffIdQuery,
  UpdateDailyReportMutation,
} from "@/API";
import { DailyReportStatus, ModelSortDirection } from "@/API";
import { createDailyReport, updateDailyReport } from "@/graphql/mutations";
import { dailyReportsByStaffId } from "@/graphql/queries";
import useCognitoUser from "@/hooks/useCognitoUser";
import fetchStaff from "@/hooks/useStaff/fetchStaff";

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

interface DailyReportForm {
  date: string;
  author: string;
  title: string;
  content: string;
}

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
  const { cognitoUser } = useCognitoUser();
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [createForm, setCreateForm] = useState<DailyReportForm>(() =>
    emptyForm()
  );
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DailyReportForm | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<
    string | "create" | null
  >(null);
  const [authorName, setAuthorName] = useState<string>("");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isCreateMode = selectedReportId === "create";
  const resolvedAuthorName = authorName || "スタッフ";
  const canSubmit = Boolean(staffId && createForm.title.trim());
  const canEditSubmit = Boolean(editDraft && editDraft.title.trim());

  useEffect(() => {
    if (!cognitoUser?.id) {
      setAuthorName("スタッフ");
      setStaffId(null);
      return;
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
      } catch {
        if (!mounted) return;
        const fallback = buildName(
          currentUser.familyName ?? null,
          currentUser.givenName ?? null
        );
        setAuthorName(fallback || "スタッフ");
        setStaffId(null);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [cognitoUser]);

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
      return;
    }

    setIsLoadingReports(true);
    setRequestError(null);
    try {
      const aggregated: DailyReportItem[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        const response = (await API.graphql({
          query: dailyReportsByStaffId,
          variables: {
            staffId,
            sortDirection: ModelSortDirection.DESC,
            limit: 50,
            nextToken,
          },
          authMode: "AMAZON_COGNITO_USER_POOLS",
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

    if (!selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  useEffect(() => {
    setEditingReportId(null);
    setEditDraft(null);
    setActionError(null);
  }, [selectedReportId]);

  const handleCreateChange = (field: keyof DailyReportForm, value: string) => {
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
      const response = (await API.graphql({
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
        authMode: "AMAZON_COGNITO_USER_POOLS",
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

  const handleEditChange = (field: keyof DailyReportForm, value: string) => {
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
      const response = (await API.graphql({
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
        authMode: "AMAZON_COGNITO_USER_POOLS",
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

  const renderFormFields = (
    form: DailyReportForm,
    onChange: (field: keyof DailyReportForm, value: string) => void
  ) => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="日付"
            type="date"
            value={form.date}
            onChange={(event) => onChange("date", event.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="担当者"
            value={form.author || resolvedAuthorName}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
      </Grid>
      <TextField
        label="タイトル"
        value={form.title}
        onChange={(event) => onChange("title", event.target.value)}
        fullWidth
      />
      <TextField
        label="内容"
        value={form.content}
        onChange={(event) => onChange("content", event.target.value)}
        multiline
        minRows={6}
        fullWidth
        placeholder={"例) サマリ/実施タスク/課題などをまとめて記入"}
      />
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            日報
          </Typography>
          <Typography color="text.secondary">
            簡易モックです。画面遷移なしで作成・編集・コメントまで確認できます。
          </Typography>
        </Box>

        {requestError && (
          <Alert severity="error" onClose={() => setRequestError(null)}>
            {requestError}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ height: "100%" }}>
              <List disablePadding>
                <ListItemButton
                  selected={selectedReportId === "create"}
                  onClick={() => setSelectedReportId("create")}
                  alignItems="flex-start"
                  sx={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemText
                    primary="＋ 日報を作成"
                    secondary="クリックして作成フォームを開く"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItemButton>
                {reports.map((report) => {
                  const statusMeta = STATUS_META[report.status];
                  return (
                    <ListItemButton
                      key={report.id}
                      selected={selectedReportId === report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      alignItems="flex-start"
                      sx={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ width: 1 }}
                      >
                        <ListItemText
                          primary={report.title}
                          secondary={report.date}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                        <Chip
                          size="small"
                          label={statusMeta.label}
                          color={statusMeta.color}
                        />
                      </Stack>
                    </ListItemButton>
                  );
                })}
              </List>
              {isLoadingReports && (
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography color="text.secondary" variant="body2">
                    日報を読み込み中です…
                  </Typography>
                </Box>
              )}
              {!isLoadingReports && reports.length === 0 && (
                <Box sx={{ px: 3, pb: 3 }}>
                  <Typography color="text.secondary" variant="body2">
                    まだ日報がありません。新規作成から登録してください。
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              <Card variant="outlined">
                <CardContent>
                  {actionError && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2 }}
                      onClose={() => setActionError(null)}
                    >
                      {actionError}
                    </Alert>
                  )}
                  {isCreateMode ? (
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
                          {renderFormFields(createForm, handleCreateChange)}
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
                      const report = reports.find(
                        (r) => r.id === selectedReportId
                      );
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
                                {report.date} | {report.author}
                              </Typography>
                              <Typography variant="h5">
                                {report.title}
                              </Typography>
                              {report.updatedAt && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  最終更新: {report.updatedAt.replace("T", " ")}
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
                              {renderFormFields(editDraft, handleEditChange)}
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
                                          {new Date(
                                            comment.createdAt
                                          ).toLocaleString()}
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
                </CardContent>
                {!isCreateMode && selectedReportId && (
                  <CardActions sx={{ px: 3, pb: 3 }}>
                    {editingReportId && editDraft ? (
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Button
                          variant="outlined"
                          disabled={!canEditSubmit || isUpdating}
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
                      <Button
                        variant="outlined"
                        disabled={isUpdating}
                        onClick={() => {
                          const report = reports.find(
                            (r) => r.id === selectedReportId
                          );
                          if (report) handleStartEdit(report);
                        }}
                      >
                        編集
                      </Button>
                    )}
                  </CardActions>
                )}
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
