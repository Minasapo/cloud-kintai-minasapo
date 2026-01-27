import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function EditButton({ staff }: { staff: StaffType }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const { cognitoUserId } = staff;
    navigate(`/admin/staff/${cognitoUserId}/edit`);
  };
  return (
    <IconButton size="small" onClick={handleClick}>
      <EditIcon fontSize="small" />
    </IconButton>
  );
}
