import { lazy, Suspense } from "react";

export type OfficeQrPanelProps = {
  showAdminAlert: boolean;
  isOfficeModeEnabled: boolean;
  isRegisterMode: boolean;
  timeLeft: number;
  progress: number;
  qrUrl: string;
  tooltipOpen: boolean;
  onModeChange: () => void;
  onCopyUrl: () => void;
  onManualRefresh: () => void;
};

const LazyQRCodeCanvas = lazy(async () => {
  const module = await import("qrcode.react");
  return { default: module.QRCodeCanvas };
});

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function OfficeQrPanel({
  showAdminAlert,
  isOfficeModeEnabled,
  isRegisterMode,
  timeLeft,
  progress,
  qrUrl,
  tooltipOpen,
  onModeChange,
  onCopyUrl,
  onManualRefresh,
}: OfficeQrPanelProps) {
  if (!isOfficeModeEnabled) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-4">
        <div
          role="alert"
          data-testid="office-qr-disabled-alert"
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium leading-6 text-amber-950"
        >
          現在、使用することができません。
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4">
      {showAdminAlert && (
        <div className="mt-4 text-center">
          <div
            role="alert"
            data-testid="office-qr-admin-alert"
            className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-950"
          >
            管理者権限で表示されています。オペレーター権限を持ったアカウントで表示してから運用してください。
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onModeChange}
          className={`inline-flex appearance-none items-center justify-center rounded-lg border-0 px-5 py-3 text-lg font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${isRegisterMode ? "bg-emerald-600" : "bg-slate-700"}`}
          data-testid="office-qr-mode-toggle"
        >
          {isRegisterMode ? "出勤モード" : "退勤モード"}
        </button>
      </div>

      <div className="mt-4 text-center">
        <p
          className="mb-2 text-sm leading-6 text-slate-700"
          data-testid="office-qr-timer"
        >
          次の更新までの時間: {formatTime(timeLeft)}
        </p>
        <div className="mx-auto w-full max-w-[500px]">
          <div
            className="h-[30px] overflow-hidden rounded-full bg-slate-200"
            data-testid="office-qr-progress"
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="mb-2 text-base leading-7 text-slate-900">
          以下のQRコードをスキャンしてください。
        </p>
        <div className="mt-2">
          <Suspense
            fallback={
              <div className="flex justify-center" aria-label="QRコード生成中">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
              </div>
            }
          >
            <div className="flex justify-center">
              <LazyQRCodeCanvas
                value={qrUrl}
                size={500}
                data-testid="office-qr-code"
                aria-label="office-qr-code"
              />
            </div>
          </Suspense>
        </div>
        <div className="my-2 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <div className="relative inline-flex">
            {tooltipOpen && (
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white shadow-lg">
                URLがコピーされました！
              </div>
            )}
            <button
              type="button"
              onClick={onCopyUrl}
              data-testid="office-qr-copy-button"
              className="inline-flex appearance-none items-center justify-center rounded-md border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              URLをコピー
            </button>
          </div>
          <button
            type="button"
            onClick={onManualRefresh}
            data-testid="office-qr-refresh-button"
            className="inline-flex appearance-none items-center justify-center rounded-md border border-emerald-600 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            QRコードを手動更新
          </button>
        </div>
      </div>
    </div>
  );
}
