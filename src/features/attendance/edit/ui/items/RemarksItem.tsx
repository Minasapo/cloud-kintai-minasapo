import { Box, Chip, Stack, TextField } from "@mui/material";
import { useContext } from "react";
import { Controller } from "react-hook-form";

import { PANEL_HEIGHTS } from "@/shared/config/uiDimensions";
import { AttendanceEditContext } from "@/pages/attendance/edit/AttendanceEditProvider";

export default function RemarksItem() {
  const { getValues, setValue, control, watch, readOnly } = useContext(
    AttendanceEditContext
  );

  if (!getValues) return null;

  // subscribe to remarkTags so Chips update when tags change
  const tags: string[] = watch
    ? (watch("remarkTags") as string[]) || []
    : (getValues("remarkTags") as string[]) || [];

  return (
    <Stack direction="row" alignItems={"center"} spacing={2}>
      <Box sx={{ flexGrow: 2 }}>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 1,
            minHeight: PANEL_HEIGHTS.TEXTAREA_MIN,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            bgcolor: "background.paper",
          }}
        >
          {tags.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
          ))}

          <Box sx={{ width: "100%" }}>
            {control ? (
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    data-testid="remarks-input"
                    fullWidth
                    size="small"
                    placeholder="備考を入力してください（タグは上に表示されます）"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    disabled={!!readOnly}
                  />
                )}
              />
            ) : (
              <TextField
                data-testid="remarks-input"
                fullWidth
                size="small"
                value={(getValues("remarks") as string) || ""}
                onChange={(e) =>
                  !readOnly && setValue && setValue("remarks", e.target.value)
                }
                placeholder="備考を入力してください（タグは上に表示されます）"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                disabled={!!readOnly}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
