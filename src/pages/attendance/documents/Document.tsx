import { Container, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";

/**
 * @deprecated ドキュメントサイトが新設されたため、廃止を検討しています
 */
export default function Document() {
  return (
    <Container
      sx={{
        maxWidth: "xl",
        pb: 5,
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        sx={{
          pt: {
            xs: 1,
            md: 2,
          },
        }}
      >
        <Outlet />
      </Stack>
    </Container>
  );
}
