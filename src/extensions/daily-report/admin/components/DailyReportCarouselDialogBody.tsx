import { formatDateSlash, formatDateTimeReadable } from "@shared/lib/time";
import { SubsectionTitle } from "@shared/ui/typography";

import {
  type AdminComment,
  type AdminDailyReport,
  REACTION_META,
  type ReactionType,
  type ReportReaction,
  STATUS_META,
} from "../data";

const STATUS_BADGE_CLASS: Record<"default" | "info" | "success", string> = {
  default:
    "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600",
  info: "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700",
  success:
    "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
};

interface DailyReportCarouselDialogBodyProps {
  isLoading: boolean;
  isStaffLoading: boolean;
  loadError: string | null;
  report: AdminDailyReport | null;
  actionError: string | null;
  onClearActionError: () => void;
  reactions: ReportReaction[];
  selectedReactions: ReactionType[];
  chipsDisabled: boolean;
  onToggleReaction: (type: ReactionType) => void;
  comments: AdminComment[];
}

export function DailyReportCarouselDialogBody({
  isLoading,
  isStaffLoading,
  loadError,
  report,
  actionError,
  onClearActionError,
  reactions,
  selectedReactions,
  chipsDisabled,
  onToggleReaction,
  comments,
}: DailyReportCarouselDialogBodyProps) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      {isLoading || isStaffLoading ? (
        <p className="py-8 text-center text-sm text-slate-400">読み込み中...</p>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : !report ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          日報が見つかりません
        </div>
      ) : (
        <div className="space-y-4">
          {actionError && (
            <div className="flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{actionError}</span>
              <button
                type="button"
                onClick={onClearActionError}
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

          <div>
            <SubsectionTitle className="text-base font-bold text-slate-800">
              {report.title}
            </SubsectionTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">
                {formatDateSlash(report.date) || report.date} | {report.author}
              </span>
              <span className={STATUS_BADGE_CLASS[STATUS_META[report.status].color]}>
                {STATUS_META[report.status].label}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              最終更新: {formatDateTimeReadable(report.updatedAt) || "-"}
            </p>
          </div>

          <hr className="border-slate-100" />

          <pre className="whitespace-pre-wrap font-[inherit] text-sm leading-relaxed text-slate-700">
            {report.content || "内容は登録されていません"}
          </pre>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              リアクション
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(REACTION_META) as ReactionType[]).map((type) => {
                const meta = REACTION_META[type];
                const count = reactions.find((reaction) => reaction.type === type)?.count ?? 0;
                const isSelected = selectedReactions.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={chipsDisabled}
                    onClick={() => {
                      onToggleReaction(type);
                    }}
                    data-testid={`daily-report-reaction-${type}`}
                    className={[
                      "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition",
                      isSelected
                        ? "border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                      chipsDisabled ? "cursor-not-allowed opacity-50" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {meta.emoji} {meta.label}
                    {count > 0 && <span className="ml-1 text-slate-400">({count})</span>}
                  </button>
                );
              })}
            </div>
            {reactions.length === 0 && (
              <p className="text-xs text-slate-400">まだリアクションはありません。</p>
            )}
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              コメント
            </p>
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400">まだコメントはありません。</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {comment.author}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDateTimeReadable(comment.createdAt) || comment.createdAt}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{comment.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
