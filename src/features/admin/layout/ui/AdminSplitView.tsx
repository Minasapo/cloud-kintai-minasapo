import { ADMIN_SPLIT_PANEL_OPTIONS } from "@features/admin/layout/model/adminSplitPanelRegistry";
import { PanelContainer } from "@features/splitView";
import { Box, Skeleton, Stack } from "@mui/material";
import React, { memo, Suspense } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

const PANEL_SEPARATOR_STYLE = {
  width: "8px",
  backgroundColor: "rgb(226 232 240)",
  cursor: "col-resize",
} as const;

const SplitPanelSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 2 }}>
    <Skeleton variant="text" width="38%" height={32} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
    <Skeleton variant="rounded" height={54} />
  </Stack>
);

const EmptyPanelState = memo(function EmptyPanelState({
  label,
}: {
  label: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgb(100 116 139)",
        fontSize: "0.9rem",
      }}
    >
      {label}
    </Box>
  );
});

const SinglePanelContent = memo(function SinglePanelContent({
  outlet,
}: {
  outlet: React.ReactNode;
}) {
  return <>{outlet}</>;
});

const MainOutletPanelContent = memo(function MainOutletPanelContent({
  outlet,
}: {
  outlet: React.ReactNode;
}) {
  return <PanelContainer onClose={undefined}>{outlet}</PanelContainer>;
});

const SplitContentPanel = memo(function SplitContentPanel({
  title,
  selectedScreen,
  emptyLabel,
  onClose,
  onScreenChange,
  PanelComponent,
}: {
  title?: string;
  selectedScreen: string;
  emptyLabel: string;
  onClose: () => void;
  onScreenChange: (screenValue: string) => void;
  PanelComponent?: React.ComponentType<{ panelId: string }>;
}) {
  return (
    <PanelContainer
      title={title || "画面を選択"}
      onClose={onClose}
      screenOptions={ADMIN_SPLIT_PANEL_OPTIONS}
      selectedScreen={selectedScreen}
      onScreenChange={onScreenChange}
      contentSx={selectedScreen === "daily-report" ? { pt: 0 } : undefined}
    >
      {PanelComponent ? (
        <Suspense fallback={<SplitPanelSkeleton />}>
          <PanelComponent panelId={selectedScreen} />
        </Suspense>
      ) : (
        <EmptyPanelState label={emptyLabel} />
      )}
    </PanelContainer>
  );
});

interface SplitLayoutPanelsProps {
  splitPanelTitle?: string;
  splitPanelPosition: "left" | "right";
  selectedScreen: string;
  onClosePanel: () => void;
  onScreenChange: (screenValue: string) => void;
  SplitPanelComponent?: React.ComponentType<{ panelId: string }>;
  outlet: React.ReactNode;
}

const SplitLayoutPanels = memo(function SplitLayoutPanels({
  splitPanelTitle,
  splitPanelPosition,
  selectedScreen,
  onClosePanel,
  onScreenChange,
  SplitPanelComponent,
  outlet,
}: SplitLayoutPanelsProps) {
  const splitPanelContent = (
    <SplitContentPanel
      title={splitPanelTitle}
      selectedScreen={selectedScreen}
      emptyLabel="パネルが選択されていません"
      onClose={onClosePanel}
      onScreenChange={onScreenChange}
      PanelComponent={SplitPanelComponent}
    />
  );

  const mainPanelContent = <MainOutletPanelContent outlet={outlet} />;

  return (
    <Group orientation="horizontal">
      <Panel defaultSize={50} minSize={30}>
        {splitPanelPosition === "left" ? splitPanelContent : mainPanelContent}
      </Panel>
      <Separator style={PANEL_SEPARATOR_STYLE} />
      <Panel defaultSize={50} minSize={30}>
        {splitPanelPosition === "left" ? mainPanelContent : splitPanelContent}
      </Panel>
    </Group>
  );
});

interface TripleLayoutPanelsProps {
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  middleSelectedScreen: string;
  rightSelectedScreen: string;
  onCloseMiddlePanel: () => void;
  onCloseRightPanel: () => void;
  onMiddleScreenChange: (screenValue: string) => void;
  onRightScreenChange: (screenValue: string) => void;
  MiddlePanelComponent?: React.ComponentType<{ panelId: string }>;
  RightPanelComponent?: React.ComponentType<{ panelId: string }>;
  outlet: React.ReactNode;
}

