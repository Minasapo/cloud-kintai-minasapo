import { AuthContext } from "@app/providers/auth/AuthContext";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { STANDARD_PADDING } from "@shared/config/uiDimensions";
import { designTokenVar } from "@shared/designSystem";
import {
  AppButton,
  AppSplitButton,
  type AppSplitButtonOption,
} from "@shared/ui/button";
import { AppSelect, AppTextField } from "@shared/ui/form";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAggregateExportAction } from "./AggregateExportButton";
import { useExportAttendancesAction } from "./ExportButton";
import StaffSelector from "./StaffSelector";

export type Inputs = {
  startDate: dayjs.Dayjs | undefined;
  endDate: dayjs.Dayjs | undefined;
  staffs: StaffType[];
};
type CloseDateItem = {
  closeDate: string;
  startDate: string;
  endDate: string;
};

type ExpandedDownloadPanelProps = {
  closeDates: CloseDateItem[];
  closeMonthSelectLabelId: string;
  selectedCloseDate: string;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  navigate: ReturnType<typeof useNavigate>;
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (value: StaffType[]) => void;
  workDates: string[];
};

const formatInputDate = (value: dayjs.Dayjs) => value.format("YYYY-MM-DD");
const MAIN_GREEN = designTokenVar(
  "color.feedback.success.base",
  "rgb(16 185 129)",
);
const MAIN_GREEN_DARK = "rgb(5 150 105)";
const DOWNLOAD_OPTIONS: AppSplitButtonOption[] = [
  { key: "aggregate", label: "集計ダウンロード" },
  { key: "detail", label: "一括ダウンロード" },
];

