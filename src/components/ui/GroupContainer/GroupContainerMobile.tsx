import { Box, Stack, styled, SxProps, Theme, Typography } from "@mui/material";
import React from "react";

const Container = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export interface GroupContainerMobileProps {
  title?: string;
  count?: number;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

export default function GroupContainerMobile({
  title,
  count,
  children,
  sx,
}: GroupContainerMobileProps) {
  return (
    <Container sx={sx}>
      {title ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Title variant="subtitle1">{title}</Title>
          {typeof count === "number" && (
            <Typography
              variant="caption"
              color="text.secondary"
            >{`(${count}件)`}</Typography>
          )}
        </Stack>
      ) : null}

      <Box sx={{ mt: 1 }}>{children}</Box>
    </Container>
  );
}
