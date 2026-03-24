import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayUpdate,
} from "react-hook-form";

import { useAttendanceEditUi } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import { AttendanceControl, AttendanceFieldPath } from "../../../model/types";

interface CommonRestTimePickerProps {
  name: AttendanceFieldPath;
  value: string | null | undefined;
  workDate: dayjs.Dayjs;
  control: AttendanceControl;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  restUpdate: UseFieldArrayUpdate<AttendanceEditInputs, "rests">;
  chipLabel: string;
  onChipClick: () => void;
}

export function CommonRestTimePicker({
  name,
  value,
  workDate,
  control,
  rest,
  index,
  restUpdate,
  chipLabel,
  onChipClick,
}: CommonRestTimePickerProps) {
  const { readOnly } = useAttendanceEditUi();

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <TimePicker
            value={value ? dayjs(value) : null}
            ampm={false}
            slotProps={{
              textField: { size: "small" },
            }}
            disabled={!!readOnly}
            onChange={(newValue) => {
              if (newValue && !newValue.isValid()) {
                return;
              }

              const formatted = (() => {
                if (!newValue) return null;

                return newValue
                  .year(workDate.year())
                  .month(workDate.month())
                  .date(workDate.date())
                  .second(0)
                  .millisecond(0)
                  .toISOString();
              })();

              field.onChange(formatted);

              restUpdate(index, {
                ...rest,
                [name.split(".").pop()!]: formatted,
              });
            }}
          />
        )}
      />
      <div>
        <button
          type="button"
          onClick={() => {
            if (readOnly) return;
            onChipClick();
          }}
          className={[
            "inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 transition hover:bg-emerald-100",
            readOnly ? "cursor-not-allowed opacity-60" : "",
          ].join(" ")}
          disabled={!!readOnly}
        >
          <AddCircleOutlineOutlinedIcon fontSize="small" />
          <span>{chipLabel}</span>
        </button>
      </div>
    </>
  );
}
