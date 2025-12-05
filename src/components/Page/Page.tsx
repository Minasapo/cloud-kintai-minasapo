import { Container, Stack } from "@mui/material";
import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import React, { type ReactNode } from "react";

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
