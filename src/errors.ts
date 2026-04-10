type MessageKind = "error" | "success";

type MessageDefinitionInput = {
  message: string;
  note?: string;
};

type MessageCategoryDefinition = {
  label: string;
  definitions: Record<string, MessageDefinitionInput>;
};

const MESSAGE_CATEGORY_DEFINITIONS = {
  common: {
    label: "共通",
    definitions: {
      E00001: {
        message: "データ取得中に問題が発生しました(エラーコード: E00001)",
      },
      E00002: {
        message: "メール送信に失敗しました(エラーコード: E00002)",
      },
    },
  },
  attendanceManagement: {
    label: "勤怠管理",
    definitions: {
      E01001: {
        message: "出勤に失敗しました(エラーコード: E01001)",
      },
      E01002: {
        message: "退勤に失敗しました(エラーコード: E01002)",
      },
      E01003: {
        message: "休憩開始に失敗しました(エラーコード: E01003)",
      },
      E01004: {
        message: "休憩終了に失敗しました(エラーコード: E01004)",
      },
      E01005: {
        message: "直行に失敗しました(エラーコード: E01005)",
      },
      E01006: {
        message: "直帰に失敗しました(エラーコード: E01006)",
      },
      S01001: {
        message: "出勤しました",
      },
      S01002: {
        message: "退勤しました",
      },
      S01003: {
        message: "出勤(直行)しました",
      },
      S01004: {
        message: "退勤(直帰)しました",
      },
      S01005: {
        message: "休憩開始しました",
      },
      S01006: {
        message: "休憩終了しました",
      },
    },
  },
  attendanceRecord: {
    label: "勤怠情報",
    definitions: {
      E02001: {
        message: "勤怠情報の取得に失敗しました(エラーコード: E02001)",
      },
      E02002: {
        message: "勤怠情報の作成に失敗しました(エラーコード: E02002)",
      },
      E02003: {
        message: "勤怠情報の更新に失敗しました(エラーコード: E02003)",
      },
      E02004: {
        message:
          "同一日付に重複した勤怠データが存在します。データ統合をしてください。(エラーコード: E02004)",
        note:
          "同一スタッフの同一日付に対して重複した勤怠データが存在する場合に使用します。データベースを確認し、スタッフ ID と対象日をキーとして 1 件のみ残るように重複レコードを統合してください。",
      },
      E02005: {
        message:
          "勤怠情報の変更リクエスト登録に失敗しました(エラーコード: E02005)",
      },
      S02002: {
        message: "勤怠情報を作成しました",
      },
      S02003: {
        message: "勤怠情報を更新しました",
      },
      S02005: {
        message:
          "勤怠情報の変更リクエストを登録しました。管理者から承認後に内容が反映されます。",
      },
    },
  },
  restRecord: {
    label: "休憩情報",
    definitions: {
      E03002: {
        message: "休憩情報の作成に失敗しました(エラーコード: E03002)",
      },
      E03003: {
        message: "休憩情報の更新に失敗しました(エラーコード: E03003)",
      },
      E03004: {
        message: "休憩情報の削除に失敗しました(エラーコード: E03004)",
      },
    },
  },
  attendanceAdmin: {
    label: "勤怠修正(管理者)",
    definitions: {
      E04001: {
        message: "勤怠情報の保存に失敗しました(エラーコード: E04001)",
      },
      E04006: {
        message: "勤怠情報の変更リクエストの承認に失敗しました",
      },
      E04007: {
        message: "勤怠情報の変更リクエストの却下に失敗しました",
      },
      S04001: {
        message: "勤怠情報を保存しました",
      },
      S04006: {
        message: "勤怠情報の変更リクエストを承認しました",
      },
      S04007: {
        message: "勤怠情報の変更リクエストを却下しました",
      },
    },
  },
  staffInfo: {
    label: "スタッフ情報",
    definitions: {
      E05001: {
        message: "スタッフ情報の取得に失敗しました(エラーコード: E05001)",
      },
      E05002: {
        message: "スタッフ情報の作成に失敗しました(エラーコード: E05002)",
      },
      E05003: {
        message: "スタッフ情報の更新に失敗しました(エラーコード: E05003)",
      },
      E05005: {
        message: "スタッフ情報の同期に失敗しました(エラーコード: E05005)",
      },
      E05006: {
        message: "スタッフ情報の同期に失敗しました(エラーコード: E05006)",
        note:
          "Cognito からユーザー情報を取得できなかった場合に使用します。既存仕様上、解決方法の追加説明はありません。",
      },
      E05007: {
        message: "スタッフ情報の同期に失敗しました(エラーコード: E05007)",
      },
      E05008: {
        message: "スタッフ情報の同期に失敗しました(エラーコード: E05008)",
        note:
          "Cognito 上でユーザーロールが取得できなかった場合に使用します。AWS コンソールのユーザープールで対象ユーザーのロール設定を確認してください。",
      },
      E05009: {
        message: "スタッフ情報の同期に失敗しました(エラーコード: E05009)",
        note:
          "Cognito 上でオーナー権限が取得できなかった場合に使用します。`custom:owner` の未設定または不正値を確認してください。",
      },
      S05001: {
        message: "スタッフ情報を取得しました",
      },
      S05003: {
        message: "スタッフ情報を更新しました",
      },
      S05005: {
        message: "スタッフ情報を同期しました",
      },
    },
  },
  staffRole: {
    label: "スタッフ権限情報",
    definitions: {
      E06001: {
        message: "スタッフ権限情報の取得に失敗しました(エラーコード: E06001)",
      },
    },
  },
  aggregationTargetMonth: {
    label: "集計対象月",
    definitions: {
      E09003: {
        message: "集計対象月情報の更新に失敗しました(エラーコード: E09003)",
      },
      E09004: {
        message: "集計対象月情報の削除に失敗しました(エラーコード: E09004)",
      },
      S09003: {
        message: "集計対象月情報を更新しました",
      },
      S09004: {
        message: "集計対象月情報を削除しました",
      },
    },
  },
  staffAccount: {
    label: "スタッフ",
    definitions: {
      E10001: {
        message:
          "スタッフの取得に失敗しました。手動で同期を実行してください。(エラーコード: E10001)",
      },
      E10002: {
        message: "スタッフの作成に失敗しました(エラーコード: E10002)",
      },
      E10004: {
        message: "スタッフの削除に失敗しました(エラーコード: E10004)",
      },
      S10002: {
        message: "スタッフを作成しました",
      },
      S10004: {
        message: "スタッフを削除しました",
      },
    },
  },
  accountDisable: {
    label: "アカウント無効化",
    definitions: {
      E11001: {
        message: "アカウント無効化に失敗しました(エラーコード: E11001)",
      },
      S11001: {
        message: "アカウントを無効化しました",
      },
    },
  },
  accountEnable: {
    label: "アカウント有効化",
    definitions: {
      E12001: {
        message: "アカウント有効化に失敗しました(エラーコード: E12001)",
      },
      S12001: {
        message: "アカウントを有効化しました",
      },
    },
  },
  documents: {
    label: "ドキュメント",
    definitions: {
      E13001: {
        message: "ドキュメントの取得に失敗しました(エラーコード: E13001)",
      },
      E13002: {
        message: "ドキュメントの作成に失敗しました(エラーコード: E13002)",
      },
      E13003: {
        message: "ドキュメントの更新に失敗しました(エラーコード: E13003)",
      },
      S13002: {
        message: "ドキュメントを作成しました",
      },
      S13003: {
        message: "ドキュメントを更新しました",
      },
    },
  },
  settings: {
    label: "設定管理",
    definitions: {
      E14001: {
        message: "設定の保存に失敗しました(エラーコード: E14001)",
      },
      E14002: {
        message:
          "開始時間または終了時間が設定されていません(エラーコード: E14002)",
      },
      S14001: {
        message: "設定が正常に作成されました",
      },
      S14002: {
        message: "設定が正常に更新されました",
      },
    },
  },
  theme: {
    label: "テーマ管理",
    definitions: {
      E15001: {
        message: "テーマカラーの保存に失敗しました(エラーコード: E15001)",
      },
      S15001: {
        message: "テーマカラーを保存しました",
      },
    },
  },
  shiftRequest: {
    label: "シフト希望",
    definitions: {
      E16001: {
        message: "シフト希望の保存に失敗しました(エラーコード: E16001)",
      },
      E16002: {
        message: "シフト希望の取得に失敗しました(エラーコード: E16002)",
      },
      S16001: {
        message: "シフト希望を保存しました",
      },
    },
  },
} as const satisfies Record<string, MessageCategoryDefinition>;

