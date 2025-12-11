export type ShiftGroupConstraints = {
  min: number | null;
  max: number | null;
  fixed: number | null;
};

export type GroupCoveragePresentation = {
  primary: string;
  primaryColor: string;
  violationReason?: string | null;
  violationTone?: "error" | "warning" | null;
};

export const getGroupCoveragePresentation = (
  actual: number,
  constraints: ShiftGroupConstraints
): GroupCoveragePresentation => {
  const hasMin = constraints.min !== null;
  const hasMax = constraints.max !== null;

  let violationReason: string | null = null;
  let violationTone: "error" | "warning" | null = null;

  if (constraints.fixed !== null) {
    if (actual < constraints.fixed) {
      violationReason = `固定人数 ${constraints.fixed}名を下回っています`;
      violationTone = "error";
    } else if (actual > constraints.fixed) {
      violationReason = `固定人数 ${constraints.fixed}名を超えています`;
      violationTone = "warning";
    }
  } else {
    if (hasMin && actual < (constraints.min as number)) {
      violationReason = `必要人数は${constraints.min}名以上です`;
      violationTone = "error";
    } else if (hasMax && actual > (constraints.max as number)) {
      violationReason = `必要人数は${constraints.max}名以下です`;
      violationTone = "warning";
    }
  }

  let primaryColor = "text.primary";
  if (violationTone === "error") {
    primaryColor = "error.main";
  } else if (violationTone === "warning") {
    primaryColor = "warning.main";
  }

  return {
    primary: `${actual}`,
    primaryColor,
    violationReason,
    violationTone,
  };
};
