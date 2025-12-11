import { Avatar, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface StaffIconProps {
  name?: string;
}

const StaffIcon = ({ name }: StaffIconProps) => {
  const navigate = useNavigate();

  return (
    <IconButton aria-label="account" onClick={() => navigate("/profile")}>
      <Avatar>{name ? name.slice(0, 1) : ""}</Avatar>
    </IconButton>
  );
};

export default StaffIcon;
