export default function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-1"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
      />
      <p className="m-0 text-sm text-slate-500">
        読み込み中です…
      </p>
    </div>
  );
}
