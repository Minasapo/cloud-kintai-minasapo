import fetchStaff from "@entities/staff/model/useStaff/fetchStaff";
import updateStaff from "@entities/staff/model/useStaff/updateStaff";
import {
  mappingStaffRole,
  roleLabelMap,
  StaffType,
} from "@entities/staff/model/useStaffs/useStaffs";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { updatePassword } from "aws-amplify/auth";
import dayjs from "dayjs";
import { type SyntheticEvent, useContext, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { AttendanceDate } from "@/entities/attendance/lib/AttendanceDate";
import {
  STAFF_EXTERNAL_LINKS_LIMIT,
  StaffExternalLink,
} from "@/entities/staff/externalLink";
import * as MESSAGE_CODE from "@/errors";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import {
  buildVersionOrUpdatedAtCondition,
  getNextVersion,
} from "@/shared/api/graphql/concurrency";
import { predefinedIcons } from "@/shared/config/icons";
import { createLogger } from "@/shared/lib/logger";

import { AuthContext } from "../context/AuthContext";

const logger = createLogger("Profile");
const PROFILE_CONTENT_MAX_WIDTH = 920;

export type StaffNotificationInputs = {
  workStart: boolean;
  workEnd: boolean;
};

type StaffProfileFormInputs = StaffNotificationInputs & {
  externalLinks: StaffExternalLink[];
};

type PasswordChangeInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileTab = "general" | "notifications" | "links" | "security";

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

const isProfileTab = (value: string): value is ProfileTab =>
  value === "general" ||
  value === "notifications" ||
  value === "links" ||
  value === "security";

const profileTabs: { value: ProfileTab; label: string }[] = [
  { value: "general", label: "一般設定" },
  { value: "notifications", label: "通知設定" },
  { value: "links", label: "個人リンク設定" },
  { value: "security", label: "セキュリティ" },
];

const inputBaseClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h2>
      {description ? (
        <p className="text-sm leading-5 text-slate-500 sm:leading-6">{description}</p>
      ) : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[1.35rem] border border-emerald-100/80 bg-white/85 p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-medium tracking-[0.04em] text-slate-500">
        {label}
      </p>
      <p className="mt-1.5 break-words text-[0.95rem] font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function InlineAlert({
  variant,
  children,
  onClose,
}: {
  variant: "success" | "error";
  children: string;
  onClose?: () => void;
}) {
  const styles =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div
      className={[
        "flex min-w-0 items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
        styles,
      ].join(" ")}
    >
      <p className="m-0 min-w-0 break-words leading-6">{children}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs font-semibold opacity-70 transition hover:opacity-100"
        >
          閉じる
        </button>
      ) : null}
    </div>
  );
}

