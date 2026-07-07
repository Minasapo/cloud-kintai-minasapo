import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  SELECTOR_MAX_WIDTH,
  SELECTOR_MIN_WIDTH,
} from "@shared/config/uiDimensions";
import { designTokenVar } from "@shared/designSystem";
import { AppButton } from "@shared/ui/button";
import { AppMultiSelect } from "@shared/ui/form";
import { useMemo } from "react";

type Props = {
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (s: StaffType[]) => void;
};

type StaffSelectAreaProps = {
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (s: StaffType[]) => void;
  selectedLabel: string;
};

const MAIN_GREEN = designTokenVar(
  "color.feedback.success.base",
  "rgb(16 185 129)",
);
const MAIN_GREEN_DARK = "rgb(5 150 105)";

function StaffSelectArea({
  staffs,
  selectedStaff,
  setSelectedStaff,
  selectedLabel,
}: StaffSelectAreaProps) {
  const selectedIds = useMemo(
    () => selectedStaff.map((staff) => staff.id),
    [selectedStaff],
  );
  const options = useMemo(
    () =>
      staffs.map((staff) => ({
        value: staff.id,
        label: `${staff.familyName || ""} ${staff.givenName || ""}`.trim(),
      })),
    [staffs],
  );
  const selectLabelId = "attendance-download-staff-select";

  return (
    <div className="flex flex-col gap-2">
      <AppMultiSelect<string>
        label=""
        labelId={selectLabelId}
        value={selectedIds}
        options={options}
        emptyText="該当するスタッフが見つかりません。"
        onChange={(nextIds) => {
          const idSet = new Set(nextIds);
          setSelectedStaff(staffs.filter((staff) => idSet.has(staff.id)));
        }}
        renderValue={(values) => {
          if (values.length === 0) {
            return <span className="text-slate-400">対象者を選択</span>;
          }

          return <span>{selectedLabel}</span>;
        }}
        sx={{
          minWidth: SELECTOR_MIN_WIDTH,
          maxWidth: SELECTOR_MAX_WIDTH,
        }}
      />

      <div
        className="flex items-center gap-2"
        style={{ maxWidth: SELECTOR_MAX_WIDTH, minWidth: SELECTOR_MIN_WIDTH }}
      >
        <AppButton
          variant="outline"
          tone="primary"
          size="sm"
          onClick={() => setSelectedStaff(staffs)}
          disabled={
            staffs.length === 0 ||
            staffs.every((staff) => selectedIds.includes(staff.id))
          }
          className="whitespace-nowrap"
          sx={{
            "--variant-outlinedColor": MAIN_GREEN,
            "--variant-outlinedBorder": "rgba(16, 185, 129, 0.5)",
            "--variant-outlinedBg": "rgba(16, 185, 129, 0.04)",
            "&:hover": {
              "--variant-outlinedBorder": MAIN_GREEN_DARK,
              "--variant-outlinedBg": "rgba(16, 185, 129, 0.1)",
            },
          }}
        >
          全選択
        </AppButton>
        <AppButton
          variant="outline"
          tone="primary"
          size="sm"
          onClick={() => setSelectedStaff([])}
          disabled={selectedStaff.length === 0}
          className="whitespace-nowrap"
          sx={{
            "--variant-outlinedColor": MAIN_GREEN,
            "--variant-outlinedBorder": "rgba(16, 185, 129, 0.5)",
            "--variant-outlinedBg": "rgba(16, 185, 129, 0.04)",
            "&:hover": {
              "--variant-outlinedBorder": MAIN_GREEN_DARK,
              "--variant-outlinedBg": "rgba(16, 185, 129, 0.1)",
            },
          }}
        >
          全解除
        </AppButton>
      </div>
    </div>
  );
}

export default function StaffSelector({
  staffs,
  selectedStaff,
  setSelectedStaff,
}: Props) {
  const selectedLabel = useMemo(() => {
    if (selectedStaff.length === 0) return "対象者を選択";
    if (selectedStaff.length === 1) {
      return `${selectedStaff[0].familyName || ""} ${selectedStaff[0].givenName || ""}`.trim();
    }
    return `${selectedStaff.length}名を選択中`;
  }, [selectedStaff]);

  return (
    <div className="relative flex flex-col gap-3 overflow-visible">
      <StaffSelectArea
        staffs={staffs}
        selectedStaff={selectedStaff}
        setSelectedStaff={setSelectedStaff}
        selectedLabel={selectedLabel}
      />
    </div>
  );
}
