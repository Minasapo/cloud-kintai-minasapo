import Link from "@shared/ui/link/Link";

const MENU_ITEMS = [
  {
    label: "スタッフ管理",
    href: "/admin/staff",
  },
  {
    label: "勤怠管理",
    href: "/admin/attendance",
  },
] as const;

const Menu = () => (
  <nav className="box-border flex h-full w-auto items-center gap-2">
    {MENU_ITEMS.map(({ label, href }) => (
      <div key={href}>
        <Link
          label={label}
          href={href}
          color="secondary"
          className="block h-full px-1 leading-8"
        />
      </div>
    ))}
  </nav>
);

export default Menu;
