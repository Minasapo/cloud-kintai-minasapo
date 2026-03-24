import { useContext } from "react";

import { AttendanceDateTime } from "@/entities/attendance/lib/AttendanceDateTime";
import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export function LunchRestTimeNotSetWarning({
  targetWorkDate,
}: {
  targetWorkDate: string | undefined;
}) {
  const { restAppend } = useContext(AttendanceEditContext);

  const handleButtonClick = () => {
    if (!targetWorkDate || !restAppend) {
      return;
    }

    restAppend({
      startTime: new AttendanceDateTime()
        .setDateString(targetWorkDate)
        .setRestStart()
        .toISOString(),
      endTime: new AttendanceDateTime()
        .setDateString(targetWorkDate)
        .setRestEnd()
        .toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 md:flex-row md:items-center md:justify-between">
      <p className="m-0 leading-6">
        勤務時間が6時間を超えています。休憩時間を確認をしてください。
      </p>
      <button
        type="button"
        onClick={handleButtonClick}
        className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        昼休みを追加
      </button>
    </div>
  );
}
