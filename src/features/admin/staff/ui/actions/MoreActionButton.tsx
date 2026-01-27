import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu } from "@mui/material";
import { DeleteStaffInput, UpdateStaffInput } from "@shared/api/graphql/types";
import { useState } from "react";

import {
  DeleteAccountMenuItem,
  DisableAccountMenuItem,
  EnableAccountMenuItem,
} from "./index";

export function MoreActionButton({
  staff,
  updateStaff,
  deleteStaff,
}: {
  staff: StaffType;
  updateStaff: (input: UpdateStaffInput) => Promise<void>;
  deleteStaff: (input: DeleteStaffInput) => Promise<void>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { enabled: accountEnabled } = staff;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {accountEnabled ? (
          <DisableAccountMenuItem staff={staff} updateStaff={updateStaff} />
        ) : (
          <EnableAccountMenuItem staff={staff} updateStaff={updateStaff} />
        )}
        <DeleteAccountMenuItem staff={staff} deleteStaff={deleteStaff} />
      </Menu>
    </>
  );
}
