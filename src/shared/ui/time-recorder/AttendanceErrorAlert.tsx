import { Link as RouterLink } from "react-router-dom";

export interface AttendanceErrorAlertProps {
  displayMode?: "compact" | "detailed";
}

const AttendanceErrorAlert = ({
  displayMode = "detailed",
}: AttendanceErrorAlertProps) => {
  const isCompact = displayMode === "compact";

  return (
    <div
      role="alert"
      className={[
        "flex items-center justify-between gap-4 border bg-[linear-gradient(135deg,#fee2e2_0%,#fff1f2_48%,#ffffff_100%)] text-rose-950 shadow-[0_22px_36px_-26px_rgba(225,29,72,0.65)]",
        isCompact
          ? "rounded-[1.15rem] border-rose-300 px-4 py-3"
          : "rounded-[1.5rem] border-rose-300 px-5 py-4",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p
          className={[
            "m-0 font-semibold text-rose-950",
            isCompact ? "text-sm leading-5" : "text-base leading-6",
          ].join(" ")}
        >
          勤怠打刻エラー
        </p>
        <p
          className={[
            "m-0 text-rose-900/80",
            isCompact ? "text-xs leading-5" : "text-sm leading-6",
          ].join(" ")}
        >
          打刻エラーがあります。勤怠一覧を確認してください。
        </p>
      </div>
      <RouterLink
        to="/attendance/list"
        className={[
          "inline-flex min-w-fit shrink-0 whitespace-nowrap rounded-full border border-rose-700 bg-rose-700 text-white font-semibold leading-none no-underline transition-colors hover:bg-rose-800 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2",
          isCompact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        ].join(" ")}
      >
        確認
      </RouterLink>
    </div>
  );
};

export default AttendanceErrorAlert;
