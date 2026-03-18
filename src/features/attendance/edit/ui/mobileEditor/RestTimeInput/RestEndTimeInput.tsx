/**
 * 休憩終了時刻入力コンポーネント。
 * ネイティブの時刻入力で、休憩終了時刻を選択・編集できる。
 * デフォルトの昼休憩終了時刻をChipで選択可能。
 *
 * @packageDocumentation
 */

import QuickInputChips from "@shared/ui/inputs/QuickInputChips";
import { TimeInput } from "@shared/ui/TimeInput";
import dayjs from "dayjs";
import { useContext } from "react";
import { FieldArrayWithId, UseFieldArrayUpdate } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

/**
 * RestEndTimeInputのプロパティ型定義。
 */
type RestEndTimeInputProps = {
  /**
   * 勤務日(dayjsオブジェクト)
   */
  workDate: dayjs.Dayjs;
  /**
   * 休憩データ
   */
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  /**
   * 休憩配列のインデックス
   */
  index: number;
  /**
   * 休憩データの更新関数
   */
  restUpdate: UseFieldArrayUpdate<AttendanceEditInputs, "rests">;
  testIdPrefix?: string;
};

/**
 * 休憩終了時刻入力用コンポーネント。
 *
 * @param props RestEndTimeInputProps
 * @returns JSX.Element
 */
export default function RestEndTimeInput({
  workDate,
  rest,
  index,
  restUpdate,
  testIdPrefix = "mobile",
}: RestEndTimeInputProps) {
  const { getLunchRestEndTime } = useContext(AppConfigContext);

  const lunchRestEndTime = getLunchRestEndTime().format("H:mm");

  return (
    <div className="flex flex-col gap-2">
        <TimeInput
          value={rest.endTime ?? null}
          baseDate={workDate.format("YYYY-MM-DD")}
          size="small"
          step={60}
          data-testid={"rest-end-time-input-" + testIdPrefix + "-" + index}
          onChange={(formattedEndTime) => {
            restUpdate(index, { ...rest, endTime: formattedEndTime });
          }}
        />
        <div>
          <DefaultEndTimeChip
            index={index}
            workDate={workDate}
            restUpdate={restUpdate}
            rest={rest}
            lunchRestEndTime={lunchRestEndTime}
          />
        </div>
    </div>
  );
}

/**
 * デフォルトの昼休憩終了時刻を選択するChipコンポーネント。
 *
 * @param props index, workDate, restUpdate, rest, lunchRestEndTime
 * @returns JSX.Element
 */
function DefaultEndTimeChip({
  index,
  workDate,
  restUpdate,
  rest,
  lunchRestEndTime,
}: {
  index: number;
  workDate: dayjs.Dayjs;
  restUpdate: UseFieldArrayUpdate<AttendanceEditInputs, "rests">;
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  lunchRestEndTime: string;
}): JSX.Element {
  return (
    <QuickInputChips
      quickInputTimes={[{ time: lunchRestEndTime, enabled: true }]}
      workDate={workDate}
      onSelectTime={() => {
        const endTime = new AttendanceDateTime()
          .setDate(workDate)
          .setRestEnd()
          .toISOString();
        restUpdate(index, { ...rest, endTime });
      }}
    />
  );
}
