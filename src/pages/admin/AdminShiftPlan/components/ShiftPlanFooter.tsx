import { AppSaveButton } from "@shared/ui/button";

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
      <AppSaveButton
        type="button"
        size="sm"
        disabled={isBusy}
        onClick={onSaveAll}
      >
        全体を保存
      </AppSaveButton>
    </div>
  );
};

export default ShiftPlanFooter;
