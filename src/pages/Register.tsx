import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { Alert, Box, Container } from "@mui/material";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import TimeRecorder from "@/features/attendance/time-recorder/ui/TimeRecorder";

import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { isCognitoUserRole } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isCognitoUserRole(StaffRole.OPERATOR)) {
      navigate("/office/qr");
    }
  }, [isCognitoUserRole, navigate]);

  const isRegisterDisabled =
    import.meta.env.VITE_STANDARD_REGISTER_DISABLE === "true";

  if (isRegisterDisabled) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Alert severity="warning">現在、こちらの機能は使用できません</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        height: 1,
        py: {
          xs: 2,
          md: 10,
        },
        justifyContent: "center",
        display: "flex",
      }}
    >
      <TimeRecorder />
    </Box>
  );
}
