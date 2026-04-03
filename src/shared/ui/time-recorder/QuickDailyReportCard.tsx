import { ChangeEvent, ReactNode, useEffect } from "react";

export interface QuickDailyReportCardViewProps {
  date: string;
  reportId: string | null;
  content: string;
  isOpen: boolean;
  isDialogOpen: boolean;
  isLoading: boolean;
  isEditable: boolean;
  isSaving: boolean;
  hasStaff: boolean;
  error: string | null;
  lastSavedAt: string | null;
  contentPanelId: string;
  isSubmitted: boolean;
  onToggle: () => void;
  onDialogOpen: () => void;
  onDialogClose: () => void;
  onSave: () => void;
  onContentChange: (value: string) => void;
}

function ExpandMoreIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function OpenInFullIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3.5H3.5V7" />
      <path d="M13 3.5h3.5V7" />
      <path d="M7 16.5H3.5V13" />
      <path d="M13 16.5h3.5V13" />
    </svg>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="m-0 text-xs leading-5 text-slate-500">{children}</p>;
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
    >
      {message}
    </div>
  );
}

function LoadingBar() {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-[4px] bg-slate-200"
      aria-label="日報を読み込み中"
    >
      <div className="h-full w-1/3 animate-pulse rounded-[4px] bg-emerald-600" />
    </div>
  );
}

type TextAreaProps = {
  autoFocus?: boolean;
  content: string;
  disabled: boolean;
  minRows: number;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

function ReportTextArea({
  autoFocus = false,
  content,
  disabled,
  minRows,
  placeholder,
  onChange,
}: TextAreaProps) {
  return (
    <textarea
      autoFocus={autoFocus}
      rows={minRows}
      value={content}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="min-h-[7rem] w-full rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
    />
  );
}

const QuickDailyReportCardView = ({
  date,
  reportId,
  content,
  isOpen,
  isDialogOpen,
  isLoading,
  isEditable,
  isSaving,
  hasStaff,
  error,
  lastSavedAt,
  contentPanelId,
  isSubmitted,
  onToggle,
  onDialogOpen,
  onDialogClose,
  onSave,
  onContentChange,
}: QuickDailyReportCardViewProps) => {
  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(event.target.value);
  };

  const placeholder = hasStaff
    ? "今日の振り返りや共有事項をここに入力できます"
    : "スタッフ情報を読み込み中です";

  useEffect(() => {
    if (!isDialogOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDialogClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isDialogOpen, onDialogClose]);

  return (
    <>
      <section className="rounded-[4px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3 shadow-[0_30px_60px_-48px_rgba(15,23,42,0.45)]">
        <div className="rounded-[4px] border border-white/70 bg-white/70 p-3 backdrop-blur-sm">
          <div className="mb-1 flex items-start gap-2">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              aria-controls={contentPanelId}
              className="mt-0.5 inline-flex h-9 w-9 shrink-0 appearance-none items-center justify-center rounded-[4px] border-0 bg-slate-100 p-0 text-slate-600 shadow-none transition hover:bg-slate-200 hover:text-slate-900"
            >
              <ExpandMoreIcon isOpen={isOpen} />
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="min-w-0 flex-1 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left shadow-none"
            >
              <p className="m-0 text-base font-semibold text-slate-900">
                今日の日報メモ
              </p>
              <p className="m-0 text-xs text-slate-500">
                {date} / {reportId ? "既存データを更新" : "新規作成"}
              </p>
              {lastSavedAt && (
                <p className="m-0 text-xs text-emerald-700">
                  {isSaving ? "保存中..." : `最終保存: ${lastSavedAt}`}
                </p>
              )}
            </button>

            <button
              type="button"
              onClick={onDialogOpen}
              disabled={!hasStaff || isLoading}
              aria-label="拡大表示"
              title="拡大表示"
              className={`inline-flex h-9 w-9 shrink-0 appearance-none items-center justify-center rounded-[4px] border-0 bg-slate-100 p-0 text-slate-600 shadow-none transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 ${isOpen ? "visible" : "invisible"}`}
            >
              <OpenInFullIcon />
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!isEditable || isSaving || isSubmitted}
              className={`shrink-0 appearance-none whitespace-nowrap rounded-[4px] border-0 bg-[linear-gradient(135deg,#0FA85E_0%,#0B6D53_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_24px_-20px_rgba(15,168,94,0.7)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 ${isOpen ? "visible" : "invisible"}`}
            >
              {isSaving ? "提出中" : "提出"}
            </button>
          </div>

          {isOpen && (
            <div id={contentPanelId} className="mt-1 space-y-3">
              {isLoading && <LoadingBar />}
              <ReportTextArea
                content={content}
                disabled={!hasStaff || isLoading}
                minRows={4}
                placeholder={placeholder}
                onChange={handleContentChange}
              />
              <FieldHint>
                入力を停止して1秒後に自動保存されます。他の日報は、日報ページから編集・閲覧できます。
              </FieldHint>
              {error && <ErrorAlert message={error} />}
            </div>
          )}
        </div>
      </section>

      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${contentPanelId}-dialog-title`}
          onClick={onDialogClose}
        >
          <div
            className="w-full max-w-3xl rounded-[4px] bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2
                id={`${contentPanelId}-dialog-title`}
                className="m-0 text-lg font-semibold text-slate-900"
              >
                今日の日報メモを拡大表示
              </h2>
            </div>
            <div className="space-y-4 px-6 py-5">
              {isLoading && <LoadingBar />}
              <ReportTextArea
                autoFocus
                content={content}
                disabled={!hasStaff || isLoading}
                minRows={10}
                placeholder={placeholder}
                onChange={handleContentChange}
              />
              <FieldHint>
                入力を停止して1秒後に自動保存されます。保存すると標準のカードにも内容が反映されます。
              </FieldHint>
              {error && <ErrorAlert message={error} />}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={onDialogClose}
                className="appearance-none rounded-[4px] border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-none transition hover:bg-slate-50"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => void onSave()}
                disabled={!isEditable || isSaving || isSubmitted}
                className="appearance-none rounded-[4px] border-0 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-none transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSaving ? "提出中..." : "提出"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickDailyReportCardView;
