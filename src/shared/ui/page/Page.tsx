import { Container, Stack } from "@mui/material";
import CommonBreadcrumbs, {
  type BreadcrumbItem,
} from "@shared/ui/breadcrumbs/CommonBreadcrumbs";
import Title from "@shared/ui/typography/Title";
import type { ReactNode } from "react";

interface PageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  maxWidth?: "xl" | "lg" | "md" | "sm" | false;
}

export default function Page({
  title,
  breadcrumbs = [{ label: "TOP", href: "/" }],
  children,
  maxWidth = "xl",
}: PageProps) {
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
