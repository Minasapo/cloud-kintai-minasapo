type ErrorFallbackPanelProps = {
  title: string;
  message: string;
  scope?: "page" | "feature";
};

export function ErrorFallbackPanel({
  title,
  message,
  scope = "feature",
}: ErrorFallbackPanelProps) {
  if (scope === "page") {
    return (
      <div className="mx-auto min-h-[40vh] w-full max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-4">
          <h1 className="m-0 text-3xl font-bold tracking-[-0.03em] text-slate-950">
            {title}
          </h1>
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
          >
            {message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-900"
    >
      <p className="m-0 text-sm font-semibold">{title}</p>
      <p className="m-0 mt-1">{message}</p>
    </div>
  );
}
