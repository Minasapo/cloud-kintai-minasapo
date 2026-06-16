import {
  AttendanceDaily,
  DuplicateAttendanceDaily,
} from "@entities/attendance/model/useAttendanceDaily";
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { AppButton } from "@shared/ui/button";
import ConfirmDialog from "@shared/ui/feedback/ConfirmDialog";
import dayjs from "dayjs";

import { renderInlineDiff } from "../lib/inlineDiff";
import { useDuplicateAttendanceManagerState } from "../model/useDuplicateConfirmState";
import { DuplicateComparisonTable } from "./DuplicateComparisonTable";

const duplicateBadgeChipSx = { fontWeight: 600 } as const;
const tableContainerSx = { width: "100%", overflowX: "auto" } as const;
const recordIdsCellSx = {
  display: { xs: "none", md: "table-cell" },
  whiteSpace: "nowrap",
} as const;
const duplicateErrorBoxSx = {
  pb: 2,
  border: "1px solid",
  borderColor: "error.main",
  borderRadius: 2,
  p: 2,
  backgroundColor: "rgba(255, 205, 210, 0.16)",
} as const;
const sectionTitleSx = { mb: 1 } as const;
const alertMb2Sx = { mb: 2 } as const;
const colStaffSx = { width: "30%" } as const;
const colDateSx = { width: "25%" } as const;
const colCountSx = { width: "15%" } as const;
const colActionSx = { width: "12%" } as const;
const dialogHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: 1.5,
  gap: 1,
} as const;

type DuplicateAttendanceManagerProps = {
  duplicates: DuplicateAttendanceDaily[];
  staffNameMap: Record<string, string>;
};

type DuplicateAttendanceBadgeProps = {
  row: AttendanceDaily;
  duplicateInfoByStaff: Record<string, DuplicateAttendanceDaily[]>;
};

export function DuplicateAttendanceBadge({
  row,
  duplicateInfoByStaff,
}: DuplicateAttendanceBadgeProps) {
  const duplicates = duplicateInfoByStaff[row.sub];
  if (!duplicates || duplicates.length === 0) {
    return null;
  }

  const detail = duplicates
    .map((duplicate) => {
      return `${dayjs(duplicate.workDate).format("YYYY/MM/DD")}: ${duplicate.ids.join(", ")}`;
    })
    .join("\n");

  return (
    <Tooltip title={detail || "重複データがあります"} arrow placement="top">
      <Chip
        size="small"
        color="warning"
        label="重複"
        sx={duplicateBadgeChipSx}
      />
    </Tooltip>
  );
}

export function DuplicateAttendanceManager({
  duplicates,
  staffNameMap,
}: DuplicateAttendanceManagerProps) {
  const {
    confirmFieldRows,
    selectionMode,
    selectedRecordIndex,
    fieldSelections,
    handleChangeSelectionMode,
    handleSelectRecord,
    handleSelectField,
    confirmOpen,
    confirmTargetStaffId,
    confirmTargetName,
    confirmLoading,
    confirmRecords,
    handleOpenConfirmClick,
    handleCloseConfirm,
    handleRequestDeleteDuplicates,
    handleCancelDeleteDuplicates,
    handleDeleteDuplicates,
    deleteConfirmOpen,
    deleteConfirmMessage,
  } = useDuplicateAttendanceManagerState({
    duplicates,
    staffNameMap,
  });

  if (duplicates.length === 0) {
    return null;
  }

  return (
    <>
      <Box sx={duplicateErrorBoxSx}>
        <Typography variant="h6" sx={sectionTitleSx}>
          重複データが検出されたスタッフ ({duplicates.length})
        </Typography>
        <Alert severity="error" sx={alertMb2Sx}>
          同一日付に重複した勤怠データがあります。早急にデータ統合を実施してください。
        </Alert>
        <TableContainer sx={tableContainerSx}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={colStaffSx}>スタッフ</TableCell>
                <TableCell sx={colDateSx}>対象日</TableCell>
                <TableCell sx={colCountSx}>重複件数</TableCell>
                <TableCell sx={recordIdsCellSx}>レコードID一覧</TableCell>
                <TableCell sx={colActionSx} align="right">
                  確認
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {duplicates.map((duplicate, index) => (
                <TableRow
                  key={`${duplicate.staffId}-${duplicate.workDate}-${index}`}
                >
                  <TableCell>
                    {duplicate.staffName || duplicate.staffId}
                  </TableCell>
                  <TableCell>
                    {duplicate.workDate
                      ? dayjs(duplicate.workDate).format("YYYY/MM/DD")
                      : "-"}
                  </TableCell>
                  <TableCell>{duplicate.ids.length}</TableCell>
                  <TableCell sx={recordIdsCellSx}>
                    {duplicate.ids.join(", ") || "-"}
                  </TableCell>
                  <TableCell align="right">
                    <AppButton
                      variant="solid"
                      tone="danger"
                      size="sm"
                      data-staff-id={duplicate.staffId}
                      onClick={handleOpenConfirmClick}
                    >
                      確認
                    </AppButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          重複データ確認 - {confirmTargetName || confirmTargetStaffId}
        </DialogTitle>
        <DialogContent dividers>
          {confirmLoading ? (
            <Typography>読み込み中...</Typography>
          ) : confirmRecords.length === 0 ? (
            <Typography color="text.secondary">
              該当の重複データを取得できませんでした。
            </Typography>
          ) : (
            <>
              <Box sx={dialogHeaderSx}>
                <Typography variant="body2" color="text.secondary">
                  選択モードを切り替えて、レコード単位または項目単位で採用候補をマークできます。
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={selectionMode}
                  onChange={handleChangeSelectionMode}
                >
                  <ToggleButton value="record">レコード単位</ToggleButton>
                  <ToggleButton value="field">項目単位</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <DuplicateComparisonTable
                confirmRecords={confirmRecords}
                confirmFieldRows={confirmFieldRows}
                selectionMode={selectionMode}
                selectedRecordIndex={selectedRecordIndex}
                fieldSelections={fieldSelections}
                onSelectRecord={handleSelectRecord}
                onSelectField={handleSelectField}
                renderInlineDiff={renderInlineDiff}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {selectionMode === "record" && selectedRecordIndex !== null && (
            <AppButton
              variant="outline"
              tone="danger"
              onClick={handleRequestDeleteDuplicates}
            >
              選択したデータを残す
            </AppButton>
          )}
          <AppButton
            variant="ghost"
            tone="neutral"
            onClick={handleCloseConfirm}
          >
            閉じる
          </AppButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="重複データ削除の確認"
        message={deleteConfirmMessage}
        confirmLabel="削除する"
        onConfirm={() => {
          void handleDeleteDuplicates();
        }}
        onCancel={handleCancelDeleteDuplicates}
      />
    </>
  );
}
