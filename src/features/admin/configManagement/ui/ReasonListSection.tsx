import {
  SettingsCheckbox,
  SettingsTextField,
} from "@features/admin/layout/ui/SettingsPrimitives";
import { AppButton, AppDeleteIconButton } from "@shared/ui/button";

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
    value: string | boolean,
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
      <div className="flex flex-row flex-wrap items-center gap-4" key={index}>
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
        <AppDeleteIconButton
          size="sm"
          onClick={() => onRemoveReason(index)}
          aria-label="削除"
        />
      </div>
    ))}
    <AppButton
      variant="ghost"
      tone="primary"
      size="sm"
      onClick={onAddReason}
      sx={{
        alignSelf: "flex-start",
        mt: 1,
        textTransform: "none",
        fontWeight: 500,
        color: "rgb(5 150 105)",
        "&:hover": {
          color: "rgb(4 120 87)",
          backgroundColor: "transparent",
        },
      }}
    >
      + 理由を追加
    </AppButton>
  </div>
);

export default ReasonListSection;
