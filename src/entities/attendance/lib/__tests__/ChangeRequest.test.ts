import { ChangeRequest } from "../ChangeRequest";

describe("ChangeRequest", () => {
  it("counts unapproved change requests", () => {
    const changeRequests = [
      { __typename: "AttendanceChangeRequest" as const, completed: false },
      { __typename: "AttendanceChangeRequest" as const, completed: true },
      { __typename: "AttendanceChangeRequest" as const, completed: false },
    ];

    const cr = new ChangeRequest(changeRequests);

    expect(cr.getUnapprovedCount()).toBe(2);
  });

  it("returns first unapproved change request", () => {
    const changeRequests = [
      {
        __typename: "AttendanceChangeRequest" as const,
        completed: true,
      },
      {
        __typename: "AttendanceChangeRequest" as const,
        completed: false,
      },
      {
        __typename: "AttendanceChangeRequest" as const,
        completed: false,
      },
    ];

    const cr = new ChangeRequest(changeRequests);

    expect(cr.getFirstUnapproved()).not.toBeNull();
  });

  it("handles null items and empty array", () => {
    const crNull = new ChangeRequest([null, null]);
    expect(crNull.getUnapprovedCount()).toBe(0);
    expect(crNull.getFirstUnapproved()).toBeNull();

    const crEmpty = new ChangeRequest([]);
    expect(crEmpty.getUnapprovedCount()).toBe(0);
    expect(crEmpty.getFirstUnapproved()).toBeNull();

    const crUndefined = new ChangeRequest(undefined);
    expect(crUndefined.getUnapprovedCount()).toBe(0);
    expect(crUndefined.getFirstUnapproved()).toBeNull();
  });
});
