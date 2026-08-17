import { AuthContext } from "@app/providers/auth/AuthContext";
import { AttendanceDate } from "@entities/attendance/lib/AttendanceDate";
import useCloseDates from "@entities/attendance/model/useCloseDates";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { STANDARD_PADDING } from "@shared/config/uiDimensions";
import { designTokenVar } from "@shared/designSystem";
import { AppButton } from "@shared/ui/button";
import { AppRadio, AppSelect, AppTextField } from "@shared/ui/form";
import { AppStepper } from "@shared/ui/stepper";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

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

type PeriodSelectionMode = "customRange" | "closeMonth";

type ExpandedDownloadPanelProps = {
  closeDates: CloseDateItem[];
  closeMonthSelectLabelId: string;
  selectedCloseDate: string;
  selectedPeriodMode: PeriodSelectionMode;
  setSelectedPeriodMode: (value: PeriodSelectionMode) => void;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (value: StaffType[]) => void;
  onDetailDownload: () => void;
  onAggregateDownload: () => void;
  detailDownloadDisabled: boolean;
  aggregateDownloadDisabled: boolean;
};

type PeriodSelectionStepProps = {
  closeDates: CloseDateItem[];
  closeMonthSelectLabelId: string;
  selectedCloseDate: string;
  selectedPeriodMode: PeriodSelectionMode;
  setSelectedPeriodMode: (value: PeriodSelectionMode) => void;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
};

type DownloadActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
};

const formatInputDate = (value: dayjs.Dayjs) => value.format("YYYY-MM-DD");
const MAIN_GREEN = designTokenVar(
  "color.feedback.success.base",
  "rgb(16 185 129)",
);
const MAIN_GREEN_DARK = "rgb(5 150 105)";
const INPUT_SURFACE = "rgb(255 255 255)";
const DOWNLOAD_FLOW_STEPS = [
  { key: "period", label: "期間を選択" },
  { key: "staff", label: "対象者を選択" },
  { key: "execute", label: "ダウンロード実行" },
] as const;

