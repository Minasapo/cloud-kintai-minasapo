import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { DailyReport, DailyReportStatus } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import * as MESSAGE_CODE from "@/errors";
import {
  formatBelongingLabel,
  formatStaffDisplayName,
  sendAdminNotificationMail,
} from "@/shared/lib/mail/adminNotification";

type SendDailyReportSubmissionNotificationParams = {
  staffs: StaffType[];
  report: DailyReport;
  fallbackAuthorName?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD") : value;
};

const formatDateTime = (value?: string | null) => {
  const parsed = value ? dayjs(value) : null;
  if (parsed?.isValid()) {
    return parsed.format("YYYY/MM/DD HH:mm");
  }
  return dayjs().format("YYYY/MM/DD HH:mm");
};

export const sendDailyReportSubmissionNotification = async ({
  staffs,
  report,
  fallbackAuthorName = "スタッフ",
}: SendDailyReportSubmissionNotificationParams) => {
  if (report.status !== DailyReportStatus.SUBMITTED) {
    return;
  }

  if (!report.id) {
    throw new Error("Daily report identifier is missing.");
  }

  const basePath = import.meta.env.VITE_BASE_PATH;
  if (!basePath) {
    throw new Error(MESSAGE_CODE.E00002);
  }

  const submitter = staffs.find((staff) => staff.id === report.staffId) ?? null;
  const authorName = formatStaffDisplayName(
    submitter?.familyName,
    submitter?.givenName,
    fallbackAuthorName,
  );
  const belonging = formatBelongingLabel(submitter);
  const reportDateLabel = formatDate(report.reportDate);
  const submittedAt = formatDateTime(report.updatedAt);
  const subject = `日報が提出されました - ${reportDateLabel} / ${authorName}`;
  const title = report.title?.trim() || "(無題)";
  const summary = report.content?.trim() || "内容は本文をご確認ください。";
  const reportUrl = `${basePath}/admin/daily-report/${report.id}`;

  const body = [
    "管理者 各位",
    "",
    `${authorName} さんから日報が提出されました。`,
    "",
    "----- 日報情報 -----",
    `対象日：${reportDateLabel}`,
    `タイトル：${title}`,
    `提出者：${authorName} さん`,
    `所属：${belonging}`,
    `日報ID：${report.id}`,
    `提出日時：${submittedAt}`,
    "-----",
    "",
    "概要",
    summary,
    "",
    "確認用URL",
    reportUrl,
    "",
  ].join("\n");

  await sendAdminNotificationMail({ staffs, subject, body });
};
