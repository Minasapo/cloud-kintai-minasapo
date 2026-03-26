export default function FloatingPanel({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className={`absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-[8px] border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(246,252,248,0.96)_100%)] p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur ${className}`.trim()}
    >
      {children}
    </div>
  );
}
