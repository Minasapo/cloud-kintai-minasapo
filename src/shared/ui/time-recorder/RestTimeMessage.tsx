import { Alert, AlertTitle, Stack, Typography } from "@mui/material";

export interface RestTimeMessageProps {
  lunchRestStartTime: string;
  lunchRestEndTime: string;
}

const RestTimeMessage = ({
  lunchRestStartTime,
  lunchRestEndTime,
}: RestTimeMessageProps) => {
  return (
    <Alert severity="info">
      <AlertTitle>昼休憩は退勤時に自動打刻されます</AlertTitle>
      <Stack spacing={0.5}>
        <Typography
          variant="body2"
          component="p"
          data-testid="rest-time-message-autostamp"
        >
          退勤打刻時に{lunchRestStartTime}〜{lunchRestEndTime}
          の昼休憩が自動追加されます。
        </Typography>
        <Typography
          variant="body2"
          component="p"
          data-testid="rest-time-message-support"
        >
          修正する際は、変更リクエストまたは管理者へ問い合わせてください。
        </Typography>
      </Stack>
    </Alert>
  );
};

export default RestTimeMessage;
