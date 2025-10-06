import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Chip, Stack, TextField } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";

import { AppConfigContext } from "@/context/AppConfigContext";

import { AttendanceEditContext } from "../AttendanceEditProvider";

export default function StaffCommentInput() {
  const { changeRequests, register, setValue } = useContext(
    AttendanceEditContext
  );
  const { getReasons } = useContext(AppConfigContext);
  const [reasons, setReasons] = useState<
    { reason: string; enabled: boolean }[]
  >([]);
  const staffCommentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setReasons(getReasons().filter((reason) => reason.enabled)); // 有効な理由のみ設定
  }, [getReasons]);

  if (!register || !setValue) {
    return null;
  }

  return (
    <Box>
      <TextField
        {...register("staffComment")}
        inputRef={(ref) => {
          staffCommentRef.current = ref;
          register("staffComment", { required: false });
        }}
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
          sx={{ mt: 1, flexWrap: "wrap" }}
          alignItems={"center"}
        >
          {reasons.map((reason, index) => (
            <Chip
              key={index}
              label={reason.reason}
              variant="outlined"
              color="primary"
              icon={<AddCircleOutlineOutlinedIcon fontSize="small" />}
              disabled={changeRequests.length > 0}
              onClick={() => {
                if (staffCommentRef.current) {
                  staffCommentRef.current.value = reason.reason;
                }
                setValue("staffComment", reason.reason, {
                  shouldDirty: true,
                });
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
