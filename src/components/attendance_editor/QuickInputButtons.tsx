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
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
// Auth/role checks are intentionally not used here - visibility is driven by visibleMode prop
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
  /**
   * 表示モード: all(すべて)/admin(管理者のみ)/staff(スタッフのみ)
   * 親コンポーネントから渡された値に応じて表示を切り替えます。
   */
  visibleMode?: "all" | "admin" | "staff";
  getValues?: UseFormGetValues<AttendanceEditInputs>;
  readOnly?: boolean;
  /**
   * ボタンごとの表示モード。プロパティを指定しない場合は `visibleMode` のルールを使用します。
   */
  // ボタンごとの表示制御は外部から受け取らず、コンポーネント内で固定的に扱います。
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
  type ButtonRoleMode = "all" | "admin" | "staff";

  const isVisibleFor = (mode?: ButtonRoleMode) => {
    // 表示は親コンポーネントが渡す visibleMode に依存する
    const current = visibleMode ?? "all";
    // 親が all を指定していればすべて表示
    if (current === "all") return true;
    // ボタン自体が all の場合は常に表示
    if (mode === "all") return true;
    // それ以外は mode と current を比較
    return mode === current;
  };

  // ボタンごとのロール定義（コンポーネント内部で固定）
  const BUTTON_ROLE_MAP: Record<
    | "clear"
    | "normal"
    | "regularStart"
    | "regularEnd"
    | "amHalf"
    | "pmHalf"
    | "paidHoliday",
    ButtonRoleMode
  > = {
    clear: "all",
    normal: "all",
    regularStart: "staff",
    regularEnd: "staff",
    amHalf: "admin",
    pmHalf: "admin",
    paidHoliday: "admin",
  };
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

  // どのボタンも表示されない場合はコンポーネントを非表示にする
  const anyButtonVisible =
    isVisibleFor(BUTTON_ROLE_MAP.clear) ||
    isVisibleFor(BUTTON_ROLE_MAP.normal) ||
    (getAmPmHolidayEnabled() &&
      (isVisibleFor(BUTTON_ROLE_MAP.amHalf) ||
        isVisibleFor(BUTTON_ROLE_MAP.pmHalf))) ||
    isVisibleFor(BUTTON_ROLE_MAP.paidHoliday);

  if (!anyButtonVisible) return null;

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
          {isVisibleFor(BUTTON_ROLE_MAP.clear) && (
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
                        setValue("remarkTags", []);
                        setValue("remarks", "");
                        setValue("goDirectlyFlag", false);
                        setValue("returnDirectlyFlag", false);
                      }
                    )
                  }
                  disabled={!!readOnly}
                >
                  クリア
                </Button>
              </span>
            </Tooltip>
          )}

          {isVisibleFor(BUTTON_ROLE_MAP.normal) && (
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
                        // clear tags and free-text remarks for normal work
                        setValue("remarkTags", []);
                        setValue("remarks", "");
                      }
                    )
                  }
                  disabled={!!readOnly}
                >
                  通常勤務
                </Button>
              </span>
            </Tooltip>
          )}

          {isVisibleFor(BUTTON_ROLE_MAP.regularStart) && (
            <Tooltip title="定時出勤（スタッフ向け）をセットします。">
              <span>
                <Button
                  variant="outlined"
                  onClick={() =>
                    askConfirm(
                      "定型入力: 定時出勤を適用します。よろしいですか？",
                      () => {
                        setValue("startTime", toISO(defaultStart));
                      }
                    )
                  }
                  disabled={!!readOnly}
                >
                  定時出勤
                </Button>
              </span>
            </Tooltip>
          )}

          {isVisibleFor(BUTTON_ROLE_MAP.regularEnd) && (
            <Tooltip title="定時退勤（スタッフ向け）をセットします。">
              <span>
                <Button
                  variant="outlined"
                  onClick={() =>
                    askConfirm(
                      "定型入力: 定時退勤を適用します。よろしいですか？",
                      () => {
                        setValue("endTime", toISO(defaultEnd));
                        setValue("rests", [
                          {
                            startTime: toISO(defaultLunchStart),
                            endTime: toISO(defaultLunchEnd),
                          },
                        ]);
                      }
                    )
                  }
                  disabled={!!readOnly}
                >
                  定時退勤
                </Button>
              </span>
            </Tooltip>
          )}

          {getAmPmHolidayEnabled() && (
            <>
              {isVisibleFor(BUTTON_ROLE_MAP.amHalf) && (
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
                            // set tag for 午前半休
                            try {
                              if (getValues) {
                                const tags: string[] =
                                  (getValues("remarkTags") as string[]) || [];
                                if (!tags.includes("午前半休")) {
                                  setValue("remarkTags", [...tags, "午前半休"]);
                                }
                              }
                            } catch (e) {
                              // noop
                            }
                          }
                        )
                      }
                      disabled={!!readOnly}
                    >
                      午前半休
                    </Button>
                  </span>
                </Tooltip>
              )}

              {isVisibleFor(BUTTON_ROLE_MAP.pmHalf) && (
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
                            try {
                              if (getValues) {
                                const tags: string[] =
                                  (getValues("remarkTags") as string[]) || [];
                                if (!tags.includes("午後半休")) {
                                  setValue("remarkTags", [...tags, "午後半休"]);
                                }
                              }
                            } catch (e) {
                              // noop
                            }
                          }
                        )
                      }
                      disabled={!!readOnly}
                    >
                      午後半休
                    </Button>
                  </span>
                </Tooltip>
              )}
            </>
          )}

          {isVisibleFor(BUTTON_ROLE_MAP.paidHoliday) && (
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
                        // mark paid holiday as a tag
                        try {
                          if (getValues) {
                            const tags: string[] =
                              (getValues("remarkTags") as string[]) || [];
                            if (!tags.includes("有給休暇")) {
                              setValue("remarkTags", [...tags, "有給休暇"]);
                            }
                          }
                        } catch (e) {
                          // noop
                        }
                      }
                    )
                  }
                  disabled={!!readOnly}
                >
                  有給休暇(1日)
                </Button>
              </span>
            </Tooltip>
          )}
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
