import { ShiftRequestDayStatus } from "./statusMapping";

export type ShiftRequestPattern = {
  id: string;
  name: string;
  mapping: Record<number, ShiftRequestDayStatus>;
};

