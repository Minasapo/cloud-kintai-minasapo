import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  Workflow,
  WorkflowCategory,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import * as MESSAGE_CODE from "@/errors";
import {
  formatBelongingLabel,
  formatStaffDisplayName,
  sendAdminNotificationMail,
} from "@/shared/lib/mail/adminNotification";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD") : value;
};

const buildTargetDateLabel = (workflow: Workflow) => {
  const details = workflow.overTimeDetails;
  if (!details) {
    return "-";
  }

  if (
    workflow.category === WorkflowCategory.PAID_LEAVE ||
    workflow.category === WorkflowCategory.ABSENCE
  ) {
    const start = formatDate(details.startTime);
    const end = formatDate(details.endTime);
    if (start && end && start !== end) {
      return `${start} 〜 ${end}`;
    }
    return start;
  }

  return formatDate(details.date);
};

const buildSubmittedAtLabel = (workflow: Workflow) => {
  const source = workflow.updatedAt || workflow.createdAt;
  const parsed = dayjs(source);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD HH:mm") : source;
};

type SendWorkflowSubmissionNotificationParams = {
  staffs: StaffType[];
  applicant: StaffType | null | undefined;
  workflow: Workflow;
};

export const sendWorkflowSubmissionNotification = async ({
  staffs,
  applicant,
  workflow,
}: SendWorkflowSubmissionNotificationParams) => {
  if (workflow.status !== WorkflowStatus.SUBMITTED) {
    return;
  }

  if (!workflow.id) {
    throw new Error("Workflow identifier is missing.");
  }

  const basePath = import.meta.env.VITE_BASE_PATH;
  if (!basePath) {
    throw new Error(MESSAGE_CODE.E00002);
  }

  const applicantName = formatStaffDisplayName(
    applicant?.familyName,
    applicant?.givenName,
    "スタッフ",
  );
  const belonging = formatBelongingLabel(applicant);
  const categoryLabel = getWorkflowCategoryLabel(workflow);
  const subject = `ワークフロー申請が届きました - ${categoryLabel} / ${applicantName}`;
  const targetDate = buildTargetDateLabel(workflow);
  const submittedAt = buildSubmittedAtLabel(workflow);
  const workflowUrl = `${basePath}/admin/workflow/${workflow.id}`;

  const details = workflow.overTimeDetails;
  const optionalLines: string[] = [];
  if (
    workflow.category === WorkflowCategory.CUSTOM &&
    workflow.customWorkflowTitle?.trim()
  ) {
    optionalLines.push(`申請タイトル：${workflow.customWorkflowTitle.trim()}`);
  }

  if (details?.reason?.trim()) {
    optionalLines.push(`申請理由：${details.reason.trim()}`);
  }

  const body = [
    "管理者 各位",
    "",
    `${applicantName} さんからワークフロー申請が提出されました。`,
    "内容を確認し、必要な対応を行ってください。",
    "",
    "----- 申請情報 -----",
    `申請種別：${categoryLabel}`,
    `対象日：${targetDate}`,
    `申請者：${applicantName} さん`,
    `所属：${belonging}`,
    `申請ID：${workflow.id}`,
    `提出日時：${submittedAt}`,
    ...optionalLines,
    "-----",
    "",
    "確認用URL",
    workflowUrl,
    "",
  ].join("\n");

  await sendAdminNotificationMail({ staffs, subject, body });
};