export type MessageCategory = keyof typeof MESSAGE_CATEGORY_DEFINITIONS;

type MessageCategoryMap = typeof MESSAGE_CATEGORY_DEFINITIONS;

export type MessageCode = {
  [Category in keyof MessageCategoryMap]: keyof MessageCategoryMap[Category]["definitions"];
}[keyof MessageCategoryMap] &
  string;

export type ErrorCode = Extract<MessageCode, `E${string}`>;
export type SuccessCode = Extract<MessageCode, `S${string}`>;

export type MessageDefinition = {
  code: MessageCode;
  message: string;
  category: MessageCategory;
  categoryLabel: string;
  kind: MessageKind;
  note: string | null;
};

export type MessageCategoryEntry = {
  key: MessageCategory;
  label: string;
  definitions: MessageDefinition[];
};

const isErrorCode = (code: MessageCode): code is ErrorCode =>
  code.startsWith("E");

const buildMessageDefinitions = () => {
  const definitions = {} as Record<MessageCode, MessageDefinition>;

  for (const category of Object.keys(
    MESSAGE_CATEGORY_DEFINITIONS,
  ) as MessageCategory[]) {
    const categoryDefinition = MESSAGE_CATEGORY_DEFINITIONS[category];
    const categoryDefinitions =
      categoryDefinition.definitions as Partial<
        Record<MessageCode, MessageDefinitionInput>
      >;

    for (const code of Object.keys(
      categoryDefinition.definitions,
    ) as MessageCode[]) {
      const definition = categoryDefinitions[code];

      if (!definition) {
        continue;
      }

      definitions[code] = {
        code,
        message: definition.message,
        category,
        categoryLabel: categoryDefinition.label,
        kind: isErrorCode(code) ? "error" : "success",
        note: definition.note ?? null,
      };
    }
  }

  return Object.freeze(definitions);
};

