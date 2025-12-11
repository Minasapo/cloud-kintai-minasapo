import { Box, Typography } from "@mui/material";

interface FooterProps {
  themeColor: string;
}

const Footer = ({ themeColor }: FooterProps) => (
  <footer
    style={{
      backgroundColor: themeColor,
    }}
  >
    <Box textAlign="center" sx={{ p: 1 }}>
      <Typography
        sx={{
          variant: "body2",
          color: "white",
        }}
      >
        © 2025 Virtual Tech Japan Inc.
      </Typography>
    </Box>
  </footer>
);

export default Footer;
