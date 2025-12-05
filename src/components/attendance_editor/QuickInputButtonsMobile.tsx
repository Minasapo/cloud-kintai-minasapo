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
import { useMemo, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

type ButtonRoleMode = "all" | "admin" | "staff";

type Props = {
  setValue: UseFormSetValue<AttendanceEditInputs>;
  restReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  hourlyPaidHolidayTimeReplace: (
    items: { startTime: string | null; endTime: string | null }[]
  ) => void;
  workDate: dayjs.Dayjs | null;
  visibleMode?: ButtonRoleMode;
  readOnly?: boolean;
};

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

function isVisibleFor(
  mode: ButtonRoleMode | undefined,
  visibleMode?: ButtonRoleMode
) {
  const current = visibleMode ?? "all";
  if (current === "all" || mode === "all") return true;
  return mode === current;
}

function toISO(time: string | null, workDate: dayjs.Dayjs | null) {
  if (!time || !workDate) return null;
  const [hh, mm] = time.split(":").map(Number);
  return workDate.hour(hh).minute(mm).second(0).millisecond(0).toISOString();
}

export default function QuickInputButtonsMobile({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
  readOnly,
}: Props) {
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

  const anyButtonVisible =
    isVisibleFor(BUTTON_ROLE_MAP.clear, visibleMode) ||
    isVisibleFor(BUTTON_ROLE_MAP.normal, visibleMode) ||
    (getAmPmHolidayEnabled() &&
      (isVisibleFor(BUTTON_ROLE_MAP.amHalf, visibleMode) ||
        isVisibleFor(BUTTON_ROLE_MAP.pmHalf, visibleMode))) ||
    isVisibleFor(BUTTON_ROLE_MAP.paidHoliday, visibleMode);
  if (!anyButtonVisible) return null;

  const defaultStart = getStartTime().format("HH:mm");
  const defaultEnd = getEndTime().format("HH:mm");
  const defaultLunchStart = getLunchRestStartTime().format("HH:mm");
  const defaultLunchEnd = getLunchRestEndTime().format("HH:mm");
  const defaultAmStart = getAmHolidayStartTime().format("HH:mm");
  const defaultAmEnd = getAmHolidayEndTime().format("HH:mm");
  const defaultPmStart = getPmHolidayStartTime().format("HH:mm");
  const defaultPmEnd = getPmHolidayEndTime().format("HH:mm");

  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // 定型ボタンリストをuseMemoで最適化
  const items = useMemo(() => {
    const arr: { key: string; label: string; action: () => void }[] = [];
    if (isVisibleFor(BUTTON_ROLE_MAP.clear, visibleMode)) {
      arr.push({
        key: "clear",
        label: "クリア",
        action: () => {
          if (readOnly) return;
          setValue("startTime", null);
          setValue("endTime", null);
          restReplace([]);
          hourlyPaidHolidayTimeReplace([]);
          setValue("paidHolidayFlag", false);
          // clear both tags and free-text remarks
          setValue("remarkTags", []);
          setValue("remarks", "");
          setValue("goDirectlyFlag", false);
          setValue("returnDirectlyFlag", false);
        },
      });
    }
    if (isVisibleFor(BUTTON_ROLE_MAP.normal, visibleMode)) {
      arr.push({
        key: "normal",
        label: "通常勤務",
        action: () => {
          if (readOnly) return;
          setValue("startTime", toISO(defaultStart, workDate));
          setValue("endTime", toISO(defaultEnd, workDate));
          restReplace([
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
          hourlyPaidHolidayTimeReplace([]);
          setValue("paidHolidayFlag", false);
          // clear tags and free-text remarks for normal work
          setValue("remarkTags", []);
          setValue("remarks", "");
        },
      });
    }
    if (isVisibleFor(BUTTON_ROLE_MAP.regularStart, visibleMode)) {
      arr.push({
        key: "regularStart",
        label: "定時出勤",
        action: () => {
          if (readOnly) return;
          setValue("startTime", toISO(defaultStart, workDate));
        },
      });
    }
    if (isVisibleFor(BUTTON_ROLE_MAP.regularEnd, visibleMode)) {
      arr.push({
        key: "regularEnd",
        label: "定時退勤",
        action: () => {
          if (readOnly) return;
          setValue("endTime", toISO(defaultEnd, workDate));
          setValue("rests", [
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
        },
      });
    }
    if (getAmPmHolidayEnabled()) {
      if (isVisibleFor(BUTTON_ROLE_MAP.amHalf, visibleMode)) {
        arr.push({
          key: "amHalf",
          label: "午前半休",
          action: () => {
            if (readOnly) return;
            setValue("startTime", toISO(defaultPmStart, workDate));
            setValue("endTime", toISO(defaultPmEnd, workDate));
            restReplace([]);
            hourlyPaidHolidayTimeReplace([]);
            setValue("paidHolidayFlag", false);
            // set tag for 午前半休
            setValue("remarkTags", ["午前半休"]);
          },
        });
      }
      if (isVisibleFor(BUTTON_ROLE_MAP.pmHalf, visibleMode)) {
        arr.push({
          key: "pmHalf",
          label: "午後半休",
          action: () => {
            if (readOnly) return;
            setValue("startTime", toISO(defaultAmStart, workDate));
            setValue("endTime", toISO(defaultAmEnd, workDate));
            restReplace([]);
            hourlyPaidHolidayTimeReplace([]);
            setValue("paidHolidayFlag", false);
            // set tag for 午後半休
            setValue("remarkTags", ["午後半休"]);
          },
        });
      }
    }
    if (isVisibleFor(BUTTON_ROLE_MAP.paidHoliday, visibleMode)) {
      arr.push({
        key: "paidHoliday",
        label: "有給休暇(1日)",
        action: () => {
          if (readOnly) return;
          setValue("startTime", toISO(defaultStart, workDate));
          setValue("endTime", toISO(defaultEnd, workDate));
          restReplace([
            {
              startTime: toISO(defaultLunchStart, workDate),
              endTime: toISO(defaultLunchEnd, workDate),
            },
          ]);
          hourlyPaidHolidayTimeReplace([]);
          setValue("paidHolidayFlag", true);
          // mark paid holiday as a tag
          setValue("remarkTags", ["有給休暇"]);
        },
      });
    }
    return arr;
  }, [
    visibleMode,
    workDate,
    setValue,
    restReplace,
    hourlyPaidHolidayTimeReplace,
    getAmPmHolidayEnabled,
    defaultStart,
    defaultEnd,
    defaultLunchStart,
    defaultLunchEnd,
    defaultAmStart,
    defaultAmEnd,
    defaultPmStart,
    defaultPmEnd,
  ]);

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
            {items.map((it) => (
              <ListItemButton
                key={it.key}
                selected={selectedKey === it.key}
                onClick={() => setSelectedKey(it.key)}
              >
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
            {items.length === 0 && (
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
              const it = items.find((i) => i.key === selectedKey);
              if (it) {
                it.action();
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
