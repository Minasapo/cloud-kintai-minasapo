export default function FilterTrigger({
  label,
  isOpen,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-[10px] border px-6 py-4 text-left text-[0.95rem] transition",
        isOpen
          ? "border-emerald-500/45 bg-white ring-2 ring-emerald-100"
          : "border-slate-300 bg-white hover:border-slate-400",
      ].join(" ")}
    >
      <span className="truncate text-slate-900">{label}</span>
      <span className="ml-3 text-slate-500">{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}
