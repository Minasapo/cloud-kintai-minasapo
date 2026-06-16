
export interface PresenceData {
  sessionId: string;
  userId: string;
  userName: string;
  color: string;
  lastActivity: number;
  timestamp: number;
  editingCells: Array<{
    cellKey: string;
    userId: string;
    userName: string;
    startTime: number;
  }>;
}

export type EditingCellEntry = {
  userId: string;
  userName: string;
  startTime: number;
};

export type PresenceEditingCell = PresenceData["editingCells"][number];

export type EditingCellsMap = Map<string, EditingCellEntry>;

export type EditingCellsStateUpdater =
  | EditingCellsMap
  | ((prev: EditingCellsMap) => EditingCellsMap);