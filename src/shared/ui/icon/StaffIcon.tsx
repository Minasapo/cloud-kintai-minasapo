import { AppAvatar } from "@shared/ui/avatar";
import { Link } from "react-router-dom";

interface StaffIconProps {
  name?: string;
}

const StaffIcon = ({ name }: StaffIconProps) => {
  const initial = name ? name.slice(0, 1) : "";

  return (
    <Link
      aria-label="account"
      to="/profile"
      className="inline-flex rounded-full p-[2px] no-underline transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-[6px]"
    >
      <AppAvatar
        size="large"
        sx={{
          width: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
          height: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
          fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.25rem" },
          bgcolor: "rgb(226 232 240)",
          color: "rgb(51 65 85)",
        }}
      >
        {initial}
      </AppAvatar>
    </Link>
  );
};

export default StaffIcon;
