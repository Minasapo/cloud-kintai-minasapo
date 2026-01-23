import { WorkflowCategory } from "@shared/api/graphql/types";

import {
  CATEGORY_LABELS,
  CLOCK_CORRECTION_CHECK_IN_LABEL,
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  getWorkflowCategoryLabel,
  resolveClockCorrectionLabel,
  REVERSE_CATEGORY,
  REVERSE_STATUS,
  STATUS_LABELS,
} from "../workflowLabels";

describe("workflowLabels", () => {
  it("resolves clock correction labels based on reason", () => {
    expect(resolveClockCorrectionLabel(CLOCK_CORRECTION_CHECK_IN_LABEL)).toBe(
      CLOCK_CORRECTION_CHECK_IN_LABEL
    );
    expect(resolveClockCorrectionLabel(CLOCK_CORRECTION_CHECK_OUT_LABEL)).toBe(
      CLOCK_CORRECTION_CHECK_OUT_LABEL
    );
    expect(resolveClockCorrectionLabel(undefined)).toBe(
      "打刻修正(出勤/退勤忘れ)"
    );
  });

  it("returns category label with clock correction handled via reason", () => {
    expect(
      getWorkflowCategoryLabel({
        category: WorkflowCategory.CLOCK_CORRECTION,
        overTimeDetails: { reason: CLOCK_CORRECTION_CHECK_OUT_LABEL },
      })
    ).toBe(CLOCK_CORRECTION_CHECK_OUT_LABEL);

    expect(
      getWorkflowCategoryLabel({ category: WorkflowCategory.PAID_LEAVE })
    ).toBe(CATEGORY_LABELS[WorkflowCategory.PAID_LEAVE]);
  });

  it("returns '-' when category is missing", () => {
    expect(getWorkflowCategoryLabel(null)).toBe("-");
    expect(getWorkflowCategoryLabel({})).toBe("-");
  });

  it("includes reverse mappings for category and status labels", () => {
    Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
      expect(REVERSE_CATEGORY[label]).toBe(key);
    });
    expect(REVERSE_CATEGORY[CLOCK_CORRECTION_CHECK_IN_LABEL]).toBe(
      WorkflowCategory.CLOCK_CORRECTION
    );
    expect(REVERSE_CATEGORY[CLOCK_CORRECTION_CHECK_OUT_LABEL]).toBe(
      WorkflowCategory.CLOCK_CORRECTION
    );

    Object.entries(STATUS_LABELS).forEach(([key, label]) => {
      expect(REVERSE_STATUS[label]).toBe(key);
    });
  });
});
