import { designTokenVar } from "@/shared/designSystem";

type WorkflowDetailActionsProps = {
  onBack: () => void;
  onWithdraw: () => void;
  onEdit: () => void;
  withdrawDisabled?: boolean;
  withdrawTooltip?: string;
  editDisabled?: boolean;
  editTooltip?: string;
};

const BUTTON_RADIUS = designTokenVar("radius.md", "8px");
const BUTTON_PADDING_X = designTokenVar("spacing.md", "12px");
const BUTTON_PADDING_Y = designTokenVar("spacing.sm", "8px");
const PRIMARY_BUTTON_BG = designTokenVar("color.brand.primary.base", "#0FA85E");
const PRIMARY_BUTTON_TEXT = designTokenVar(
  "color.brand.primary.contrast",
  "#FFFFFF"
);
const DANGER_BUTTON_BG = designTokenVar("color.feedback.danger.base", "#D7443E");
const BUTTON_DISABLED_BG = designTokenVar("color.neutral.200", "#D7E0DB");
const BUTTON_DISABLED_TEXT = designTokenVar("color.neutral.500", "#6B7C74");
const SECONDARY_BUTTON_TEXT = designTokenVar("color.text.secondary", "#45574F");

const actionButtonStyle = (
  backgroundColor: string,
  color: string,
  disabled?: boolean
) => ({
  border: "none",
  borderRadius: BUTTON_RADIUS,
  padding: `${BUTTON_PADDING_Y} ${BUTTON_PADDING_X}`,
  backgroundColor,
  color,
  cursor: disabled ? "not-allowed" : "pointer",
});

export default function WorkflowDetailActions({
  onBack,
  onWithdraw,
  onEdit,
  withdrawDisabled,
  withdrawTooltip,
  editDisabled,
  editTooltip,
}: WorkflowDetailActionsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <button
          type="button"
          className="rounded text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            border: "none",
            backgroundColor: "transparent",
            borderRadius: BUTTON_RADIUS,
            padding: `${BUTTON_PADDING_Y} ${BUTTON_PADDING_X}`,
            color: SECONDARY_BUTTON_TEXT,
            cursor: "pointer",
          }}
          onClick={onBack}
        >
          一覧に戻る
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className="text-sm font-medium transition-opacity hover:opacity-90 disabled:hover:opacity-100"
          style={actionButtonStyle(
            withdrawDisabled ? BUTTON_DISABLED_BG : DANGER_BUTTON_BG,
            withdrawDisabled ? BUTTON_DISABLED_TEXT : PRIMARY_BUTTON_TEXT,
            withdrawDisabled
          )}
          onClick={onWithdraw}
          disabled={withdrawDisabled}
          title={withdrawTooltip}
        >
          取り下げ
        </button>
        <button
          type="button"
          className="text-sm font-medium transition-opacity hover:opacity-90 disabled:hover:opacity-100"
          style={actionButtonStyle(
            editDisabled ? BUTTON_DISABLED_BG : PRIMARY_BUTTON_BG,
            editDisabled ? BUTTON_DISABLED_TEXT : PRIMARY_BUTTON_TEXT,
            editDisabled
          )}
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
