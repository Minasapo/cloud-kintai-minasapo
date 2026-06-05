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
  Stack,  Typography,
} from "@mui/material";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { AppButton } from "@shared/ui/button";
import { AppTextField } from "@shared/ui/form";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import PropTypes from "prop-types";
import { memo, useCallback, useMemo, useState } from "react";

import { buildPrintHtml } from "../lib/printShiftHtml";
import { ShiftState } from "../types/collaborative.types";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface StaffInfo {
  id: string;
  familyName?: string;
  givenName?: string;
}

interface StaffSelectionSectionProps {
  staffs: StaffInfo[];
  selectedStaffIds: Set<string>;
  onToggleStaff: (staffId: string) => void;
  onSelectAll: () => void;
}

const StaffSelectionSection = ({
  staffs,
  selectedStaffIds,
  onToggleStaff,
  onSelectAll,
}: StaffSelectionSectionProps) => (
  <Box>
    <FormControlLabel
      control={
        <Checkbox
          checked={selectedStaffIds.size === staffs.length}
          indeterminate={
            selectedStaffIds.size > 0 &&
            selectedStaffIds.size < staffs.length
          }
          onChange={onSelectAll}
        />
      }
      label={`全スタッフを選択 (${selectedStaffIds.size}/${staffs.length})`}
    />
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        mt: 1,
      }}
    >
      {staffs.map((staff) => (
        <FormControlLabel
          key={staff.id}
          control={
            <Checkbox
              checked={selectedStaffIds.has(staff.id)}
              onChange={() => onToggleStaff(staff.id)}
              size="small"
            />
          }
          label={
            <Typography variant="caption">
              {`${staff.familyName ?? ""}${staff.givenName ?? ""}`.trim() ||
                staff.id}
            </Typography>
          }
        />
      ))}
    </Box>
  </Box>
);

interface PrintShiftDialogProps {
  open: boolean;
  onClose: () => void;
  days: Dayjs[];
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

  // スタッフ選択の切り替え
  const handleStaffToggle = useCallback((staffId: string) => {
    setSelectedStaffIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  }, []);

  // 全スタッフ選択
  const handleSelectAllStaffs = useCallback(() => {
    if (selectedStaffIds.size === staffs.length) {
      setSelectedStaffIds(new Set());
    } else {
      setSelectedStaffIds(new Set(staffs.map((s) => s.id)));
    }
  }, [staffs, selectedStaffIds.size]);

  // 印刷実行
  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      pushNotification({
        tone: "warning",
        message: "ポップアップが許可されていません。ブラウザ設定を確認してください。",
      });
      return;
    }

    printWindow.document.write(
      buildPrintHtml({
        filteredDays,
        filteredStaffs,
        shiftDataMap,
        targetMonth,
        includeLegend,
        includeTimestamp,
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
    targetMonth,
    includeLegend,
    includeTimestamp,
  ]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>シフト調整表を印刷</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* 印刷設定セクション */}
        <Paper sx={{ p: 2, bgcolor: "rgb(245 245 245)" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 2 }}>
            印刷設定
          </Typography>

          <Stack spacing={2}>
            {/* 日付範囲 */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              <AppTextField
                label="開始日"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <AppTextField
                label="終了日"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="caption" color="text.secondary">
                (選択: {filteredDays.length}日)
              </Typography>
            </Box>

            {/* スタッフ選択 */}
              <StaffSelectionSection
                staffs={staffs}
                selectedStaffIds={selectedStaffIds}
                onToggleStaff={handleStaffToggle}
                onSelectAll={handleSelectAllStaffs}
              />

            {/* その他のオプション */}
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeLegend}
                    onChange={(e) => setIncludeLegend(e.target.checked)}
                  />
                }
                label="凡例を含める"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  />
                }
                label="出力日時を含める"
              />
            </FormGroup>

            {/* 用紙設定 */}
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                用紙向き: 横
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* プレビュー情報 */}
        <Typography variant="caption" color="text.secondary">
          プレビュー: {filteredDays.length}日間 × {filteredStaffs.length}名
        </Typography>
      </DialogContent>
      <DialogActions>
        <AppButton variant="outline" tone="neutral" onClick={onClose}>
          キャンセル
        </AppButton>
        <AppButton
          onClick={handlePrint}
          variant="solid"
          startIcon={<PrintIcon />}
          disabled={filteredDays.length === 0 || filteredStaffs.length === 0}
        >
          印刷プレビューを表示
        </AppButton>
      </DialogActions>
    </Dialog>
  );
};

PrintShiftDialogComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  days: PropTypes.arrayOf(PropTypes.any).isRequired,
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
