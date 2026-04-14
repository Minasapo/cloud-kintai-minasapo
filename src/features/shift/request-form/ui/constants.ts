import { alpha, Theme } from "@mui/material/styles";

import { ShiftRequestPattern } from "../model/shiftRequestPattern";
import { ShiftRequestDayStatus } from "../model/statusMapping";

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

export const STATUS_LABEL_MAP: Record<ShiftRequestDayStatus, string> = {
  work: "出勤",
  fixedOff: "固定休",
  requestedOff: "希望休",
  auto: "おまかせ",
};

export const STATUS_MOBILE_LABEL_MAP: Partial<
  Record<ShiftRequestDayStatus, string>
> = {
  work: "出",
  fixedOff: "固",
  requestedOff: "希",
};

export const STATUS_COLOR_MAP: Record<
  ShiftRequestDayStatus,
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning"
> = {
  work: "success",
  fixedOff: "error",
  requestedOff: "warning",
  auto: "info",
};

export const createStatusBackgroundMap = (theme: Theme) => ({
  work: alpha(theme.palette.success.main, 0.25),
  fixedOff: alpha(theme.palette.error.main, 0.23),
  requestedOff: alpha(theme.palette.warning.main, 0.3),
  auto: alpha(theme.palette.info.main, 0.18),
});

export const DEFAULT_NEW_PATTERN_MAPPING: ShiftRequestPattern["mapping"] = {
  0: "fixedOff",
  1: "work",
  2: "work",
  3: "work",
  4: "work",
  5: "work",
  6: "fixedOff",
};

