import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SplitViewProvider } from './SplitViewProvider';
import { useSplitView } from '../hooks/useSplitView';

const TestComponent: React.FC = () => {
  const { state, setMode, setLeftPanel, setRightPanel } = useSplitView();

  return (
    <div>
      <div data-testid="mode">{state.mode}</div>
      <div data-testid="left-panel">{state.leftPanel?.id || 'null'}</div>
      <div data-testid="right-panel">{state.rightPanel?.id || 'null'}</div>
      <button onClick={() => setMode('split')}>Split Mode</button>
      <button onClick={() => setLeftPanel({ id: 'left', title: 'Left' })}>Set Left</button>
      <button onClick={() => setRightPanel({ id: 'right', title: 'Right' })}>Set Right</button>
    </div>
  );
};

describe('SplitViewProvider', () => {
  describe('initialization', () => {
    it('should initialize with default single mode', () => {
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('single');
      expect(screen.getByTestId('left-panel')).toHaveTextContent('null');
      expect(screen.getByTestId('right-panel')).toHaveTextContent('null');
    });
  });

  describe('setMode', () => {
    it('should update mode to split', async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>
      );

      const splitButton = screen.getByText('Split Mode');
      await user.click(splitButton);

      await waitFor(() => {
        expect(screen.getByTestId('mode')).toHaveTextContent('split');
      });
    });
  });

  describe('setLeftPanel', () => {
    it('should set left panel', async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>
      );

      const setLeftButton = screen.getByText('Set Left');
      await user.click(setLeftButton);

      await waitFor(() => {
        expect(screen.getByTestId('left-panel')).toHaveTextContent('left');
      });
    });
  });

  describe('setRightPanel', () => {
    it('should set right panel', async () => {
      const user = userEvent.setup();
      render(
        <SplitViewProvider>
          <TestComponent />
        </SplitViewProvider>
      );

      const setRightButton = screen.getByText('Set Right');
      await user.click(setRightButton);

      await waitFor(() => {
        expect(screen.getByTestId('right-panel')).toHaveTextContent('right');
      });
    });
  });

  describe('error handling', () => {
    it('should throw error when useSplitView is used outside provider', () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useSplitView must be used within a SplitViewProvider');

      spy.mockRestore();
    });
  });
});
