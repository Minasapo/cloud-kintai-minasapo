import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import PrintIcon from "@mui/icons-material/Print";
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { AppButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import PropTypes from "prop-types";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";

import { buildPrintHtml } from "../lib/printShiftHtml";
import { ShiftState } from "../types/collaborative.types";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface StaffInfo {
  id: string;
  familyName?: string;
  givenName?: string;
}

type PrintColorMode = "color" | "monochrome";

interface StaffSelectionSectionProps {
  staffs: StaffInfo[];
  selectedStaffIds: Set<string>;
  onSelectStaffs: (staffIds: string[]) => void;
  onUnselectStaffs: (staffIds: string[]) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

interface StepSectionProps {
  step: number;
  title: string;
  children: ReactNode;
  isLast?: boolean;
}

const StepSection = ({
  step,
  title,
  children,
  isLast = false,
}: StepSectionProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "36px minmax(0, 1fr)",
      columnGap: 1.5,
    }}
  >
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          bgcolor: "primary.main",
          color: "common.white",
          mt: 0.25,
        }}
      >
        {step}
      </Box>
      {!isLast && (
        <Box
          sx={{
            mt: 1,
            width: 2,
            flex: 1,
            minHeight: 24,
            bgcolor: "divider",
          }}
        />
      )}
    </Box>

    <Box sx={{ pb: isLast ? 0 : 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  </Box>
);

const StaffSelectionSection = ({
  staffs,
  selectedStaffIds,
  onSelectStaffs,
  onUnselectStaffs,
  onSelectAll,
  onClearAll,
}: StaffSelectionSectionProps) => {
  const [checkedStaffIds, setCheckedStaffIds] = useState<Set<string>>(
    new Set(),
  );
  const selectedCount = selectedStaffIds.size;
  const totalCount = staffs.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const availableStaffs = staffs.filter(
    (staff) => !selectedStaffIds.has(staff.id),
  );
  const selectedStaffs = staffs.filter((staff) =>
    selectedStaffIds.has(staff.id),
  );

  const handleCheckToggle = useCallback((staffId: string) => {
    setCheckedStaffIds((prev) => {
      const next = new Set(prev);
      if (next.has(staffId)) {
        next.delete(staffId);
      } else {
        next.add(staffId);
      }
      return next;
    });
  }, []);

  const checkedAvailableIds = availableStaffs
    .filter((staff) => checkedStaffIds.has(staff.id))
    .map((staff) => staff.id);
  const checkedSelectedIds = selectedStaffs
    .filter((staff) => checkedStaffIds.has(staff.id))
    .map((staff) => staff.id);

  const clearChecked = useCallback((staffIds: string[]) => {
    setCheckedStaffIds((prev) => {
      const next = new Set(prev);
      staffIds.forEach((id) => {
        next.delete(id);
      });
      return next;
    });
  }, []);

  const renderStaffList = (
    title: string,
    list: StaffInfo[],
    emptyText: string,
  ) => {
    const visibleRows = Math.min(Math.max(list.length, 3), 8);
    const estimatedRowHeight = 38;
    const listViewportHeight = visibleRows * estimatedRowHeight;

    return (
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          minHeight: { xs: 220, md: 252 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75 }}>
          {title} ({list.length})
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            minHeight: { xs: 144, md: 168 },
            maxHeight: {
              xs: Math.min(listViewportHeight, 260),
              md: Math.min(listViewportHeight + 24, 360),
            },
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {list.length === 0 && (
            <Typography variant="caption" color="text.disabled" sx={{ py: 1 }}>
              {emptyText}
            </Typography>
          )}

          {list.map((staff) => {
            const displayName =
              [staff.familyName, staff.givenName].filter(Boolean).join(" ") ||
              staff.id;

            return (
              <FormControlLabel
                key={staff.id}
                sx={{
                  mx: 0,
                  borderRadius: 1,
                  px: 0.5,
                  py: 0.25,
                  bgcolor: checkedStaffIds.has(staff.id)
                    ? "action.selected"
                    : "transparent",
                }}
                control={
                  <Checkbox
                    checked={checkedStaffIds.has(staff.id)}
                    onChange={() => handleCheckToggle(staff.id)}
                    size="small"
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.4,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                    title={displayName}
                  >
                    {displayName}
                  </Typography>
                }
              />
            );
          })}
        </Box>
      </Paper>
    );
  };

  const transferActionButtonSx = {
    justifyContent: "space-between",
    minHeight: 36,
    px: 1.25,
  } as const;

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) auto minmax(0, 1fr)",
          },
          gap: 1,
          mt: 1,
          alignItems: "stretch",
        }}
      >
        {renderStaffList(
          "選択済み",
          selectedStaffs,
          "選択済みスタッフはありません",
        )}

        <Stack
          direction="column"
          spacing={1}
          justifyContent="center"
          sx={{ px: 0.5, py: { xs: 0, md: 1 }, width: { xs: "100%", md: 176 } }}
        >
          <AppButton
            variant="solid"
            size="sm"
            fullWidth
            sx={transferActionButtonSx}
            startIcon={<KeyboardArrowLeftIcon />}
            onClick={() => {
              onSelectStaffs(checkedAvailableIds);
              clearChecked(checkedAvailableIds);
            }}
            disabled={checkedAvailableIds.length === 0}
          >
            追加
          </AppButton>
          <AppButton
            variant="solid"
            size="sm"
            fullWidth
            sx={transferActionButtonSx}
            endIcon={<KeyboardArrowRightIcon />}
            onClick={() => {
              onUnselectStaffs(checkedSelectedIds);
              clearChecked(checkedSelectedIds);
            }}
            disabled={checkedSelectedIds.length === 0}
          >
            戻す
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            fullWidth
            sx={transferActionButtonSx}
            startIcon={<KeyboardDoubleArrowLeftIcon />}
            onClick={onSelectAll}
            disabled={isAllSelected}
          >
            すべて追加
          </AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            fullWidth
            sx={transferActionButtonSx}
            endIcon={<KeyboardDoubleArrowRightIcon />}
            onClick={onClearAll}
            disabled={selectedCount === 0}
          >
            すべて戻す
          </AppButton>
        </Stack>

        {renderStaffList(
          "未選択",
          availableStaffs,
          "未選択スタッフはありません",
        )}
      </Box>
    </Box>
  );
};

