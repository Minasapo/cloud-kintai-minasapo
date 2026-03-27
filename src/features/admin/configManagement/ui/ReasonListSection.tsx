import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";

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
        <TextField
          label={`理由 ${index + 1}`}
          value={reason.reason}
          onChange={(e) => onReasonChange(index, "reason", e.target.value)}
          size="small"
          sx={{ width: 320, maxWidth: "100%" }}
        />
        <div className="min-w-[88px]">
          <FormControlLabel
            control={
              <Checkbox
                checked={reason.enabled}
                onChange={(e) =>
                  onReasonChange(index, "enabled", e.target.checked)
                }
              />
            }
            label="有効"
          />
        </div>
        <button
          className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"
          type="button"
          onClick={() => onRemoveReason(index)}
          aria-label="削除"
        >
          <DeleteIcon />
        </button>
      </div>
    ))}
    <button
      className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start mt-2 transition"
      type="button"
      onClick={onAddReason}
    >
      + 理由を追加
    </button>
  </div>
);

export default ReasonListSection;
