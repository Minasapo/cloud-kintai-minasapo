import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";

type TestableProps<T> = T & {
  "data-testid"?: string;
};

type SlotProps = {
  root?: TestableProps<HTMLAttributes<HTMLDivElement> & { sx?: CSSProperties }>;
  header?: TestableProps<HTMLAttributes<HTMLDivElement> & { sx?: CSSProperties }>;
  main?: TestableProps<HTMLAttributes<HTMLElement> & { sx?: CSSProperties }>;
  footer?: TestableProps<HTMLAttributes<HTMLElement> & { sx?: CSSProperties }>;
  snackbar?: TestableProps<HTMLAttributes<HTMLDivElement> & { sx?: CSSProperties }>;
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
    <div
      {...rootRest}
      style={{
        minHeight,
        backgroundColor: APP_BACKGROUND,
        color: APP_TEXT_COLOR,
        display: "flex",
        flexDirection: "column",
        ...rootSx,
        ...rootRest.style,
      }}
    >
      <div
        {...headerRest}
        style={{
          flexShrink: 0,
          ...headerSx,
          ...headerRest.style,
        }}
      >
        {header}
      </div>
      <main
        {...mainRest}
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: CONTENT_BACKGROUND,
          ...mainSx,
          ...mainRest.style,
        }}
      >
        {main}
      </main>
      {footer && (
        <footer
          {...footerRest}
          style={{
            flexShrink: 0,
            ...footerSx,
            ...footerRest.style,
          }}
        >
          {footer}
        </footer>
      )}
      {snackbar && (
        <div
          {...snackbarRest}
          style={{
            position: "relative",
            zIndex: 1,
            ...snackbarSx,
            ...snackbarRest.style,
          }}
        >
          {snackbar}
        </div>
      )}
    </div>
  );
}
