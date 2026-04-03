import { useGetAttendanceByStaffAndDateQuery } from "@entities/attendance/api/attendanceApi";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import AttendanceOperationLogHistory from "@/features/attendance/edit/ui/AttendanceOperationLogHistory";
import { PageContent } from "@/shared/ui/layout";

export default function AdminAttendanceHistory(): JSX.Element {
  const { targetWorkDate, staffId } = useParams();
  const workDate = targetWorkDate
    ? dayjs(targetWorkDate).format(AttendanceDate.DataFormat)
    : "";

  const { data: attendance, isLoading, error } = useGetAttendanceByStaffAndDateQuery(
    {
      staffId: staffId ?? "",
      workDate,
    },
    {
      skip: !staffId || !targetWorkDate,
    },
  );

  return (
    <PageContent width="dashboard" className="pt-1">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="m-0 text-xl font-semibold text-slate-900">勤怠履歴</h1>
          <p className="mt-2 text-sm text-slate-600">
            {workDate || "-"} の canonical log を表示します。新形式ログが無い場合のみ legacy history を表示します。
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-slate-500">履歴を読み込み中です...</div>
        ) : error ? (
          <div className="text-sm text-rose-600">
            履歴の取得に失敗しました。
          </div>
        ) : (
          <AttendanceOperationLogHistory attendance={attendance} />
        )}
      </div>
    </PageContent>
  );
}
