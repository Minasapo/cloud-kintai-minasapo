import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import { useWorkflowDetailContext } from "../model/WorkflowDetailContext";

const pillButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-emerald-700/55 bg-[#19b985] px-7 py-3 text-base font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(5,150,105,0.55)] transition hover:bg-[#17ab7b] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none";
const dangerPillButtonClassName =
  "inline-flex items-center justify-center rounded-full border border-rose-700/55 bg-[#e05353] px-7 py-3 text-base font-medium text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12),0_12px_24px_-18px_rgba(224,83,83,0.45)] transition hover:bg-[#d64545] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none";

export default function WorkflowDetailActions() {
  const { permissions, onBack, onWithdraw, onEdit } = useWorkflowDetailContext();
  const { withdrawDisabled, withdrawTooltip, editDisabled, editTooltip } =
    permissions;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <button
          type="button"
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.25)] transition hover:border-slate-400/70 hover:bg-white"
          onClick={onBack}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 18, color: "#475569" }} />
          一覧に戻る
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className={dangerPillButtonClassName}
          onClick={onWithdraw}
          disabled={withdrawDisabled}
          title={withdrawTooltip}
        >
          取り下げ
        </button>
        <button
          type="button"
          className={pillButtonClassName}
          style={
            editDisabled
              ? undefined
              : {
                  backgroundColor: "#19b985",
                  color: "#ffffff",
                }
          }
          onClick={onEdit}
          disabled={editDisabled}
          title={editTooltip}
        >
          編集
        </button>
      </div>
    </div>
  );
}
