import { Grid, Link, Stack, Typography } from "@mui/material";

import { predefinedIcons } from "@/constants/icons";

export function LinkGridItem({
  url,
  title,
  iconType,
  staffName,
}: {
  url: string;
  title: string;
  iconType: string;
  staffName: string;
}) {
  const IconMap = new Map(
    predefinedIcons.map((icon) => [icon.value, icon.component])
  );

  const iconComponent = IconMap.get(iconType) || IconMap.get("LinkIcon");

  const processedUrl = url.replace("{staffName}", staffName);

  return (
    <Grid item xs={4}>
      <Link
        href={processedUrl}
        target="_blank"
        color={"inherit"}
        underline="none"
      >
        <Stack
          direction="column"
          spacing={0}
          alignItems="center"
          sx={{
            p: 1,
            "&:hover": {
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          {iconComponent}
          <Typography variant="caption">{title}</Typography>
        </Stack>
      </Link>
    </Grid>
  );
}
