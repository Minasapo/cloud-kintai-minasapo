import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  styled,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CommonBreadcrumbs from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { useAppDispatchV2 } from "@/app/hooks";
import { predefinedIcons } from "@/shared/config/icons";
import { MARGINS } from "@/shared/config/uiDimensions";
import {
  STAFF_EXTERNAL_LINKS_LIMIT,
  StaffExternalLink,
} from "@/entities/staff/externalLink";
import * as MESSAGE_CODE from "@/errors";
import updateStaff from "@entities/staff/model/useStaff/updateStaff";
import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import { createLogger } from "@/shared/lib/logger";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/app/slices/snackbarSlice";

import { AuthContext } from "../context/AuthContext";
import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import {
  mappingStaffRole,
  roleLabelMap,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";

const logger = createLogger("Profile");

const NotificationSwitch = styled(Switch)(({ theme }) => ({
  padding: MARGINS.PADDING_STANDARD,
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: MARGINS.FORM_MARGIN,
  },
}));

export type StaffNotificationInputs = {
  workStart: boolean;
  workEnd: boolean;
};

type StaffProfileFormInputs = StaffNotificationInputs & {
  externalLinks: StaffExternalLink[];
};

const DEFAULT_ICON_VALUE = predefinedIcons[0]?.value ?? "LinkIcons";

const createEmptyExternalLink = (): StaffExternalLink => ({
  label: "",
  url: "",
  icon: DEFAULT_ICON_VALUE,
  enabled: true,
});

const sanitizeExternalLinks = (links: StaffExternalLink[]) =>
  links
    .slice(0, STAFF_EXTERNAL_LINKS_LIMIT)
    .map((link) => ({
      ...link,
      label: link.label.trim(),
      url: link.url.trim(),
      icon: DEFAULT_ICON_VALUE,
    }))
    .filter((link) => link.label !== "" && link.url !== "");

const isValidUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const ProfileLogoutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.logout.contrastText,
  backgroundColor: theme.palette.logout.main,
  border: `3px solid ${theme.palette.logout.main}`,
  "&:hover": {
    color: theme.palette.logout.main,
    backgroundColor: theme.palette.logout.contrastText,
  },
}));

