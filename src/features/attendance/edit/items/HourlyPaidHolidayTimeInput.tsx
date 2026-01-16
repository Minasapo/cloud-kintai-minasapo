import { Stack } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/pages/attendance/edit/common";

/**
 * 時間単位休暇の開始/終了時刻を入力するための共通コンポーネント。
 * TimePickerを使用し、24時間形式で時刻を入力します。
 */

interface HourlyPaidHolidayTimeInputProps {
  /** 配列内のインデックス */
  index: number;
  /** 時間単位休暇の時間帯データ（未使用だが型チェックのために保持） */
  time: FieldArrayWithId<AttendanceEditInputs, "hourlyPaidHolidayTimes", "id">;
  /** フィールド名（開始時刻または終了時刻） */
  fieldKey: "startTime" | "endTime";
  /** 入力フィールドのラベル */
  label?: string;
}

export default function HourlyPaidHolidayTimeInput({
  index,
  fieldKey,
  label,
}: HourlyPaidHolidayTimeInputProps) {
  const { workDate, control, changeRequests, readOnly } = useContext(
    AttendanceEditContext
  );

  if (!workDate || !control) {
    return null;
  }

  /**
   * 時刻を勤務日の年月日に合わせてISO形式に変換する。
   * @param time - 入力された時刻
   * @param workDate - 勤務日
   * @returns ISO形式の日時文字列
   */
  const formatTimeToISO = (
    time: dayjs.Dayjs,
    workDate: dayjs.Dayjs
  ): string => {
    return time
      .year(workDate.year())
      .month(workDate.month())
      .date(workDate.date())
      .second(0)
      .millisecond(0)
      .toISOString();
  };

  return (
    <Stack spacing={1}>
      <Controller
        name={`hourlyPaidHolidayTimes.${index}.${fieldKey}`}
        control={control}
        render={({ field }) => (
          <TimePicker
            value={field.value ? dayjs(field.value) : null}
            disabled={changeRequests.length > 0 || !!readOnly}
            ampm={false}
            slotProps={{ textField: { size: "small", label } }}
            onChange={(newTime) => {
              if (!newTime) {
                // ピッカーがクリアされた場合は値をnullに設定
                field.onChange(null);
                return;
              }

              if (!newTime.isValid()) {
                // 入力された値が有効な時刻になるまでフォーム値を更新しない
                return;
              }

              // 勤務日の年月日に入力された時刻を設定
              const formattedTime = formatTimeToISO(newTime, workDate);

              // 直接入力（テキスト入力）が反映されるよう、入力中もフォーム値を更新
              field.onChange(formattedTime);
            }}
            onAccept={(newTime) => {
              if (newTime && !newTime.isValid()) {
                return;
              }

              // ピッカーで選択確定時の処理
              const formattedTime = newTime
                ? formatTimeToISO(newTime, workDate)
                : null;

              // FieldArrayのupdateではなく、Controllerの値のみ更新
              // これにより他のフィールド（startTime/endTime）が上書きされるのを防ぐ
              field.onChange(formattedTime);
            }}
          />
        )}
      />
    </Stack>
  );
}
