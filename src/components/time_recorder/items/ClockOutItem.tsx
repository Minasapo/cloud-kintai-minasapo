import { useMemo } from "react";

import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";

import { WorkStatus, WorkStatusCodes } from "../common";

type ClockOutItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
};

export default function ClockOutItem({
  workStatus,
  onClick,
}: ClockOutItemProps) {
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus?.code]
  );

  return <ClockOutButton isWorking={Boolean(isWorking)} onClockOut={onClick} />;
}