interface RequiredSettingsStepperProps {
  startDate: string;
  endDate: string;
  filteredDaysCount: number;
  filteredStaffsCount: number;
  staffs: StaffInfo[];
  selectedStaffIds: Set<string>;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSelectStaffs: (staffIds: string[]) => void;
  onUnselectStaffs: (staffIds: string[]) => void;
  onSelectAllStaffs: () => void;
  onClearAllStaffs: () => void;
  isPrintDisabled: boolean;
  onPrint: () => void;
}

const RequiredSettingsStepper = ({
  startDate,
  endDate,
  filteredDaysCount,
  filteredStaffsCount: _filteredStaffsCount,
  staffs,
  selectedStaffIds,
  onStartDateChange,
  onEndDateChange,
  onSelectStaffs,
  onUnselectStaffs,
  onSelectAllStaffs,
  onClearAllStaffs,
  isPrintDisabled,
  onPrint,
}: RequiredSettingsStepperProps) => {
  const inputWhiteSx = {
    "& .MuiInputBase-root": {
      bgcolor: "common.white",
    },
  };

  return (
    <Box>
      <StepSection step={1} title="期間を選択">
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <AppTextField
            label="開始日"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={inputWhiteSx}
          />
          <AppTextField
            label="終了日"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={inputWhiteSx}
          />
          <Typography variant="caption" color="text.secondary">
            (選択: {filteredDaysCount}日)
          </Typography>
        </Box>
      </StepSection>

      <StepSection step={2} title="出力スタッフを選択">
        <StaffSelectionSection
          staffs={staffs}
          selectedStaffIds={selectedStaffIds}
          onSelectStaffs={onSelectStaffs}
          onUnselectStaffs={onUnselectStaffs}
          onSelectAll={onSelectAllStaffs}
          onClearAll={onClearAllStaffs}
        />
      </StepSection>

      <StepSection step={3} title="印刷する">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box>
            <AppButton
              onClick={onPrint}
              variant="solid"
              startIcon={<PrintIcon />}
              disabled={isPrintDisabled}
            >
              印刷する
            </AppButton>
          </Box>
        </Box>
      </StepSection>

      <StepSection step={4} title="完了" isLast>
        <Typography variant="caption" color="text.secondary">
          印刷プレビューが別ウィンドウで表示されます
        </Typography>
      </StepSection>
    </Box>
  );
};

