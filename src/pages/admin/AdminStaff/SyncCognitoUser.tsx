import SyncIcon from "@mui/icons-material/Sync";
import { Box, Button, CircularProgress } from "@mui/material";
import { CreateStaffInput, UpdateStaffInput } from "@shared/api/graphql/types";
import { useState } from "react";

import { useAppDispatchV2 } from "../../../app/hooks";
import * as MESSAGE_CODE from "../../../errors";
import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";
import { handleSyncCognitoUser } from "./handleSyncCognitoUser";

export default function SyncCognitoUser({
  staffs,
  refreshStaff,
  createStaff,
  updateStaff,
}: {
  staffs: StaffType[];
  refreshStaff: () => Promise<void>;
  createStaff: (input: CreateStaffInput) => Promise<void>;
  updateStaff: (input: UpdateStaffInput) => Promise<void>;
}) {
  const dispatch = useAppDispatchV2();
  const [cognitoUserLoading, setCognitoUserLoading] = useState(false);

  return (
    <Box>
      <Button
        variant="outlined"
        size="medium"
        disabled={cognitoUserLoading}
        startIcon={
          cognitoUserLoading ? <CircularProgress size={15} /> : <SyncIcon />
        }
        onClick={() => {
          setCognitoUserLoading(true);
          handleSyncCognitoUser(staffs, refreshStaff, createStaff, updateStaff)
            .then(() => {
              dispatch(setSnackbarSuccess(MESSAGE_CODE.S05005));
            })
            .catch((e) => {
              dispatch(setSnackbarError(e.message));
            })
            .finally(() => {
              setCognitoUserLoading(false);
            });
        }}
      >
        ユーザー同期
      </Button>
    </Box>
  );
}
