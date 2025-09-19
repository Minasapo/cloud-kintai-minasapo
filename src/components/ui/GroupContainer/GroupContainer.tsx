import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Collapse,
  IconButton,
  Stack,
  styled,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import { useState } from "react";

const Container = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderLeft: `6px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const Header = styled(Stack)(() => ({
  alignItems: "center",
  justifyContent: "space-between",
  flexDirection: "row",
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

export interface GroupContainerProps {
  title?: string;
  count?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

export default function GroupContainer({
  title,
  count,
  collapsible = false,
  defaultCollapsed = false,
  children,
  sx,
}: GroupContainerProps) {
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

  return (
    <Container sx={sx}>
      {(title || collapsible) && (
        <Header>
          <Stack direction="row" alignItems="center" spacing={1}>
            {title ? <Title variant="subtitle1">{title}</Title> : null}
            {typeof count === "number" && (
              <Typography
                variant="caption"
                color="text.secondary"
              >{`(${count}件)`}</Typography>
            )}
          </Stack>
          {collapsible && (
            <IconButton
              size="small"
              onClick={() => setCollapsed((s) => !s)}
              aria-label={collapsed ? "expand" : "collapse"}
            >
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          )}
        </Header>
      )}

      <Collapse in={!collapsed}>
        <Box sx={{ mt: 1 }}>{children}</Box>
      </Collapse>
    </Container>
  );
}
