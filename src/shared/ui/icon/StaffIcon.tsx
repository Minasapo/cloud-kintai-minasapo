import { Avatar, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

interface StaffIconProps {
  name?: string;
}

const StaffIcon = ({ name }: StaffIconProps) => {
  return (
    <IconButton aria-label="account" component={Link} to="/profile">
      <Avatar>{name ? name.slice(0, 1) : ""}</Avatar>
    </IconButton>
  );
};

export default StaffIcon;
