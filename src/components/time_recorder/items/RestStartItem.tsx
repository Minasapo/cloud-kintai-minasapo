import { useMemo } from "react";

import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";

import { WorkStatus, WorkStatusCodes } from "../common";

type RestStartItemProps = {
  workStatus: WorkStatus | null;
  onClick: () => void;
  disabled?: boolean;
};

export default function RestStartItem({
  workStatus,
  onClick,
  disabled = false,
}: RestStartItemProps) {
  const isWorking = useMemo(
    () => workStatus?.code === WorkStatusCodes.WORKING,
    [workStatus?.code]
  );

  return (
    <RestStartButton
      isWorking={Boolean(isWorking)}
      onRestStart={onClick}
      disabled={disabled}
    />
  );
}
