type ShiftPlanFooterProps = {
  isAutoSaving: boolean;
  lastAutoSaveTime: string | null;
  isBusy: boolean;
  onSaveAll: () => void;
};

const ShiftPlanFooter: React.FC<ShiftPlanFooterProps> = ({
  isAutoSaving,
  lastAutoSaveTime,
  isBusy,
  onSaveAll,
}: ShiftPlanFooterProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex flex-col gap-1">
        {isAutoSaving && (
          <span className="text-xs" style={{ color: "#3C7EDB" }}>
            自動保存中...
          </span>
        )}
        {lastAutoSaveTime && !isAutoSaving && (
          <span className="text-xs" style={{ color: "#7D9288" }}>
            最後の自動保存: {lastAutoSaveTime}
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={isBusy}
        onClick={onSaveAll}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: "#0FA85E" }}
        onMouseEnter={(e) => {
          if (!isBusy) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0B8A4C";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0FA85E";
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        全体を保存
      </button>
    </div>
  );
};

export default ShiftPlanFooter;
