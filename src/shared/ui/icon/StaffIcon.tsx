import { Link } from "react-router-dom";

interface StaffIconProps {
  name?: string;
}

const StaffIcon = ({ name }: StaffIconProps) => {
  return (
    <Link
      aria-label="account"
      to="/profile"
      className="inline-flex rounded-full p-[2px] no-underline transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:p-[6px]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[0.9rem] text-slate-700 sm:h-9 sm:w-9 sm:text-[1.1rem] md:h-10 md:w-10 md:text-[1.25rem]">
        {name ? name.slice(0, 1) : ""}
      </span>
    </Link>
  );
};

export default StaffIcon;
