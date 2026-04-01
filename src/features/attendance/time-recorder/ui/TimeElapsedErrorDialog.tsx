import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

type TimeElapsedErrorDialogProps = {
  isTimeElapsedError: boolean;
};

/**
 * 1週間以上経過した打刻エラーがある場合に表示するダイアログコンポーネント。
 */
export default function TimeElapsedErrorDialog({
  isTimeElapsedError,
}: TimeElapsedErrorDialogProps): JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isTimeElapsedError);
  }, [isTimeElapsedError]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      aria-modal="true"
      role="dialog"
      data-testid="time-elapsed-error-dialog"
      className={`${open ? "flex" : "hidden"} fixed inset-0 z-50 items-center justify-center bg-slate-950/50 p-4`}
    >
      <div className="w-full max-w-md rounded-[6px] bg-white p-6 shadow-xl">
        <h2
          id="alert-dialog-title"
          className="m-0 text-lg font-semibold text-slate-900"
        >
          <span data-testid="time-elapsed-error-dialog-title-text">
            1週間以上経過した打刻エラーがあります
          </span>
        </h2>
        <div className="mt-4">
          <p
            id="alert-dialog-description"
            className="m-0 text-sm leading-6 text-slate-700"
          >
            <span data-testid="time-elapsed-error-dialog-description-text">
              1週間以上経過した打刻エラーがあります。
            </span>
            <br />
            勤怠一覧を確認して打刻修正を申請してください。
          </p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            data-testid="time-elapsed-error-dialog-later-btn"
            className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            あとで
          </button>
          <RouterLink
            to="/attendance/list"
            onClick={handleClose}
            data-testid="time-elapsed-error-dialog-confirm-btn"
            className="inline-flex items-center justify-center rounded-[4px] bg-emerald-600 px-4 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-emerald-700 hover:no-underline"
          >
            確認する
          </RouterLink>
        </div>
      </div>
    </div>
  );
}
