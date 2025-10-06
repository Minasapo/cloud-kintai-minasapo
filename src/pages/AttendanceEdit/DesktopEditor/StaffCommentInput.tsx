import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack, styled, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";

import { AppConfigContext } from "../../../context/AppConfigContext";
import { AttendanceEditContext } from "../AttendanceEditProvider";
import { AttendanceEditInputs } from "../common";

const Label = styled(Typography)(() => ({
  width: "150px",
  fontWeight: "bold",
}));

export default function StaffCommentInput({
  register,
  setValue,
}: {
  register: UseFormRegister<AttendanceEditInputs>;
  setValue: UseFormSetValue<AttendanceEditInputs>;
}) {
  const { getReasons } = useContext(AppConfigContext);
  const { changeRequests } = useContext(AttendanceEditContext);
  const [reasons, setReasons] = useState<
    { reason: string; enabled: boolean }[]
  >([]);

  useEffect(() => {
    setReasons(getReasons().filter((reason) => reason.enabled));
  }, [getReasons]);

  return (
    <Stack direction="row" alignItems={"center"}>
      <Label>修正理由</Label>
      <Box sx={{ flexGrow: 2 }}>
        <TextField
          {...register("staffComment")}
          multiline
          fullWidth
          minRows={2}
          placeholder="修正理由欄：管理者へ伝えたいことを記載"
          disabled={changeRequests.length > 0}
        />
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1 }}
            alignItems={"center"}
          >
            <Typography variant="body1">クイック入力：</Typography>
            {reasons.map((reason, index) => (
              <Chip
                key={index}
                label={reason.reason}
                variant="outlined"
                color="primary"
                icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
                disabled={changeRequests.length > 0}
                onClick={() =>
                  setValue("staffComment", reason.reason, { shouldDirty: true })
                }
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}
