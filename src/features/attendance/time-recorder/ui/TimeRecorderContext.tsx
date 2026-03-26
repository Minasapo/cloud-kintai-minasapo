import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
} from "react";

import type { WorkStatus } from "../lib/common";

export type TimeRecorderContextValue = {
  today: string;
  staffId: string | null;
  workStatus: WorkStatus;
  directMode: boolean;
  hasChangeRequest: boolean;
  isAttendanceError: boolean;
  clockInDisplayText: string | null;
  clockOutDisplayText: string | null;
  onDirectModeChange: Dispatch<SetStateAction<boolean>>;
  onClockIn: () => void;
  onClockOut: () => void;
  onGoDirectly: () => void;
  onReturnDirectly: () => void;
  onRestStart: () => void;
  onRestEnd: () => void;
  isTimeElapsedError: boolean;
};

const TimeRecorderContext = createContext<TimeRecorderContextValue | null>(null);

type TimeRecorderProviderProps = PropsWithChildren<{
  value: TimeRecorderContextValue;
}>;

export function TimeRecorderProvider({
  value,
  children,
}: TimeRecorderProviderProps) {
  return (
    <TimeRecorderContext.Provider value={value}>
      {children}
    </TimeRecorderContext.Provider>
  );
}

export function useTimeRecorder() {
  const context = useContext(TimeRecorderContext);
  if (!context) {
    throw new Error("useTimeRecorder must be used within TimeRecorderProvider");
  }

  return context;
}
