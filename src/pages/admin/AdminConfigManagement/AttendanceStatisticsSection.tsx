import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type React from "react";

type AttendanceStatisticsSectionProps = {
  enabled: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => void;
};

export default function AttendanceStatisticsSection({
  enabled,
  onChange,
}: AttendanceStatisticsSectionProps) {
  return (
    <Stack spacing={1}>
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={onChange}
            color="primary"
            inputProps={{ "aria-label": "稼働統計の表示切り替え" }}
          />
        }
        label={enabled ? "表示" : "非表示"}
        sx={{ mb: 1 }}
      />
      <Typography variant="body2" color="textSecondary">
        稼働統計ページと関連メニューの表示を切り替えます。非表示にすると利用者の
        ナビゲーションから稼働統計が隠れ、直接アクセス時も無効化されます。
      </Typography>
    </Stack>
  );
}
