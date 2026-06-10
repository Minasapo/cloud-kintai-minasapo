import { useAppDispatchV2 } from "@app/hooks";
import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import {
  buildEditStaffUpdatePayload,
  EDIT_STAFF_DEFAULT_VALUES,
  StaffFormValues,
  toShiftGroupOptions,
} from "@features/admin/staff/model/staffForm";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useParams } from "react-router-dom";

import * as MESSAGE_CODE from "@/errors";

type ExtendedStaff = StaffType & {
  workType?: string;
  developer?: boolean;
  attendanceManagementEnabled?: boolean | null;
};

export type UseAdminStaffEditorFormReturn = UseFormReturn<StaffFormValues> & {
  staffId: string | undefined;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  onSubmit: (data: StaffFormValues) => Promise<void>;
  tabIndex: number;
  setTabIndex: (index: number) => void;
  cognitoUser: { id?: string; owner?: boolean | null } | undefined;
  isAuthenticated: boolean;
  staffs: StaffType[];
  staffLoading: boolean;
  staffError: unknown;
  shiftGroupOptions: { value: string; label: string }[];
};

export function useAdminStaffEditorForm(): UseAdminStaffEditorFormReturn {
  const { staffId } = useParams();
  const dispatch = useAppDispatchV2();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { getShiftGroups } = useContext(AppConfigContext);

  const {
    staffs,
    loading: staffLoading,
    error: staffError,
    updateStaff,
  } = useStaffs({ isAuthenticated });

  const [tabIndex, setTabIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const form = useForm<StaffFormValues>({
    mode: "onChange",
    defaultValues: EDIT_STAFF_DEFAULT_VALUES as Partial<StaffFormValues>,
  });

  const { setValue, reset } = form;

  useEffect(() => {
    if (!staffId) return;
    const staff = staffs.find((s) => s.cognitoUserId === staffId);
    if (!staff) return;
    const extendedStaff = staff as ExtendedStaff;
    setValue("staffId", staff.cognitoUserId ?? null);
    setValue("internalId", staff.id ?? null);
    setValue("familyName", staff.familyName ?? null);
    setValue("givenName", staff.givenName ?? null);
    setValue("mailAddress", staff.mailAddress ?? null);
    setValue("owner", staff.owner ?? false);
    setValue("sortKey", staff.sortKey ?? null);
    setValue("usageStartDate", staff.usageStartDate ?? null);
    setValue("workType", extendedStaff.workType ?? "weekday");
    setValue("shiftGroup", staff.shiftGroup ?? null);
    setValue(
      "attendanceManagementEnabled",
      extendedStaff.attendanceManagementEnabled ?? true,
    );
    setValue("role", staff.role ?? null);
    setValue("developer", extendedStaff.developer ?? false);
  }, [staffId, staffs, setValue]);

  useEffect(() => {
    if (!staffError) {
      return;
    }

    dispatch(
      pushNotification({
        tone: "error",
        message: MESSAGE_CODE.E00001,
      }),
    );
  }, [dispatch, staffError]);

  const shiftGroupOptions = useMemo(
    () => toShiftGroupOptions(getShiftGroups()),
    [getShiftGroups],
  );

  const onSubmit = async (data: StaffFormValues) => {
    if (!staffId) return;
    setSaving(true);
    try {
      const staff = staffs.find((s) => s.cognitoUserId === staffId);
      if (!staff) {
        dispatch(
          pushNotification({
            tone: "error",
            message: "スタッフが見つかりません",
          }),
        );
        return;
      }
      const payload = buildEditStaffUpdatePayload({
        id: staff.id,
        data,
      });
      await updateStaff(payload);
      reset(data);
      dispatch(
        pushNotification({
          tone: "success",
          message: "保存しました",
        }),
      );
    } catch {
      dispatch(
        pushNotification({
          tone: "error",
          message: MESSAGE_CODE.E05002,
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    ...form,
    staffId,
    saving,
    setSaving,
    onSubmit,
    tabIndex,
    setTabIndex,
    cognitoUser: cognitoUser ?? undefined,
    isAuthenticated,
    staffs,
    staffLoading,
    staffError,
    shiftGroupOptions,
  };
}