function ExpandedDownloadPanel({
  closeDates,
  closeMonthSelectLabelId,
  selectedCloseDate,
  selectedPeriodMode,
  setSelectedPeriodMode,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  staffs,
  selectedStaff,
  setSelectedStaff,
  onDetailDownload,
  onAggregateDownload,
  detailDownloadDisabled,
  aggregateDownloadDisabled,
}: ExpandedDownloadPanelProps) {
  const [displayStep, setDisplayStep] = useState(0);
  const hasValidRange =
    dayjs(startDate).isValid() &&
    dayjs(endDate).isValid() &&
    !dayjs(startDate).isAfter(dayjs(endDate));
  const hasSelectedStaff = selectedStaff.length > 0;
  const isDownloadDisabled =
    detailDownloadDisabled && aggregateDownloadDisabled;
  const completedSteps = [
    ...(hasValidRange ? [0] : []),
    ...(hasSelectedStaff ? [1] : []),
    ...(!isDownloadDisabled ? [2] : []),
  ];
  const canGoNext =
    (displayStep === 0 && hasValidRange) ||
    (displayStep === 1 && hasSelectedStaff);
  const isFirstStep = displayStep === 0;
  const isLastStep = displayStep === DOWNLOAD_FLOW_STEPS.length - 1;

  const handlePrevStep = () => {
    setDisplayStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNextStep = () => {
    if (!canGoNext) {
      return;
    }
    setDisplayStep((prev) =>
      Math.min(prev + 1, DOWNLOAD_FLOW_STEPS.length - 1),
    );
  };

  return (
    <div id="attendance-download-panel" className="w-full">
      <div className="mx-auto flex w-full max-w-[880px] min-w-0 flex-col gap-6 px-1 sm:px-2 md:px-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-4 shadow-sm sm:px-4">
          <AppStepper
            steps={DOWNLOAD_FLOW_STEPS}
            activeStep={displayStep}
            completedSteps={completedSteps}
            sx={{
              "& .MuiStepLabel-label": {
                fontSize: "0.85rem",
              },
            }}
          />
        </div>

        {displayStep === 0 && (
          <PeriodSelectionStep
            closeDates={closeDates}
            closeMonthSelectLabelId={closeMonthSelectLabelId}
            selectedCloseDate={selectedCloseDate}
            selectedPeriodMode={selectedPeriodMode}
            setSelectedPeriodMode={setSelectedPeriodMode}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        )}

        {displayStep === 1 && (
          <StaffSelector
            staffs={staffs}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
          />
        )}

        {displayStep === 2 && (
          <DownloadExecutionStep
            onDetailDownload={onDetailDownload}
            onAggregateDownload={onAggregateDownload}
            detailDownloadDisabled={detailDownloadDisabled}
            aggregateDownloadDisabled={aggregateDownloadDisabled}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <AppButton
            variant="outline"
            tone="secondary"
            size="sm"
            onClick={handlePrevStep}
            disabled={isFirstStep}
            className="min-w-0"
          >
            戻る
          </AppButton>
          {!isLastStep && (
            <AppButton
              variant="solid"
              tone="primary"
              size="sm"
              onClick={handleNextStep}
              disabled={!canGoNext}
              className="min-w-0"
            >
              次へ
            </AppButton>
          )}
        </div>
      </div>
    </div>
  );
}

function PeriodSelectionStep({
  closeDates,
  closeMonthSelectLabelId,
  selectedCloseDate,
  selectedPeriodMode,
  setSelectedPeriodMode,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: PeriodSelectionStepProps) {
  const isCustomRangeSelected = selectedPeriodMode === "customRange";
  const isCloseMonthSelected = selectedPeriodMode === "closeMonth";

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5"
      role="radiogroup"
      aria-label="期間の指定方法"
    >
      <div
        className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
          isCustomRangeSelected
            ? "border-emerald-300/90 bg-emerald-50/70 shadow-emerald-100"
            : "border-slate-300/90 bg-slate-100/85 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
            isCustomRangeSelected
              ? "from-emerald-100/70 via-transparent to-teal-100/40 opacity-100"
              : "from-slate-100/0 via-transparent to-slate-200/20 opacity-70 group-hover:opacity-100"
          }`}
        />
        <label className="relative z-10 flex cursor-pointer items-start justify-between gap-3 rounded-xl px-1 py-1 text-left">
          <div className="flex items-start gap-3">
            <AppRadio
              name="attendance-download-period-mode"
              checked={isCustomRangeSelected}
              onChange={() => setSelectedPeriodMode("customRange")}
              value="customRange"
              sx={{ mt: -0.5 }}
            />
            <div>
              <span
                className={`whitespace-nowrap text-sm font-semibold ${
                  isCustomRangeSelected ? "text-slate-800" : "text-slate-600"
                }`}
              >
                指定した期間から
              </span>
              <p
                className={`mt-1 text-xs leading-5 ${
                  isCustomRangeSelected ? "text-slate-500" : "text-slate-400"
                }`}
              >
                開始日と終了日を自由に指定して出力できます
              </p>
            </div>
          </div>
          {isCustomRangeSelected && (
            <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              選択中
            </span>
          )}
        </label>
        <div className="relative z-10 mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div
            className={`flex-1 transition-opacity ${
              isCustomRangeSelected ? "opacity-100" : "opacity-40"
            }`}
          >
            <AppTextField
              type="date"
              value={startDate}
              onChange={(event) => {
                setSelectedPeriodMode("customRange");
                setStartDate(event.target.value);
              }}
              disabled={!isCustomRangeSelected}
              size="small"
              fullWidth
              inputProps={{ "aria-label": "開始日" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: INPUT_SURFACE,
                },
              }}
            />
          </div>
          <div className="hidden h-11 items-center text-slate-400 sm:flex">
            〜
          </div>
          <div
            className={`flex-1 transition-opacity ${
              isCustomRangeSelected ? "opacity-100" : "opacity-40"
            }`}
          >
            <AppTextField
              type="date"
              value={endDate}
              onChange={(event) => {
                setSelectedPeriodMode("customRange");
                setEndDate(event.target.value);
              }}
              disabled={!isCustomRangeSelected}
              size="small"
              fullWidth
              inputProps={{ "aria-label": "終了日" }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: INPUT_SURFACE,
                },
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
          isCloseMonthSelected
            ? "border-emerald-300/90 bg-emerald-50/70 shadow-emerald-100"
            : "border-slate-300/90 bg-slate-100/85 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
            isCloseMonthSelected
              ? "from-emerald-100/70 via-transparent to-teal-100/40 opacity-100"
              : "from-slate-100/0 via-transparent to-slate-200/20 opacity-70 group-hover:opacity-100"
          }`}
        />
        <label className="relative z-10 flex cursor-pointer items-start justify-between gap-3 rounded-xl px-1 py-1 text-left">
          <div className="flex items-start gap-3">
            <AppRadio
              name="attendance-download-period-mode"
              checked={isCloseMonthSelected}
              onChange={() => setSelectedPeriodMode("closeMonth")}
              value="closeMonth"
              sx={{ mt: -0.5 }}
            />
            <div>
              <span
                className={`whitespace-nowrap text-sm font-semibold ${
                  isCloseMonthSelected ? "text-slate-800" : "text-slate-600"
                }`}
              >
                集計対象月から
              </span>
              <p
                className={`mt-1 text-xs leading-5 ${
                  isCloseMonthSelected ? "text-slate-500" : "text-slate-400"
                }`}
              >
                締め日設定に基づく対象月を選んで出力します
              </p>
            </div>
          </div>
          {isCloseMonthSelected && (
            <span className="rounded-full bg-emerald-600/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              選択中
            </span>
          )}
        </label>
        <div
          className={`relative z-10 mt-2 flex flex-col gap-2 sm:flex-row sm:items-center ${
            isCloseMonthSelected ? "opacity-100" : "opacity-45"
          }`}
        >
          <AppSelect<string>
            label="対象月"
            labelId={closeMonthSelectLabelId}
            value={selectedCloseDate}
            onChange={(value) => {
              setSelectedPeriodMode("closeMonth");
              const closeDate = closeDates.find(
                (item) => item.closeDate === value,
              );
              if (!closeDate) return;
              setStartDate(formatInputDate(dayjs(closeDate.startDate)));
              setEndDate(formatInputDate(dayjs(closeDate.endDate)));
            }}
            disabled={!isCloseMonthSelected}
            options={[
              { value: "", label: "対象月を選択" },
              ...closeDates
                .toSorted((a, b) => dayjs(b.closeDate).diff(dayjs(a.closeDate)))
                .map((closeDate) => ({
                  value: closeDate.closeDate,
                  label: dayjs(closeDate.closeDate).format("YYYY/MM"),
                })),
            ]}
            sx={{
              minWidth: 0,
              flex: 1,
              "& .MuiOutlinedInput-root": {
                backgroundColor: INPUT_SURFACE,
              },
            }}
          />
        </div>
        <p className="relative z-10 text-sm leading-6 text-slate-600">
          集計対象月は
          <RouterLink
            to="/admin/master/job_term"
            className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-600"
          >
            設定画面
          </RouterLink>
          より編集可能です
        </p>
      </div>
    </div>
  );
}

function DownloadActionCard({
  title,
  description,
  buttonLabel,
  onClick,
  disabled,
}: DownloadActionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-300/90 bg-slate-100/85 p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-sm">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-100/0 via-transparent to-slate-200/20 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative z-10 flex h-full flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <AppButton
          variant="solid"
          tone="primary"
          size="md"
          onClick={onClick}
          disabled={disabled}
          className="w-full"
          sx={{
            mt: "auto",
            "--variant-containedBg": MAIN_GREEN,
            "&:hover": {
              "--variant-containedBg": MAIN_GREEN_DARK,
            },
          }}
        >
          {buttonLabel}
        </AppButton>
      </div>
    </div>
  );
}

