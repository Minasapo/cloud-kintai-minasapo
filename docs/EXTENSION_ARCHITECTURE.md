# Extension Architecture

> 状態: Phase 3 完了 — 5 つの主要機能を `src/extensions/` 配下に移設済み。新規拡張は `scripts/create-extension.mjs` で雛形生成可能。

## 目的

`garaku-frontend` を「コア（全テナント・全ユーザーで必須）」と「拡張機能（テナント/オフィス設定で on/off できるオプション機能）」に整理し、以下を実現する。

- **AppConfig フラグ駆動** での機能 on/off を、ルート / メニュー / Provider / RTK Query / GraphQL Subscription までまとめて切り替え可能にする
- 個別機能の責務とディレクトリ境界を明確にし、コア膨張を抑える
- 将来サードパーティ／別チームが機能追加できる土台を残す（同一リポジトリ内モジュール分割を前提）

> **スコープ**: ビルドは 1 本。ランタイム動的ロード（Module Federation 等）は今回扱わない。

---

## 構成

```
src/
├─ app/                ← core: ルートストア・プロバイダ
├─ entities/           ← core: ドメイン型・API クライアント
├─ features/           ← core: 共通機能
├─ pages/              ← core: ページ
├─ processes/          ← core: 横断フロー
├─ shared/             ← core: 共通 UI・ユーティリティ
├─ widgets/            ← core: 横断 UI ブロック
├─ router.tsx          ← core + 拡張ルートを合成
└─ extensions/         ← 拡張モジュール置き場（新規）
   ├─ _types.ts        ← ExtensionManifest 型
   ├─ registry.ts      ← collectExtension*  ヘルパ
   ├─ index.ts         ← extensionManifests 配列（追加点）
   └─ <name>/          ← 各拡張のサブモジュール
      ├─ manifest.ts
      ├─ pages/
      ├─ features/
      ├─ entities/
      └─ __tests__/
```

### 依存方向

```
app → processes → pages → features → entities → shared
                                                  ↑
                                       extensions ┘
```

- **core → extensions の直接 import は禁止**（ESLint で error）
  - 例外: 統合点 4 ファイルだけ ignores で許可
    - `src/router.tsx`（route 合成）
    - `src/app/apis/index.ts`（RTK Query 合成）
    - `src/app/providers/AppRootProviders.tsx`（Provider 合成）
    - `src/widgets/layout/header/NavigationMenu.tsx`（メニュー合成）
- **extension → 別 extension の直接 import は禁止**（共有が必要なら shared / entities に昇格）
- extension → core/shared/entities/features/processes は OK

---

## ExtensionManifest 仕様

```ts
type ExtensionManifest = {
  name: string;                                       // kebab-case 一意 ID
  isEnabled?: (derived?: AppConfigDerived) => boolean; // 未指定なら常時有効
  routes?: RouteObject[];                              // "/" 配下に追加
  adminRoutes?: RouteObject[];                         // "/admin" 配下に追加
  menuItems?: ExtensionMenuItemDescriptor[];           // ナビメニューに追加
  providers?: ComponentType<{ children: ReactNode }>[]; // Provider スタック内側に挿入
  rtkApis?: RegisteredRtkApi[];                        // RTK Query slice を登録
};
```

### 重要な制約

- **ルートと Provider は常に登録される**（AppConfig がロードされる前にルーターが構築されるため、`isEnabled` で物理的に外すことはできない）
  - `isEnabled` は **メニュー表示** と **将来のスロット表示判定** のためのフラグ
  - 無効時のアクセス防止は、各拡張の route 内でリダイレクト / 不在 UI を返す責務
- **`menuItems` は `isEnabled` で動的にフィルタされる**（NavigationMenu 内で評価）
- **`rtkApis` は常に store に登録される**（fetch を発火させない限りコストは小さい）

---

## 拡張の追加手順（5 ステップ）

1. `src/extensions/<name>/` を作成
2. `manifest.ts` を作成し `ExtensionManifest` を default export
3. `src/extensions/index.ts` の `extensionManifests` 配列に追加
4. `npm run typecheck && npm run lint` で土台を確認
5. ユニットテスト / E2E を `src/extensions/<name>/__tests__/` または `playwright/tests/<name>/` に追加