interface OptionalSettingsPanelProps {
  colorMode: PrintColorMode;
  includeLegend: boolean;
  includeTimestamp: boolean;
  onColorModeChange: (value: PrintColorMode) => void;
  onIncludeLegendChange: (checked: boolean) => void;
  onIncludeTimestampChange: (checked: boolean) => void;
}

const OptionalSettingsPanel = ({
  colorMode,
  includeLegend,
  includeTimestamp,
  onColorModeChange,
  onIncludeLegendChange,
  onIncludeTimestampChange,
}: OptionalSettingsPanelProps) => (
  <Box
    sx={{
      p: 2,
      bgcolor: "common.white",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
      オプション
    </Typography>
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.75, display: "block" }}
      >
        配色モード
      </Typography>
      <ToggleButtonGroup
        value={colorMode}
        exclusive
        size="small"
        onChange={(_, value: PrintColorMode | null) => {
          if (value) {
            onColorModeChange(value);
          }
        }}
        aria-label="配色モード"
      >
        <ToggleButton value="color" aria-label="カラー">
          カラー
        </ToggleButton>
        <ToggleButton value="monochrome" aria-label="モノクロ">
          モノクロ
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={includeLegend}
            onChange={(e) => onIncludeLegendChange(e.target.checked)}
          />
        }
        label="凡例を含める"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={includeTimestamp}
            onChange={(e) => onIncludeTimestampChange(e.target.checked)}
          />
        }
        label="出力日時を含める"
      />
    </FormGroup>
  </Box>
);

interface PrintShiftDialogProps {
  open: boolean;
  onClose: () => void;
  days: Dayjs[];
  getEventsForDay: (day: Dayjs) => Array<{
    label: string;
    start: Dayjs;
    end?: Dayjs;
    color: string;
  }>;
  staffs: StaffInfo[];
  shiftDataMap: Map<
    string,
    Map<
      string,
      {
        state: ShiftState;
        isLocked: boolean;
      }
    >
  >;
  targetMonth: string;
}

/**
 * 印刷設定ダイアログコンポーネント
 * @description
 * シフト調整テーブルの印刷オプションを設定し、
 * 印刷プレビューを表示するダイアログ
 */
