/**
 * 共同編集シフト調整の型定義
 */

import { ShiftRequestStatus } from "@shared/api/graphql/types";

/**
 * シフト状態（内部表現）
 */
export type ShiftState =
  | "work"
  | "fixedOff"
  | "requestedOff"
  | "auto"
  | "empty";

/**
 * 参加ユーザー情報
 */
export interface CollaborativeUser {
  userId: string;
  userName: string;
  color: string; // UI用のアバターカラー
  lastActivity: number; // timestamp
}

/**
 * 接続状態
 */
export interface ConnectionState {
  status: "connected" | "disconnected" | "syncing";
  lastSyncedAt: number; // timestamp
  pendingChangeCount: number;
}

/**
 * シフトセルデータ
 */
export interface ShiftCellData {
  state: ShiftState;
  isLocked: boolean;
  lastChangedBy?: string;
  lastChangedAt?: string;
  version?: number;
}

/**
 * シフトデータマップ
 * Key: staffId, Value: Map<dayKey, ShiftCellData>
 */
export type ShiftDataMap = Map<string, Map<string, ShiftCellData>>;

/**
 * 保留中の変更
 * Key: staffId-dayKey, Value: ShiftCellUpdate
 */
export type PendingChangesMap = Map<string, ShiftCellUpdate>;

/**
 * 共同編集コンテキストの状態
 */
export interface CollaborativeShiftState {
  // シフトデータ
  shiftDataMap: ShiftDataMap;

  // 参加ユーザー
  activeUsers: CollaborativeUser[];

  // 編集中のセル（他のユーザーが編集中）
  editingCells: Map<string, { userId: string; userName: string }>;

  // ローカル編集状態
  pendingChanges: PendingChangesMap;
  selectedCells: Set<string>; // "staffId#dayKey"

  // 状態フラグ
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number;
  error: string | null;
  connectionState: "connected" | "disconnected" | "error";
}

/**
 * GraphQL から受け取るシフトリクエスト
 */
export interface ShiftRequestData {
  id: string;
  staffId: string;
  targetMonth: string;
  entries?: Array<{
    date: string;
    status: ShiftRequestStatus;
  }>;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
}

/**
 * シフト更新リクエスト（UIからの入力）
 */
export interface ShiftCellUpdate {
  staffId: string;
  date: string; // "YYYY-MM-DD"
  newState: ShiftState;
}
