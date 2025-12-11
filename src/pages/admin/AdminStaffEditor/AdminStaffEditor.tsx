/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import {
  ApproverMultipleMode,
  ApproverSettingMode,
} from "@shared/api/graphql/types";
import CommonBreadcrumbs from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  useForm,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { useParams } from "react-router-dom";

import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";

import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import useStaffs, { StaffRole } from "../../../hooks/useStaffs/useStaffs";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "../../../lib/reducers/snackbarReducer";
import { ROLE_OPTIONS } from "../AdminStaff/CreateStaffDialog";
import WORK_TYPE_OPTIONS from "../AdminStaff/workTypeOptions";

type Inputs = {
  staffId?: string | null;
  familyName?: string | null;
  givenName?: string | null;
  mailAddress?: string | null;
  owner: boolean;
  sortKey?: string | null;
  usageStartDate?: string | null;
  workType?: string | null;
  shiftGroup?: string | null;
  role?: string | null;
  approverSetting?: ApproverSettingMode | null;
  approverSingle?: string | null;
  approverMultiple?: (string | null)[] | null;
  approverMultipleMode?: ApproverMultipleMode | null;
  developer?: boolean;
};

export default function AdminStaffEditor() {
  const { staffId } = useParams();
  const dispatch = useAppDispatchV2();
  const { cognitoUser } = useContext(AuthContext);
  const { getShiftGroups } = useContext(AppConfigContext);
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
    watch,
    getValues,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: { owner: false, developer: false },
  });

  const [tabIndex, setTabIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!staffId) return;
    const staff = staffs.find((s) => s.cognitoUserId === staffId);
    if (!staff) return;
    setValue("staffId", staff.cognitoUserId as any);
    setValue("familyName", staff.familyName ?? null);
    setValue("givenName", staff.givenName ?? null);
    setValue("mailAddress", staff.mailAddress ?? null);
    setValue("owner", staff.owner ?? false);
    setValue("sortKey", staff.sortKey ?? null);
    setValue("usageStartDate", staff.usageStartDate ?? null);
    setValue(
      "workType",
      (staff as unknown as Record<string, unknown>).workType as string | null
    );
    setValue("shiftGroup", staff.shiftGroup ?? null);
    // permissive read in case backend schema hasn't added developer yet
    setValue(
      "developer",
      ((staff as unknown as Record<string, unknown>).developer as
        | boolean
        | undefined) ?? false
    );
  }, [staffId, staffs, setValue]);

  const shiftGroupOptions = useMemo(
    () =>
      getShiftGroups().map((group) => ({
        value: group.label,
        label: group.label,
        description: group.description ?? "",
      })),
    [getShiftGroups]
  );

  if (staffLoading) return <LinearProgress />;
  if (staffError) {
    dispatch(setSnackbarError(MESSAGE_CODE.E05001));
    return null;
  }

  const onSubmit = async (data: Inputs) => {
    if (!staffId) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        id: staffs.find((s) => s.cognitoUserId === staffId)?.id,
        mailAddress: data.mailAddress,
        familyName: data.familyName,
        givenName: data.givenName,
        owner: data.owner,
        sortKey: data.sortKey,
        usageStartDate: data.usageStartDate,
        workType: data.workType,
        shiftGroup: data.shiftGroup ?? null,
      };

      // approver related
      const approverSetting = watch("approverSetting");
      const approverMultiple =
        (watch("approverMultiple") as (string | null)[]) ?? [];
      const approverMultipleMode = watch("approverMultipleMode");

      if (approverSetting === ApproverSettingMode.SINGLE) {
        payload.approverSingle = watch("approverSingle");
      }
      if (approverSetting === ApproverSettingMode.MULTIPLE) {
        payload.approverMultiple = approverMultiple;
        payload.approverMultipleMode = approverMultipleMode;
      }

      // only include developer if explicitly present (defensive for backend schema)
      if (typeof data.developer !== "undefined")
        payload.developer = data.developer;

      await updateStaff(payload as any);
      dispatch(setSnackbarSuccess("保存しました"));
    } catch (e) {
      dispatch(setSnackbarError(MESSAGE_CODE.E05002));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
      <Stack spacing={2}>
        <CommonBreadcrumbs
          items={[
            { label: "TOP", href: "/" },
            { label: "スタッフ一覧", href: "/admin/staff" },
          ]}
          current={`${getValues("familyName") ?? "(未設定)"} ${
            getValues("givenName") ?? ""
          }`}
        />
        <Title>スタッフ編集</Title>

        <Box>
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            aria-label="スタッフ編集タブ"
          >
            <Tab label="全般" />
            <Tab
              label="高度設定"
              disabled={!cognitoUser?.owner}
              data-testid="advanced-tab"
            />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableBody>
              {tabIndex === 0 && (
                <>
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
                      <TextField
                        {...register("sortKey")}
                        size="small"
                        sx={{ width: 400 }}
                        placeholder="例：1、2、3...やZZ001、ZZ002...など"
                      />
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
                    <StaffRoleTableCell
                      control={control as unknown as Control<Inputs, any>}
                      setValue={setValue}
                    />
                  </TableRow>

                  {cognitoUser?.owner && (
                    <TableRow>
                      <TableCell>オーナー権限</TableCell>
                      <TableCell>
                        <Controller
                          name="owner"
                          control={control as unknown as Control<Inputs, any>}
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
                      <Controller
                        name="usageStartDate"
                        control={control as unknown as Control<Inputs, any>}
                        render={({ field }) => (
                          <DatePicker
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(v) => {
                              // convert dayjs to ISO string (or null)
                              const next = v ? v.format("YYYY-MM-DD") : null;
                              field.onChange(next);
                            }}
                            format="YYYY/M/D"
                            slotProps={{
                              textField: {
                                onBlur: field.onBlur,
                                size: "small",
                              },
                            }}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>勤務形態</TableCell>
                    <TableCell>
                      <Controller
                        name="workType"
                        control={control as unknown as Control<Inputs, any>}
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
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>シフトグループ</TableCell>
                    <TableCell>
                      {shiftGroupOptions.length === 0 ? (
                        <Typography color="text.secondary">
                          利用可能なシフトグループがありません。管理画面の「シフト設定」で登録してください。
                        </Typography>
                      ) : (
                        <Controller
                          name="shiftGroup"
                          control={control as unknown as Control<Inputs, any>}
                          render={({ field }) => {
                            const selectedOption =
                              shiftGroupOptions.find(
                                (option) => option.value === field.value
                              ) ?? null;
                            return (
                              <Autocomplete
                                value={selectedOption}
                                options={shiftGroupOptions}
                                onChange={(_, newValue) => {
                                  field.onChange(newValue?.value ?? null);
                                }}
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    size="small"
                                    sx={{ width: 400 }}
                                    placeholder="所属させるシフトグループを選択"
                                    onBlur={field.onBlur}
                                  />
                                )}
                              />
                            );
                          }}
                        />
                      )}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>承認者設定</TableCell>
                    <TableCell>
                      <Controller
                        name="approverSetting"
                        control={control as unknown as Control<Inputs, any>}
                        render={({ field }) => (
                          <RadioGroup
                            row
                            value={field.value}
                            onChange={(e) => {
                              const v = e.target.value as ApproverSettingMode;
                              field.onChange(v);
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
                        )}
                      />
                    </TableCell>
                  </TableRow>

                  <ApproverSettingTableRows
                    control={control}
                    watch={watch}
                    staffs={staffs}
                    currentCognitoUserId={cognitoUser?.id}
                  />
                </>
              )}

              {/* 開発者フラグ: 高度設定タブでのみ表示 */}
              {tabIndex === 1 && (
                <TableRow>
                  <TableCell>
                    <Controller
                      name="developer"
                      control={control as unknown as Control<Inputs, any>}
                      render={({ field }) => (
                        <Switch
                          data-testid="developer-flag-checkbox"
                          checked={Boolean(field.value)}
                          onChange={() => {
                            setValue("developer", !field.value, {
                              shouldDirty: true,
                            });
                            field.onChange(!field.value);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">開発者フラグ</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, mb: 8 }}>
          <Button
            data-testid="save-button"
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

// Helper components

function ApproverSettingTableRows({
  control,
  watch,
  staffs,
  currentCognitoUserId,
}: {
  control: Control<Inputs, any>;
  watch: (name: string) => unknown;
  staffs: any[];
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
            .filter((n: any) => Boolean(n))
            .join(" ") || staff.mailAddress,
        description: staff.mailAddress,
      }));
  }, [staffs, currentCognitoUserId]);

  const approverSetting = watch("approverSetting") as
    | ApproverSettingMode
    | undefined;
  const approverMultiple =
    (watch("approverMultiple") as (string | null)[]) ?? [];
  const approverMultipleMode = watch("approverMultipleMode");

  const selectedMultipleOptions = (approverMultiple as (string | null)[])
    .map((value) => adminOptions.find((option) => option.value === value))
    .filter((o): o is { value: string; label: string; description: string } =>
      Boolean(o)
    );

  return (
    <>
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
                    getOptionLabel={(option: any) => option.label}
                    isOptionEqualToValue={(option: any, value: any) =>
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
                      ((value as any[])?.length ?? 0) > 0 ||
                      "承認者を選択してください"
                    );
                  },
                }}
                render={({ field, fieldState }) => {
                  const valueOptions = (field.value ?? [])
                    .map((v: any) => adminOptions.find((o) => o.value === v))
                    .filter(Boolean);
                  return (
                    <Autocomplete
                      multiple
                      options={adminOptions}
                      value={valueOptions as any}
                      onChange={(_, newValue) => {
                        field.onChange(
                          newValue.map((option: any) => option.value)
                        );
                      }}
                      disableCloseOnSelect
                      getOptionLabel={(option: any) => option.label}
                      isOptionEqualToValue={(option: any, value: any) =>
                        option.value === value.value
                      }
                      renderTags={(tagValue: any, getTagProps: any) =>
                        tagValue.map((option: any, index: number) => (
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
