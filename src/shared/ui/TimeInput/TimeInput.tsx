import { TextField, type TextFieldProps } from "@mui/material";

import { formatISOToTime, parseTimeToISO } from "@/shared/lib/time";

type TimeInputProps = Omit<
  TextFieldProps,
  "type" | "value" | "onChange" | "InputLabelProps"
> & {
  /**
   * ISO 8601形式の日時文字列 (例: "2024-01-15T09:00:00+09:00")
   * または null
   */
  value: string | null;
  /**
   * 値変更時のコールバック
   * @param isoString - ISO 8601形式の日時文字列 または null
   */
  onChange: (isoString: string | null) => void;
  /**
   * 基準日（YYYY-MM-DD形式）
   * 時刻のみの入力をISO文字列に変換する際に使用
   */
  baseDate: string;
};

/**
 * 時刻入力用の共通コンポーネント
 *
 * 特徴:
 * - ISO 8601形式の日時文字列を内部で管理
 * - HH:mm形式での表示・入力
 * - 勤怠編集とワークフロー申請で統一された入力体験
 *
 * 使用例:
 * ```tsx
 * <TimeInput
 *   value={startTime}
 *   onChange={setStartTime}
 *   baseDate="2024-01-15"
 *   label="出勤時刻"
 *   error={Boolean(error)}
 *   helperText={error}
 * />
 * ```
 */
export function TimeInput({
  value,
  onChange,
  baseDate,
  ...textFieldProps
}: TimeInputProps) {
  const displayValue = value ? formatISOToTime(value) : "";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = event.target.value;

    if (!timeValue) {
      onChange(null);
      return;
    }

    const isoString = parseTimeToISO(timeValue, baseDate);
    onChange(isoString);
  };

  return (
    <TextField
      {...textFieldProps}
      type="time"
      value={displayValue}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
    />
  );
}
