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
import React, { useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

type QuickInputButtonsProps = {
  setValue: UseFormSetValue<AttendanceEditInputs>;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
};

export default function QuickInputButtons({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
}: QuickInputButtonsProps) {
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAmHolidayStartTime,
    getAmHolidayEndTime,
    getPmHolidayStartTime,
    getPmHolidayEndTime,
    getAmPmHolidayEnabled,
  } = useAppConfig();

  const defaultStart = getStartTime().format("HH:mm");
  const defaultEnd = getEndTime().format("HH:mm");
  const defaultLunchStart = getLunchRestStartTime().format("HH:mm");
  const defaultLunchEnd = getLunchRestEndTime().format("HH:mm");
  const defaultAmStart = getAmHolidayStartTime().format("HH:mm");
  const defaultAmEnd = getAmHolidayEndTime().format("HH:mm");
  const defaultPmStart = getPmHolidayStartTime().format("HH:mm");
  const defaultPmEnd = getPmHolidayEndTime().format("HH:mm");

  const toISO = (time: string | null) => {
    if (!time) return null;
    if (!workDate) return null;

    const [hh, mm] = time.split(":").map((v) => Number(v));
    return workDate.hour(hh).minute(mm).second(0).millisecond(0).toISOString();
  };

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
      pendingActionRef.current && pendingActionRef.current();
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
          <Tooltip title="入力内容をすべてクリアします。">
            <span>
              <Button
                variant="outlined"
                onClick={() =>
                  askConfirm(
                    "定型入力: 入力内容をクリアします。よろしいですか？",
                    () => {
                      setValue("startTime", null);
                      setValue("endTime", null);
                      restReplace([]);
                      hourlyPaidHolidayTimeReplace([]);
                      setValue("paidHolidayFlag", false);
                      setValue("remarks", "");
                      setValue("goDirectlyFlag", false);
                      setValue("returnDirectlyFlag", false);
                    }
                  )
                }
              >
                クリア
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="規定の出勤時間と昼休みをセットします。">
            <span>
              <Button
                variant="outlined"
                onClick={() =>
                  askConfirm(
                    "定型入力: 「通常勤務」を適用します。よろしいですか？",
                    () => {
                      setValue("startTime", toISO(defaultStart));
                      setValue("endTime", toISO(defaultEnd));
                      restReplace([
                        {
                          startTime: toISO(defaultLunchStart),
                          endTime: toISO(defaultLunchEnd),
                        },
                      ]);
                      hourlyPaidHolidayTimeReplace([]);
                      setValue("paidHolidayFlag", false);
                      setValue("remarks", "");
                    }
                  )
                }
              >
                通常勤務
              </Button>
            </span>
          </Tooltip>

          {getAmPmHolidayEnabled() && (
            <>
              <Tooltip title="午前を休みにします（午後から出勤）。管理者画面で設定された時間が適用されます。">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      askConfirm(
                        "定型入力: 「午前半休」を適用します。よろしいですか？",
                        () => {
                          setValue("startTime", toISO(defaultPmStart));
                          setValue("endTime", toISO(defaultPmEnd));
                          restReplace([]);
                          hourlyPaidHolidayTimeReplace([]);
                          setValue("paidHolidayFlag", false);
                          setValue("remarks", "午前半休");
                        }
                      )
                    }
                  >
                    午前半休
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title="午後を休みにします（午前中出勤）。管理者画面で設定された時間が適用されます。">
                <span>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      askConfirm(
                        "定型入力: 「午後半休」を適用します。よろしいですか？",
                        () => {
                          setValue("startTime", toISO(defaultAmStart));
                          setValue("endTime", toISO(defaultAmEnd));
                          restReplace([]);
                          hourlyPaidHolidayTimeReplace([]);
                          setValue("paidHolidayFlag", false);
                          setValue("remarks", "午後半休");
                        }
                      )
                    }
                  >
                    午後半休
                  </Button>
                </span>
              </Tooltip>
            </>
          )}

          <Tooltip title="有給休暇(1日)を設定します。勤務時間は、規定の出勤・退勤時刻で打刻されます。">
            <span>
              <Button
                variant="outlined"
                onClick={() =>
                  askConfirm(
                    "定型入力: 「有給(1日)」を適用します。よろしいですか？",
                    () => {
                      setValue("startTime", toISO(defaultStart));
                      setValue("endTime", toISO(defaultEnd));
                      restReplace([
                        {
                          startTime: toISO(defaultLunchStart),
                          endTime: toISO(defaultLunchEnd),
                        },
                      ]);
                      hourlyPaidHolidayTimeReplace([]);
                      setValue("paidHolidayFlag", true);
                    }
                  )
                }
              >
                有給休暇(1日)
              </Button>
            </span>
          </Tooltip>
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
