import { designTokenVar } from "@shared/designSystem";
import { AppButton } from "@shared/ui/button";
import { AppDialog } from "@shared/ui/feedback";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const handleConfirm = () => {
    setDismissed(true);
    navigate("/attendance/list");
  };

  return (
    <AppDialog
      testId="time-elapsed-error-dialog"
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      title={
        <span data-testid="time-elapsed-error-dialog-title-text">
          1週間以上経過した打刻エラーがあります
        </span>
      }
      description={
        <>
          <span data-testid="time-elapsed-error-dialog-description-text">
            1週間以上経過した打刻エラーがあります。
          </span>
          <br />
          勤怠一覧を確認して打刻修正を申請してください。
        </>
      }
      actions={
        <>
          <AppButton
            variant="outline"
            tone="neutral"
            onClick={handleClose}
            data-testid="time-elapsed-error-dialog-later-btn"
          >
            あとで
          </AppButton>
          <AppButton
            tone="primary"
            sx={{
              backgroundColor: designTokenVar("color.brand.primary.base"),
              color: designTokenVar("color.brand.primary.contrastText"),
              "&:hover": {
                backgroundColor: designTokenVar("color.brand.primary.dark"),
              },
            }}
            onClick={handleConfirm}
            data-testid="time-elapsed-error-dialog-confirm-btn"
          >
            確認する
          </AppButton>
        </>
      }
    />
  );
}
