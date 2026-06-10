import { Stack } from "@mui/material";
import { PageContent } from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import {
  calculateDailyCount,
  generateMockShiftData,
  mockActiveUsers,
  mockStaffs,
} from "./prototype/mockData";
import { PrototypeFooter } from "./prototype/PrototypeFooter";
import { PrototypeHeader } from "./prototype/PrototypeHeader";
import { PrototypeShiftTable } from "./prototype/PrototypeShiftTable";
import { PrototypeToolbarPanel } from "./prototype/PrototypeToolbarPanel";

export default function ShiftCollaborativePrototype() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth],
  );
  const daysInMonth = monthStart.daysInMonth();

  const shiftData = useMemo(
    () => generateMockShiftData(mockStaffs, daysInMonth),
    [daysInMonth],
  );

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }).map((_, i) =>
        monthStart.add(i, "day"),
      ),
    [monthStart, daysInMonth],
  );

  const progress = useMemo(() => {
    let confirmedCount = 0;
    let needsAdjustmentCount = 0;
    let emptyCount = 0;

    days.forEach((day) => {
      const dayKey = day.format("DD");
      const count = calculateDailyCount(shiftData, dayKey);

      if (day.date() <= 10) {
        confirmedCount++;
      } else if (count.work < 2) {
        needsAdjustmentCount++;
      } else if (count.work === 0) {
        emptyCount++;
      }
    });

    return {
      confirmed: confirmedCount,
      needsAdjustment: needsAdjustmentCount,
      empty: emptyCount,
      percentage: Math.round((confirmedCount / days.length) * 100),
    };
  }, [days, shiftData]);

  const handleCellClick = (_staffId: string, _dayKey: string) => {
    // プロトタイプなので実装予定
  };

  const prevMonth = () => setCurrentMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth((m) => m.add(1, "month"));
  const monthLabel = monthStart.format("YYYY年 M月");

  return (
    <Page title="シフト調整(共同) プロトタイプ" width="full">
      <PageContent width="wide" className="py-3">
        <Stack spacing={3}>
          <PrototypeHeader
            mockActiveUsers={mockActiveUsers}
            monthLabel={monthLabel}
          />
          <PrototypeToolbarPanel
            monthStart={monthStart}
            progress={progress}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
          <PrototypeShiftTable
            days={days}
            shiftData={shiftData}
            onCellClick={handleCellClick}
            mockActiveUsers={mockActiveUsers}
          />
          <PrototypeFooter />
        </Stack>
      </PageContent>
    </Page>
  );
}