function ExpandedDownloadPanel({
  closeDates,
  closeMonthSelectLabelId,
  selectedCloseDate,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  navigate,
  staffs,
  selectedStaff,
  setSelectedStaff,
  workDates,
}: ExpandedDownloadPanelProps) {
  const [selectedDownloadAction, setSelectedDownloadAction] =
    useState<string>("aggregate");
  const { onClick: onDetailDownload, disabled: detailDownloadDisabled } =
    useExportAttendancesAction({
      workDates,
      selectedStaff,
    });
  const { onClick: onAggregateDownload, disabled: aggregateDownloadDisabled } =
    useAggregateExportAction({
      workDates,
      selectedStaff,
    });
  const handleDownload = () => {
    if (selectedDownloadAction === "detail") {
      void onDetailDownload();
      return;
    }
    void onAggregateDownload();
  };

  return (
    <div id="attendance-download-panel" className="w-full">
      <div className="mx-auto flex w-full max-w-[880px] min-w-0 flex-col gap-6 px-1 sm:px-2 md:px-0">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <AppTextField
                label="開始日"
                InputLabelProps={{ shrink: true }}
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                size="small"
                fullWidth
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "rgb(71 85 105)",
                  },
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
            </div>
            <div className="hidden h-11 items-center text-slate-400 sm:flex">
              〜
            </div>
            <div className="flex-1">
              <AppTextField
                label="終了日"
                InputLabelProps={{ shrink: true }}
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                size="small"
                fullWidth
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "rgb(71 85 105)",
                  },
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
            </div>
          </div>

          <div className="flex max-w-[560px] flex-col gap-2">
            <div className="flex flex-col gap-2">
              <span className="whitespace-nowrap text-sm text-slate-600">
                集計対象月から:
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <AppSelect<string>
                  label="対象月"
                  labelId={closeMonthSelectLabelId}
                  value={selectedCloseDate}
                  onChange={(value) => {
                    const closeDate = closeDates.find(
                      (item) => item.closeDate === value,
                    );
                    if (!closeDate) return;
                    setStartDate(formatInputDate(dayjs(closeDate.startDate)));
                    setEndDate(formatInputDate(dayjs(closeDate.endDate)));
                  }}
                  options={[
                    { value: "", label: "対象月を選択" },
                    ...closeDates
                      .toSorted((a, b) =>
                        dayjs(b.closeDate).diff(dayjs(a.closeDate)),
                      )
                      .map((closeDate) => ({
                        value: closeDate.closeDate,
                        label: dayjs(closeDate.closeDate).format("YYYY/MM"),
                      })),
                  ]}
                  sx={{
                    minWidth: 0,
                    flex: 1,
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
                    "& .MuiSelect-select": {
                      padding: "10px 16px",
                      fontSize: "0.875rem",
                      color: "rgb(15 23 42)",
                    },
                  }}
                />
                <AppButton
                  variant="outline"
                  tone="secondary"
                  size="sm"
                  onClick={() => navigate("/admin/master/job_term")}
                  className="rounded-full whitespace-nowrap"
                  startIcon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
                  sx={{
                    boxShadow: "0 8px 24px -20px rgba(15, 23, 42, 0.18)",
                    borderColor: "rgb(203 213 225 / 0.7)",
                    color: "rgb(51 65 85)",
                    backgroundColor: "rgb(255 255 255)",
                    "&:hover": {
                      backgroundColor: "rgb(248 250 252)",
                    },
                  }}
                >
                  新規
                </AppButton>
              </div>
            </div>
          </div>
        </div>

        <StaffSelector
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
        />

        <div className="w-full">
          <AppSplitButton
            options={DOWNLOAD_OPTIONS}
            selectedKey={selectedDownloadAction}
            onSelectedKeyChange={setSelectedDownloadAction}
            onPrimaryClick={handleDownload}
            variant="solid"
            tone="primary"
            size="md"
            disabled={aggregateDownloadDisabled && detailDownloadDisabled}
            className="w-full"
            buttonGroupSx={{
              "& .MuiButton-containedPrimary": {
                "--variant-containedBg": MAIN_GREEN,
                "&:hover": {
                  "--variant-containedBg": MAIN_GREEN_DARK,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
type DownloadFormProps = {
  mode?: "inline" | "dialog";
};

export default function DownloadForm({ mode = "inline" }: DownloadFormProps) {
  const navigate = useNavigate();
  const [selectedStaff, setSelectedStaff] = useState<StaffType[]>([]);
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const [isExpanded, setIsExpanded] = useState(mode === "dialog");
  const {
    staffs,
    loading: staffLoading,
    error: staffError,
  } = useStaffs({
    isAuthenticated,
  });
  const {
    closeDates,
    loading: closeDateLoading,
    error: closeDateError,
  } = useCloseDates();
  const [startDate, setStartDate] = useState(formatInputDate(dayjs()));
  const [endDate, setEndDate] = useState(formatInputDate(dayjs()));
  const closeMonthSelectLabelId = "attendance-download-close-month-select";

  const workDates = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return [];
    }

    const dates: string[] = [];
    let date = start;
    while (date.isBefore(end) || date.isSame(end, "day")) {
      dates.push(date.format(AttendanceDate.DataFormat));
      date = date.add(1, "day");
    }
    return dates;
  }, [startDate, endDate]);

  const selectedCloseDate = useMemo(() => {
    const matched = closeDates.find(
      (closeDate) =>
        formatInputDate(dayjs(closeDate.startDate)) === startDate &&
        formatInputDate(dayjs(closeDate.endDate)) === endDate,
    );
    return matched?.closeDate ?? "";
  }, [closeDates, endDate, startDate]);

  if (staffLoading || closeDateLoading) {
    return (
      <div className="flex justify-center py-8 text-sm text-slate-500">
        読み込み中...
      </div>
    );
  }

  if (staffError || closeDateError) {
    return (
      <div className="rounded-[18px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-900">
        エラーが発生しました
      </div>
    );
  }

  if (mode === "dialog") {
    return (
      <div
        className="w-full min-w-0"
        style={{ paddingBottom: STANDARD_PADDING.CARD }}
      >
        <ExpandedDownloadPanel
          closeDates={closeDates}
          closeMonthSelectLabelId={closeMonthSelectLabelId}
          selectedCloseDate={selectedCloseDate}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          navigate={navigate}
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          workDates={workDates}
        />
      </div>
    );
  }

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden"
      style={{ paddingBottom: STANDARD_PADDING.CARD }}
    >
      <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[1.05rem] font-bold text-slate-900">
            ダウンロード
          </div>
          <div className="mt-0.5 text-[0.92rem] leading-7 text-slate-500">
            期間と対象スタッフを選択して、勤怠データを出力できます。
          </div>
        </div>
        <div className="self-end sm:self-center">
          <AppButton
            variant="outline"
            tone="primary"
            size="sm"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="min-w-0 rounded-full"
            sx={{
              "--variant-outlinedColor": MAIN_GREEN,
              "--variant-outlinedBorder": "rgba(16, 185, 129, 0.5)",
              "--variant-outlinedBg": "rgba(16, 185, 129, 0.04)",
              "&:hover": {
                "--variant-outlinedBorder": MAIN_GREEN_DARK,
                "--variant-outlinedBg": "rgba(16, 185, 129, 0.1)",
              },
            }}
            aria-label={
              isExpanded
                ? "ダウンロード要素を折りたたむ"
                : "ダウンロード要素を展開する"
            }
            aria-expanded={isExpanded}
            aria-controls="attendance-download-panel"
            endIcon={
              isExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )
            }
          >
            {isExpanded ? "折りたたむ" : "展開する"}
          </AppButton>
        </div>
      </div>

      {isExpanded && (
        <ExpandedDownloadPanel
          closeDates={closeDates}
          closeMonthSelectLabelId={closeMonthSelectLabelId}
          selectedCloseDate={selectedCloseDate}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          navigate={navigate}
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          workDates={workDates}
        />
      )}
    </div>
  );
}
