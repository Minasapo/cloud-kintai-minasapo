import "./styles.scss";

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";

import type { TimeRecorderAnnouncement } from "@/features/attendance/time-recorder/lib/timeRecorderAnnouncement";
import RegisterDashboard from "@/features/attendance/time-recorder/ui/RegisterDashboard";
import RegisterSummaryAttendanceErrorCountCard from "@/features/attendance/time-recorder/ui/RegisterSummaryAttendanceErrorCountCard";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(768));
  const [attendanceErrorCount, setAttendanceErrorCount] = useState(0);
  const [elapsedWorkInfo, setElapsedWorkInfo] =
    useState<TimeRecorderElapsedWorkInfo>({
      visible: false,
      workDurationLabel: "00:00",
      restDurationLabel: "00:00",
    });

  return (
    <div className="register-content">
      <div className="register-content__top-glow" />
      <div className="register-content__bottom-glow" />
      <div className="register-content__inner">
        <div className="register-content__layout">
          {isMobile && (
            <div
              data-testid="register-dashboard-mobile-slot"
              className="register-mobile-dashboard"
            >
              <RegisterSummaryAttendanceErrorCountCard
                attendanceErrorCount={attendanceErrorCount}
                hasAttendanceError={attendanceErrorCount > 0}
              />
            </div>
          )}
          <TimeRecorder
            onAttendanceErrorCountChange={setAttendanceErrorCount}
            onElapsedWorkTimeChange={setElapsedWorkInfo}
          />
          {!isMobile && (
            <RegisterDashboard
              configId={configId}
              announcement={announcement}
              elapsedWorkInfo={elapsedWorkInfo}
              attendanceErrorCount={attendanceErrorCount}
            />
          )}
        </div>
      </div>
    </div>
  );
}
