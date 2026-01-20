import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import React from "react";

export interface ScreenOption {
  value: string;
  label: string;
  route?: string;
}

export interface PanelHeaderProps {
  title?: string;
  onClose?: () => void;
  screenOptions?: ScreenOption[];
  selectedScreen?: string;
  onScreenChange?: (screenValue: string) => void;
}

/**
 * PanelHeader
 * パネルのヘッダーコンポーネント（タイトル、画面選択ピッカー、閉じるボタン）
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  onClose,
  screenOptions,
  selectedScreen,
  onScreenChange,
}) => {
  if (!title && !onClose && !screenOptions) {
    return null;
  }

  const handleScreenChange = (event: SelectChangeEvent<string>) => {
    if (onScreenChange) {
      onScreenChange(event.target.value);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 2,
        borderBottom: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {screenOptions && screenOptions.length > 0 && !selectedScreen && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedScreen || ""}
              onChange={handleScreenChange}
              displayEmpty
              inputProps={{ "aria-label": "画面を選択" }}
            >
              <MenuItem value="" disabled>
                画面を選択
              </MenuItem>
              {screenOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      {onClose && (
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="パネルを閉じる"
          sx={{ marginLeft: 2 }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};
