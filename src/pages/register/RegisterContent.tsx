import { useState } from "react";

import type { TimeRecorderAnnouncement } from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";
import RegisterDashboard from "@/features/attendance/time-recorder/ui/RegisterDashboard";
import TimeRecorder, {
  type TimeRecorderElapsedWorkInfo,
} from "@/features/attendance/time-recorder/ui/TimeRecorder";

type RegisterContentProps = {
  configId: string | null;
  announcement: TimeRecorderAnnouncement;
};

export default function RegisterContent({
  configId,
  announcement,
}: RegisterContentProps) {
  const [attendanceErrorCount, setAttendanceErrorCount] = useState(0);
  const [elapsedWorkInfo, setElapsedWorkInfo] =
    useState<TimeRecorderElapsedWorkInfo>({
      visible: false,
      workDurationLabel: "00:00",
      restDurationLabel: "00:00",
    });

  return (
    <div className="relative flex h-full flex-col overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_52%,#f8fafc_100%)] py-3 md:py-10">
      <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(15,168,94,0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.08),transparent_65%)]" />
      <div className="relative mx-auto w-full max-w-[98rem] px-2 lg:px-4">
        <div className="lg:grid lg:grid-cols-[minmax(0,33rem)_minmax(30rem,38rem)] lg:justify-center lg:gap-6">
          <TimeRecorder
            onAttendanceErrorCountChange={setAttendanceErrorCount}
            onElapsedWorkTimeChange={setElapsedWorkInfo}
          />
          <RegisterDashboard
            configId={configId}
            announcement={announcement}
            elapsedWorkInfo={elapsedWorkInfo}
            attendanceErrorCount={attendanceErrorCount}
          />
        </div>
      </div>
    </div>
  );
}
