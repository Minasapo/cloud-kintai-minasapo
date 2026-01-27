import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Stack, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { memo } from "react";

type ShiftPlanFooterProps = {
  isAutoSaving: boolean;
  lastAutoSaveTime: string | null;
  isBusy: boolean;
  onSaveAll: () => void;
};

const ShiftPlanFooterBase: React.FC<ShiftPlanFooterProps> = ({
  isAutoSaving,
  lastAutoSaveTime,
  isBusy,
  onSaveAll,
}: ShiftPlanFooterProps) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={3}
      py={2}
    >
      <Stack spacing={1}>
        {isAutoSaving && (
          <Typography variant="caption" color="info.main">
            自動保存中...
          </Typography>
        )}
        {lastAutoSaveTime && !isAutoSaving && (
          <Typography variant="caption" color="text.secondary">
            最後の自動保存: {lastAutoSaveTime}
          </Typography>
        )}
      </Stack>
      <Button
        variant="contained"
        startIcon={<SaveIcon />}
        onClick={onSaveAll}
        disabled={isBusy}
      >
        全体を保存
      </Button>
    </Box>
  );
};

ShiftPlanFooterBase.propTypes = {
  isAutoSaving: PropTypes.bool.isRequired,
  lastAutoSaveTime: PropTypes.string,
  isBusy: PropTypes.bool.isRequired,
  onSaveAll: PropTypes.func.isRequired,
};

const ShiftPlanFooter = memo(ShiftPlanFooterBase);

export default ShiftPlanFooter;
