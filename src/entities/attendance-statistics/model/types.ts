export type AttendanceStatisticsStatus =
  | "IDLE"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED";

export type AttendanceStatisticsMonthlySummary = {
  month: number;
  rangeStart: string;
  rangeEnd: string;
  workHours: number;
  paidDays: number;
  specialHolidayDays: number;
  absentDays: number;
  workDays: number;
  isFallback: boolean;
};

export type AttendanceStatisticsSnapshot = {
  id: string;
  staffId: string;
  year: number;
  status: AttendanceStatisticsStatus;
  progressPercent: number | null;
  currentStepLabel: string | null;
  rangeStart: string | null;
  rangeEnd: string | null;
  monthlySummaries: AttendanceStatisticsMonthlySummary[];
  totalWorkHours: number;
  totalPaidDays: number;
  totalSpecialHolidayDays: number;
  totalAbsentDays: number;
  totalWorkDays: number;
  startedAt: string | null;
  completedAt: string | null;
  lastAggregatedAt: string | null;
  errorMessage: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AttendanceStatisticsProgress = {
  progressPercent: number;
  currentStepLabel: string;
  startedAt: string;
};
