import { Alert, Container, Stack, Typography } from "@mui/material";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import NotFound from "@/pages/NotFound";
import { designTokenVar } from "@/shared/designSystem";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");
const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

export default function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return (
    <Container
      maxWidth="lg"
      disableGutters
      className="pt-6"
      style={{ paddingTop: PAGE_PADDING_TOP }}
    >
      <Stack
        direction="column"
        spacing={0}
        className="min-h-[40vh]"
        style={{ gap: PAGE_SECTION_GAP }}
      >
        <Typography variant="h4" component="h1">
          ページの表示中に問題が発生しました
        </Typography>
        <Alert severity="error">
          {isRouteErrorResponse(error)
            ? error.data || `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "予期しないエラーが発生しました。"}
        </Alert>
      </Stack>
    </Container>
  );
}
