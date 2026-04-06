import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

import { AppIconButton } from "@/shared/ui/button";

export function EditButton({ staff }: { staff: StaffType }) {
  const navigate = useNavigate();

  const handleClick = () => {
    const { cognitoUserId } = staff;
    navigate(`/admin/staff/${cognitoUserId}/edit`);
  };
  return (
    <AppIconButton aria-label="スタッフを編集" size="sm" onClick={handleClick}>
      <EditIcon fontSize="small" />
    </AppIconButton>
  );
}
