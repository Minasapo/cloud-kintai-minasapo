import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { useParams } from "react-router-dom";

import CommonBreadcrumbs from "@/components/common/CommonBreadcrumbs";
import { AuthContext } from "@/context/AuthContext";

import { ApproverMultipleMode, ApproverSettingMode } from "../../../API";
import { useAppDispatchV2 } from "../../../app/hooks";
import Title from "../../../components/Title/Title";
import * as MESSAGE_CODE from "../../../errors";
import addUserToGroup from "../../../hooks/common/addUserToGroup";
import removeUserFromGroup from "../../../hooks/common/removeUserFromGroup";
import updateCognitoUser from "../../../hooks/common/updateCognitoUser";
import { Staff } from "../../../hooks/useStaffs/common";
import useStaffs, {
  StaffRole,
  StaffType,
} from "../../../hooks/useStaffs/useStaffs";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";
import { ROLE_OPTIONS } from "../AdminStaff/CreateStaffDialog";
import WORK_TYPE_OPTIONS from "../AdminStaff/workTypeOptions";

type Inputs = {
  staffId?: Staff["sub"];
  familyName?: Staff["familyName"] | null;
  givenName?: Staff["givenName"] | null;
  mailAddress?: Staff["mailAddress"];
  owner: boolean;
  beforeRoles: StaffRole[];
  role: string;
  workType?: string | null;
  usageStartDate?: Staff["usageStartDate"] | null;
  sortKey: string;
  approverSetting: ApproverSettingMode;
  approverSingle: StaffType["cognitoUserId"] | null;
  approverMultiple: StaffType["cognitoUserId"][];
  approverMultipleMode: ApproverMultipleMode;
};

const defaultValues: Inputs = {
  staffId: undefined,
  mailAddress: undefined,
  owner: false,
  beforeRoles: [],
  role: StaffRole.STAFF,
  workType: undefined,
  sortKey: "1",
  approverSetting: ApproverSettingMode.ADMINS,
  approverSingle: null,
  approverMultiple: [],
  approverMultipleMode: ApproverMultipleMode.ANY,
};

