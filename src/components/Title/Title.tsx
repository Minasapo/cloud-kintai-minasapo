import { Typography, TypographyProps } from "@mui/material";
import { forwardRef } from "react";

type TitleProps = {
  borderColor?: string;
  color?: string;
} & Omit<TypographyProps, "color">;

const DEFAULT_COLOR = "#0FA85E";

const Title = forwardRef<HTMLSpanElement, TitleProps>(function Title(
  {
    children,
    borderColor,
    color = DEFAULT_COLOR,
    sx,
    variant = "h4",
    ...typographyProps
  },
  ref
) {
  const resolvedBorderColor = borderColor ?? color;
  const normalizedSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Typography
      ref={ref}
      variant={variant}
      sx={[
        {
          pl: 1,
          borderBottom: `solid 5px ${resolvedBorderColor}`,
          color,
        },
        ...normalizedSx,
      ]}
      {...typographyProps}
    >
      {children}
    </Typography>
  );
});

Title.displayName = "Title";

export default Title;
