import { Box, ButtonBase, Stack } from "@mui/material";
import type { MouseEvent } from "react";
import { Link as RouterLink } from "react-router-dom";

import type { AdminHeaderMenuItem } from "@/features/admin/layout/model/useHeaderMenu";

interface AdminMenuProps {
  items: readonly AdminHeaderMenuItem[];
  selectedHref: string;
  onSelect: (item: AdminHeaderMenuItem) => void;
}

const AdminMenu = ({ items, selectedHref, onSelect }: AdminMenuProps) => {
  const isActivePath = (href: string) => selectedHref === href;

  const handleClick = (
    event: MouseEvent<HTMLElement>,
    item: AdminHeaderMenuItem
  ) => {
    // Let modified or non-left clicks fall back to the browser so Cmd/Ctrl+Click opens a new tab.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onSelect(item);
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{ rowGap: 1, width: "100%" }}
    >
      {items.map((item) => {
        const isActive = isActivePath(item.href);
        const accessibleLabel = item.secondaryLabel
          ? `${item.primaryLabel} ${item.secondaryLabel}`
          : item.primaryLabel;

        return (
          <ButtonBase
            key={item.href}
            focusRipple
            component={RouterLink}
            to={item.href}
            onClick={(event) => handleClick(event, item)}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: isActive ? "primary.main" : "grey.300",
              backgroundColor: isActive ? "primary.light" : "common.white",
              color: isActive ? "primary.main" : "text.primary",
              px: 2,
              py: 1.5,
              minWidth: { xs: "48%", sm: 140 },
              flexGrow: { xs: 1, sm: 0 },
              textAlign: "center",
            }}
            aria-label={accessibleLabel}
          >
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 1,
                lineHeight: 1.2,
                whiteSpace: "pre-line",
                fontWeight: 600,
              }}
            >
              <Box component="span" sx={{ fontSize: "1rem" }}>
                {item.primaryLabel}
              </Box>
              {item.secondaryLabel ? (
                <Box component="span" sx={{ fontSize: "0.85rem", mt: 0.25 }}>
                  {item.secondaryLabel}
                </Box>
              ) : null}
            </Box>
          </ButtonBase>
        );
      })}
    </Stack>
  );
};

export default AdminMenu;
