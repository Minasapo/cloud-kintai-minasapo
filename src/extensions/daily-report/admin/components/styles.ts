export const STATUS_BADGE_CLASS: Record<"default" | "info" | "success", string> =
  {
    default:
      "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600",
    info: "inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700",
    success:
      "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
  };

export const SELECT_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200";

export const INPUT_DATE_CLASS =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-200";
