import {
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Control, Controller } from "react-hook-form";

import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

// -----------------------------------------------------------------------------
// ファイル / コンポーネントの概要
// -----------------------------------------------------------------------------
/**
 * IsDeemedHolidayFlagInput コンポーネント
 *
 * 勤務形態がシフト勤務のスタッフ向けに、"扱いを休日扱いにする" フラグを切り替える
 * スイッチ入力を提供する UI コンポーネントです。画面幅に応じてレイアウトを切り替えます。
 *
 * 使用技術:
 * - Material UI (MUI)
 * - react-hook-form の Controller を使用してフォーム制御を行います
 *
 * 参照:
 * - AttendanceEditInputs 型は /src/features/attendance/edit/model/common で定義されています
 */

// -----------------------------------------------------------------------------
// コンポーネントの props の説明
// -----------------------------------------------------------------------------
/**
 * コンポーネントに渡す props
 *
 * @param control - react-hook-form の Control オブジェクト。フォーム値の制御に使用します。
 * @param name - AttendanceEditInputs のキー。該当フィールドの値を制御します。
 * @param disabled - スイッチを無効化するかどうか（省略時は false）。
 * @param helperText - スイッチ下に表示する補助テキスト（任意）。
 *
 * @returns JSX.Element - スイッチを含む UI を返します。
 */
export default function IsDeemedHolidayFlagInput({
  control,
  name,
  disabled = false,
  helperText,
}: {
  control: Control<AttendanceEditInputs>;
  name: keyof AttendanceEditInputs;
  disabled?: boolean;
  helperText?: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isMobile) {
    return (
      <Stack direction="column" spacing={0.5} mb={1}>
        <Typography variant="body2">
          勤務形態がシフト勤務のスタッフのみ設定が可能です。
        </Typography>
        <Typography variant="body2">
          設定した場合は、土日祝日と同様に休日扱いとなります。
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={disabled}
              />
            )}
          />
        </Stack>
        {helperText && (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
            {helperText}
          </Typography>
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={0.5}>
      <Typography variant="body2">
        勤務形態がシフト勤務のスタッフのみ設定が可能です。
      </Typography>
      <Typography variant="body2">
        設定した場合は、土日祝日と同様に休日扱いとなります。
      </Typography>
      <Stack direction="row" alignItems="center">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              disabled={disabled}
            />
          )}
        />
      </Stack>
      {helperText && (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
          {helperText}
        </Typography>
      )}
    </Stack>
  );
}
