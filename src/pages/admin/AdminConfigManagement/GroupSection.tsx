import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

type Props = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export default function GroupSection({
  title,
  description,
  actions,
  children,
}: Props) {
  const theme = useTheme();
  const borderColor = alpha(theme.palette.success.main ?? "#4caf50", 0.2);
  const titleColor = theme.palette.success.dark ?? theme.palette.success.main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor,
        borderLeft: `6px solid ${alpha(
          theme.palette.success.main ?? "#4caf50",
          0.8
        )}`,
      }}
    >
      <Stack spacing={1}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: titleColor }}>
            {title}
          </Typography>
          {actions && <Box>{actions}</Box>}
        </Box>
        {description && (
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
        )}
        <Divider />
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
}
