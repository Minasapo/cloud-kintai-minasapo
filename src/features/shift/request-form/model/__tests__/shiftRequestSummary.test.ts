import { createShiftRequestSummary } from "../shiftRequestSummary";

describe("createShiftRequestSummary", () => {
  it("counts work, fixed off, and requested off days", () => {
    expect(
      createShiftRequestSummary({
        "2026-04-01": { status: "work" },
        "2026-04-02": { status: "work" },
        "2026-04-03": { status: "fixedOff" },
        "2026-04-04": { status: "requestedOff" },
        "2026-04-05": { status: "auto" },
      }),
    ).toEqual({
      workDays: 2,
      fixedOffDays: 1,
      requestedOffDays: 1,
    });
  });

  it("returns zero counts when no dates are selected", () => {
    expect(createShiftRequestSummary({})).toEqual({
      workDays: 0,
      fixedOffDays: 0,
      requestedOffDays: 0,
    });
  });
});
