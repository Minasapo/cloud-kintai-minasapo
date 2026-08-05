import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { useSplitView } from "../hooks/useSplitView";
import { SplitViewProvider } from "./SplitViewProvider";

const TestComponent: React.FC = () => {
  const { state, setMode, setLeftPanel, setRightPanel, enableTripleMode } =
    useSplitView();

  return (
    <div>
      <div data-testid="mode">{state.mode}</div>
      <div data-testid="left-panel">{state.leftPanel?.id || "null"}</div>
      <div data-testid="right-panel">{state.rightPanel?.id || "null"}</div>
      <button onClick={() => setMode("split")}>Split Mode</button>
      <button onClick={enableTripleMode}>Triple Mode</button>
      <button onClick={() => setLeftPanel({ id: "left", title: "Left" })}>
        Set Left
      </button>
      <button onClick={() => setRightPanel({ id: "right", title: "Right" })}>
        Set Right
      </button>
    </div>
  );
};

describe("SplitViewProvider", () => {
  describe("initialization", () => {
    it("初期状態で single モードで初期化されること", () => {
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>,
      );

      expect(screen.getByTestId("mode")).toHaveTextContent("single");
      expect(screen.getByTestId("left-panel")).toHaveTextContent("null");
      expect(screen.getByTestId("right-panel")).toHaveTextContent("null");
    });
  });

  describe("setMode", () => {
    it("setMode 実行で mode が split に更新されること", async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>,
      );

      const splitButton = screen.getByText("Split Mode");
      await user.click(splitButton);

      await waitFor(() => {
        expect(screen.getByTestId("mode")).toHaveTextContent("split");
      });
    });
  });

  describe("enableTripleMode", () => {
    it("enableTripleMode 実行で mode が triple に更新されること", async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>,
      );

      const button = screen.getByText("Triple Mode");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("mode")).toHaveTextContent("triple");
      });
    });
  });

  describe("setLeftPanel", () => {
    it("setLeftPanel 実行で leftPanel が設定されること", async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>,
      );

      const setLeftButton = screen.getByText("Set Left");
      await user.click(setLeftButton);

      await waitFor(() => {
        expect(screen.getByTestId("left-panel")).toHaveTextContent("left");
      });
    });
  });

  describe("setRightPanel", () => {
    it("setRightPanel 実行で rightPanel が設定されること", async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>,
      );

      const setRightButton = screen.getByText("Set Right");
      await user.click(setRightButton);

      await waitFor(() => {
        expect(screen.getByTestId("right-panel")).toHaveTextContent("right");
      });
    });
  });

  describe("error handling", () => {
    it("useSplitView を Provider 外で使うとエラーを throw すること", () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, "error").mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useSplitView must be used within a SplitViewProvider");

      spy.mockRestore();
    });
  });
});
