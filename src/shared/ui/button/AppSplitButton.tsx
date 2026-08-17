import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { SxProps, Theme } from "@mui/material/styles";
import { MouseEvent, useMemo, useState } from "react";

import type { ButtonSize, ButtonTone, ButtonVariant } from "./types";

export interface AppSplitButtonOption {
  key: string;
  label: string;
  title?: string;
  disabled?: boolean;
}

type AppSplitButtonProps = {
  options: AppSplitButtonOption[];
  selectedKey: string | null;
  onSelectedKeyChange: (key: string) => void;
  onPrimaryClick: () => void;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  disabled?: boolean;
  className?: string;
  buttonGroupSx?: SxProps<Theme>;
  primaryButtonTestId?: string;
  toggleButtonTestId?: string;
};

const variantMap: Record<ButtonVariant, "contained" | "outlined" | "text"> = {
  solid: "contained",
  outline: "outlined",
  ghost: "text",
};

const toneMap: Record<
  ButtonTone,
  "primary" | "secondary" | "error" | "inherit"
> = {
  primary: "primary",
  secondary: "secondary",
  danger: "error",
  neutral: "inherit",
};

const sizeMap: Record<ButtonSize, "small" | "medium" | "large"> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

export default function AppSplitButton({
  options,
  selectedKey,
  onSelectedKeyChange,
  onPrimaryClick,
  variant = "outline",
  tone = "primary",
  size = "sm",
  disabled = false,
  className,
  buttonGroupSx,
  primaryButtonTestId,
  toggleButtonTestId,
}: AppSplitButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    return (
      options.find((option) => option.key === selectedKey) ?? options[0] ?? null
    );
  }, [options, selectedKey]);

  if (!selected) {
    return null;
  }

  return (
    <>
      <ButtonGroup
        variant={variantMap[variant]}
        color={toneMap[tone]}
        size={sizeMap[size]}
        disabled={disabled}
        className={className}
        sx={buttonGroupSx}
        aria-label="split-button"
      >
        <Button
          onClick={onPrimaryClick}
          title={selected.title}
          disabled={disabled || selected.disabled}
          sx={{ whiteSpace: "nowrap", flex: 1 }}
          data-testid={primaryButtonTestId}
        >
          {selected.label}
        </Button>
        <Button
          size={sizeMap[size]}
          aria-label="select preset action"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
            setOpen((prev) => !prev);
          }}
          disabled={disabled}
          data-testid={toggleButtonTestId}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1300 }}
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option) => (
                    <MenuItem
                      key={option.key}
                      selected={option.key === selected.key}
                      disabled={!!option.disabled}
                      onClick={() => {
                        onSelectedKeyChange(option.key);
                        setOpen(false);
                      }}
                      title={option.title}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
