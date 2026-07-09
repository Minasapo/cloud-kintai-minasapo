import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { AppIconButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

type MoveDateItemProps = {
  workDate: dayjs.Dayjs;
};

export default function MoveDateItem({ workDate }: MoveDateItemProps) {
  const navigate = useNavigate();

  const handlePrevDay = () => {
    const prevDay = workDate.subtract(1, "day");
    navigate(
      `/admin/attendances/${prevDay.format(AttendanceDate.QueryParamFormat)}`,
    );
  };

  const handleNextDay = () => {
    const nextDay = workDate.add(1, "day");
    navigate(
      `/admin/attendances/${nextDay.format(AttendanceDate.QueryParamFormat)}`,
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AppIconButton
        onClick={handlePrevDay}
        aria-label="前日へ移動"
        tone="neutral"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-600 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
      >
        <ArrowBackIcon fontSize="small" />
      </AppIconButton>
      <AppTextField
        type="date"
        value={workDate.format("YYYY-MM-DD")}
        onChange={(event) => {
          const date = dayjs(event.target.value);
          if (date.isValid()) {
            navigate(
              `/admin/attendances/${date.format(AttendanceDate.QueryParamFormat)}`,
            );
          }
        }}
        size="small"
        sx={{
          minWidth: 142,
          "& .MuiOutlinedInput-root": {
            borderRadius: "18px",
            backgroundColor: "rgb(255 255 255)",
            "& fieldset": {
              borderColor: "rgb(203 213 225 / 0.7)",
            },
            "&:hover fieldset": {
              borderColor: "rgb(148 163 184)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgb(16 185 129)",
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "10px 16px",
            fontSize: "0.875rem",
            color: "rgb(15 23 42)",
          },
        }}
      />
      <AppIconButton
        onClick={handleNextDay}
        aria-label="翌日へ移動"
        tone="neutral"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300/70 bg-white text-slate-600 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.18)] transition hover:bg-slate-50"
      >
        <ArrowForwardIcon fontSize="small" />
      </AppIconButton>
    </div>
  );
}
