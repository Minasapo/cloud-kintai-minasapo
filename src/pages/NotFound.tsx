import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { designTokenVar } from "@/shared/designSystem";

const PAGE_PADDING_TOP = designTokenVar("component.page.paddingTop", "24px");
const PAGE_SECTION_GAP = designTokenVar("component.page.sectionGap", "16px");

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ pt: PAGE_PADDING_TOP }}>
      <Stack
        direction="column"
        spacing={0}
        sx={{ gap: PAGE_SECTION_GAP }}
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
      >
        <Box sx={{ textAlign: "center", py: 4 }}>
          {/* 404コード */}
          <Typography
            variant="h1"
            component="div"
            sx={{
              fontSize: { xs: "72px", md: "120px" },
              fontWeight: 700,
              color: "primary.main",
              lineHeight: 1,
              mb: 2,
            }}
          >
            404
          </Typography>

          {/* メインメッセージ */}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "24px", md: "32px" },
              fontWeight: 600,
              mb: 1,
              color: "text.primary",
            }}
          >
            ページが見つかりません
          </Typography>

          {/* サブメッセージ */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "14px", md: "16px" },
              color: "text.secondary",
              mb: 4,
              maxWidth: "500px",
            }}
          >
            お探しのページは存在しないか、移動された可能性があります。
            <br />
            ホームページに戻るか、前のページに戻ってください。
          </Typography>

          {/* アクションボタン */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGoHome}
              sx={{
                minWidth: "160px",
              }}
            >
              ホームに戻る
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={handleGoBack}
              sx={{
                minWidth: "160px",
              }}
            >
              前のページに戻る
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