const PrintShiftDialogComponent = ({
  open,
  onClose,
  days,
  getEventsForDay,
  staffs,
  shiftDataMap,
  targetMonth,
}: PrintShiftDialogProps) => {
  // 印刷設定状態
  const [startDate, setStartDate] = useState<string>(
    dayjs(targetMonth).format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState<string>(
    dayjs(targetMonth).endOf("month").format("YYYY-MM-DD"),
  );
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(
    new Set(staffs.map((s) => s.id)),
  );
  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [colorMode, setColorMode] = useState<PrintColorMode>("color");
  const [_orientation, _setOrientation] = useState<"portrait" | "landscape">(
    "landscape",
  );

  // フィルタリングされた日付の計算
  const filteredDays = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return days.filter(
      (day) => day.isSameOrAfter(start) && day.isSameOrBefore(end),
    );
  }, [days, startDate, endDate]);

  // フィルタリングされたスタッフの計算
  const filteredStaffs = useMemo(
    () => staffs.filter((staff) => selectedStaffIds.has(staff.id)),
    [staffs, selectedStaffIds],
  );

  // スタッフ選択（追加）
  const handleSelectStaffs = useCallback((staffIds: string[]) => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      staffIds.forEach((staffId) => {
        next.add(staffId);
      });
      return next;
    });
  }, []);

  // スタッフ選択（解除）
  const handleUnselectStaffs = useCallback((staffIds: string[]) => {
    setSelectedStaffIds((prev) => {
      const next = new Set(prev);
      staffIds.forEach((staffId) => {
        next.delete(staffId);
      });
      return next;
    });
  }, []);

  // 全スタッフ選択
  const handleSelectAllStaffs = useCallback(() => {
    setSelectedStaffIds(new Set(staffs.map((s) => s.id)));
  }, [staffs]);

  const handleClearAllStaffs = useCallback(() => {
    setSelectedStaffIds(new Set());
  }, []);

  // 印刷実行
  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      pushNotification({
        tone: "warning",
        message:
          "ポップアップが許可されていません。ブラウザ設定を確認してください。",
      });
      return;
    }

    printWindow.document.write(
      buildPrintHtml({
        filteredDays,
        filteredStaffs,
        shiftDataMap,
        getEventsForDay,
        targetMonth,
        includeLegend,
        includeTimestamp,
        colorMode,
      }),
    );
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }, [
    shiftDataMap,
    filteredDays,
    filteredStaffs,
    getEventsForDay,
    targetMonth,
    includeLegend,
    includeTimestamp,
    colorMode,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          width: "min(1120px, 96vw)",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>シフト調整表を印刷</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 設定セクション */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.7fr) minmax(240px, 1fr)",
            },
            gap: 2,
            alignItems: "start",
          }}
        >
          <RequiredSettingsStepper
            startDate={startDate}
            endDate={endDate}
            filteredDaysCount={filteredDays.length}
            filteredStaffsCount={filteredStaffs.length}
            staffs={staffs}
            selectedStaffIds={selectedStaffIds}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSelectStaffs={handleSelectStaffs}
            onUnselectStaffs={handleUnselectStaffs}
            onSelectAllStaffs={handleSelectAllStaffs}
            onClearAllStaffs={handleClearAllStaffs}
            isPrintDisabled={
              filteredDays.length === 0 || filteredStaffs.length === 0
            }
            onPrint={handlePrint}
          />

          <OptionalSettingsPanel
            colorMode={colorMode}
            includeLegend={includeLegend}
            includeTimestamp={includeTimestamp}
            onColorModeChange={setColorMode}
            onIncludeLegendChange={setIncludeLegend}
            onIncludeTimestampChange={setIncludeTimestamp}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <AppButton variant="ghost" tone="neutral" onClick={onClose}>
          閉じる
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

PrintShiftDialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  days: PropTypes.arrayOf(PropTypes.any).isRequired,
  getEventsForDay: PropTypes.func.isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      familyName: PropTypes.string,
      givenName: PropTypes.string,
    }),
  ).isRequired,
  shiftDataMap: PropTypes.instanceOf(Map).isRequired,
  targetMonth: PropTypes.string.isRequired,
};

export const PrintShiftDialog = memo(PrintShiftDialogComponent);

PrintShiftDialog.displayName = "PrintShiftDialog";

(PrintShiftDialog as React.ComponentType<PrintShiftDialogProps>).propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  days: PropTypes.arrayOf(PropTypes.any).isRequired,
  getEventsForDay: PropTypes.func.isRequired,
  staffs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      familyName: PropTypes.string,
      givenName: PropTypes.string,
    }),
  ).isRequired,
  shiftDataMap: PropTypes.instanceOf(Map).isRequired,
  targetMonth: PropTypes.string.isRequired,
};
