import dayjs from "dayjs";

// モックデータ型定義
export interface MockUser {
  id: string;
  name: string;
  role: "admin" | "staff";
  color: string;
  editingCell?: string; // "staffId-dayKey" format
  status: "editing" | "viewing" | "idle";
}

export interface MockShiftCell {
  state: "work" | "fixedOff" | "requestedOff" | "auto" | "empty";
  isLocked: boolean;
  lastChangedBy?: string;
  lastChangedAt?: string;
  history: Array<{
    timestamp: string;
    user: string;
    from: string;
    to: string;
  }>;
}

export interface MockStaff {
  id: string;
  name: string;
  group: string;
}

// シフト状態の表示設定
export const shiftStateConfig = {
  work: { label: "○", color: "success.main", text: "出勤" },
  fixedOff: { label: "固", color: "error.main", text: "固定休" },
  requestedOff: { label: "希", color: "warning.main", text: "希望休" },
  auto: { label: "△", color: "info.main", text: "自動調整枠" },
  empty: { label: "-", color: "text.disabled", text: "未入力" },
} as const;

// モックユーザー（接続中のユーザー）
export const mockActiveUsers: MockUser[] = [
  {
    id: "user1",
    name: "管理者 (Taro)",
    role: "admin",
    color: "rgb(25 118 210)",
    editingCell: "staff2-15",
    status: "editing",
  },
  {
    id: "user2",
    name: "Hanako",
    role: "staff",
    color: "rgb(156 39 176)",
    status: "viewing",
  },
  {
    id: "user3",
    name: "Jiro",
    role: "staff",
    color: "rgb(245 124 0)",
    editingCell: "staff3-10",
    status: "editing",
  },
];

// モックスタッフリスト
export const mockStaffs: MockStaff[] = [
  { id: "staff1", name: "山田 太郎", group: "グループA" },
  { id: "staff2", name: "鈴木 花子", group: "グループA" },
  { id: "staff3", name: "田中 次郎", group: "グループB" },
  { id: "staff4", name: "佐藤 美咲", group: "グループB" },
  { id: "staff5", name: "高橋 健太", group: "グループA" },
];

// モックシフトデータ生成
export const generateMockShiftData = (
  staffs: MockStaff[],
  daysInMonth: number,
): Map<string, Map<string, MockShiftCell>> => {
  const data = new Map<string, Map<string, MockShiftCell>>();

  staffs.forEach((staff) => {
    const staffData = new Map<string, MockShiftCell>();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = String(day).padStart(2, "0");
      const states: Array<MockShiftCell["state"]> = [
        "work",
        "fixedOff",
        "requestedOff",
        "auto",
        "empty",
      ];
      const randomState = states[Math.floor(Math.random() * states.length)];

      staffData.set(dayKey, {
        state: randomState,
        isLocked: day <= 10, // 1-10日は確定済みとする
        lastChangedBy: day % 3 === 0 ? "管理者" : staff.name,
        lastChangedAt:
          day <= 15
            ? dayjs()
                .subtract(daysInMonth - day, "day")
                .format("M/D HH:mm")
            : undefined,
        history: [],
      });
    }
    data.set(staff.id, staffData);
  });

  return data;
};

// 日ごとの人数集計
export const calculateDailyCount = (
  shiftData: Map<string, Map<string, MockShiftCell>>,
  dayKey: string,
): { work: number; fixedOff: number; requestedOff: number; total: number } => {
  let work = 0;
  let fixedOff = 0;
  let requestedOff = 0;

  shiftData.forEach((staffData) => {
    const cell = staffData.get(dayKey);
    if (cell) {
      if (cell.state === "work") work++;
      else if (cell.state === "fixedOff") fixedOff++;
      else if (cell.state === "requestedOff") requestedOff++;
    }
  });

  return { work, fixedOff, requestedOff, total: work };
};