import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type React from "react";

type TimeRecorderAnnouncementSectionProps = {
  enabled: boolean;
  message: string;
  onEnabledChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  onMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function TimeRecorderAnnouncementSection({
  enabled,
  message,
  onEnabledChange,
  onMessageChange,
}: TimeRecorderAnnouncementSectionProps) {
  return (
    <Stack spacing={1.5}>
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={onEnabledChange}
            color="primary"
            inputProps={{ "aria-label": "打刻画面アナウンスの表示切り替え" }}
          />
        }
        label={enabled ? "表示" : "非表示"}
      />
      <TextField
        label="アナウンス本文"
        value={message}
        onChange={onMessageChange}
        multiline
        minRows={3}
        fullWidth
        placeholder="例: 本日18:00〜18:30はシステムメンテナンスのため打刻が反映されにくくなる場合があります。"
      />
      <Typography variant="body2" color="textSecondary">
        /register のヘッダー直下に固定表示します。本文が空の場合は表示されません。
      </Typography>
    </Stack>
  );
}
