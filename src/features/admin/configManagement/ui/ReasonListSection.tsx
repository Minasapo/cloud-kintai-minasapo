import SettingsIcon from "@/features/admin/layout/ui/SettingsIcon";
import {
  SettingsCheckbox,
  SettingsTextField,
} from "@/features/admin/layout/ui/SettingsPrimitives";

interface Reason {
  reason: string;
  enabled: boolean;
}

interface ReasonListSectionProps {
  reasons: Reason[];
  onAddReason: () => void;
  onReasonChange: (
    index: number,
    field: "reason" | "enabled",
    value: string | boolean
  ) => void;
  onRemoveReason: (index: number) => void;
}

const ReasonListSection = ({
  reasons,
  onAddReason,
  onReasonChange,
  onRemoveReason,
}: ReasonListSectionProps) => (
  <div className="flex flex-col gap-4">
    {reasons.map((reason, index) => (
      <div
        className="flex flex-row flex-wrap items-center gap-4"
        key={index}
      >
        <SettingsTextField
          label={`理由 ${index + 1}`}
          value={reason.reason}
          onChange={(value) => onReasonChange(index, "reason", value)}
          className="w-[320px] max-w-full"
        />
        <div className="min-w-[88px]">
          <SettingsCheckbox
            checked={reason.enabled}
            onChange={(checked) => onReasonChange(index, "enabled", checked)}
            label="有効"
          />
        </div>
        <button
          className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition"
          type="button"
          onClick={() => onRemoveReason(index)}
          aria-label="削除"
        >
          <SettingsIcon name="delete" />
        </button>
      </div>
    ))}
    <button
      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium self-start mt-2 transition"
      type="button"
      onClick={onAddReason}
    >
      + 理由を追加
    </button>
  </div>
);

export default ReasonListSection;
