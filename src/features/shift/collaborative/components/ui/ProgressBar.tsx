type ProgressBarProps = {
  value: number;
};

export const ProgressBar = ({ value }: ProgressBarProps) => (
  <div className="h-2 rounded-full bg-slate-200/80">
    <div
      className="h-full rounded-full bg-[#19b985] transition-[width]"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);
