import { getWorkTypeLabel } from "@/entities/staff/lib/workTypeOptions";
import { useAttendanceEditData } from "@/features/attendance/edit/model/AttendanceEditProvider";

export default function WorkTypeItem() {
  const { staff } = useAttendanceEditData();

  if (!staff) {
    return null;
  }

  const workTypeValue = (staff as unknown as Record<string, unknown>)
    .workType as string | null | undefined;

  const label = getWorkTypeLabel(workTypeValue);

  if (!label) return null;

  return (
    <div className="flex items-center">
      <div className="w-[150px] font-bold text-slate-900">勤務形態</div>
      <div className="text-base text-slate-900">{label}</div>
    </div>
  );
}
