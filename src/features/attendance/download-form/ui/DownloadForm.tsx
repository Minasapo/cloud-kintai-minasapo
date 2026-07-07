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
import {
  AppButton,
  AppSplitButton,
  type AppSplitButtonOption,
} from "@shared/ui/button";
import { AppSelect, AppTextField } from "@shared/ui/form";
import { AppStepper } from "@shared/ui/stepper";
import dayjs from "dayjs";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type ExpandedDownloadPanelProps = {
  closeDates: CloseDateItem[];
  closeMonthSelectLabelId: string;
  selectedCloseDate: string;
  startDate: string;
  endDate: string;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  staffs: StaffType[];
  selectedStaff: StaffType[];
  setSelectedStaff: (value: StaffType[]) => void;
  selectedDownloadAction: string;
  setSelectedDownloadAction: (value: string) => void;
  onDownload: () => void;
  isDownloadDisabled: boolean;
  showDownloadButton?: boolean;
};

export type DownloadFormDialogActionState = {
  selectedDownloadAction: string;
  setSelectedDownloadAction: (value: string) => void;
  onDownload: () => void;
  isDownloadDisabled: boolean;
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
const DOWNLOAD_FLOW_STEPS = [
  { key: "period", label: "期間を選択" },
  { key: "staff", label: "対象者を選択" },
  { key: "execute", label: "ダウンロード実行" },
] as const;

function ExpandedDownloadPanel({
  closeDates,
  closeMonthSelectLabelId,
  selectedCloseDate,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  staffs,
  selectedStaff,
  setSelectedStaff,
  selectedDownloadAction,
  setSelectedDownloadAction,
  onDownload,
  isDownloadDisabled,
  showDownloadButton = true,
}: ExpandedDownloadPanelProps) {
  const [displayStep, setDisplayStep] = useState(0);
  const hasValidRange =
    dayjs(startDate).isValid() &&
    dayjs(endDate).isValid() &&
    !dayjs(startDate).isAfter(dayjs(endDate));
  const hasSelectedStaff = selectedStaff.length > 0;
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm">
              <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                指定した期間から
              </span>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <AppTextField
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ "aria-label": "開始日" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                </div>
                <div className="hidden h-11 items-center text-slate-400 sm:flex">
                  〜
                </div>
                <div className="flex-1">
                  <AppTextField
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ "aria-label": "終了日" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 shadow-sm">
              <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                集計対象月から
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
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </div>
              <p className="text-sm leading-6 text-slate-600">
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
        )}

        {displayStep === 1 && (
          <StaffSelector
            staffs={staffs}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
          />
        )}

        {displayStep === 2 && (
          <>
            {showDownloadButton ? (
              <div className="w-full">
                <AppSplitButton
                  options={DOWNLOAD_OPTIONS}
                  selectedKey={selectedDownloadAction}
                  onSelectedKeyChange={setSelectedDownloadAction}
                  onPrimaryClick={onDownload}
                  variant="solid"
                  tone="primary"
                  size="md"
                  disabled={isDownloadDisabled}
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
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
                ダウンロード種別を選択後、ダイアログ下部の実行ボタンで出力してください。
              </div>
            )}
          </>
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
type DownloadFormProps = {
  mode?: "inline" | "dialog";
  onDialogActionStateChange?: (
    state: DownloadFormDialogActionState | null,
  ) => void;
};

export default function DownloadForm({
  mode = "inline",
  onDialogActionStateChange,
}: DownloadFormProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffType[]>([]);
  const [selectedDownloadAction, setSelectedDownloadAction] =
    useState<string>("detail");
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

  // デフォルトで全員を選択状態に設定
  useEffect(() => {
    if (staffs.length > 0 && selectedStaff.length === 0) {
      setSelectedStaff(staffs);
    }
  }, [staffs, selectedStaff.length]);

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
  const isDownloadDisabled =
    aggregateDownloadDisabled && detailDownloadDisabled;

  const handleDownload = useCallback(() => {
    if (selectedDownloadAction === "detail") {
      void onDetailDownload();
      return;
    }
    void onAggregateDownload();
  }, [onAggregateDownload, onDetailDownload, selectedDownloadAction]);
  const handleDownloadRef = useRef(handleDownload);

  useEffect(() => {
    handleDownloadRef.current = handleDownload;
  }, [handleDownload]);

  const handleDownloadFromDialogActions = useCallback(() => {
    handleDownloadRef.current();
  }, []);

  useEffect(() => {
    if (mode !== "dialog") {
      return;
    }
    onDialogActionStateChange?.({
      selectedDownloadAction,
      setSelectedDownloadAction,
      onDownload: handleDownloadFromDialogActions,
      isDownloadDisabled,
    });
  }, [
    handleDownloadFromDialogActions,
    isDownloadDisabled,
    mode,
    onDialogActionStateChange,
    selectedDownloadAction,
  ]);

  useEffect(() => {
    return () => {
      onDialogActionStateChange?.(null);
    };
  }, [onDialogActionStateChange]);

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
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          selectedDownloadAction={selectedDownloadAction}
          setSelectedDownloadAction={setSelectedDownloadAction}
          onDownload={handleDownload}
          isDownloadDisabled={isDownloadDisabled}
          showDownloadButton={false}
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
          staffs={staffs}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          selectedDownloadAction={selectedDownloadAction}
          setSelectedDownloadAction={setSelectedDownloadAction}
          onDownload={handleDownload}
          isDownloadDisabled={isDownloadDisabled}
        />
      )}
    </div>
  );
}
