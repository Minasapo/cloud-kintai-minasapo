import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import {
  DailyReportCalendar,
  DailyReportFormChangeHandler,
  DailyReportFormData,
  DailyReportFormFields,
} from "@features/attendance/daily-report";
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
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { sendDailyReportSubmissionNotification } from "@/features/attendance/daily-report/lib/sendDailyReportSubmissionNotification";
import useCognitoUser from "@/hooks/useCognitoUser";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getGraphQLErrorMessage,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";
import { formatDateSlash, formatDateTimeReadable } from "@/shared/lib/time";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

/**
 * 定数定義
 */
// 自動保存の遅延時間（ミリ秒）
const AUTO_SAVE_DELAY = 1000;
// 保存時刻の表示フォーマット
const TIME_FORMAT = "HH:mm:ss";
// 日付のフォーマット（YYYY-MM-DD）
const DATE_FORMAT = "YYYY-MM-DD";

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
  version?: number | null;
  createdAt?: string | null;
  reactions: ReportReaction[];
  comments: AdminComment[];
}

type DailyReportForm = DailyReportFormData;

const STATUS_META: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "下書き",
    className: "border border-slate-300 bg-slate-100 text-slate-700",
  },
  SUBMITTED: {
    label: "提出済",
    className: "border border-sky-200 bg-sky-100 text-sky-800",
  },
  APPROVED: {
    label: "確認済",
    className: "border border-emerald-200 bg-emerald-100 text-emerald-800",
  },
};

const REACTION_META: Record<ReactionType, { label: string; emoji: string }> = {
  CHEER: { label: "GOOD", emoji: "👍" },
  CHECK: { label: "確認済", emoji: "✅" },
  THANKS: { label: "感謝", emoji: "🙌" },
  LOOK: { label: "見ました", emoji: "👀" },
};

/**
 * ヘルパー関数
 */

/** DateオブジェクトをYYYY-MM-DD形式の文字列に変換 */
const formatDateInput = (value: Date) => value.toISOString().slice(0, 10);

/** 日付から日報のデフォルトタイトルを生成 */
const buildDefaultTitle = (date: string) => (date ? `${date}の日報` : "日報");

/** 空の日報フォームを作成 */
const emptyForm = (
  initialDate?: string,
  initialAuthor?: string,
): DailyReportForm => {
  const date = initialDate ?? formatDateInput(new Date());
  return {
    date,
    author: initialAuthor ?? "",
    title: buildDefaultTitle(date),
    content: "",
  };
};

/** リアクション配列を集計してタイプごとのカウントに変換 */
const aggregateReactions = (
  entries?: (DailyReportReaction | null)[] | null,
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

/** コメント配列を整形し、作成日時の降順でソート */
const mapComments = (
  entries?: (DailyReportComment | null)[] | null,
): AdminComment[] => {
  if (!entries?.length) return [];
  return entries
    .filter((entry): entry is DailyReportComment => Boolean(entry))
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((entry) => ({
      id: entry.id,
      author: entry.authorName || "管理者",
      body: entry.body,
      createdAt: entry.createdAt,
    }));
};

/** GraphQLレスポンスの日報データを内部形式に変換 */
const mapDailyReport = (
  record: DailyReportModel,
  authorFallback: string,
): DailyReportItem => ({
  id: record.id,
  staffId: record.staffId,
  date: record.reportDate,
  author: authorFallback,
  title: record.title,
  content: record.content ?? "",
  status: record.status,
  updatedAt: record.updatedAt ?? record.createdAt ?? null,
  version: record.version,
  createdAt: record.createdAt ?? null,
  reactions: aggregateReactions(record.reactions),
  comments: mapComments(record.comments),
});

/** 日報を日付の降順、同日の場合は更新日時の降順でソート */
const sortReports = (items: DailyReportItem[]) =>
  items.toSorted((a, b) => {
    if (a.date === b.date) {
      const aTime = a.updatedAt ?? "";
      const bTime = b.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    }
    return b.date.localeCompare(a.date);
  });

type AlertTone = "error" | "warning";
type ButtonTone = "primary" | "secondary" | "ghost";

function VStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-col ${className}`.trim()}>{children}</div>;
}

function AlertBox({
  children,
  tone,
  onClose,
  className = "",
}: {
  children: ReactNode;
  tone: AlertTone;
  onClose?: () => void;
  className?: string;
}) {
  const toneClassName =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-950"
      : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm leading-6 ${toneClassName} ${className}`.trim()}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="shrink-0 appearance-none rounded-md border-0 px-2 py-1 text-xs font-medium transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          閉じる
        </button>
      )}
    </div>
  );
}

