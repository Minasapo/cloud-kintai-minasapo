import {
  StaffRole,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";
import { sendMail } from "@shared/api/graphql/documents/queries";

import * as MESSAGE_CODE from "@/errors";
import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

const parseOverrideRecipients = (): string[] => {
  const raw = (
    import.meta.env.VITE_ADMIN_NOTIFICATION_EMAILS as string | undefined
  )
    ?.split(/[,\n]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return raw ?? [];
};

const ADMIN_NOTIFICATION_OVERRIDE_RECIPIENTS = parseOverrideRecipients();

const resolveRecipientsFromStaffs = (staffs: StaffType[]) =>
  staffs
    .filter(
      (staff) =>
        staff.role === StaffRole.ADMIN || staff.role === StaffRole.STAFF_ADMIN,
    )
    .map((staff) => staff.mailAddress?.trim())
    .filter((address): address is string => Boolean(address));

export const resolveAdminNotificationRecipients = (
  staffs: StaffType[],
): string[] => {
  if (ADMIN_NOTIFICATION_OVERRIDE_RECIPIENTS.length > 0) {
    return ADMIN_NOTIFICATION_OVERRIDE_RECIPIENTS;
  }

  const recipients = resolveRecipientsFromStaffs(staffs);
  if (recipients.length === 0) {
    throw new Error(MESSAGE_CODE.E00002);
  }

  return recipients;
};

export const formatStaffDisplayName = (
  familyName?: string | null,
  givenName?: string | null,
  fallback = "スタッフ",
): string => {
  const safeFamily = familyName?.trim() ?? "";
  const safeGiven = givenName?.trim() ?? "";

  if (safeFamily && safeGiven) {
    return `${safeFamily} ${safeGiven}`;
  }

  if (safeFamily || safeGiven) {
    return safeFamily || safeGiven;
  }

  return fallback;
};

export const formatBelongingLabel = (
  staff?: {
    shiftGroup?: string | null;
    workType?: string | null;
  } | null,
): string => {
  const shiftGroup = staff?.shiftGroup?.trim();
  if (shiftGroup) {
    return shiftGroup;
  }

  const workType = staff?.workType?.trim();
  if (workType) {
    return workType;
  }

  return "未設定";
};

type AdminNotificationPayload = {
  staffs: StaffType[];
  subject: string;
  body: string;
};

export const sendAdminNotificationMail = async ({
  staffs,
  subject,
  body,
}: AdminNotificationPayload) => {
  const to = resolveAdminNotificationRecipients(staffs);
  if (!subject?.trim() || !body?.trim()) {
    throw new Error(MESSAGE_CODE.E00002);
  }

  await graphqlClient.graphql({
    query: sendMail,
    variables: {
      data: {
        to,
        subject,
        body,
      },
    },
  });
};
