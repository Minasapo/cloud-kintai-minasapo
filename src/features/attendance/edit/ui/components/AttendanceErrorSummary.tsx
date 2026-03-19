type AttendanceErrorSummaryProps = {
  messages: string[];
  title?: string;
  variant?: "desktop" | "mobile";
};

const classNameByVariant = {
  desktop: "rounded-[20px] border border-rose-500/15 bg-rose-50/90 px-4 py-3",
  mobile: "rounded-[18px] border border-rose-500/15 bg-rose-50/90 px-4 py-3",
} as const;

export function AttendanceErrorSummary({
  messages,
  title = "入力内容に誤りがあります。",
  variant = "desktop",
}: AttendanceErrorSummaryProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={classNameByVariant[variant]}>
      <div className="text-sm font-semibold text-rose-900">{title}</div>
      <div className="mt-2 flex flex-col gap-1">
        {messages.map((message) => (
          <div key={message} className="text-sm text-rose-900">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}