export default function Profile() {
  const dispatch = useAppDispatchV2();
  const { cognitoUser, signOut } = useContext(AuthContext);
  const [staff, setStaff] = useState<StaffType | null | undefined>(undefined);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = useForm<StaffProfileFormInputs>({
    mode: "onChange",
    defaultValues: {
      workStart: true,
      workEnd: true,
      externalLinks: [],
    },
  });

  const {
    fields: externalLinkFields,
    append: appendExternalLink,
    remove: removeExternalLink,
  } = useFieldArray({
    control,
    name: "externalLinks",
  });

  const canAddMoreLinks =
    externalLinkFields.length < STAFF_EXTERNAL_LINKS_LIMIT;

  const handleAddLink = () => {
    if (!canAddMoreLinks) return;
    appendExternalLink(createEmptyExternalLink());
  };

  const handleRemoveLink = (index: number) => {
    removeExternalLink(index);
  };

  useEffect(() => {
    if (!cognitoUser) return;

    fetchStaff(cognitoUser.id)
      .then((res) => {
        if (!res) return;

        setStaff({
          ...res,
          familyName: res.familyName,
          givenName: res.givenName,
          owner: res.owner ?? false,
          role: mappingStaffRole(res.role),
        });

        const normalizedExternalLinks = (res.externalLinks ?? [])
          .filter((link): link is NonNullable<typeof link> => Boolean(link))
          .map((link) => ({
            label: link.label,
            url: link.url,
            icon: DEFAULT_ICON_VALUE,
            enabled: link.enabled,
          }));

        setValue("workStart", res.notifications?.workStart ?? true, {
          shouldDirty: false,
        });
        setValue("workEnd", res.notifications?.workEnd ?? true, {
          shouldDirty: false,
        });
        setValue("externalLinks", normalizedExternalLinks, {
          shouldDirty: false,
        });
      })
      .catch((e: Error) => {
        logger.error("Failed to load staff data:", e);
      });
  }, [cognitoUser, setValue]);

  if (!cognitoUser || staff === undefined) {
    return null;
  }

  const onSubmit = (data: StaffProfileFormInputs) => {
    if (!staff) return;
    const preparedLinks = sanitizeExternalLinks(data.externalLinks ?? []);
    updateStaff({
      id: staff.id,
      cognitoUserId: staff.cognitoUserId,
      familyName: staff.familyName,
      givenName: staff.givenName,
      mailAddress: staff.mailAddress,
      role: staff.role,
      enabled: staff.enabled,
      status: staff.status,
      owner: staff.owner,
      usageStartDate: staff.usageStartDate,
      notifications: {
        workStart: data.workStart,
        workEnd: data.workEnd,
      },
      externalLinks: preparedLinks,
    })
      .then(() => dispatch(setSnackbarSuccess(MESSAGE_CODE.S05003)))
      .catch(() => dispatch(setSnackbarError(MESSAGE_CODE.E05003)));
  };

  return (
    <Container maxWidth="xl" sx={{ pt: 2 }}>
      <Stack direction="column" spacing={2}>
        <CommonBreadcrumbs
          items={[{ label: "TOP", href: "/" }]}
          current="個人設定"
        />
        <Title>個人設定</Title>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: 200 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    名前
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {cognitoUser.familyName} {cognitoUser.givenName} さん
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    メールアドレス
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {cognitoUser.mailAddress}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    権限
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {staff?.role ? roleLabelMap.get(staff.role) : "未設定"}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    利用開始日
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {staff?.usageStartDate
                      ? dayjs(staff.usageStartDate).format(
                          AttendanceDate.DisplayFormat
                        )
                      : "未設定"}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    通知設定
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={1}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="workStart"
                          control={control}
                          render={({ field }) => (
                            <NotificationSwitch
                              {...field}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      }
                      label="勤務開始メール"
                    />
                    <FormControlLabel
                      control={
                        <Controller
                          name="workEnd"
                          control={control}
                          render={({ field }) => (
                            <NotificationSwitch
                              {...field}
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          )}
                        />
                      }
                      label="勤務終了メール"
                    />
                  </Stack>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    個人リンク
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={2}>
                    {externalLinkFields.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        個人リンクはまだ登録されていません。
                      </Typography>
                    )}
                    {externalLinkFields.map((field, index) => (
                      <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle2">
                              リンク {index + 1}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Controller
                                name={`externalLinks.${index}.enabled`}
                                control={control}
                                render={({ field }) => (
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        {...field}
                                        checked={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.checked)
                                        }
                                      />
                                    }
                                    label="有効"
                                  />
                                )}
                              />
                              <IconButton
                                aria-label="リンクを削除"
                                onClick={() => handleRemoveLink(index)}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Stack>
                          </Stack>
                          <Controller
                            name={`externalLinks.${index}.label`}
                            control={control}
                            rules={{
                              required: "表示名を入力してください",
                              maxLength: {
                                value: 32,
                                message: "32文字以内で入力してください",
                              },
                            }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="表示名"
                                size="small"
                                fullWidth
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                              />
                            )}
                          />
                          <Controller
                            name={`externalLinks.${index}.url`}
                            control={control}
                            rules={{
                              required: "URLを入力してください",
                              validate: (value) =>
                                isValidUrl(value) ||
                                "https:// から始まるURLを入力してください",
                            }}
                            render={({ field, fieldState }) => (
                              <TextField
                                {...field}
                                label="URL"
                                placeholder="https://..."
                                size="small"
                                fullWidth
                                error={Boolean(fieldState.error)}
                                helperText={fieldState.error?.message}
                              />
                            )}
                          />
                          <Typography variant="caption" color="text.secondary">
                            アイコンは「その他」で固定されています。
                          </Typography>
                        </Stack>
                      </Paper>
                    ))}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddLink}
                        disabled={!canAddMoreLinks}
                      >
                        リンクを追加
                      </Button>
                      {!canAddMoreLinks && (
                        <Typography variant="caption" color="text.secondary">
                          最大{STAFF_EXTERNAL_LINKS_LIMIT}件まで追加できます。
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    ログアウト
                  </Typography>
                </TableCell>
                <TableCell>
                  <ProfileLogoutButton onClick={signOut}>
                    ログアウト
                  </ProfileLogoutButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Box>
          <Button
            variant="contained"
            size="medium"
            disabled={!isValid || !isDirty || isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} />}
            onClick={handleSubmit(onSubmit)}
          >
            保存
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
