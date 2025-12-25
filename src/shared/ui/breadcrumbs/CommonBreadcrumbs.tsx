import { Breadcrumbs, Link, Typography } from "@mui/material";

import { designTokenVar } from "@/shared/designSystem";

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
  const BREADCRUMB_GAP = designTokenVar("component.breadcrumbs.gap", "8px");
  const BREADCRUMB_SEPARATOR_COLOR = designTokenVar(
    "component.breadcrumbs.separatorColor",
    "#A0B1A7"
  );
  const BREADCRUMB_LINK_COLOR = designTokenVar(
    "component.breadcrumbs.linkColor",
    "#0FA85E"
  );
  const BREADCRUMB_TEXT_COLOR = designTokenVar(
    "component.breadcrumbs.textColor",
    "#45574F"
  );
  const BREADCRUMB_FONT_SIZE = designTokenVar(
    "component.breadcrumbs.fontSize",
    "14px"
  );
  const BREADCRUMB_FONT_WEIGHT = designTokenVar(
    "component.breadcrumbs.fontWeight",
    "500"
  );

  return (
    <Breadcrumbs
      separator={
        <Typography component="span" sx={{ color: BREADCRUMB_SEPARATOR_COLOR }}>
          /
        </Typography>
      }
      sx={{
        columnGap: BREADCRUMB_GAP,
        "& .MuiBreadcrumbs-li": {
          fontSize: BREADCRUMB_FONT_SIZE,
          fontWeight: BREADCRUMB_FONT_WEIGHT,
        },
      }}
    >
      {items.map((item, idx) =>
        item.href ? (
          <Link
            href={item.href}
            key={idx}
            underline="hover"
            sx={{
              color: BREADCRUMB_LINK_COLOR,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {item.label}
          </Link>
        ) : (
          <Typography sx={{ color: BREADCRUMB_TEXT_COLOR }} key={idx}>
            {item.label}
          </Typography>
        )
      )}
      <Typography sx={{ color: BREADCRUMB_TEXT_COLOR }} aria-current="page">
        {current}
      </Typography>
    </Breadcrumbs>
  );
}
