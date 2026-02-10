import { Avatar, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

interface StaffIconProps {
  name?: string;
}

const StaffIcon = ({ name }: StaffIconProps) => {
  return (
    <IconButton
      aria-label="account"
      component={Link}
      to="/profile"
      sx={{
        p: { xs: "4px", sm: "6px" },
      }}
    >
      <Avatar
        sx={{
          width: { xs: 32, sm: 36, md: 40 },
          height: { xs: 32, sm: 36, md: 40 },
          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
        }}
      >
        {name ? name.slice(0, 1) : ""}
      </Avatar>
    </IconButton>
  );
};

export default StaffIcon;
