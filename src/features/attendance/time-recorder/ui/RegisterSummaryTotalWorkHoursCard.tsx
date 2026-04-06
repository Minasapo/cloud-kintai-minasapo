type RegisterSummaryTotalWorkHoursCardProps = {
  totalHoursLabel: string;
};

export default function RegisterSummaryTotalWorkHoursCard({
  totalHoursLabel,
}: RegisterSummaryTotalWorkHoursCardProps) {
  return (
    <div className="rounded-[4px] border border-slate-200/90 bg-slate-50/70 px-3.5 py-3">
      <p className="m-0 text-xs font-medium tracking-[0.03em] text-slate-500">
        合計勤務時間
      </p>
      <p className="m-0 mt-1.5 text-2xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
        {totalHoursLabel}
      </p>
    </div>
  );
}
