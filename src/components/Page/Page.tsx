import { Container, Stack } from "@mui/material";
import React, { type ReactNode } from "react";

import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@/components/common/CommonBreadcrumbs";
import Title from "@/components/Title/Title";

export default function Page({
  title,
  breadcrumbs = [{ label: "TOP", href: "/" }],
  children,
  maxWidth = "xl",
}: {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  maxWidth?: "xl" | "lg" | "md" | "sm" | false;
}) {
  return (
    <Container maxWidth={maxWidth} disableGutters sx={{ pt: 2 }}>
      <Stack direction="column" spacing={2}>
        <CommonBreadcrumbs items={breadcrumbs} current={title} />
        <Title>{title}</Title>
        {children}
      </Stack>
    </Container>
  );
}