function PasswordField({
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  showPassword,
  onToggleVisibility,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  helperText?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
}) {
  const fieldClassName = [
    "flex items-center rounded-2xl border bg-white transition focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100",
    error ? "border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100" : "border-slate-200",
  ].join(" ");

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className={fieldClassName}>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={[
            "min-w-0 flex-1 rounded-l-2xl border-0 bg-transparent px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0",
            "min-h-[52px]",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          aria-label="パスワードの表示切り替え"
          className="inline-flex h-[52px] w-12 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-slate-400 transition hover:text-slate-700"
        >
          {showPassword ? (
            <VisibilityOffIcon fontSize="small" />
          ) : (
            <VisibilityIcon fontSize="small" />
          )}
        </button>
      </div>
      {error || helperText ? (
        <p className={["text-xs leading-5", error ? "text-rose-600" : "text-slate-500"].join(" ")}>
          {error ?? helperText}
        </p>
      ) : null}
    </label>
  );
}

export default function Profile() {
  const { notify } = useLocalNotification();
  const { cognitoUser, signOut } = useContext(AuthContext);
  const [staff, setStaff] = useState<StaffType | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null,
  );

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
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { isValid: isPasswordValid, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
    getValues: getPasswordValues,
  } = useForm<PasswordChangeInputs>({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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
      input: {
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
        version: getNextVersion(staff.version),
      },
      condition: buildVersionOrUpdatedAtCondition(staff.version, staff.updatedAt),
    })
      .then(() => void notify(MESSAGE_CODE.S05003, { mode: "auto-close" }))
      .catch(
        () =>
          void notify("エラー", {
            body: MESSAGE_CODE.E05003,
            mode: "await-interaction",
            priority: "high",
          }),
      );
  };

  const handleTabChange = (_: SyntheticEvent, value: string) => {
    if (isProfileTab(value)) {
      setActiveTab(value);
      setPasswordChangeSuccess(false);
      setPasswordChangeError(null);
    }
  };

  const onPasswordChange = async (data: PasswordChangeInputs) => {
    setPasswordChangeError(null);
    setPasswordChangeSuccess(false);

    try {
      await updatePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordChangeSuccess(true);
      resetPasswordForm();
      logger.info("Password changed successfully");
    } catch (error) {
      logger.error("Failed to change password:", error);
      if (error instanceof Error) {
        if (error.name === "NotAuthorizedException") {
          setPasswordChangeError("現在のパスワードが正しくありません。");
        } else if (error.name === "InvalidPasswordException") {
          setPasswordChangeError(
            "新しいパスワードは8文字以上で、大文字・小文字・数字・記号を含める必要があります。",
          );
        } else if (error.name === "LimitExceededException") {
          setPasswordChangeError(
            "試行回数が上限に達しました。しばらくしてから再度お試しください。",
          );
        } else {
          setPasswordChangeError(
            "パスワードの変更に失敗しました。もう一度お試しください。",
          );
        }
      } else {
        setPasswordChangeError(
          "パスワードの変更に失敗しました。もう一度お試しください。",
        );
      }
    }
  };

  const profileName = `${cognitoUser.familyName} ${cognitoUser.givenName}`;
  const roleLabel = staff?.role ? roleLabelMap.get(staff.role) : "未設定";
  const usageStartDateLabel = staff?.usageStartDate
    ? dayjs(staff.usageStartDate).format(AttendanceDate.DisplayFormat)
    : "未設定";

  return (
    <div className="mx-auto w-full max-w-[1280px] overflow-x-hidden px-4 py-3 sm:px-8 sm:py-6 lg:px-12">
      <div className="min-w-0 space-y-3 sm:space-y-5">
        <section
          className="w-full overflow-hidden rounded-[1.5rem] border border-emerald-100/80 bg-[linear-gradient(135deg,#f7fcf8_0%,#ecfdf5_55%,#ffffff_100%)] shadow-[0_28px_60px_-40px_rgba(15,23,42,0.35)] sm:rounded-[2rem]"
          style={{ maxWidth: PROFILE_CONTENT_MAX_WIDTH }}
        >
          <div className="grid gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] lg:items-end">
            <div className="min-w-0 space-y-2">
              <div className="space-y-2">
                <h1 className="text-[1.75rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                  個人設定
                </h1>
                <p className="max-w-2xl text-sm leading-5 text-slate-600 sm:text-[0.95rem] sm:leading-6">
                  通知、個人リンク、ログイン情報をここで管理します。日常的に触る設定をひとつの画面にまとめています。
                </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <InfoCard label="名前" value={`${profileName} さん`} />
              <InfoCard label="権限" value={roleLabel ?? "未設定"} />
            </div>
          </div>
        </section>

        <div
          className="w-full rounded-[1.25rem] border border-emerald-100/80 bg-white/80 p-1.5 shadow-[0_18px_44px_-36px_rgba(15,23,42,0.35)] sm:rounded-[1.5rem] sm:p-2"
          style={{ maxWidth: PROFILE_CONTENT_MAX_WIDTH }}
        >
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:min-w-0 sm:gap-2">
            {profileTabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    handleTabChange({} as SyntheticEvent, tab.value)
                  }
                  className={[
                    "min-w-0 rounded-[1rem] px-2.5 py-2 text-center text-[0.92rem] font-semibold leading-tight transition whitespace-normal break-words sm:shrink-0 sm:rounded-[1.1rem] sm:px-4 sm:py-2.5 sm:text-sm sm:whitespace-nowrap",
                    isActive
                      ? "bg-emerald-600 text-white shadow-[0_14px_30px_-20px_rgba(5,150,105,0.7)]"
                      : "bg-transparent text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <section
          className="min-w-0 w-full rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_24px_54px_-40px_rgba(15,23,42,0.35)] sm:rounded-[2rem] sm:p-6"
          style={{ maxWidth: PROFILE_CONTENT_MAX_WIDTH }}
        >
          {activeTab === "general" ? (
            <div className="w-full max-w-[920px] space-y-4">
              <SectionTitle
                title="一般設定"
                description="プロフィールの基本情報を確認できます。編集対象ではない項目も、ここでまとめて確認できます。"
              />
              <div className="grid gap-2.5 md:grid-cols-2">
                <InfoCard label="メールアドレス" value={cognitoUser.mailAddress} />
                <InfoCard label="権限" value={roleLabel ?? "未設定"} />
                <InfoCard label="利用開始日" value={usageStartDateLabel} />
              </div>
              <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-sm font-medium text-slate-900">ログアウト</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  現在の端末からサインアウトします。
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-[1rem] border border-rose-200 bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 sm:w-auto"
                >
                  ログアウト
                </button>
              </div>
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div className="w-full max-w-[920px] space-y-5">
              <SectionTitle
                title="通知設定"
                description="勤務開始と勤務終了の通知メールを切り替えられます。"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <Controller
                  name="workStart"
                  control={control}
                  render={({ field }) => (
                    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/70">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          勤務開始メール
                        </p>
                        <p className="text-sm leading-6 text-slate-500">
                          出勤打刻時の通知を受け取ります。
                        </p>
                      </div>
                      <span
                        className={[
                          "relative inline-flex h-8 w-14 shrink-0 rounded-full border transition",
                          field.value
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-slate-200",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="sr-only"
                        />
                        <span
                          className={[
                            "absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.18)] transition-transform",
                            field.value ? "translate-x-6" : "translate-x-0",
                          ].join(" ")}
                        />
                      </span>
                    </label>
                  )}
                />
                <Controller
                  name="workEnd"
                  control={control}
                  render={({ field }) => (
                    <label className="flex min-w-0 cursor-pointer items-center justify-between gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/70">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          勤務終了メール
                        </p>
                        <p className="text-sm leading-6 text-slate-500">
                          退勤打刻時の通知を受け取ります。
                        </p>
                      </div>
                      <span
                        className={[
                          "relative inline-flex h-8 w-14 shrink-0 rounded-full border transition",
                          field.value
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-slate-300 bg-slate-200",
                        ].join(" ")}
                      >
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          className="sr-only"
                        />
                        <span
                          className={[
                            "absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.18)] transition-transform",
                            field.value ? "translate-x-6" : "translate-x-0",
                          ].join(" ")}
                        />
                      </span>
                    </label>
                  )}
                />
              </div>
            </div>
          ) : null}

          {activeTab === "links" ? (
            <div className="w-full max-w-[920px] space-y-5">
              <SectionTitle
                title="個人リンク設定"
                description="自分専用のショートカットを登録できます。ヘッダーのリンク一覧から開く想定です。"
              />
              <p className="text-sm leading-6 text-slate-500">
                アイコンは汎用リンク表示で扱われます。
              </p>
              {externalLinkFields.length === 0 ? (
                <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-500">
                  個人リンクはまだ登録されていません。
                </div>
              ) : null}
              <div className="space-y-3">
                {externalLinkFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="min-w-0 rounded-[1.6rem] border border-slate-200 bg-slate-50/60 p-4 sm:p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            リンク {index + 1}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <Controller
                            name={`externalLinks.${index}.enabled`}
                            control={control}
                            render={({ field }) => (
                              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={(event) =>
                                    field.onChange(event.target.checked)
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                有効
                              </label>
                            )}
                          />
                          <button
                            type="button"
                            aria-label="リンクを削除"
                            onClick={() => handleRemoveLink(index)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                      <div className="grid max-w-[760px] gap-4">
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
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-700">
                                表示名
                              </span>
                              <input
                                {...field}
                                className={[
                                  inputBaseClassName,
                                  fieldState.error
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                    : "",
                                ].join(" ")}
                              />
                              {fieldState.error?.message ? (
                                <p className="text-xs text-rose-600">
                                  {fieldState.error.message}
                                </p>
                              ) : null}
                            </label>
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
                            <label className="block space-y-2">
                              <span className="text-sm font-medium text-slate-700">
                                URL
                              </span>
                              <input
                                {...field}
                                placeholder="https://..."
                                className={[
                                  inputBaseClassName,
                                  fieldState.error
                                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                                    : "",
                                ].join(" ")}
                              />
                              {fieldState.error?.message ? (
                                <p className="text-xs text-rose-600">
                                  {fieldState.error.message}
                                </p>
                              ) : null}
                            </label>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={!canAddMoreLinks}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  リンクを追加
                </button>
                {!canAddMoreLinks ? (
                  <p className="text-xs text-slate-500">
                    最大{STAFF_EXTERNAL_LINKS_LIMIT}件まで追加できます。
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeTab === "security" ? (
            <div className="w-full max-w-[920px] space-y-5">
              <SectionTitle
                title="セキュリティ"
                description="パスワードを更新して、ログイン情報を管理します。"
              />
              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    パスワード変更
                  </h3>
                  {passwordChangeSuccess ? (
                    <InlineAlert
                      variant="success"
                      onClose={() => setPasswordChangeSuccess(false)}
                    >
                      パスワードを変更しました。
                    </InlineAlert>
                  ) : null}
                  {passwordChangeError ? (
                    <InlineAlert
                      variant="error"
                      onClose={() => setPasswordChangeError(null)}
                    >
                      {passwordChangeError}
                    </InlineAlert>
                  ) : null}
                  <div className="grid max-w-[760px] gap-4">
                    <Controller
                      name="currentPassword"
                      control={passwordControl}
                      rules={{
                        required: "現在のパスワードを入力してください",
                      }}
                      render={({ field, fieldState }) => (
                        <PasswordField
                          label="現在のパスワード"
                          type={showCurrentPassword ? "text" : "password"}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={fieldState.error?.message}
                          showPassword={showCurrentPassword}
                          onToggleVisibility={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        />
                      )}
                    />
                    <Controller
                      name="newPassword"
                      control={passwordControl}
                      rules={{
                        required: "新しいパスワードを入力してください",
                        minLength: {
                          value: 8,
                          message: "パスワードは8文字以上で入力してください",
                        },
                        validate: {
                          hasUpperCase: (value) =>
                            /[A-Z]/.test(value) ||
                            "大文字を1文字以上含めてください",
                          hasLowerCase: (value) =>
                            /[a-z]/.test(value) ||
                            "小文字を1文字以上含めてください",
                          hasNumber: (value) =>
                            /[0-9]/.test(value) ||
                            "数字を1文字以上含めてください",
                          hasSpecialChar: (value) =>
                            /[^A-Za-z0-9]/.test(value) ||
                            "記号を1文字以上含めてください",
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <PasswordField
                          label="新しいパスワード"
                          type={showNewPassword ? "text" : "password"}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={fieldState.error?.message}
                          helperText="8文字以上で、大文字・小文字・数字・記号を含めてください"
                          showPassword={showNewPassword}
                          onToggleVisibility={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                        />
                      )}
                    />
                    <Controller
                      name="confirmPassword"
                      control={passwordControl}
                      rules={{
                        required: "パスワードを再入力してください",
                        validate: (value) =>
                          value === getPasswordValues("newPassword") ||
                          "パスワードが一致しません",
                      }}
                      render={({ field, fieldState }) => (
                        <PasswordField
                          label="新しいパスワード(確認)"
                          type={showConfirmPassword ? "text" : "password"}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={fieldState.error?.message}
                          showPassword={showConfirmPassword}
                          onToggleVisibility={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      )}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={!isPasswordValid || isPasswordSubmitting}
                      onClick={handlePasswordSubmit(onPasswordChange)}
                      className="inline-flex w-full items-center justify-center rounded-[1rem] bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {isPasswordSubmitting ? "変更中..." : "パスワードを変更"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {activeTab !== "security" ? (
          <div
            className="w-full pb-3"
            style={{ maxWidth: PROFILE_CONTENT_MAX_WIDTH }}
          >
            <button
              type="button"
              disabled={!isValid || !isDirty || isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="inline-flex w-full items-center justify-center rounded-[1rem] bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
