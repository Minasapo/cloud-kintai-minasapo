import { Attendance, AttendanceChangeRequest } from "@/API";

export class ChangeRequest {
  private changeRequests: AttendanceChangeRequest[];

  constructor(changeRequests: Attendance["changeRequests"]) {
    this.changeRequests = changeRequests
      ? changeRequests.filter(
          (item): item is NonNullable<typeof item> => item !== null
        )
      : [];
  }

  getUnapprovedCount() {
    return this.changeRequests.filter(
      (changeRequest) => !changeRequest.completed
    ).length;
  }

  getFirstUnapproved(): AttendanceChangeRequest | null {
    return (
      this.changeRequests.find((changeRequest) => !changeRequest.completed) ??
      null
    );
  }
}
