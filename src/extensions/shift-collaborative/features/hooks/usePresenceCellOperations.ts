import { useCallback } from "react";

import { CollaborativeUser } from "../types/collaborative.types";
import { EditingCellsMap } from "../types/presence.types";
import { generateUserColor } from "../utils/presenceUtils";

export const usePresenceCellOperations = ({
  currentUserId,
  currentUserName,
  editingCells,
  setEditingCellsState,
  updateActivity,
  activeUsers,
  currentUserColorRef,
}: {
  currentUserId: string;
  currentUserName: string;
  editingCells: EditingCellsMap;
  setEditingCellsState: React.Dispatch<React.SetStateAction<EditingCellsMap>>;
  updateActivity: () => void;
  activeUsers: CollaborativeUser[];
  currentUserColorRef: React.MutableRefObject<string>;
}) => {
  const startEditingCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.set(cellKey, {
          userId: currentUserId,
          userName: currentUserName,
          startTime: Date.now(),
        });
        return next;
      });
      updateActivity();
    },
    [currentUserId, currentUserName, setEditingCellsState, updateActivity],
  );

  const stopEditingCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });
      updateActivity();
    },
    [setEditingCellsState, updateActivity],
  );

  const isCellBeingEdited = useCallback(
    (staffId: string, date: string): boolean => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      return editor !== undefined && editor.userId !== currentUserId;
    },
    [editingCells, currentUserId],
  );

  const hasEditLock = useCallback(
    (staffId: string, date: string): boolean => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      return editor !== undefined && editor.userId === currentUserId;
    },
    [editingCells, currentUserId],
  );

  const getCellEditor = useCallback(
    (staffId: string, date: string): CollaborativeUser | undefined => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      if (!editor) return undefined;
      return (
        activeUsers.find((user) => user.userId === editor.userId) ?? {
          userId: editor.userId,
          userName: editor.userName,
          color:
            editor.userId === currentUserId
              ? currentUserColorRef.current
              : generateUserColor(editor.userId),
          lastActivity: editor.startTime,
        }
      );
    },
    [activeUsers, currentUserColorRef, currentUserId, editingCells],
  );

  const forceReleaseCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });
      updateActivity();
    },
    [setEditingCellsState, updateActivity],
  );

  const getAllEditingCells = useCallback(() => {
    return Array.from(editingCells.entries()).map(([cellKey, editor]) => {
      const [staffId, date] = cellKey.split("_");
      return { cellKey, staffId, date, ...editor };
    });
  }, [editingCells]);

  return {
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    forceReleaseCell,
    getAllEditingCells,
  };
};