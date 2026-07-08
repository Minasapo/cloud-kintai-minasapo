import type { ShiftDisplayMode } from "@entities/app-config/model/useAppConfig";
import { AppButton, AppButtonGroup } from "@shared/ui/button";

type ShiftDisplayModeButtonGroupProps = {
  value: ShiftDisplayMode;
  onChange: (mode: ShiftDisplayMode) => void;
};

const buttonBaseSx = {
  minWidth: 0,
  px: 2,
  py: 1,
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.25,
  textTransform: "none",
  whiteSpace: "nowrap",
};

const activeButtonSx = {
  ...buttonBaseSx,
  borderColor: "rgb(5 150 105)",
  backgroundColor: "rgb(236 253 245)",
  color: "rgb(4 120 87)",
  "&:hover": {
    borderColor: "rgb(4 120 87)",
    backgroundColor: "rgb(209 250 229)",
  },
};

const inactiveButtonSx = {
  ...buttonBaseSx,
  borderColor: "rgb(203 213 225)",
  backgroundColor: "rgb(255 255 255)",
  color: "rgb(51 65 85)",
  "&:hover": {
    borderColor: "rgb(203 213 225)",
    backgroundColor: "rgb(248 250 252)",
  },
};

export default function ShiftDisplayModeButtonGroup({
  value,
  onChange,
}: ShiftDisplayModeButtonGroupProps) {
  return (
    <AppButtonGroup
      aria-label="シフト表示モード"
      size="small"
      sx={{
        "& .MuiButtonGroup-grouped": {
          minWidth: 0,
        },
      }}
    >
      <AppButton
        variant="outline"
        tone="neutral"
        onClick={() => onChange("normal")}
        sx={value === "normal" ? activeButtonSx : inactiveButtonSx}
      >
        通常モード
      </AppButton>
      <AppButton
        variant="outline"
        tone="neutral"
        onClick={() => onChange("collaborative")}
        sx={value === "collaborative" ? activeButtonSx : inactiveButtonSx}
      >
        共同編集モード
      </AppButton>
    </AppButtonGroup>
  );
}
