import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
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
    <div className="flex flex-col gap-2">
      <div>
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
        />
      </div>
      <p className="text-sm text-slate-500">
        稼働統計ページと関連メニューの表示を切り替えます。非表示にすると利用者の
        ナビゲーションから稼働統計が隠れ、直接アクセス時も無効化されます。
      </p>
    </div>
  );
}
