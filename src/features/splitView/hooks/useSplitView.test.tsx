import { render, screen } from '@testing-library/react';
import React from 'react';
import { SplitViewProvider } from '../context/SplitViewProvider';
import { useSplitView } from './useSplitView';

const TestComponent: React.FC = () => {
  const context = useSplitView();
  return (
    <div>
      <div data-testid="mode">{context.state.mode}</div>
      <div data-testid="divider">{context.state.dividerPosition}</div>
    </div>
  );
};

describe('useSplitView', () => {
  it('should return SplitViewContextValue when used within provider', () => {
    render(
      <SplitViewProvider>
        <TestComponent />
      </SplitViewProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('single');
    expect(screen.getByTestId('divider')).toHaveTextContent('50');
  });

  it('should throw error when used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSplitView must be used within a SplitViewProvider');

    spy.mockRestore();
  });
});
