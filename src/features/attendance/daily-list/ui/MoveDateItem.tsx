import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";

type MoveDateItemProps = {
  workDate: dayjs.Dayjs;
};

export default function MoveDateItem({ workDate }: MoveDateItemProps) {
  const navigate = useNavigate();

  const handlePrevDay = () => {
    const prevDay = workDate.subtract(1, "day");
    navigate(`/admin/attendances/${prevDay.format(AttendanceDate.QueryParamFormat)}`);
  };

  const handleNextDay = () => {
    const nextDay = workDate.add(1, "day");
    navigate(`/admin/attendances/${nextDay.format(AttendanceDate.QueryParamFormat)}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handlePrevDay}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-600 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
      >
        <ArrowBackIcon fontSize="small" />
      </button>
      <input
        type="date"
        value={workDate.format("YYYY-MM-DD")}
        onChange={(event) => {
          const date = dayjs(event.target.value);
          if (date.isValid()) {
            navigate(`/admin/attendances/${date.format(AttendanceDate.QueryParamFormat)}`);
          }
        }}
        className="rounded-[18px] border border-slate-300/70 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
      />
      <button
        type="button"
        onClick={handleNextDay}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-600 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
      >
        <ArrowForwardIcon fontSize="small" />
      </button>
    </div>
  );
}