### 例: 最小マニフェスト

```ts
// src/extensions/sample/manifest.ts
import type { ExtensionManifest } from "@extensions/_types";
import { createLazyRoute } from "@/router/lazyRoute";

const SamplePageRoute = createLazyRoute(() => import("./pages/SamplePage"));

export const sampleManifest: ExtensionManifest = {
  name: "sample",
  isEnabled: (derived) => !!derived?.attendanceStatisticsEnabled,
  routes: [{ path: "sample", lazy: SamplePageRoute }],
  menuItems: [
    {
      label: "サンプル",
      href: "/sample",
      roles: ["STAFF", "ADMIN", "STAFF_ADMIN"],
    },
  ],
};
```

```ts
// src/extensions/index.ts
import { sampleManifest } from "./sample/manifest";

export const extensionManifests = [sampleManifest] as const;
```

---

## 移設ガイド

既存機能を `src/extensions/<name>/` に移設する場合の手順:

1. **コアから機能特定**: pages / features / entities 配下の対象ディレクトリと、router/store/menu の登録箇所を洗い出す
2. **雛形生成**: `node scripts/create-extension.mjs <kebab-case-name>` で `src/extensions/<name>/manifest.ts` と `README.md` が作成され、`src/extensions/index.ts` にも自動登録される
3. **manifest 編集**: routes / adminRoutes / menuItems / rtkApis を移行
4. **ファイル移動**: `git mv` で対象 directory を `src/extensions/<name>/{pages,features,...}/` に移動し、import path を `@extensions/<name>/...` に書き換え
5. **コア側削除**:
   - `src/router.tsx` から重複する route 定義を削除
   - `src/router/adminChildRoutes.tsx` から admin route を削除（あれば）
   - `src/router/routePreloaders.ts` の path を `@extensions/...` に更新
   - `src/app/apis/index.ts` の `coreRtkApis` から重複する RTK Query slice を削除
   - `src/widgets/layout/header/NavigationMenu.tsx` から重複するメニュー定義を削除
6. **ESLint ignores 追加**: extension を import する core ファイルを `eslint.config.mjs` の `no-restricted-imports` rule の `ignores` 配列に追加
7. **テスト**: `npm run typecheck && npm run lint && npm run test:unit`
8. **手動**: AppConfig フラグ off で該当ルート / メニューが消えることを確認

---

## 移設済み拡張

| 拡張名                  | 移設元                                                                                                             | enabledKey                    | manifest                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| `attendance-statistics` | `src/pages/attendance/statistics/`, `src/features/attendance/statistics/`                                          | `attendanceStatisticsEnabled` | ✅                                                          |
| `workflow-notification` | `src/pages/notifications/WorkflowNotificationsPage.tsx`                                                            | `workflowNotificationEnabled` | ✅（page のみ。Header ボタン・inbox hook 等は core 残置）   |
| `daily-report`          | `src/pages/attendance/daily-report/`, `src/features/attendance/daily-report/`, `src/pages/admin/AdminDailyReport/` | （フラグなし、常時有効）      | ✅                                                          |
| `shift-collaborative`   | `src/pages/shift/collaborative/`, `src/features/shift/collaborative/`                                              | `shiftCollaborativeEnabled`   | ❌（route 登録は core 残置。ファイル配置のみ extension 化） |
| `office-qr`             | `src/pages/office/`, `src/features/attendance/office-{layout,qr,qr-register}/`, `src/processes/office-access/`     | `officeMode`                  | ✅                                                          |

---

## 検証

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run build           # chunk 分割を確認したい場合
```

## 既知の制限と将来検討

- **GraphQL schema**: `amplify/backend/api/garakufrontend/schema.graphql` は単一ファイル。拡張ごとにスキーマを分離する仕組みは未対応。
- **route override**: 現状 `RouteDescriptor` に override フラグはなく、core route を後勝ちで上書きする手段は未提供。必要になった時点で `override?: boolean` を追加する想定。
- **動的ロード（Module Federation）**: 検討対象外。必要になった時点で別プラン化する。
- **extension 間の依存禁止**: lint で機械的にチェックする仕組みは現状なし。共通コードは `@shared/*` または `@entities/*` に昇格させること（規約のみ）。
