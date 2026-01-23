import getAttendanceMailBody from "@features/attendance/edit/lib/attendanceMailTemplate";
import { Attendance, AttendanceHistory } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { StaffType } from "@/hooks/useStaffs/useStaffs";

import { AttendanceDate } from "../AttendanceDate";
import { MailSender } from "./MailSender";

export class AttendanceEditMailSender extends MailSender {
  staff: StaffType;
  attendance: Attendance;

  constructor(staff: StaffType, attendance: Attendance) {
    super();
    this.staff = staff;
    this.attendance = attendance;
  }

  protected getWorkDate(): string {
    const { workDate } = this.attendance;
    return dayjs(workDate).format(AttendanceDate.DisplayFormat);
  }

  protected getStaffName(): string {
    throw new Error("Method not implemented.");
  }

  private getLatestHistory(): AttendanceHistory | null {
    const { histories } = this.attendance;

    if (!histories || histories.length === 0) {
      return null;
    }

    const latestHistory = histories
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.createdAt === b.createdAt) return 0;
        return a.createdAt < b.createdAt ? 1 : -1;
      })[0];

    return latestHistory ?? null;
  }

  changeRequest() {
    const { mailAddress } = this.staff;
    const subject = `勤怠情報変更のお知らせ - ${this.getWorkDate()}`;
    const body = getAttendanceMailBody(
      this.staff,
      this.attendance,
      this.getLatestHistory()
    ).join("\n");

    return this.send([mailAddress], subject, body);
  }
}
