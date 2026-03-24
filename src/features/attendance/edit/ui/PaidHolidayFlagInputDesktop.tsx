import dayjs from "dayjs";
import { Controller, UseFieldArrayReplace } from "react-hook-form";

import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import {
  AttendanceEditInputs,
  RestInputs,
} from "@/features/attendance/edit/model/common";

import {
  AttendanceControl,
  AttendanceControllerField,
  AttendanceGetValues,
  AttendanceSetValue,
} from "../model/types";

type PaidHolidayFlagField = AttendanceControllerField<"paidHolidayFlag">;

interface PaidHolidayFlagInputProps {
  label?: string;
  disabled?: boolean;
  control: AttendanceControl;
  setValue: AttendanceSetValue;
  workDate?: string;
  setPaidHolidayTimes?: boolean;
  restReplace?: UseFieldArrayReplace<AttendanceEditInputs, "rests">;
  getValues?: AttendanceGetValues;
}

export default function PaidHolidayFlagInputDesktop({
  label = "有給休暇",
  disabled = false,
  control,
  setValue,
  workDate,
  setPaidHolidayTimes = false,
  restReplace,
  getValues,
}: PaidHolidayFlagInputProps) {
  if (!control || !setValue) return null;

  const handleChange = (
    checked: boolean,
    field: PaidHolidayFlagField
  ) => {
    setValue("paidHolidayFlag", checked);
    field.onChange(checked);

    if (!checked || !setPaidHolidayTimes || !workDate) return;

    const workDayjs = dayjs(workDate);
    setValue(
      "startTime",
      new AttendanceDateTime().setDate(workDayjs).setWorkStart().toISOString()
    );
    setValue(
      "endTime",
      new AttendanceDateTime().setDate(workDayjs).setWorkEnd().toISOString()
    );
    const rests: RestInputs[] = [
      {
        startTime: new AttendanceDateTime()
          .setDate(workDayjs)
          .setRestStart()
          .toISOString(),
        endTime: new AttendanceDateTime()
          .setDate(workDayjs)
          .setRestEnd()
          .toISOString(),
      },
    ];

    if (restReplace && typeof restReplace === "function") {
      restReplace(rests);
    } else {
      setValue("rests", rests);
    }

    try {
      if (getValues) {
        // remove special holiday tag if present (mutual exclusion)
        try {
          const special = (getValues("specialHolidayFlag") as boolean) || false;
          if (special) {
            setValue("specialHolidayFlag", false);
          }
        } catch {
          // noop
        }

        const tags: string[] = (getValues("remarkTags") as string[]) || [];
        if (!tags.includes("有給休暇")) {
          setValue("remarkTags", [...tags, "有給休暇"]);
        }
      }
    } catch {
      // noop
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-[150px] font-bold text-slate-900">{label}</div>
      <div>
        <Controller
          name="paidHolidayFlag"
          control={control}
          disabled={disabled}
          render={({ field }) => (
            <label className="inline-flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={field.value || false}
                onChange={(e) => handleChange(e.target.checked, field)}
                disabled={disabled}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
              />
              <span className="text-sm text-slate-600">有効にする</span>
            </label>
          )}
        />
      </div>
    </div>
  );
}
