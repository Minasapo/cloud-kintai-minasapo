import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Alert, AlertTitle, IconButton, Typography } from "@mui/material";

/**
 * 勤怠打刻エラーを通知するアラートコンポーネント。
 * エラーが発生した場合に、勤怠一覧ページへのリンク付きで警告を表示します。
 *
 * @returns {JSX.Element} エラーアラートのReact要素
 */
export function AttendanceErrorAlert() {
  return (
    <Alert
      severity="error"
      action={
        <IconButton onClick={() => window.open("/attendance/list", "_blank")}>
          <OpenInNewIcon />
        </IconButton>
      }
    >
      <AlertTitle>勤怠打刻エラー</AlertTitle>
      <Typography variant="body2">
        打刻エラーがあります。勤怠一覧を確認してください。(画面更新時に反映されます)
      </Typography>
    </Alert>
  );
}
