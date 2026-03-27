import { useAppDispatchV2 } from "@app/hooks";
import {
  staffApi,
  useCreateStaffMutation,
  useDeleteStaffMutation,
  useGetStaffsQuery,
  useUpdateStaffMutation,
} from "@entities/staff/api/staffApi";
import {
  ApproverMultipleMode,
  ApproverSettingMode,
  CreateStaffInput,
  DeleteStaffInput,
  Staff,
  UpdateStaffInput,
} from "@shared/api/graphql/types";
import { useCallback, useMemo } from "react";

import { StaffExternalLink } from "@/entities/staff/externalLink";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";

import fetchStaffs from "./fetchStaffs";

export enum StaffRole {
  OWNER = "Owner",
  ADMIN = "Admin",
  STAFF_ADMIN = "StaffAdmin",
  STAFF = "Staff",
  GUEST = "Guest",
  OPERATOR = "Operator",
  NONE = "None",
}

export const roleLabelMap = new Map<StaffRole, string>([
  [StaffRole.OWNER, "オーナー"],
  [StaffRole.ADMIN, "管理者"],
  [StaffRole.STAFF_ADMIN, "スタッフ管理者"],
  [StaffRole.STAFF, "スタッフ"],
  [StaffRole.GUEST, "ゲスト"],
  [StaffRole.OPERATOR, "オペレーター"],
  [StaffRole.NONE, "未設定"],
]);

export type StaffType = {
  id: Staff["id"];
  cognitoUserId: Staff["cognitoUserId"];
  familyName: Staff["familyName"];
  givenName: Staff["givenName"];
  mailAddress: Staff["mailAddress"];
  owner: Staff["owner"];
  role: StaffRole;
  enabled: Staff["enabled"];
  status: Staff["status"];
  createdAt: Staff["createdAt"];
  updatedAt: Staff["updatedAt"];
  version?: Staff["version"];
  usageStartDate?: Staff["usageStartDate"];
  notifications?: Staff["notifications"];
  externalLinks?: (StaffExternalLink | null)[] | null;
  sortKey?: Staff["sortKey"];
  workType?: string | null;
  developer?: Staff["developer"];
  approverSetting?: ApproverSettingMode | null;
  approverSingle?: string | null;
  approverMultiple?: (string | null)[] | null;
  approverMultipleMode?: ApproverMultipleMode | null;
  shiftGroup?: string | null;
  attendanceManagementEnabled?: boolean | null;
};

export function mappingStaffRole(role: Staff["role"]): StaffRole {
  switch (role) {
    case StaffRole.ADMIN:
      return StaffRole.ADMIN;
    case StaffRole.STAFF_ADMIN:
      return StaffRole.STAFF_ADMIN;
    case StaffRole.STAFF:
      return StaffRole.STAFF;
    case StaffRole.GUEST:
      return StaffRole.GUEST;
    case StaffRole.OPERATOR:
      return StaffRole.OPERATOR;
    default:
      return StaffRole.NONE;
  }
}

export type UseStaffsParams = {
  isAuthenticated: boolean;
};

function mapStaff(staff: Staff): StaffType {
  return {
    id: staff.id,
    cognitoUserId: staff.cognitoUserId,
    familyName: staff.familyName,
    givenName: staff.givenName,
    mailAddress: staff.mailAddress,
    owner: staff.owner ?? false,
    role: mappingStaffRole(staff.role),
    enabled: staff.enabled,
    status: staff.status,
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
    version: staff.version,
    usageStartDate: staff.usageStartDate,
    notifications: staff.notifications,
    externalLinks: staff.externalLinks ?? null,
    sortKey: staff.sortKey,
    workType: (staff as unknown as Record<string, unknown>).workType as
      | string
      | null,
    developer: (staff as unknown as Record<string, unknown>).developer as
      | boolean
      | undefined,
    approverSetting: staff.approverSetting ?? null,
    approverSingle: staff.approverSingle ?? null,
    approverMultiple: staff.approverMultiple ?? null,
    approverMultipleMode: staff.approverMultipleMode ?? null,
    shiftGroup: staff.shiftGroup ?? null,
    attendanceManagementEnabled: (
      staff as unknown as Record<string, unknown>
    ).attendanceManagementEnabled as boolean | null | undefined,
  };
}

function toError(
  error: unknown,
): Error | null {
  if (!error) {
    return null;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return new Error((error as { message: string }).message);
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: unknown }).error === "string"
  ) {
    return new Error((error as { error: string }).error);
  }

  return new Error("Unknown staff error");
}

export function useStaffs({ isAuthenticated }: UseStaffsParams) {
  const dispatch = useAppDispatchV2();
  const {
    data,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useGetStaffsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createStaffMutation, createState] = useCreateStaffMutation();
  const [updateStaffMutation, updateState] = useUpdateStaffMutation();
  const [deleteStaffMutation, deleteState] = useDeleteStaffMutation();

  const staffs = useMemo(() => (data ?? []).map(mapStaff), [data]);
  const loading =
    isAuthenticated &&
    (isLoading ||
      isFetching ||
      createState.isLoading ||
      updateState.isLoading ||
      deleteState.isLoading);
  const error =
    toError(queryError) ??
    toError(createState.error) ??
    toError(updateState.error) ??
    toError(deleteState.error);

  const refreshStaff = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }

    await refetch();
  }, [isAuthenticated, refetch]);

  const createStaff = useCallback(async (input: CreateStaffInput) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }
    const inputWithDefault = {
      ...input,
      attendanceManagementEnabled:
        (
          input as CreateStaffInput & {
            attendanceManagementEnabled?: boolean | null;
          }
        ).attendanceManagementEnabled ?? true,
    } as CreateStaffInput;

    await createStaffMutation(inputWithDefault).unwrap();
  }, [createStaffMutation, isAuthenticated]);

  const updateStaff = useCallback(async (input: UpdateStaffInput) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }
    const currentStaff = staffs.find((staff) => staff.id === input.id);

    await updateStaffMutation({
      input: {
        ...input,
        version: getNextVersion(currentStaff?.version),
      },
      condition: buildVersionOrUpdatedAtCondition(
        currentStaff?.version,
        currentStaff?.updatedAt,
      ),
    }).unwrap();
  }, [isAuthenticated, staffs, updateStaffMutation]);

  const deleteStaff = useCallback(async (input: DeleteStaffInput) => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }
    await deleteStaffMutation(input).unwrap();
  }, [deleteStaffMutation, isAuthenticated]);

  const getAllStaffs = useCallback(async (): Promise<StaffType[]> => {
    if (!isAuthenticated) {
      throw new Error("User is not authenticated");
    }
    const res = await fetchStaffs();
    dispatch(
      staffApi.util.upsertQueryData("getStaffs", undefined, res) as never,
    );
    return res.map(mapStaff);
  }, [dispatch, isAuthenticated]);

  return {
    loading,
    error,
    staffs,
    refreshStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getAllStaffs,
  };
}
