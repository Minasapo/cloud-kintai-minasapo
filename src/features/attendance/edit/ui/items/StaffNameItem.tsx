import { useAttendanceEditData } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function StaffNameItem() {
  const { staff } = useAttendanceEditData();

  if (!staff?.familyName && !staff?.givenName) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className="w-[150px] text-sm font-bold text-slate-900">スタッフ</div>
      <div className="text-sm text-slate-900">{`${staff.familyName} ${staff.givenName}`}</div>
    </div>
  );
}
