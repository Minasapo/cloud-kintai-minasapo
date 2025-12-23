import { Box, type BoxProps, Stack, type StackProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

type TestableProps<T> = T & {
  "data-testid"?: string;
};

type SlotProps = {
  root?: TestableProps<StackProps>;
  header?: TestableProps<BoxProps>;
  main?: TestableProps<BoxProps>;
  footer?: TestableProps<BoxProps>;
  snackbar?: TestableProps<BoxProps>;
};

type AppShellProps = {
  header: ReactNode;
  main: ReactNode;
  footer?: ReactNode;
  snackbar?: ReactNode;
  minHeight?: number | string;
  slotProps?: SlotProps;
};

const APP_BACKGROUND = designTokenVar(
  "component.appShell.background",
  "#F8FAF9"
);
const APP_TEXT_COLOR = designTokenVar(
  "component.appShell.textColor",
  "#1E2A25"
);
const CONTENT_BACKGROUND = designTokenVar(
  "component.appShell.contentBackground",
  "#F8FAF9"
);

type MergeableSx = SxProps<Theme>;

const normalizeSxArray = (value?: MergeableSx): MergeableSx[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const mergeSx = (base: MergeableSx, override?: MergeableSx): MergeableSx => {
  if (!override) {
    return base;
  }
  const baseArray = normalizeSxArray(base);
  const overrideArray = normalizeSxArray(override);
  return [...baseArray, ...overrideArray] as MergeableSx;
};

export default function AppShell({
  header,
  main,
  footer,
  snackbar,
  minHeight = "100vh",
  slotProps,
}: AppShellProps) {
  const {
    root,
    header: headerSlot,
    main: mainSlot,
    footer: footerSlot,
    snackbar: snackbarSlot,
  } = slotProps ?? {};
  const { sx: rootSx, ...rootRest } = root ?? {};
  const { sx: headerSx, ...headerRest } = headerSlot ?? {};
  const { sx: mainSx, ...mainRest } = mainSlot ?? {};
  const { sx: footerSx, ...footerRest } = footerSlot ?? {};
  const { sx: snackbarSx, ...snackbarRest } = snackbarSlot ?? {};

  return (
    <Stack
      {...rootRest}
      sx={mergeSx(
        {
          minHeight,
          backgroundColor: APP_BACKGROUND,
          color: APP_TEXT_COLOR,
        },
        rootSx
      )}
    >
      <Box
        {...headerRest}
        sx={mergeSx(
          {
            flexShrink: 0,
          },
          headerSx
        )}
      >
        {header}
      </Box>
      <Box
        component="main"
        {...mainRest}
        sx={mergeSx(
          {
            flex: 1,
            overflow: "auto",
            backgroundColor: CONTENT_BACKGROUND,
          },
          mainSx
        )}
      >
        {main}
      </Box>
      {footer && (
        <Box
          component="footer"
          {...footerRest}
          sx={mergeSx(
            {
              flexShrink: 0,
            },
            footerSx
          )}
        >
          {footer}
        </Box>
      )}
      {snackbar && (
        <Box
          {...snackbarRest}
          sx={mergeSx(
            {
              position: "relative",
              zIndex: 1,
            },
            snackbarSx
          )}
        >
          {snackbar}
        </Box>
      )}
    </Stack>
  );
}
