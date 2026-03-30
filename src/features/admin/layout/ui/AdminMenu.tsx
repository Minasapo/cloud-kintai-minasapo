import { Box, ButtonBase, Stack } from "@mui/material";
import { memo, type MouseEvent } from "react";
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
              borderRadius: "9999px",
              border: "1px solid",
              borderColor: isActive
                ? "rgba(6,95,70,0.35)"
                : "rgba(148,163,184,0.28)",
              backgroundColor: isActive ? "#19b985" : "rgba(255,255,255,0.72)",
              color: isActive ? "#ffffff" : "#0f172a",
              px: { xs: 2, sm: 2.25 },
              py: 1.15,
              minWidth: { xs: "calc(50% - 4px)", sm: 124 },
              flexGrow: 1,
              textAlign: "center",
              boxShadow: isActive
                ? "inset 0 -2px 0 rgba(0,0,0,0.12), 0 12px 24px -18px rgba(5,150,105,0.55)"
                : "0 6px 18px -18px rgba(15,23,42,0.12)",
              transition: "background-color 160ms ease, border-color 160ms ease",
              "&:hover": {
                backgroundColor: isActive ? "#17ab7b" : "rgba(255,255,255,1)",
              },
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
                fontWeight: 700,
              }}
            >
              <Box component="span" sx={{ fontSize: "0.95rem" }}>
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

export default memo(AdminMenu);