const TripleLayoutPanels = memo(function TripleLayoutPanels({
  middlePanelTitle,
  rightPanelTitle,
  middleSelectedScreen,
  rightSelectedScreen,
  onCloseMiddlePanel,
  onCloseRightPanel,
  onMiddleScreenChange,
  onRightScreenChange,
  MiddlePanelComponent,
  RightPanelComponent,
  outlet,
}: TripleLayoutPanelsProps) {
  return (
    <Group orientation="horizontal">
      <Panel defaultSize={35} minSize={22}>
        <MainOutletPanelContent outlet={outlet} />
      </Panel>
      <Separator style={PANEL_SEPARATOR_STYLE} />
      <Panel defaultSize={32} minSize={22}>
        <SplitContentPanel
          title={middlePanelTitle || "中央パネル"}
          selectedScreen={middleSelectedScreen}
          emptyLabel="中央パネルの画面を選択してください"
          onClose={onCloseMiddlePanel}
          onScreenChange={onMiddleScreenChange}
          PanelComponent={MiddlePanelComponent}
        />
      </Panel>
      <Separator style={PANEL_SEPARATOR_STYLE} />
      <Panel defaultSize={33} minSize={22}>
        <SplitContentPanel
          title={rightPanelTitle || "右パネル"}
          selectedScreen={rightSelectedScreen}
          emptyLabel="右パネルの画面を選択してください"
          onClose={onCloseRightPanel}
          onScreenChange={onRightScreenChange}
          PanelComponent={RightPanelComponent}
        />
      </Panel>
    </Group>
  );
});

export interface AdminSplitViewProps {
  isSplitMode: boolean;
  isTripleMode: boolean;
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  selectedMiddleScreen: string;
  selectedRightScreen: string;
  splitPanelPosition: "left" | "right";
  splitPanelTitle?: string;
  splitPanelScreen: string;
  onCloseMiddlePanel: () => void;
  onCloseRightPanel: () => void;
  onMiddleScreenChange: (screenValue: string) => void;
  onRightScreenChange: (screenValue: string) => void;
  SplitPanelComponent?: React.ComponentType<{ panelId: string }>;
  MiddlePanelComponent?: React.ComponentType<{ panelId: string }>;
  RightPanelComponent?: React.ComponentType<{ panelId: string }>;
  outlet: React.ReactNode;
}

export const AdminSplitView = memo(function AdminSplitView({
  isSplitMode,
  isTripleMode,
  middlePanelTitle,
  rightPanelTitle,
  selectedMiddleScreen,
  selectedRightScreen,
  splitPanelPosition,
  splitPanelTitle,
  splitPanelScreen,
  onCloseMiddlePanel,
  onCloseRightPanel,
  onMiddleScreenChange,
  onRightScreenChange,
  SplitPanelComponent,
  MiddlePanelComponent,
  RightPanelComponent,
  outlet,
}: AdminSplitViewProps) {
  if (isTripleMode) {
    return (
      <TripleLayoutPanels
        middlePanelTitle={middlePanelTitle}
        rightPanelTitle={rightPanelTitle}
        middleSelectedScreen={selectedMiddleScreen}
        rightSelectedScreen={selectedRightScreen}
        onCloseMiddlePanel={onCloseMiddlePanel}
        onCloseRightPanel={onCloseRightPanel}
        onMiddleScreenChange={onMiddleScreenChange}
        onRightScreenChange={onRightScreenChange}
        MiddlePanelComponent={MiddlePanelComponent}
        RightPanelComponent={RightPanelComponent}
        outlet={outlet}
      />
    );
  }

  if (isSplitMode) {
    return (
      <SplitLayoutPanels
        splitPanelTitle={splitPanelTitle}
        splitPanelPosition={splitPanelPosition}
        selectedScreen={splitPanelScreen}
        onClosePanel={onCloseRightPanel}
        onScreenChange={
          splitPanelPosition === "left"
            ? onMiddleScreenChange
            : onRightScreenChange
        }
        SplitPanelComponent={SplitPanelComponent}
        outlet={outlet}
      />
    );
  }

  return <SinglePanelContent outlet={outlet} />;
});
