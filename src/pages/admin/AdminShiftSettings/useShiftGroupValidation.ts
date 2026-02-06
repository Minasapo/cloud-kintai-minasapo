import { useMemo } from "react";

import {
  getGroupValidation,
  GroupValidationResult,
  ShiftGroupFormValue,
} from "./shiftGroupValidation";

type ShiftGroupValidationState = {
  validationMap: Map<string, GroupValidationResult>;
  hasValidationError: boolean;
};

const useShiftGroupValidation = (
  shiftGroups: ShiftGroupFormValue[],
): ShiftGroupValidationState =>
  useMemo(() => {
    const entries = shiftGroups.map((group) => {
      const validation = getGroupValidation(group);
      return [group.id, validation] as const;
    });
    return {
      validationMap: new Map(entries),
      hasValidationError: entries.some(([, validation]) => validation.hasError),
    };
  }, [shiftGroups]);

export default useShiftGroupValidation;
