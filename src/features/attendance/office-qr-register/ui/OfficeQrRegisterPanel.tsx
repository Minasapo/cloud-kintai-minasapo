import { Alert, Box, Button, Container, styled } from "@mui/material";
import Clock from "@shared/ui/clock/Clock";

export type OfficeQrRegisterPanelProps = {
  isOfficeModeEnabled: boolean;
  errorMessage: string | null;
  mode: "clock_in" | "clock_out" | null;
  onClockIn: () => void;
  onClockOut: () => void;
};

const ActionButton = styled(Button)(({ theme }) => ({
  color: theme.palette.clock_in.contrastText,
  backgroundColor: theme.palette.clock_in.main,
  "&.clock-out": {
    backgroundColor: theme.palette.clock_out.main,
    color: theme.palette.clock_out.contrastText,
  },
}));

export function OfficeQrRegisterPanel({
  isOfficeModeEnabled,
  errorMessage,
  mode,
  onClockIn,
  onClockOut,
}: OfficeQrRegisterPanelProps) {
  if (!isOfficeModeEnabled) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">現在、使用することができません。</Alert>
        </Box>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {errorMessage}
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box
        sx={{
          mt: 4,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Clock />
        {mode === "clock_in" && (
          <ActionButton
            variant="contained"
            className="clock-in"
            onClick={onClockIn}
            size="large"
            sx={{
              mt: 2,
              width: 1,
              maxWidth: 350,
              height: "80px",
              fontSize: "1.5rem",
            }}
          >
            出勤
          </ActionButton>
        )}
        {mode === "clock_out" && (
          <ActionButton
            variant="contained"
            className="clock-out"
            onClick={onClockOut}
            size="large"
            sx={{
              mt: 2,
              width: 1,
              maxWidth: 350,
              height: "80px",
              fontSize: "1.5rem",
            }}
          >
            退勤
          </ActionButton>
        )}
      </Box>
    </Container>
  );
}
