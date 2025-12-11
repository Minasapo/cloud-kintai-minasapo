import { useMemo } from "react";

import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";

import { WorkStatus, WorkStatusCodes } from "../common";

type ClockInItemProps = {
  workStatus: WorkStatus;
  onClick: () => void;
};

export default function ClockInItem({ workStatus, onClick }: ClockInItemProps) {
  const isBeforeWork = useMemo(
    () => workStatus.code === WorkStatusCodes.BEFORE_WORK,
    [workStatus.code]
  );

  return <ClockInButton isBeforeWork={isBeforeWork} onClockIn={onClick} />;
}
