import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { DailyReportCalendar } from "@features/attendance/daily-report";
import { sendDailyReportCommentNotification } from "@features/attendance/daily-report/lib/sendDailyReportCommentNotification";
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
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import useCognitoUser from "@/hooks/useCognitoUser";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";
import {
  buildVersionOrUpdatedAtCondition,
  getGraphQLErrorMessage,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";
import { formatDateSlash, formatDateTimeReadable } from "@/shared/lib/time";
import { DashboardInnerSurface } from "@/shared/ui/layout";

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

const DATE_FORMAT = "YYYY-MM-DD";

const STATUS_BADGE_CLASS: Record<"default" | "info" | "success", string> = {
  default:
    "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600",
  info: "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700",
  success:
    "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
};

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
  items.toSorted((a, b) => {
    if (a.date === b.date) {
      const aTime = a.updatedAt ?? "";
      const bTime = b.updatedAt ?? "";
      return bTime.localeCompare(aTime);
    }
    return b.date.localeCompare(a.date);
  });

export default function AdminDailyReportDetail() {
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const stateReportId = state?.report?.id ?? null;
  const { staffs, loading: isStaffLoading } = useStaffs({ isAuthenticated });
  const { cognitoUser } = useCognitoUser();
  const [, setSearchParams] = useSearchParams();

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
        throw new Error(
          response.errors.map((err) => err.message).join("\n"),
        );
      }

      const record = response.data?.getDailyReport;
      if (!record) throw new Error("日報が見つかりませんでした。");

      setReactionEntries(normalizeReactions(record.reactions));
      setCommentEntries(normalizeComments(record.comments));
      setReport(mapDailyReport(record, buildStaffName(record.staffId)));

      if (!staffIdForReports) setStaffIdForReports(record.staffId);
      const reportDate = dayjs(record.reportDate, DATE_FORMAT);
      if (reportDate.isValid()) setCalendarDate(reportDate.startOf("day"));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "日報の取得に失敗しました。",
      );
      if (!stateReportId) setReport(null);
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
        if (mounted) setIsResolvingCurrentStaff(false);
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
      const reportForDate = reportsByDate.get(dateKey);
      if (reportForDate) {
        navigate(`/admin/daily-report/${reportForDate.id}?date=${dateKey}`, {
          replace: true,
        });
      } else {
        setSearchParams({ date: dateKey }, { replace: true });
      }
    },
    [navigate, reportsByDate, staffIdForReports, setSearchParams],
  );

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
          condition: buildVersionOrUpdatedAtCondition(
            report.version,
            report.updatedAt,
          ),
          input: {
            id: report.id,
            reactions: nextEntries.map(({ staffId, type, createdAt }) => ({
              staffId,
              type,
              createdAt,
            })),
            updatedAt: timestamp,
            version: getNextVersion(report.version),
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          getGraphQLErrorMessage(
            response.errors,
            "リアクションの更新に失敗しました。",
          ),
        );
      }

      const updated = response.data?.updateDailyReport;
      if (!updated) throw new Error("リアクションの更新に失敗しました。");

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
          condition: buildVersionOrUpdatedAtCondition(
            report.version,
            report.updatedAt,
          ),
          input: {
            id: report.id,
            comments: nextComments.map(
              ({ id: commentId, staffId, authorName, body: commentBody, createdAt }) => ({
                id: commentId,
                staffId,
                authorName,
                body: commentBody,
                createdAt,
              }),
            ),
            updatedAt: timestamp,
            version: getNextVersion(report.version),
          },
        },
        authMode: "userPool",
      })) as GraphQLResult<UpdateDailyReportMutation>;

      if (response.errors?.length) {
        throw new Error(
          getGraphQLErrorMessage(
            response.errors,
            "コメントの更新に失敗しました。",
          ),
        );
      }

      const updated = response.data?.updateDailyReport;
      if (!updated) throw new Error("コメントの更新に失敗しました。");

      try {
        await sendDailyReportCommentNotification({
          staffs,
          report: updated,
          commentAuthorName: currentStaffName,
          commentBody: body,
        });
      } catch (mailError) {
        console.error(
          "Failed to send daily report comment notification:",
          mailError,
        );
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
    <div className="mx-auto w-full max-w-[1280px] px-2 pb-6 pt-4 sm:px-4 md:px-6">
      <div className="space-y-3">
        {/* Header */}
        <section className="rounded-[18px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-5 py-4">
          <h1 className="text-xl font-extrabold tracking-[0.01em] text-emerald-950">
            日報詳細
          </h1>
        </section>

        {/* Errors */}
        {loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {actionError && (
          <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="ml-3 shrink-0 text-red-400 hover:text-red-600"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr] md:items-start">
          {/* Calendar */}
          <DashboardInnerSurface>
            <DailyReportCalendar
              value={calendarDate}
              onChange={handleCalendarChange}
              reportedDateSet={reportedDateSet}
              isLoadingReports={isLoadingReports}
              hasReports={reports.length > 0}
            />
          </DashboardInnerSurface>

          {/* Detail panel */}
          <DashboardInnerSurface>
            {shouldShowLoading ? (
              <p className="py-8 text-center text-sm text-slate-400">
                読み込み中...
              </p>
            ) : !report ? (
              <div className="space-y-3 py-4">
                <p className="font-semibold text-slate-700">
                  日報が見つかりません
                </p>
                <p className="text-sm text-slate-500">
                  URLが正しいか、一覧から改めて選択してください。
                </p>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  戻る
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Report header */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {report.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {formatDateSlash(report.date) || report.date} |{" "}
                      {report.author}
                    </span>
                    <span
                      className={
                        STATUS_BADGE_CLASS[STATUS_META[report.status].color]
                      }
                    >
                      {STATUS_META[report.status].label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    最終更新:{" "}
                    {formatDateTimeReadable(report.updatedAt) || "-"}
                  </p>
                </div>

                {/* Content */}
                <pre className="whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-slate-700">
                  {report.content || "内容は登録されていません"}
                </pre>

                <hr className="border-slate-100" />

                {/* Reactions */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    リアクション
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(REACTION_META) as ReactionType[]).map(
                      (type) => {
                        const meta = REACTION_META[type];
                        const count =
                          reactions.find((r) => r.type === type)?.count ?? 0;
                        const isSelected = selectedReactions.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            disabled={chipsDisabled}
                            onClick={() => {
                              void handleToggleReaction(type);
                            }}
                            className={[
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition",
                              isSelected
                                ? "border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                              chipsDisabled
                                ? "cursor-not-allowed opacity-50"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {meta.emoji} {meta.label}
                            {count > 0 && (
                              <span className="ml-1 text-slate-400">
                                ({count})
                              </span>
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                  {(!reactionEntries || isResolvingCurrentStaff) && (
                    <p className="text-xs text-slate-400">
                      スタッフ情報およびリアクション履歴の取得完了後に操作できます。
                    </p>
                  )}
                  {reactions.length === 0 && (
                    <p className="text-xs text-slate-400">
                      まだリアクションはありません。
                    </p>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Comments */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    コメント
                  </p>
                  <div className="space-y-2">
                    <textarea
                      value={commentInput}
                      onChange={(e) => {
                        if (actionError) setActionError(null);
                        setCommentInput(e.target.value);
                      }}
                      placeholder="コメントを入力"
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          void handleSubmitComment();
                        }}
                        disabled={isCommentDisabled}
                        className="inline-flex h-8 items-center rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        コメントを追加
                      </button>
                    </div>
                    {(!commentEntries || isResolvingCurrentStaff) && (
                      <p className="text-xs text-slate-400">
                        スタッフ情報およびコメント履歴の取得完了後に登録できます。
                      </p>
                    )}
                  </div>

                  {comments.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      まだコメントはありません。
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700">
                              {comment.author}
                            </span>
                            <span className="shrink-0 text-xs text-slate-400">
                              {formatDateTimeReadable(comment.createdAt) ||
                                comment.createdAt}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {comment.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/daily-report")}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    一覧に戻る
                  </button>
                </div>
              </div>
            )}
          </DashboardInnerSurface>
        </div>
      </div>
    </div>
  );
}