export default function AdminStaffEditor() {
  const { cognitoUser } = useContext(AuthContext);
  const dispatch = useAppDispatchV2();
  const { staffId } = useParams();

  const [saving, setSaving] = useState(false);

  const {
    staffs,
    loading: staffLoading,
    error: staffError,
    updateStaff,
  } = useStaffs();

  const {
    register,
    control,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = (data: Inputs) => {
    const {
      familyName,
      givenName,
      mailAddress,
      beforeRoles,
      role,
      owner,
      usageStartDate,
    } = data;

    if (!familyName || !givenName || !mailAddress || !role) {
      dispatch(setSnackbarError(MESSAGE_CODE.E05003));
      return;
    }

    setSaving(true);
    updateCognitoUser(mailAddress, familyName, givenName, mailAddress, owner)
      .then(async () => {
        if (beforeRoles.length >= 1 && beforeRoles[0] !== role) {
          const removeGroupsResponse = await Promise.all(
            beforeRoles.map(async (r) => {
              await removeUserFromGroup(mailAddress, String(r)).catch((e) => {
                throw e;
              });
            })
          )
            .then(() => true)
            .catch(() => false);

          if (!removeGroupsResponse) {
            dispatch(setSnackbarError(MESSAGE_CODE.E05003));
            return;
          }

          await addUserToGroup(mailAddress, role).catch(() => {
            dispatch(setSnackbarError(MESSAGE_CODE.E05003));
          });
        }

        const staff = staffs.find((s) => s.cognitoUserId === staffId);
        if (!staff) {
          dispatch(setSnackbarError(MESSAGE_CODE.E05001));
          return;
        }

        await updateStaff({
          id: staff.id,
          familyName,
          givenName,
          mailAddress,
          owner,
          role,
          usageStartDate: usageStartDate?.toISOString() || null,
          sortKey: data.sortKey,
          // include workType; cast to any because generated UpdateStaffInput may not include it yet
          ...(data.workType ? { workType: data.workType } : {}),
          // approver settings
          approverSetting: data.approverSetting,
          approverSingle: data.approverSingle ?? null,
          approverMultiple: data.approverMultiple ?? [],
          approverMultipleMode: data.approverMultipleMode,
        })
          .then(() => {
            dispatch(setSnackbarSuccess(MESSAGE_CODE.S05003));
          })
          .catch(() => {
            dispatch(setSnackbarError(MESSAGE_CODE.E05003));
          });
      })
      .catch(() => {
        dispatch(setSnackbarError(MESSAGE_CODE.E05003));
      })
      .finally(() => {
        setSaving(false);
      });
  };

  useEffect(() => {
    if (!staffId || staffLoading || staffs.length === 0) {
      return;
    }

    const staff = staffs.find((s) => s.cognitoUserId === staffId);
    if (!staff) {
      dispatch(setSnackbarError(MESSAGE_CODE.E05001));
      return;
    }

    setValue("staffId", staff.cognitoUserId);
    setValue("familyName", staff.familyName);
    setValue("givenName", staff.givenName);
    setValue("mailAddress", staff.mailAddress);
    setValue("owner", staff.owner || false);
    setValue("beforeRoles", [staff.role]);
    setValue("role", staff.role);
    setValue(
      "workType",
      (staff as unknown as Record<string, unknown>).workType as string | null
    );
    setValue(
      "usageStartDate",
      staff.usageStartDate ? dayjs(staff.usageStartDate) : null
    );
    setValue("sortKey", staff.sortKey || "");
    // initialize approver-related fields from staff record
    setValue(
      "approverSetting",
      (staff as unknown as { approverSetting?: ApproverSettingMode })
        .approverSetting ?? ApproverSettingMode.ADMINS
    );
    setValue(
      "approverSingle",
      (staff as unknown as { approverSingle?: string }).approverSingle ?? null
    );
    setValue(
      "approverMultiple",
      (staff as unknown as { approverMultiple?: string[] }).approverMultiple ??
        []
    );
    setValue(
      "approverMultipleMode",
      (staff as unknown as { approverMultipleMode?: ApproverMultipleMode })
        .approverMultipleMode ?? ApproverMultipleMode.ANY
    );
  }, [staffId, staffLoading]);

  if (staffLoading) {
    return <LinearProgress />;
  }

  if (staffError) {
    dispatch(setSnackbarError(MESSAGE_CODE.E05001));
    return null;
  }

  const makeStaffName = () => {
    const staff = staffs.find((s) => s.cognitoUserId === staffId);
    if (!staff) {
      return "(未設定)";
    }

    const { familyName, givenName } = staff;
    if (!familyName || !givenName) {
      return "(未設定)";
    }

    return `${familyName} ${givenName}`;
  };

  return (
    <Container maxWidth="xl" sx={{ height: 1, pt: 2 }}>
      <Stack spacing={2}>
        <CommonBreadcrumbs
          items={[
            { label: "TOP", href: "/" },
            { label: "スタッフ一覧", href: "/admin/staff" },
          ]}
          current={makeStaffName()}
        />
        <Title>スタッフ編集</Title>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>スタッフID</TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {getValues("staffId")}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>汎用コード</TableCell>
                <TableCell>
                  <Typography variant="body1">
                    <TextField
                      {...register("sortKey")}
                      size="small"
                      placeholder="例：1、2、3...やZZ001、ZZ002...など"
                      helperText="このコードを利用してスタッフ一覧などの表示順を指定します。"
                      sx={{ width: 400 }}
                    />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>スタッフ名</TableCell>
                <StaffNameTableCell register={register} />
              </TableRow>
              <TableRow>
                <TableCell>メールアドレス</TableCell>
                <MailAddressTableCell register={register} />
              </TableRow>
              <TableRow>
                <TableCell>権限</TableCell>
                <StaffRoleTableCell control={control} setValue={setValue} />
              </TableRow>
              {cognitoUser?.owner && (
                <TableRow>
                  <TableCell>オーナー権限</TableCell>
                  <TableCell>
                    <Controller
                      name="owner"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onChange={() => {
                            setValue("owner", !field.value);
                            field.onChange(!field.value);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>利用開始日</TableCell>
                <TableCell>
                  <Typography variant="body1">
                    <Controller
                      name="usageStartDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value}
                          format="YYYY/M/D"
                          slotProps={{
                            textField: { size: "small" },
                          }}
                        />
                      )}
                    />
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>勤務形態</TableCell>
                <TableCell>
                  <Typography variant="body1">
                    <Controller
                      name="workType"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          value={
                            WORK_TYPE_OPTIONS.find(
                              (option) => option.value === field.value
                            ) ?? null
                          }
                          options={WORK_TYPE_OPTIONS}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{ width: 400 }}
                            />
                          )}
                          onChange={(_, data) => {
                            if (!data) return;
                            setValue("workType", data.value);
                            field.onChange(data.value);
                          }}
                        />
                      )}
                    />
                  </Typography>
                </TableCell>
              </TableRow>
              <ApproverSettingTableRows
                control={control}
                setValue={setValue}
                watch={watch}
                staffs={staffs}
                currentCognitoUserId={cognitoUser?.id}
              />
            </TableBody>
          </Table>
        </TableContainer>
        <Box>
          <Button
            variant="contained"
            size="medium"
            disabled={!isValid || !isDirty || saving || isSubmitting}
            startIcon={saving ? <CircularProgress size={15} /> : undefined}
            onClick={handleSubmit(onSubmit)}
          >
            保存
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}

