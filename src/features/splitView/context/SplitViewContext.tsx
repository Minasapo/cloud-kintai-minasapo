import { createContext } from 'react';
import { SplitViewContextValue } from '../types/splitView.types';

/**
 * SplitViewContext
 * デフォルトはシングルモード
 */
export const SplitViewContext = createContext<SplitViewContextValue | undefined>(undefined);

SplitViewContext.displayName = 'SplitViewContext';
