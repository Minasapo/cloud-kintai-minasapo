import { useContext } from "react";

import { AttendanceEditContext } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function NoDataAlert() {
  const { attendance } = useContext(AttendanceEditContext);

  if (attendance !== null) {
    return null;
  }

  return (
    <div className="rounded-[18px] border border-sky-200/70 bg-sky-50/80 px-4 py-3">
      <div className="text-sm font-semibold text-sky-900">お知らせ</div>
      <div className="mt-1 text-sm leading-6 text-sky-900">
        指定された日付に勤怠情報の登録がありませんでした。保存時に新規作成されます。
      </div>
    </div>
  );
}