function DownloadExecutionStep({
  onDetailDownload,
  onAggregateDownload,
  detailDownloadDisabled,
  aggregateDownloadDisabled,
}: {
  onDetailDownload: () => void;
  onAggregateDownload: () => void;
  detailDownloadDisabled: boolean;
  aggregateDownloadDisabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <DownloadActionCard
        title="一括ダウンロード"
        description="選択した期間と対象者の勤怠データをまとめて出力します。"
        buttonLabel="一括ダウンロード"
        onClick={onDetailDownload}
        disabled={detailDownloadDisabled}
      />
      <DownloadActionCard
        title="集計ダウンロード"
        description="選択した期間と対象者の集計結果を出力します。"
        buttonLabel="集計ダウンロード"
        onClick={onAggregateDownload}
        disabled={aggregateDownloadDisabled}
      />
    </div>
  );
}
type DownloadFormProps = {
  mode?: "inline" | "dialog";
};

export default function DownloadForm({ mode = "inline" }: DownloadFormProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffType[]>([]);
  const [selectedPeriodMode, setSelectedPeriodMode] =
    useState<PeriodSelectionMode>("customRange");
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
          selectedPeriodMode={selectedPeriodMode}
          setSelectedPeriodMode={setSelectedPeriodMode}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          onDetailDownload={onDetailDownload}
          onAggregateDownload={onAggregateDownload}
          detailDownloadDisabled={detailDownloadDisabled}
          aggregateDownloadDisabled={aggregateDownloadDisabled}
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
          selectedPeriodMode={selectedPeriodMode}
          setSelectedPeriodMode={setSelectedPeriodMode}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          onDetailDownload={onDetailDownload}
          onAggregateDownload={onAggregateDownload}
          detailDownloadDisabled={detailDownloadDisabled}
          aggregateDownloadDisabled={aggregateDownloadDisabled}
        />
      )}
    </div>
  );
}
