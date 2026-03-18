import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import { useContext } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

/**
 * 休憩終了時刻の入力コンポーネント。
 * @param rest 休憩データ
 * @param index 休憩配列のインデックス
 * @returns JSX.Element | null
 */
export default function RestEndTimeInput({
  rest,
  index,
  testIdPrefix = "desktop",
}: {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
}) {
  const { workDate, control, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );

  if (!workDate || !control || !restUpdate) return null;

  return (
    <div className="flex flex-col gap-2">
        <Controller
          name={`rests.${index}.endTime`}
          control={control}
          render={({ field }) => (
            <TimeInput
              value={field.value ?? null}
              baseDate={workDate.format("YYYY-MM-DD")}
              disabled={changeRequests.length > 0}
              size="small"
              step={60}
              data-testid={`rest-end-time-input-${testIdPrefix}-${index}`}
              onChange={(newEndTime) => field.onChange(newEndTime)}
            />
          )}
        />
        <div>
          <DefaultEndTimeChip index={index} rest={rest} />
        </div>
    </div>
  );
}

/**
 * デフォルトの休憩終了時刻を設定するチップコンポーネント。
 * @param index 休憩配列のインデックス
 * @param rest 休憩データ
 * @returns JSX.Element | null
 */
function DefaultEndTimeChip({
  index,
  rest,
}: {
  index: number;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
}) {
  const { workDate, restUpdate, changeRequests } = useContext(
    AttendanceEditContext
  );
  const { getLunchRestEndTime } = useContext(AppConfigContext);

  const lunchRestEndTime = getLunchRestEndTime().format("H:mm");

  if (!workDate || !restUpdate) return null;

  const clickHandler = () => {
    const endTime = new AttendanceDateTime()
      .setDate(workDate)
      .setRestEnd()
      .toISOString();
    restUpdate(index, { ...rest, endTime });
  };

  return (
    <QuickInputChips
      quickInputTimes={[{ time: lunchRestEndTime, enabled: true }]}
      workDate={workDate}
      disabled={changeRequests.length > 0}
      onSelectTime={clickHandler}
    />
  );
}
