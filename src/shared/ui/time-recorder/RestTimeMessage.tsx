export interface RestTimeMessageProps {
  lunchRestStartTime: string;
  lunchRestEndTime: string;
  displayMode?: "compact" | "detailed";
}

const RestTimeMessage = ({
  lunchRestStartTime,
  lunchRestEndTime,
  displayMode = "detailed",
}: RestTimeMessageProps) => {
  const isCompact = displayMode === "compact";

  return (
    <div
      role="alert"
      className={[
        "border border-cyan-200 bg-[linear-gradient(135deg,#ebfdff_0%,#ffffff_100%)] text-cyan-950 shadow-[0_18px_30px_-28px_rgba(8,145,178,0.45)]",
        isCompact ? "rounded-[4px] px-4 py-3" : "rounded-[4px] px-5 py-4",
      ].join(" ")}
    >
      <p
        className={[
          "m-0 font-semibold",
          isCompact ? "text-sm leading-5" : "text-base leading-6",
        ].join(" ")}
      >
        昼休憩は退勤時に自動打刻されます
      </p>
      <div className={isCompact ? "mt-1 space-y-0" : "mt-1 space-y-0.5"}>
        <p
          className={[
            "m-0 text-cyan-950/80",
            isCompact ? "text-xs leading-5" : "text-sm leading-6",
          ].join(" ")}
          data-testid="rest-time-message-autostamp"
        >
          退勤打刻時に{lunchRestStartTime}〜{lunchRestEndTime}
          の昼休憩が自動追加されます。
        </p>
        <p
          className={[
            "m-0 text-cyan-950/80",
            isCompact ? "text-xs leading-5" : "text-sm leading-6",
          ].join(" ")}
          data-testid="rest-time-message-support"
        >
          修正する際は、変更リクエストまたは管理者へ問い合わせてください。
        </p>
      </div>
    </div>
  );
};

export default RestTimeMessage;
