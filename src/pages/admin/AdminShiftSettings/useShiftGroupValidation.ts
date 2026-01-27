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
    const map = new Map<string, GroupValidationResult>();
    let hasError = false;
    shiftGroups.forEach((group) => {
      const validation = getGroupValidation(group);
      map.set(group.id, validation);
      if (validation.hasError) {
        hasError = true;
      }
    });
    return { validationMap: map, hasValidationError: hasError };
  }, [shiftGroups]);

export default useShiftGroupValidation;