function ApproverSettingTableRows({
  control,
  setValue,
  watch,
  staffs,
  currentCognitoUserId,
}: {
  control: Control<Inputs>;
  setValue: UseFormSetValue<Inputs>;
  watch: UseFormWatch<Inputs>;
  staffs: StaffType[];
  currentCognitoUserId?: string | null;
}) {
  const adminOptions = useMemo(() => {
    return staffs
      .filter(
        (staff) =>
          (staff.role === StaffRole.ADMIN || staff.owner) &&
          staff.cognitoUserId !== currentCognitoUserId
      )
      .map((staff) => ({
        value: staff.cognitoUserId,
        label:
          [staff.familyName, staff.givenName]
            .filter((name): name is string => Boolean(name))
            .join(" ") || staff.mailAddress,
        description: staff.mailAddress,
      }));
  }, [staffs, currentCognitoUserId]);

  const approverSetting = watch("approverSetting");
  const approverMultiple = watch("approverMultiple") ?? [];
  const approverMultipleMode = watch("approverMultipleMode");

  const selectedMultipleOptions = approverMultiple
    .map((value) => adminOptions.find((option) => option.value === value))
    .filter(
      (
        option
      ): option is { value: string; label: string; description: string } =>
        Boolean(option)
    );

  return (
    <>
      <TableRow>
        <TableCell>承認者設定</TableCell>
        <TableCell>
          <Controller
            name="approverSetting"
            control={control}
            render={({ field }) => (
              <Stack spacing={1}>
                <RadioGroup
                  row
                  value={field.value}
                  onChange={(event) => {
                    const nextValue = event.target.value as ApproverSettingMode;
                    field.onChange(nextValue);
                    if (nextValue === ApproverSettingMode.ADMINS) {
                      setValue("approverSingle", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("approverMultiple", [], {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue(
                        "approverMultipleMode",
                        ApproverMultipleMode.ANY,
                        {
                          shouldDirty: true,
                        }
                      );
                    }
                    if (nextValue === ApproverSettingMode.SINGLE) {
                      setValue("approverMultiple", [], {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue(
                        "approverMultipleMode",
                        ApproverMultipleMode.ANY,
                        {
                          shouldDirty: true,
                        }
                      );
                    }
                    if (nextValue === ApproverSettingMode.MULTIPLE) {
                      setValue("approverSingle", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <FormControlLabel
                    value={ApproverSettingMode.ADMINS}
                    control={<Radio />}
                    label="管理者全員 (デフォルト)"
                  />
                  <FormControlLabel
                    value={ApproverSettingMode.SINGLE}
                    control={<Radio />}
                    label="特定の承認者を1名に限定"
                  />
                  <FormControlLabel
                    value={ApproverSettingMode.MULTIPLE}
                    control={<Radio />}
                    label="特定の承認者を複数選択"
                  />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  ※承認者設定はモックアップです。保存してもバックエンド設定はまだ適用されません。
                </Typography>
              </Stack>
            )}
          />
        </TableCell>
      </TableRow>
      {approverSetting === ApproverSettingMode.SINGLE && (
        <TableRow>
          <TableCell />
          <TableCell>
            <Controller
              name="approverSingle"
              control={control}
              rules={{
                validate: (value) => {
                  if (approverSetting !== ApproverSettingMode.SINGLE)
                    return true;
                  return Boolean(value) || "承認者を選択してください";
                },
              }}
              render={({ field, fieldState }) => {
                const valueOption = adminOptions.find(
                  (option) => option.value === field.value
                );
                return (
                  <Autocomplete
                    value={valueOption ?? null}
                    options={adminOptions}
                    onChange={(_, newValue) => {
                      field.onChange(newValue?.value ?? null);
                    }}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) =>
                      option.value === value.value
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        sx={{ width: 400 }}
                        label="承認者"
                        placeholder="承認者を検索"
                        error={Boolean(fieldState.error)}
                        helperText={
                          fieldState.error?.message ||
                          "承認者を1名選択してください。"
                        }
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                );
              }}
            />
          </TableCell>
        </TableRow>
      )}
      {approverSetting === ApproverSettingMode.MULTIPLE && (
        <>
          <TableRow>
            <TableCell />
            <TableCell>
              <Controller
                name="approverMultiple"
                control={control}
                rules={{
                  validate: (value) => {
                    if (approverSetting !== ApproverSettingMode.MULTIPLE)
                      return true;
                    return (
                      (value?.length ?? 0) > 0 || "承認者を選択してください"
                    );
                  },
                }}
                render={({ field, fieldState }) => {
                  const valueOptions = (field.value ?? [])
                    .map((v) =>
                      adminOptions.find((option) => option.value === v)
                    )
                    .filter((option): option is (typeof adminOptions)[number] =>
                      Boolean(option)
                    );
                  return (
                    <Autocomplete
                      multiple
                      options={adminOptions}
                      value={valueOptions}
                      onChange={(_, newValue) => {
                        field.onChange(newValue.map((option) => option.value));
                      }}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.value}
                            label={option.label}
                            size="small"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          sx={{ width: 400 }}
                          label="承認者"
                          placeholder="承認者を選択"
                          error={Boolean(fieldState.error)}
                          helperText={
                            fieldState.error?.message ||
                            (approverMultipleMode === ApproverMultipleMode.ORDER
                              ? "選択した順番が承認順になります。"
                              : "複数選択できます。")
                          }
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  );
                }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell>
              <Controller
                name="approverMultipleMode"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    row
                    value={field.value ?? ApproverMultipleMode.ANY}
                    onChange={(event) => {
                      const nextValue = event.target
                        .value as ApproverMultipleMode;
                      field.onChange(nextValue);
                    }}
                  >
                    <FormControlLabel
                      value={ApproverMultipleMode.ANY}
                      control={<Radio />}
                      label="誰か1人が承認すれば完了"
                    />
                    <FormControlLabel
                      value={ApproverMultipleMode.ORDER}
                      control={<Radio />}
                      label="設定した順番で承認"
                    />
                  </RadioGroup>
                )}
              />
            </TableCell>
          </TableRow>
          {approverMultipleMode === ApproverMultipleMode.ORDER && (
            <TableRow>
              <TableCell />
              <TableCell>
                <Stack spacing={1}>
                  {selectedMultipleOptions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      承認順を設定するスタッフを選択してください。
                    </Typography>
                  ) : (
                    selectedMultipleOptions.map((option, index) => (
                      <Box
                        key={option.value}
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Chip label={index + 1} size="small" />
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            {option.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Stack>
                      </Box>
                    ))
                  )}
                  <Typography variant="caption" color="text.secondary">
                    選択した順番が承認順として利用されます。
                  </Typography>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  );
}

function StaffRoleTableCell({
  control,
  setValue,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<Inputs, any>;
  setValue: UseFormSetValue<Inputs>;
}) {
  return (
    <TableCell>
      <Box>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              value={
                ROLE_OPTIONS.find(
                  (option) => String(option.value) === field.value
                ) ?? null
              }
              options={ROLE_OPTIONS}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ width: 400 }} />
              )}
              onChange={(_, data) => {
                if (!data) return;
                setValue("role", data.value);
                field.onChange(data.value);
              }}
            />
          )}
        />
      </Box>
    </TableCell>
  );
}

function MailAddressTableCell({
  register,
}: {
  register: UseFormRegister<Inputs>;
}) {
  return (
    <TableCell>
      <TextField
        {...register("mailAddress", { required: true })}
        size="small"
        sx={{ width: 400 }}
      />
    </TableCell>
  );
}

function StaffNameTableCell({
  register,
}: {
  register: UseFormRegister<Inputs>;
}) {
  return (
    <TableCell>
      <Stack direction="row" spacing={1}>
        <TextField
          {...register("familyName", { required: true })}
          size="small"
          label="姓"
        />
        <TextField
          {...register("givenName", { required: true })}
          size="small"
          label="名"
        />
      </Stack>
    </TableCell>
  );
}
