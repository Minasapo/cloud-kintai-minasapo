import {
  PAGE_PADDING_X,
  PAGE_PADDING_Y,
} from "@features/admin/layout/adminLayoutTokens";
import { useAdminLayoutContent } from "@features/admin/layout/model/useAdminLayoutContent";
import { AdminContent } from "@features/admin/layout/ui/AdminContent";
import { SplitModeToggle, SplitViewProvider } from "@features/splitView";
import { Box, Stack } from "@mui/material";
import { designTokenVar } from "@shared/designSystem";
import { AppButton } from "@shared/ui/button";
import { PageSection } from "@shared/ui/layout";

const PAGE_SECTION_GAP = designTokenVar("spacing.xl", "24px");

const PAGE_CONTAINER_SX = {
  flex: 1,
  width: "100%",
  boxSizing: "border-box",
  px: PAGE_PADDING_X,
  py: PAGE_PADDING_Y,
  gap: PAGE_SECTION_GAP,
} as const;

const SURFACE_SECTION_SX = {
  gap: 0,
  flex: 1,
  overflow: "hidden",
  borderRadius: "16px",
  border: "1px solid rgba(226,232,240,0.8)",
  backgroundColor: "rgb(255 255 255)",
  boxShadow: "0 28px 60px -42px rgba(15,23,42,0.35)",
} as const;

function AdminLayoutContent() {
  const {
    menuItems,
    activeMenuHref,
    currentPath,
    isMobile,
    isMobileRailOpen,
    splitMode,
    isSplitMode,
    isTripleMode,
    splitPanelPosition,
    splitPanelConfig,
    middlePanelTitle,
    rightPanelTitle,
    selectedMiddleScreen,
    selectedRightScreen,
    MiddlePanelComponent,
    RightPanelComponent,
    handleSelect,
    handleToggleMobileRail,
    handleToggleSplitMode,
    handleCloseMiddlePanel,
    handleCloseRightPanel,
    handleMiddleScreenChange,
    handleRightScreenChange,
  } = useAdminLayoutContent();

  return (
    <Stack component="section" sx={PAGE_CONTAINER_SX}>
      <PageSection
        variant="surface"
        layoutVariant="dashboard"
        sx={SURFACE_SECTION_SX}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            borderBottom: "1px solid rgba(226,232,240,0.85)",
          }}
        >
          {isMobile && (
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleToggleMobileRail}
              sx={{ textTransform: "none", borderRadius: "999px" }}
            >
              {isMobileRailOpen ? "ナビを閉じる" : "ナビを開く"}
            </AppButton>
          )}
          <SplitModeToggle mode={splitMode} onToggle={handleToggleSplitMode} />
        </Box>

        <AdminContent
          menuItems={menuItems}
          activeMenuHref={activeMenuHref}
          currentPath={currentPath}
          onSelect={handleSelect}
          isMobile={isMobile}
          isMobileRailOpen={isMobileRailOpen}
          isSplitMode={isSplitMode}
          isTripleMode={isTripleMode}
          splitPanelPosition={splitPanelPosition}
          splitPanelTitle={splitPanelConfig?.title}
          splitPanelScreen={splitPanelConfig?.id ?? ""}
          middlePanelTitle={middlePanelTitle}
          rightPanelTitle={rightPanelTitle}
          selectedMiddleScreen={selectedMiddleScreen}
          selectedRightScreen={selectedRightScreen}
          onCloseMiddlePanel={handleCloseMiddlePanel}
          onCloseRightPanel={handleCloseRightPanel}
          onMiddleScreenChange={handleMiddleScreenChange}
          onRightScreenChange={handleRightScreenChange}
          SplitPanelComponent={splitPanelConfig?.component}
          MiddlePanelComponent={MiddlePanelComponent}
          RightPanelComponent={RightPanelComponent}
        />
      </PageSection>
    </Stack>
  );
}

export default function AdminLayout() {
  return (
    <SplitViewProvider>
      <AdminLayoutContent />
    </SplitViewProvider>
  );
}
