import useAppConfig from "@entities/app-config/model/useAppConfig";
import { type OvertimeCheckContext, validateOvertimeCheck } from "@entities/attendance/validation/overtimeCheckValidator";
import { useMemo } from "react";

type UseOvertimeErrorProps = {
  watchedEndTime?: string | null;
  appConfig: ReturnType<typeof useAppConfig>["config"];
  configEndTime: ReturnType<typeof useAppConfig>["derived"]["endTime"];
  overtimeRequestEndTime?: string | null;
  hasOvertimeRequest: boolean;
};

export const useOvertimeError = ({
  watchedEndTime,
  appConfig,
  configEndTime,
  overtimeRequestEndTime,
  hasOvertimeRequest,
}: UseOvertimeErrorProps): string | null => {
  return useMemo(() => {
    if (!watchedEndTime || !appConfig) {
      return null;
    }
    const context: OvertimeCheckContext = {
      workEndTime: configEndTime.format("HH:mm"),
      overTimeCheckEnabled: appConfig.overTimeCheckEnabled ?? false,
      overtimeRequestEndTime: overtimeRequestEndTime ?? null,
      hasOvertimeRequest,
    };
    const result = validateOvertimeCheck(watchedEndTime, context);
    if (!result.isValid && result.errorMessage) {
      return result.errorMessage;
    }
    return null;
  }, [watchedEndTime, appConfig, overtimeRequestEndTime, hasOvertimeRequest, configEndTime]);
};