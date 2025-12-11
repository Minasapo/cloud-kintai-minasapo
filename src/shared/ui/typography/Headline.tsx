import { Typography } from "@mui/material";

interface HeadlineProps {
  text: string;
}

export default function Headline({ text }: HeadlineProps) {
  return (
    <Typography
      variant="h4"
      sx={{ pl: 1, borderBottom: "solid 5px #0FA85E", color: "#0FA85E" }}
    >
      {text}
    </Typography>
  );
}
