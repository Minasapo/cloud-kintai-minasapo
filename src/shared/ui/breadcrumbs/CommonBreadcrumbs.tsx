import { Breadcrumbs, Link, Typography } from "@mui/material";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

interface CommonBreadcrumbsProps {
  items: BreadcrumbItem[];
  current: string;
}

export default function CommonBreadcrumbs({
  items,
  current,
}: CommonBreadcrumbsProps) {
  return (
    <Breadcrumbs>
      {items.map((item, idx) =>
        item.href ? (
          <Link href={item.href} color="inherit" key={idx}>
            {item.label}
          </Link>
        ) : (
          <Typography color="text.primary" key={idx}>
            {item.label}
          </Typography>
        )
      )}
      <Typography color="text.primary">{current}</Typography>
    </Breadcrumbs>
  );
}
