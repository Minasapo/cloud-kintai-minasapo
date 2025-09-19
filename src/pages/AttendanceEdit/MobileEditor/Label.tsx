import { styled, Typography } from "@mui/material";

export const Label = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  paddingBottom: theme.spacing(1),
}));
