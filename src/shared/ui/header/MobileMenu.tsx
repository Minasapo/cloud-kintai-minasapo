import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ReactNode } from "react";

export interface MobileMenuItem {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  styles?: Record<string, unknown>;
}

export interface MobileMenuProps {
  menuItems: MobileMenuItem[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  hide?: boolean;
  iconColor?: string;
}

const MenuList = ({
  menuItems,
  onClose,
}: {
  menuItems: MobileMenuItem[];
  onClose: () => void;
}) => (
  <Box
    sx={{ width: 250 }}
    role="presentation"
    onClick={onClose}
    onKeyDown={onClose}
  >
    <List>
      {menuItems.map((item, index) => (
        <div key={`${item.label}-${index}`}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                ...(item.styles || {}),
                "&:hover, &:focus": {
                  backgroundColor: "transparent",
                },
              }}
              onClick={item.onClick || (() => {})}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
          {item.divider && <Divider />}
        </div>
      ))}
    </List>
    <Divider />
  </Box>
);

const MobileMenu = ({
  menuItems,
  isOpen,
  onOpen,
  onClose,
  hide = false,
  iconColor = "white",
}: MobileMenuProps) => {
  if (hide) {
    return null;
  }

  return (
    <Box
      sx={{
        textAlign: "right",
        display: { xs: "block", lg: "none" },
      }}
    >
      <IconButton onClick={onOpen} sx={{ p: { xs: "3px", sm: "6px" } }}>
        <MenuIcon
          sx={{
            color: iconColor,
            fontSize: { xs: 28, sm: 32 },
          }}
        />
      </IconButton>
      <Drawer anchor="right" open={isOpen} onClose={onClose}>
        <MenuList menuItems={menuItems} onClose={onClose} />
      </Drawer>
    </Box>
  );
};

export default MobileMenu;
