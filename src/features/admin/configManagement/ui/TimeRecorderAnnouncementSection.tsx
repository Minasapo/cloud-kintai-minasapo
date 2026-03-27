import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
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
    <div className="flex flex-col gap-4">
      <div>
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
      </div>
      <div className="flex flex-col gap-1 w-full max-w-[640px]">
        <span className="text-sm font-semibold text-slate-700">アナウンス本文</span>
        <TextField
          value={message}
          onChange={onMessageChange}
          multiline
          minRows={3}
          fullWidth
          size="small"
          placeholder="例: 本日18:00〜18:30はシステムメンテナンスのため打刻が反映されにくくなる場合があります。"
        />
      </div>
      <p className="text-sm text-slate-500">
        /register のヘッダー直下に固定表示します。本文が空の場合は表示されません。
      </p>
    </div>
  );
}
