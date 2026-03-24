import Clock from "@shared/ui/clock/Clock";

export type OfficeQrRegisterPanelProps = {
  isOfficeModeEnabled: boolean;
  errorMessage: string | null;
  mode: "clock_in" | "clock_out" | null;
  onClockIn: () => void;
  onClockOut: () => void;
};

const ACTION_BUTTON_BASE_CLASS_NAME =
  "mt-2 inline-flex h-20 w-full max-w-[350px] appearance-none items-center justify-center rounded-xl border-0 px-6 text-2xl font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2";

export function OfficeQrRegisterPanel({
  isOfficeModeEnabled,
  errorMessage,
  mode,
  onClockIn,
  onClockOut,
}: OfficeQrRegisterPanelProps) {
  if (!isOfficeModeEnabled) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div
          role="alert"
          data-testid="office-qr-register-disabled-alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium leading-6 text-amber-950"
        >
          現在、使用することができません。
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <div
          role="alert"
          data-testid="office-qr-register-error-alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium leading-6 text-rose-950"
        >
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4">
      <div
        className="mt-4 flex flex-col items-center text-center"
        data-testid="office-qr-register-panel"
      >
        <div data-testid="office-qr-register-clock">
          <Clock />
        </div>
        {mode === "clock_in" && (
          <button
            type="button"
            onClick={onClockIn}
            className={`${ACTION_BUTTON_BASE_CLASS_NAME} bg-emerald-600`}
            data-testid="office-qr-register-clock-in-button"
          >
            出勤
          </button>
        )}
        {mode === "clock_out" && (
          <button
            type="button"
            onClick={onClockOut}
            className={`${ACTION_BUTTON_BASE_CLASS_NAME} bg-rose-600 focus-visible:ring-rose-400`}
            data-testid="office-qr-register-clock-out-button"
          >
            退勤
          </button>
        )}
      </div>
    </div>
  );
}
