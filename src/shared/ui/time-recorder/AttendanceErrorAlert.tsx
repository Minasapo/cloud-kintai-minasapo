import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const AttendanceErrorAlert = () => {
  return (
    <Alert
      severity="error"
      sx={{
        alignItems: "center",
        "& .MuiAlert-message": {
          minWidth: 0,
        },
        "& .MuiAlert-action": {
          alignSelf: "center",
          display: "flex",
          alignItems: "center",
          m: 0,
          ml: 2,
          pl: 0,
        },
      }}
      action={
        <Button
          component={RouterLink}
          to="/attendance/list"
          color="inherit"
          size="small"
          sx={{ whiteSpace: "nowrap", minWidth: "fit-content" }}
        >
          確認
        </Button>
      }
    >
      <AlertTitle>勤怠打刻エラー</AlertTitle>
      <Typography variant="body2">
        打刻エラーがあります。勤怠一覧を確認してください。
      </Typography>
    </Alert>
  );
};

export default AttendanceErrorAlert;