function DividerLine() {
  return <div className="h-px w-full bg-slate-200" />;
}

function StatusChip({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`.trim()}
    >
      {label}
    </span>
  );
}

function ActionButton({
  children,
  tone,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone: ButtonTone;
}) {
  const toneClassName =
    tone === "primary"
      ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300"
      : tone === "secondary"
        ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
        : "bg-transparent text-slate-700 hover:bg-slate-100 disabled:text-slate-400";

  return (
    <button
      type="button"
      className={`inline-flex w-full appearance-none items-center justify-center rounded-md border-0 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed sm:w-auto ${toneClassName} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

function CommentCard({ children }: { children: ReactNode }) {
  return <div className="rounded-lg border border-slate-200 p-4">{children}</div>;
}

export default function DailyReport() {
  const { notify } = useLocalNotification();
  const { cognitoUser, loading: isCognitoUserLoading } = useCognitoUser();
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<DailyReportItem[]>([]);
  const [createForm, setCreateForm] = useState<DailyReportForm>(() =>
    emptyForm(),
  );
  const [calendarDate, setCalendarDate] = useState<Dayjs>(() =>
    dayjs().startOf("day"),
  );
  const [isInitializedFromUrl, setIsInitializedFromUrl] = useState(false);
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [createFormLastSavedAt, setCreateFormLastSavedAt] = useState<
    string | null
  >(null);
  const [editDraftLastSavedAt, setEditDraftLastSavedAt] = useState<
    string | null
  >(null);
  const createFormAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editDraftAutoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [createFormSavedState, setCreateFormSavedState] =
    useState<DailyReportForm>(() => emptyForm());
  const [editDraftSavedState, setEditDraftSavedState] =
    useState<DailyReportForm | null>(null);
  const createdReportIdRef = useRef<string | null>(null);
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
  const notifyAdminsForSubmission = useCallback(
    async (report: DailyReportModel) => {
      try {
        await sendDailyReportSubmissionNotification({
          staffs,
          report,
          fallbackAuthorName: resolvedAuthorName,
        });
      } catch (mailError) {
        console.error(
          "Failed to send daily report submission notification:",
          mailError,
        );
        void notify("メール送信エラー", {
          body: "管理者への通知メールの送信に失敗しました。",
          mode: "await-interaction",
          priority: "normal",
          tag: "daily-report-mail-error",
        });
      }
    },
    [notify, resolvedAuthorName, staffs],
  );
  const isCreateFormDirty = useMemo(
    () => JSON.stringify(createForm) !== JSON.stringify(createFormSavedState),
    [createForm, createFormSavedState],
  );
  const isEditDraftDirty = useMemo(
    () =>
      editDraft &&
      JSON.stringify(editDraft) !== JSON.stringify(editDraftSavedState),
    [editDraft, editDraftSavedState],
  );
  const canSubmit = Boolean(staffId && createForm.title.trim());
  const canEditSubmit = Boolean(editDraft && editDraft.title.trim());
  const selectedReport =
    selectedReportId && selectedReportId !== "create"
      ? (reports.find((report) => report.id === selectedReportId) ?? null)
      : null;
  const showInitialLoading = isInitialViewPending;
  const isSelectedReportSubmitted =
    selectedReport?.status === DailyReportStatus.SUBMITTED;

  /**
   * URLパラメータから日付を初期化（マウント時のみ実行）
   * URLに日付がある場合はその日付を、ない場合は当日を表示する
   */
  useEffect(() => {
    if (isInitializedFromUrl) return;

    const dateParam = searchParams.get("date");
    let targetDate = dayjs().startOf("day");

    // URLパラメータから日付を取得
    if (dateParam) {
      const parsed = dayjs(dateParam, DATE_FORMAT);
      if (parsed.isValid()) {
        targetDate = parsed.startOf("day");
      }
    }

    // カレンダー日付と作成フォームを初期化
    setCalendarDate(targetDate);
    const dateKey = targetDate.format(DATE_FORMAT);
    setCreateForm((prev) =>
      emptyForm(dateKey, prev.author || resolvedAuthorName),
    );

    // URLパラメータがない、または無効な場合は当日をURLに設定
    if (!dateParam || !dayjs(dateParam, DATE_FORMAT).isValid()) {
      setSearchParams({ date: dateKey }, { replace: true });
    }

    setIsInitializedFromUrl(true);
  }, []);

  useEffect(() => {
    const nextDateString = selectedReport ? selectedReport.date : null;

    if (!nextDateString) return;

    // URLパラメータがある場合はcalendarDateを更新しない
    const dateParam = searchParams.get("date");
    if (dateParam) {
      return;
    }

    setCalendarDate((current) => {
      const nextDate = dayjs(nextDateString).startOf("day");
      return current.isSame(nextDate, "day") ? current : nextDate;
    });
  }, [selectedReport, searchParams]);

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
          staff?.givenName ?? null,
        );
        const fallback = buildName(
          currentUser.familyName ?? null,
          currentUser.givenName ?? null,
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
          currentUser.givenName ?? null,
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
        : { ...prev, author: resolvedAuthorName },
    );
    setReports((prev) =>
      prev.map((report) => ({ ...report, author: resolvedAuthorName })),
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
            response.errors.map((error) => error.message).join("\n"),
          );
        }

        const items =
          response.data?.dailyReportsByStaffId?.items?.filter(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? [];

        items.forEach((item) => {
          aggregated.push(mapDailyReport(item, resolvedAuthorName));
        });

        nextToken = response.data?.dailyReportsByStaffId?.nextToken;
      } while (nextToken);

      setReports(sortReports(aggregated));
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。",
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
    // selectedReportIdが明示的に"create"の場合は作成フォームを保持
    // 自動保存によってreportForCalendarDateが作成されても遷移しない
    if (selectedReportId === "create") {
      return;
    }

    if (reports.length === 0) {
      // 日報が一つもない場合は何も表示しない
      setSelectedReportId(null);
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

    // 初回ロード時や日付変更時：データがある場合のみ詳細画面を表示
    if (!selectedReportId && reportForCalendarDate) {
      setSelectedReportId(reportForCalendarDate.id);
    }
  }, [calendarDate, reports, reportsByDate, selectedReportId, isAutoSaving]);

  useEffect(() => {
    setEditingReportId(null);
    setEditDraft(null);
    setEditDraftSavedState(null);
    setEditDraftLastSavedAt(null);
    setActionError(null);
  }, [selectedReportId]);

  /**
   * カレンダーで日付を変更したときの処理
   * - 選択した日付をURLパラメータに反映
   * - 日報がある場合は詳細表示、ない場合は作成ボタンを表示
   * - フォーム内容と自動保存状態をリセット
   */
  const handleCalendarChange = (value: Dayjs | null) => {
    if (!value) return;
    const normalized = value.startOf("day");
    setCalendarDate(normalized);
    const dateKey = normalized.format(DATE_FORMAT);

    // URLに日付パラメータを反映
    setSearchParams({ date: dateKey });

    const reportForDate = reportsByDate.get(dateKey);
    if (reportForDate) {
      // 既存の日報がある場合は詳細表示
      setSelectedReportId(reportForDate.id);
      return;
    }

    // 日報がない場合は作成ボタン表示状態にリセット
    setSelectedReportId(null);
    setCreateFormLastSavedAt(null);
    setCreateForm(emptyForm(dateKey, resolvedAuthorName));
    createdReportIdRef.current = null;
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

  const handleCreateSubmit = async (
    status: EditableStatus,
    showNotification = true,
  ) => {
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
    // 自動保存の場合はフラグを設定
    if (!showNotification) {
      setIsAutoSaving(true);
    }
    const resolvedAuthor =
      (createForm.author || resolvedAuthorName).trim() || resolvedAuthorName;

    try {
      // 既に作成済みのレポートIDがある場合は更新、ない場合は新規作成
      if (createdReportIdRef.current) {
        // 更新処理
        const response = (await graphqlClient.graphql({
          query: updateDailyReport,
          variables: {
            input: {
              id: createdReportIdRef.current,
              reportDate: createForm.date,
              title: createForm.title.trim(),
              content: createForm.content,
              status,
              updatedAt: new Date().toISOString(),
              version: getNextVersion(
                reports.find(
                  (candidate) => candidate.id === createdReportIdRef.current,
                )?.version,
              ),
            },
            condition: buildVersionOrUpdatedAtCondition(
              reports.find(
                (candidate) => candidate.id === createdReportIdRef.current,
              )?.version,
              reports.find(
                (candidate) => candidate.id === createdReportIdRef.current,
              )?.updatedAt,
            ),
          },
          authMode: "userPool",
        })) as GraphQLResult<UpdateDailyReportMutation>;

        if (response.errors?.length) {
          throw new Error(
            getGraphQLErrorMessage(
              response.errors,
              "日報の更新に失敗しました。",
            ),
          );
        }

        const updated = response.data?.updateDailyReport;
        if (!updated) {
          throw new Error("日報の更新に失敗しました。");
        }

        if (showNotification && status === DailyReportStatus.SUBMITTED) {
          await notifyAdminsForSubmission(updated);
        }

        const mapped = mapDailyReport(updated, resolvedAuthor);
        setReports((prev) =>
          sortReports([
            mapped,
            ...prev.filter((report) => report.id !== mapped.id),
          ]),
        );

        // 保存時刻を記録
        setCreateFormLastSavedAt(dayjs().format(TIME_FORMAT));
        // 保存済み状態を更新
        setCreateFormSavedState(createForm);

        // 手動保存時のみ詳細画面に遷移
        if (showNotification) {
          setSelectedReportId(mapped.id);
          // 手動保存時：作成済みレポートIDをクリア
          createdReportIdRef.current = null;
        } else {
          // 自動保存時：selectedReportIdを"create"に固定して詳細画面への遷移を防ぐ
          setSelectedReportId("create");
        }

        // 手動保存時のみフォームをリセット
        if (showNotification) {
          const resetDate = formatDateInput(new Date());
          setCreateForm(() => emptyForm(resetDate, resolvedAuthorName));
        }
      } else {
        // 新規作成処理
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
            response.errors.map((error) => error.message).join("\n"),
          );
        }

        const created = response.data?.createDailyReport;
        if (!created) {
          throw new Error("日報の作成に失敗しました。");
        }

        if (showNotification && status === DailyReportStatus.SUBMITTED) {
          await notifyAdminsForSubmission(created);
        }

        const mapped = mapDailyReport(created, resolvedAuthor);
        setReports((prev) =>
          sortReports([
            mapped,
            ...prev.filter((report) => report.id !== mapped.id),
          ]),
        );

        // 作成されたレポートIDを保持（自動保存時のみ）
        if (!showNotification) {
          createdReportIdRef.current = created.id;
        }

        // 保存時刻を記録
        setCreateFormLastSavedAt(dayjs().format(TIME_FORMAT));
        // 保存済み状態を更新
        setCreateFormSavedState(createForm);

        // 手動保存時のみ詳細画面に遷移
        if (showNotification) {
          setSelectedReportId(mapped.id);
        } else {
          // 自動保存時：selectedReportIdを"create"に固定して詳細画面への遷移を防ぐ
          setSelectedReportId("create");
        }

        // 手動保存時のみフォームをリセット
        if (showNotification) {
          const resetDate = formatDateInput(new Date());
          setCreateForm(() => emptyForm(resetDate, resolvedAuthorName));
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "日報の作成に失敗しました。";
      setActionError(errorMessage);
    } finally {
      setIsSubmitting(false);
      // 自動保存フラグをリセット
      setIsAutoSaving(false);
    }
  };

  const handleStartEdit = (report: DailyReportItem) => {
    setActionError(null);
    setEditingReportId(report.id);
    const editDraftForm = {
      date: report.date,
      author: report.author || resolvedAuthorName,
      title: report.title,
      content: report.content,
    };
    setEditDraft(editDraftForm);
    setEditDraftSavedState(editDraftForm);
    setEditDraftLastSavedAt(null);
  };

  const handleEditChange: DailyReportFormChangeHandler = (field, value) => {
    setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveEdit = async (
    status: EditableStatus,
    showNotification = true,
  ) => {
    if (!editingReportId || !editDraft) return;
    if (!editDraft.title.trim()) {
      setActionError("タイトルを入力してください。");
      return;
    }

    setIsUpdating(true);
    setActionError(null);
    // 自動保存の場合はフラグを設定
    if (!showNotification) {
      setIsAutoSaving(true);
    }

    try {
      const response = (await graphqlClient.graphql({
        query: updateDailyReport,
        variables: {
          condition: buildVersionOrUpdatedAtCondition(
            reports.find((report) => report.id === editingReportId)?.version,
            reports.find((report) => report.id === editingReportId)?.updatedAt,
          ),
          input: {
            id: editingReportId,
            reportDate: editDraft.date,
            title: editDraft.title.trim(),
            content: editDraft.content,
            status,
            updatedAt: new Date().toISOString(),
            version: getNextVersion(
              reports.find((report) => report.id === editingReportId)?.version,
            ),
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          getGraphQLErrorMessage(response.errors, "日報の更新に失敗しました。"),
        );
      }

      const updated = response.data?.updateDailyReport;
      if (!updated) {
        throw new Error("日報の更新に失敗しました。");
      }

      if (showNotification && status === DailyReportStatus.SUBMITTED) {
        await notifyAdminsForSubmission(updated);
      }

      const mapped = mapDailyReport(updated, resolvedAuthorName);
      setReports((prev) =>
        sortReports(
          prev.map((report) => (report.id === mapped.id ? mapped : report)),
        ),
      );

      // 保存時刻を記録
      setEditDraftLastSavedAt(dayjs().format(TIME_FORMAT));
      // 保存済み状態を更新
      setEditDraftSavedState(editDraft);

      if (showNotification && status === DailyReportStatus.SUBMITTED) {
        setEditingReportId(null);
        setEditDraft(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "日報の更新に失敗しました。";
      setActionError(errorMessage);
    } finally {
      setIsUpdating(false);
      // 自動保存フラグをリセット
      setIsAutoSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingReportId(null);
    setEditDraft(null);
    setActionError(null);
  };

  /**
   * 作成フォーム用の自動保存
   * - 入力停止後AUTO_SAVE_DELAY（1秒）経過後に自動保存を実行
   * - デバウンス処理により、連続入力中は保存しない
   * - タイトルと内容の両方が入力されている場合のみ保存
   */
  useEffect(() => {
    // 既存のタイマーをクリア（デバウンス処理）
    if (createFormAutoSaveTimerRef.current) {
      clearTimeout(createFormAutoSaveTimerRef.current);
    }

    // 保存条件: 作成モード、内容が変更されている、タイトルと内容が両方とも空ではない
    if (
      isCreateMode &&
      isCreateFormDirty &&
      createForm.title.trim() !== "" &&
      createForm.content.trim() !== ""
    ) {
      createFormAutoSaveTimerRef.current = setTimeout(() => {
        void handleCreateSubmit(DailyReportStatus.DRAFT, false);
      }, AUTO_SAVE_DELAY);
    }

    // クリーンアップ: コンポーネントのアンマウント時やdependenciesの変更時
    return () => {
      if (createFormAutoSaveTimerRef.current) {
        clearTimeout(createFormAutoSaveTimerRef.current);
      }
    };
  }, [createForm, isCreateFormDirty, isCreateMode, handleCreateSubmit]);

  /**
   * 編集フォーム用の自動保存
   * デバウンス処理により、入力停止後AUTO_SAVE_DELAY(3秒)経過後に自動保存
   */
  useEffect(() => {
    // 既存のタイマーをクリア（デバウンス処理）
    if (editDraftAutoSaveTimerRef.current) {
      clearTimeout(editDraftAutoSaveTimerRef.current);
    }

    // 保存条件: 編集中、内容が変更されている、提出済みではない、タイトルが空ではない
    if (
      editingReportId &&
      editDraft &&
      isEditDraftDirty &&
      !isSelectedReportSubmitted &&
      editDraft.title.trim() !== ""
    ) {
      editDraftAutoSaveTimerRef.current = setTimeout(() => {
        void handleSaveEdit(DailyReportStatus.DRAFT, false);
      }, AUTO_SAVE_DELAY);
    }

    // クリーンアップ: コンポーネントのアンマウント時やdependenciesの変更時
    return () => {
      if (editDraftAutoSaveTimerRef.current) {
        clearTimeout(editDraftAutoSaveTimerRef.current);
      }
    };
  }, [
    editDraft,
    isEditDraftDirty,
    editingReportId,
    isSelectedReportSubmitted,
    handleSaveEdit,
  ]);

  return (
    <Page title="日報" maxWidth="xl" showDefaultHeader={false}>
      <PageSection layoutVariant="dashboard">
        <VStack className="gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">日報</h1>
          </div>

          {requestError && (
            <AlertBox tone="error" onClose={() => setRequestError(null)}>
              {requestError}
            </AlertBox>
          )}

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-6">
            <div>
              <DashboardInnerSurface>
                <DailyReportCalendar
                  value={calendarDate}
                  onChange={handleCalendarChange}
                  reportedDateSet={reportedDateSet}
                  isLoadingReports={isLoadingReports}
                  hasReports={reports.length > 0}
                />
              </DashboardInnerSurface>
            </div>

            <div>
              <DashboardInnerSurface>
                <VStack className="gap-6">
                  {actionError && (
                    <AlertBox tone="error" onClose={() => setActionError(null)}>
                      {actionError}
                    </AlertBox>
                  )}
                  {showInitialLoading ? (
                    <VStack className="gap-4">
                      <SkeletonBlock className="h-8 w-2/5" />
                      <SkeletonBlock className="h-12 w-3/5" />
                      <SkeletonBlock className="h-40 w-full" />
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <SkeletonBlock className="h-9 w-[120px]" />
                        <SkeletonBlock className="h-9 w-[140px]" />
                        <SkeletonBlock className="h-9 w-[140px]" />
                      </div>
                    </VStack>
                  ) : isCreateMode ? (
                    <VStack className="gap-6">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          新しい日報を登録
                        </p>
                        <h2 className="text-[1.2rem] font-semibold text-slate-900 sm:text-[1.5rem]">
                          日報作成フォーム
                        </h2>
                      </div>
                      <AlertBox tone="warning">
                        この日報はまだ提出されていません。下書き保存後、必ず「提出する」ボタンをクリックしてください。
                      </AlertBox>
                      <DividerLine />
                      <form onSubmit={(event) => event.preventDefault()}>
                        <VStack className="gap-8">
                          <DailyReportFormFields
                            form={createForm}
                            onChange={handleCreateChange}
                            resolvedAuthorName={resolvedAuthorName}
                          />
                          {createFormLastSavedAt && (
                            <p className="text-xs text-slate-500">
                              最終保存: {createFormLastSavedAt}
                            </p>
                          )}
                          <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                            <ActionButton
                              tone="ghost"
                              onClick={() => {
                                setActionError(null);
                                const newForm = emptyForm(
                                  undefined,
                                  resolvedAuthorName,
                                );
                                setCreateForm(() => newForm);
                                setCreateFormSavedState(newForm);
                                setCreateFormLastSavedAt(null);
                              }}
                            >
                              クリア
                            </ActionButton>
                            <ActionButton
                              tone="secondary"
                              disabled={!canSubmit || isSubmitting}
                              onClick={() => {
                                void handleCreateSubmit(
                                  DailyReportStatus.DRAFT,
                                  true,
                                );
                              }}
                            >
                              下書き保存
                            </ActionButton>
                            <ActionButton
                              tone="primary"
                              disabled={!canSubmit || isSubmitting}
                              onClick={() => {
                                void handleCreateSubmit(
                                  DailyReportStatus.SUBMITTED,
                                  true,
                                );
                              }}
                            >
                              提出する
                            </ActionButton>
                          </div>
                        </VStack>
                      </form>
                    </VStack>
                  ) : selectedReportId ? (
                      (() => {
                        const report = selectedReport;
                        if (!report) {
                          return (
                            <p className="text-slate-500">
                              選択中の日報が見つかりません。
                            </p>
                          );
                        }
                        const statusMeta = STATUS_META[report.status];
                        const isEditing =
                          editingReportId === report.id && Boolean(editDraft);
                        const hasReactions = report.reactions.length > 0;
                        const hasComments = report.comments.length > 0;

                        return (
                          <VStack className="gap-4">
                            <div className="flex flex-col justify-between gap-4 md:flex-row">
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  {formatDateSlash(report.date) || report.date}{" "}
                                  | {report.author}
                                </p>
                                <h2 className="break-words text-[1.2rem] font-semibold text-slate-900 sm:text-[1.5rem]">
                                  {report.title}
                                </h2>
                                {report.updatedAt && (
                                  <p className="text-sm text-slate-500">
                                    最終更新:{" "}
                                    {formatDateTimeReadable(report.updatedAt) ||
                                      "-"}
                                  </p>
                                )}
                              </div>
                              <StatusChip
                                label={statusMeta.label}
                                className={statusMeta.className}
                              />
                            </div>

                            <DividerLine />

                            {report.status === DailyReportStatus.DRAFT && (
                              <AlertBox tone="warning">
                                この日報はまだ提出されていません。内容を確認して「提出する」ボタンをクリックしてください。
                              </AlertBox>
                            )}

                            {isEditing && editDraft ? (
                              <VStack className="gap-4">
                                <DailyReportFormFields
                                  form={editDraft}
                                  onChange={handleEditChange}
                                  resolvedAuthorName={resolvedAuthorName}
                                />
                                {editDraftLastSavedAt && (
                                  <p className="text-xs text-slate-500">
                                    最終保存: {editDraftLastSavedAt}
                                  </p>
                                )}
                              </VStack>
                            ) : (
                              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-900">
                                {report.content ||
                                  "内容はまだ入力されていません。"}
                              </pre>
                            )}

                            {hasReactions && (
                              <>
                                <DividerLine />
                                <div>
                                  <p className="mb-1 text-sm font-semibold text-slate-900">
                                    管理者からのリアクション
                                  </p>
                                  <div className="mb-2 flex flex-wrap gap-2">
                                    {report.reactions.map((reaction) => {
                                      const meta = REACTION_META[reaction.type];
                                      if (!meta) return null;
                                      return (
                                        <StatusChip
                                          key={reaction.type}
                                          label={`${meta.emoji} ${meta.label} ×${reaction.count}`}
                                          className="border border-slate-300 bg-white text-slate-700"
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}

                            {hasComments && (
                              <>
                                <DividerLine />
                                <div>
                                  <p className="mb-2 text-sm font-semibold text-slate-900">
                                    管理者からのコメント
                                  </p>
                                  <VStack className="gap-3">
                                    {report.comments.map((comment) => (
                                      <CommentCard key={comment.id}>
                                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
                                          <p className="text-sm font-semibold text-slate-900">
                                            {comment.author}
                                          </p>
                                          <p className="text-xs text-slate-500">
                                            {formatDateTimeReadable(
                                              comment.createdAt,
                                            ) || comment.createdAt}
                                          </p>
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-slate-800">
                                          {comment.body}
                                        </p>
                                      </CommentCard>
                                    ))}
                                  </VStack>
                                </div>
                              </>
                            )}
                          </VStack>
                        );
                      })()
                    ) : (
                      <VStack className="items-center gap-6 py-4">
                        <p className="text-center text-slate-500">
                          {calendarDate.format("YYYY年MM月DD日")}
                          の日報はまだ登録されていません。
                        </p>
                        <ActionButton
                          tone="primary"
                          onClick={() => {
                            setSelectedReportId("create");
                            setCreateForm(
                              emptyForm(
                                calendarDate.format("YYYY-MM-DD"),
                                resolvedAuthorName,
                              ),
                            );
                            // 新規作成ボタンを押したときは作成済みレポートIDをクリア
                            createdReportIdRef.current = null;
                          }}
                        >
                          この日の日報を作成する
                        </ActionButton>
                      </VStack>
                    )}

                    {!isCreateMode && selectedReportId && (
                      <VStack className="gap-4">
                        <DividerLine />
                        {editingReportId && editDraft ? (
                          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                            <ActionButton
                              tone="secondary"
                              disabled={!canEditSubmit || isUpdating}
                              onClick={() => {
                                void handleSaveEdit(
                                  DailyReportStatus.DRAFT,
                                  true,
                                );
                              }}
                            >
                              下書き保存
                            </ActionButton>
                            <ActionButton
                              tone="primary"
                              disabled={
                                !canEditSubmit ||
                                isUpdating ||
                                isSelectedReportSubmitted
                              }
                              onClick={() => {
                                void handleSaveEdit(
                                  DailyReportStatus.SUBMITTED,
                                  true,
                                );
                              }}
                            >
                              提出する
                            </ActionButton>
                            <ActionButton tone="ghost" onClick={handleCancelEdit}>
                              キャンセル
                            </ActionButton>
                          </div>
                        ) : (
                          <div className="flex justify-stretch sm:justify-end">
                            <ActionButton
                              tone="secondary"
                              disabled={isUpdating}
                              onClick={() => {
                                if (selectedReport) {
                                  handleStartEdit(selectedReport);
                                }
                              }}
                            >
                              編集
                            </ActionButton>
                          </div>
                        )}
                      </VStack>
                    )}
                </VStack>
              </DashboardInnerSurface>
            </div>
          </div>
        </VStack>
      </PageSection>
    </Page>
  );
}
