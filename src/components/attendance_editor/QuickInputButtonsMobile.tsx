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
import React, { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";

import useAppConfig from "@/hooks/useAppConfig/useAppConfig";
import { AttendanceEditInputs } from "@/pages/AttendanceEdit/common";

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
};

export default function QuickInputButtonsMobile({
  setValue,
  restReplace,
  hourlyPaidHolidayTimeReplace,
  workDate,
  visibleMode,
}: Props) {
  type ButtonRoleMode = "all" | "admin" | "staff";

  const isVisibleFor = (mode?: ButtonRoleMode) => {
    const current = visibleMode ?? "all";
    if (current === "all") return true;
    if (mode === "all") return true;
    return mode === current;
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

  const [open, setOpen] = useState(false);

  // 選択状態 (選んでから「適用」ボタンで実行)
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const items: {
    key: string;
    label: string;
    visible: boolean;
    action: () => void;
  }[] = [];

  if (isVisibleFor(BUTTON_ROLE_MAP.clear)) {
    items.push({
      key: "clear",
      label: "クリア",
      visible: true,
      action: () => {
        setValue("startTime", null);
        setValue("endTime", null);
        restReplace([]);
        hourlyPaidHolidayTimeReplace([]);
        setValue("paidHolidayFlag", false);
        setValue("remarks", "");
        setValue("goDirectlyFlag", false);
        setValue("returnDirectlyFlag", false);
      },
    });
  }

  if (isVisibleFor(BUTTON_ROLE_MAP.normal)) {
    items.push({
      key: "normal",
      label: "通常勤務",
      visible: true,
      action: () => {
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
      },
    });
  }

  if (isVisibleFor(BUTTON_ROLE_MAP.regularStart)) {
    items.push({
      key: "regularStart",
      label: "定時出勤",
      visible: true,
      action: () => {
        setValue("startTime", toISO(defaultStart));
      },
    });
  }

  if (isVisibleFor(BUTTON_ROLE_MAP.regularEnd)) {
    items.push({
      key: "regularEnd",
      label: "定時退勤",
      visible: true,
      action: () => {
        setValue("endTime", toISO(defaultEnd));
        setValue("rests", [
          {
            startTime: toISO(defaultLunchStart),
            endTime: toISO(defaultLunchEnd),
          },
        ]);
      },
    });
  }

  if (getAmPmHolidayEnabled()) {
    if (isVisibleFor(BUTTON_ROLE_MAP.amHalf)) {
      items.push({
        key: "amHalf",
        label: "午前半休",
        visible: true,
        action: () => {
          setValue("startTime", toISO(defaultPmStart));
          setValue("endTime", toISO(defaultPmEnd));
          restReplace([]);
          hourlyPaidHolidayTimeReplace([]);
          setValue("paidHolidayFlag", false);
          setValue("remarks", "午前半休");
        },
      });
    }
    if (isVisibleFor(BUTTON_ROLE_MAP.pmHalf)) {
      items.push({
        key: "pmHalf",
        label: "午後半休",
        visible: true,
        action: () => {
          setValue("startTime", toISO(defaultAmStart));
          setValue("endTime", toISO(defaultAmEnd));
          restReplace([]);
          hourlyPaidHolidayTimeReplace([]);
          setValue("paidHolidayFlag", false);
          setValue("remarks", "午後半休");
        },
      });
    }
  }

  if (isVisibleFor(BUTTON_ROLE_MAP.paidHoliday)) {
    items.push({
      key: "paidHoliday",
      label: "有給休暇(1日)",
      visible: true,
      action: () => {
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
      },
    });
  }

  return (
    <Box sx={{ mb: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
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
                onClick={() => {
                  // 選択してから下の「適用」ボタンで実行する
                  setSelectedKey(it.key);
                }}
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