export const MESSAGE_DEFINITIONS = buildMessageDefinitions();

export const MESSAGE_CATEGORY_ENTRIES = Object.freeze(
  (Object.keys(MESSAGE_CATEGORY_DEFINITIONS) as MessageCategory[]).map((key) => {
    const category = MESSAGE_CATEGORY_DEFINITIONS[key];

    return {
      key,
      label: category.label,
      definitions: (Object.keys(category.definitions) as MessageCode[]).map(
        (code) => MESSAGE_DEFINITIONS[code],
      ),
    } satisfies MessageCategoryEntry;
  }),
);

export const MESSAGE_TEXTS = Object.freeze(
  Object.fromEntries(
    (Object.values(MESSAGE_DEFINITIONS) as MessageDefinition[]).map(
      ({ code, message }) => [code, message],
    ),
  ) as Record<MessageCode, string>,
);

export const getMessageDefinition = (code: MessageCode) =>
  MESSAGE_DEFINITIONS[code];

export const {
  E00001,
  E00002,
  E01001,
  E01002,
  E01003,
  E01004,
  E01005,
  E01006,
  S01001,
  S01002,
  S01003,
  S01004,
  S01005,
  S01006,
  E02001,
  E02002,
  E02003,
  E02004,
  E02005,
  S02002,
  S02003,
  S02005,
  E03002,
  E03003,
  E03004,
  E04001,
  E04006,
  E04007,
  S04001,
  S04006,
  S04007,
  E05001,
  E05002,
  E05003,
  E05005,
  E05006,
  E05007,
  E05008,
  E05009,
  S05001,
  S05003,
  S05005,
  E06001,
  E09003,
  E09004,
  S09003,
  S09004,
  E10001,
  E10002,
  E10004,
  S10002,
  S10004,
  E11001,
  S11001,
  E12001,
  S12001,
  E13001,
  E13002,
  E13003,
  S13002,
  S13003,
  E14001,
  E14002,
  S14001,
  S14002,
  E15001,
  S15001,
  E16001,
  E16002,
  S16001,
} = MESSAGE_TEXTS;
