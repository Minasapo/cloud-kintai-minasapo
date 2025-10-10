import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext, useState } from "react";
import { Controller } from "react-hook-form";

import { AttendanceDate } from "@/lib/AttendanceDate";

import { AttendanceEditContext } from "../AttendanceEditProvider";
import { Label } from "./Label";

export function SubstituteHolidayDateInput() {
  const { control, setValue, restReplace } = useContext(AttendanceEditContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDate, setPendingDate] = useState<dayjs.Dayjs | null>(null);

  if (!control || !setValue || !restReplace) {
    return null;
  }

  return (
    <>
      <Label variant="body1">振替休暇</Label>
      <Box sx={{ color: "text.secondary", fontSize: 14, mb: 0.5 }}>
        勤務した日を指定して振替休日を設定します。設定すると該当日は休暇扱いとなり、一部の入力がクリアされます。
      </Box>
      <Controller
        name="substituteHolidayDate"
        control={control}
        render={({ field }) => (
          <>
            <DatePicker
              {...field}
              label="勤務した日"
              format={AttendanceDate.DisplayFormat}
              value={field.value ? dayjs(field.value) : null}
              slotProps={{
                textField: { size: "small" },
              }}
              onAccept={(date) => {
                // 新しい日付が設定された場合は確認ダイアログを表示し、
                // ユーザーが承認したときのみフォーム値とフラグをクリアする
                if (date) {
                  setPendingDate(date);
                  setConfirmOpen(true);
                } else {
                  field.onChange(date);
                }
              }}
            />

            <Dialog
              open={confirmOpen}
              onClose={() => {
                setConfirmOpen(false);
                setPendingDate(null);
              }}
              aria-labelledby="confirm-clear-dialog-mobile"
            >
              <DialogTitle id="confirm-clear-dialog-mobile">
                一部の入力内容をクリアします
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  振替休日を設定すると、以下の入力内容がクリアされます。
                  <ul>
                    <li>勤務開始・終了時刻</li>
                    <li>休憩時間</li>
                    <li>有給フラグ</li>
                    <li>直行フラグ</li>
                    <li>直帰フラグ</li>
                  </ul>
                  よろしいですか？
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setConfirmOpen(false);
                    setPendingDate(null);
                  }}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={() => {
                    if (pendingDate) {
                      field.onChange(pendingDate);

                      setValue("paidHolidayFlag", false);
                      setValue("goDirectlyFlag", false);
                      setValue("returnDirectlyFlag", false);
                      setValue("startTime", null);
                      setValue("endTime", null);
                      restReplace([]);
                    }

                    setConfirmOpen(false);
                    setPendingDate(null);
                  }}
                  autoFocus
                >
                  クリアする
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      />
    </>
  );
}
