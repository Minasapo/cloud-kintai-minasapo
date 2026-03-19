import {
  StaffRole,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";
import { Autocomplete, Box, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { CreateStaffInput, UpdateStaffInput } from "@shared/api/graphql/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { handleSyncCognitoUser } from "@/features/admin/staff/model/handleSyncCognitoUser";
import addUserToGroup from "@/hooks/common/addUserToGroup";
import createCognitoUser from "@/hooks/common/createCognitoUser";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";

type Inputs = {
  familyName?: string;
  givenName?: string;
  mailAddress?: string;
  role: string;
};

const defaultValues: Inputs = {
  familyName: undefined,
  givenName: undefined,
  mailAddress: undefined,
  role: StaffRole.STAFF,
};

export const ROLE_OPTIONS = [
  { value: StaffRole.ADMIN, label: "管理者" },
  { value: StaffRole.STAFF, label: "スタッフ" },
  { value: StaffRole.OPERATOR, label: "オペレーター" },
];

export default function CreateStaffDialog({
  staffs,
  refreshStaff,
  createStaff,
  updateStaff,
}: {
  staffs: StaffType[];
  refreshStaff: () => Promise<void>;
  createStaff: (input: CreateStaffInput) => Promise<void>;
  updateStaff: (input: UpdateStaffInput) => Promise<void>;
}) {
  const dispatch = useAppDispatchV2();
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  const handleClickOpen = () => {
    reset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onSubmit = async (data: Inputs) => {
    const { familyName, givenName, mailAddress, role } = data;
    if (!familyName || !givenName || !mailAddress || !role) {
      throw new Error("Invalid data");
    }

    await createCognitoUser(mailAddress, familyName, givenName).catch(() => {
      dispatch(setSnackbarError(MESSAGE_CODE.E10002));
    });

    await addUserToGroup(mailAddress, role).catch(() => {
      dispatch(setSnackbarError(MESSAGE_CODE.E10002));
    });

    await handleSyncCognitoUser(
      staffs,
      refreshStaff,
      createStaff,
      updateStaff,
    ).catch(() => {
      dispatch(setSnackbarError(MESSAGE_CODE.E10001));
    });

    dispatch(setSnackbarSuccess(MESSAGE_CODE.S10002));
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-700/15 bg-[#19b985] px-4 text-xs font-semibold leading-none tracking-wide text-white shadow-[0_10px_20px_-14px_rgba(5,150,105,0.75)] transition hover:bg-[#17ab7b] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
        onClick={handleClickOpen}
      >
        <span className="inline-flex items-center gap-1.5 leading-none">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span>スタッフ登録</span>
        </span>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/35 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">スタッフ登録</h2>
              <p className="mt-1 text-sm text-slate-600">
                登録するスタッフの情報を入力してください。
              </p>
            </div>
            <div className="px-6 py-5">
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    {...register("familyName", { required: true })}
                    label="名前(姓)"
                    type="text"
                    fullWidth
                    variant="standard"
                  />
                  <TextField
                    {...register("givenName", { required: true })}
                    label="名前(名)"
                    type="text"
                    fullWidth
                    variant="standard"
                  />
                </Stack>
                <TextField
                  {...register("mailAddress", { required: true })}
                  label="メールアドレス"
                  type="email"
                  fullWidth
                  variant="standard"
                />
                <Box>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        value={
                          ROLE_OPTIONS.find(
                            (option) => String(option.value) === field.value,
                          ) ?? null
                        }
                        disablePortal
                        id="combo-box-demo"
                        options={ROLE_OPTIONS}
                        getOptionLabel={(option) => option.label}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="権限"
                            required
                            variant="standard"
                          />
                        )}
                        onChange={(_, data) => {
                          if (!data) return;
                          setValue("role", data.value);
                        }}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                className="rounded-md border-none px-3 py-1.5 text-sm text-slate-700 outline-none transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                onClick={handleClose}
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!isDirty || !isValid || isSubmitting}
                className="inline-flex min-w-[72px] items-center justify-center gap-1.5 rounded-md border border-emerald-700/15 bg-[#19b985] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#17ab7b] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-300"
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? (
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-30"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : null}
                登録
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
