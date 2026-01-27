import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

import { useQuickInputActions } from "../model/useQuickInputActions";

type Props = {
  setValue: UseFormSetValue<AttendanceEditInputs>;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  visibleMode?: "all" | "admin" | "staff";
  readOnly?: boolean;
};

export default function QuickInputButtonsMobile({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  readOnly,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const actions = useQuickInputActions({
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    workDate,
    visibleMode,
    readOnly,
  });

  // ボタンが表示されない場合は null を返す
  if (actions.length === 0) return null;

  return (
    <Box sx={{ mb: 1 }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexWrap: "wrap" }}
      >
        <Box sx={{ fontWeight: "bold", mr: 1 }}>定型入力</Box>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          選択
        </Button>
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>定型入力</DialogTitle>
        <DialogContent>
          <List>
            {actions.map((action) => (
              <ListItemButton
                key={action.key}
                selected={selectedKey === action.key}
                onClick={() => setSelectedKey(action.key)}
              >
                <ListItemText primary={action.label} />
              </ListItemButton>
            ))}
            {actions.length === 0 && (
              <Typography sx={{ color: "text.secondary" }}>
                操作可能な項目がありません。
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => {
              const action = actions.find((a) => a.key === selectedKey);
              if (action) {
                action.action();
                setOpen(false);
                setSelectedKey(null);
              }
            }}
            disabled={!selectedKey}
          >
            適用
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
