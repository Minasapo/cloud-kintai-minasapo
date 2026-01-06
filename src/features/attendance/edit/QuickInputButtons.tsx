import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useRef, useState } from "react";

import { useQuickInputActions } from "./hooks/useQuickInputActions";
import { AttendanceGetValues, AttendanceSetValue } from "./types";

type QuickInputButtonsProps = {
  setValue: AttendanceSetValue;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  /**
   * 表示モード: all(すべて)/admin(管理者のみ)/staff(スタッフのみ)
   * 親コンポーネントから渡された値に応じて表示を切り替えます。
   */
  visibleMode?: "all" | "admin" | "staff";
  getValues?: AttendanceGetValues;
  readOnly?: boolean;
};

export default function QuickInputButtons({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  getValues,
  readOnly,
}: QuickInputButtonsProps) {
  const actions = useQuickInputActions({
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    workDate,
    visibleMode,
    getValues,
    readOnly,
  });

  // どのボタンも表示されない場合はコンポーネントを非表示にする
  if (actions.length === 0) return null;

  // 確認ダイアログ用のstate
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLabel, setConfirmLabel] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const askConfirm = (label: string, action: () => void) => {
    setConfirmLabel(label);
    pendingActionRef.current = action;
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    try {
      pendingActionRef.current?.();
    } finally {
      pendingActionRef.current = null;
      setConfirmLabel(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    pendingActionRef.current = null;
    setConfirmLabel(null);
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ fontWeight: "bold", mr: 1 }}>定型入力</Box>
        <Stack direction="row" spacing={1}>
          {actions.map((action) => (
            <Tooltip key={action.key} title={action.tooltip || ""}>
              <span>
                <Button
                  variant="outlined"
                  onClick={() =>
                    askConfirm(
                      `定型入力: 「${action.label}」を適用します。よろしいですか？`,
                      action.action
                    )
                  }
                  disabled={!!readOnly}
                >
                  {action.label}
                </Button>
              </span>
            </Tooltip>
          ))}
        </Stack>
      </Stack>

      <Dialog open={confirmOpen} onClose={handleCancel} fullWidth maxWidth="xs">
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          <Typography>{confirmLabel}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>キャンセル</Button>
          <Button onClick={handleConfirm} variant="contained">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
