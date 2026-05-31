interface DailyReportCarouselDialogFooterProps {
  commentInput: string;
  onCommentInputChange: (value: string) => void;
  onClearActionError: () => void;
  onSubmitComment: () => void;
  isCommentDisabled: boolean;
}

export function DailyReportCarouselDialogFooter({
  commentInput,
  onCommentInputChange,
  onClearActionError,
  onSubmitComment,
  isCommentDisabled,
}: DailyReportCarouselDialogFooterProps) {
  return (
    <div className="shrink-0 border-t border-slate-100 px-5 py-3">
      <div className="space-y-2">
        <textarea
          value={commentInput}
          onChange={(event) => {
            onClearActionError();
            onCommentInputChange(event.target.value);
          }}
          placeholder="コメントを入力"
          rows={2}
          data-testid="daily-report-comment-input"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSubmitComment}
            disabled={isCommentDisabled}
            data-testid="daily-report-comment-submit"
            className="inline-flex h-8 items-center rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
