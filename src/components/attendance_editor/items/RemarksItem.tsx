import { Box, Chip, Stack, TextField } from "@mui/material";
import { useContext } from "react";
import { Controller } from "react-hook-form";

import { AttendanceEditContext } from "@/pages/AttendanceEdit/AttendanceEditProvider";

export default function RemarksItem() {
  const { getValues, setValue, control, watch } = useContext(
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
            minHeight: 48,
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
                    fullWidth
                    size="small"
                    placeholder="備考を入力してください（タグは上に表示されます）"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                  />
                )}
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                value={(getValues("remarks") as string) || ""}
                onChange={(e) =>
                  setValue && setValue("remarks", e.target.value)
                }
                placeholder="備考を入力してください（タグは上に表示されます）"
                variant="standard"
                InputProps={{ disableUnderline: true }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
