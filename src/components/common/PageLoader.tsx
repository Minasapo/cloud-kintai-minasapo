import { Box, CircularProgress, Typography } from "@mui/material";

export default function PageLoader() {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
      role="status"
      aria-live="polite"
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        読み込み中です…
      </Typography>
    </Box>
  );
}

