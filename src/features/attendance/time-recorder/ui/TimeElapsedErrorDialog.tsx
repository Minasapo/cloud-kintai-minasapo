import { useDialogFocusManagement } from "@shared/ui/feedback/useDialogFocusManagement";
import { APP_LAYER_Z_INDEX } from "@shared/ui/overlay/layers";
import OverlayPortal from "@shared/ui/overlay/OverlayPortal";
import { SectionTitle } from "@shared/ui/typography";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

type TimeElapsedErrorDialogProps = {
  isTimeElapsedError: boolean;
};

/**
 * 1週間以上経過した打刻エラーがある場合に表示するダイアログコンポーネント。
 */
export default function TimeElapsedErrorDialog({
  isTimeElapsedError,
}: TimeElapsedErrorDialogProps): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const laterButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isTimeElapsedError) {
      const timeoutId = window.setTimeout(() => {
        setDismissed(false);
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [isTimeElapsedError]);

  const open = isTimeElapsedError && !dismissed;

  const handleClose = () => {
    setDismissed(true);
  };

  useDialogFocusManagement({
    open,
    onClose: handleClose,
    dialogRef,
    initialFocusRef: laterButtonRef,
  });

  if (!open) return null;

  return (
    <OverlayPortal>
      <div
        data-testid="time-elapsed-error-dialog"
        className="fixed inset-0 flex items-center justify-center bg-slate-950/50 p-4"
        style={{ zIndex: APP_LAYER_Z_INDEX.modal }}
        role="presentation"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          aria-label="1週間以上経過した打刻エラーがあります"
          tabIndex={-1}
          className="w-full max-w-md rounded-[4px] bg-white p-6 shadow-xl"
        >
          <SectionTitle
            id="alert-dialog-title"
            className="m-0 text-lg font-semibold text-slate-900"
          >
            <span data-testid="time-elapsed-error-dialog-title-text">
              1週間以上経過した打刻エラーがあります
            </span>
          </SectionTitle>
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
              ref={laterButtonRef}
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
    </OverlayPortal>
  );
}
