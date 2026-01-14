# Playwright ビジュアルリグレッションテスト - クイックスタート

## 📋 概要

このプロジェクトでは、Playwrightの画面スクリーンショット機能を使用した**ビジュアルリグレッションテスト**を実装しました。UIの不意な変更やレイアウト崩れを自動検出できます。

## 🚀 クイックセットアップ

### 1️⃣ ベースラインスクリーンショット作成（初回のみ）

```bash
# スタッフユーザー向けのベースラインを作成
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots

# 管理者ユーザー向けのベースラインを作成
npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots

# 高度なテストのベースラインも作成
npm run test:e2e -- visual-regression-advanced --project=chromium-staff --update-snapshots
npm run test:e2e -- visual-regression-advanced --project=chromium-admin --update-snapshots
```

### 2️⃣ テスト実行（ベースラインと比較）

```bash
# スタッフユーザー用テスト
npm run test:e2e -- visual-regression --project=chromium-staff

# 管理者ユーザー用テスト
npm run test:e2e -- visual-regression --project=chromium-admin

# 両方実行
npm run test:e2e visual-regression

# 高度なテストも実行
npm run test:e2e visual-regression-advanced
```

## 📁 ファイル構成

```
playwright/
├── tests/
│   ├── visual-regression.spec.ts              # 基本的なビジュアルテスト
│   ├── visual-regression-advanced.spec.ts     # 高度なコンポーネント検証
│   ├── visual-regression.utils.ts             # ユーティリティ関数
│   ├── visual-regression.config.ts            # テスト設定と定義
│   ├── screenshots/                           # スクリーンショット保存先
│   └── __snapshots__/                         # ベースラインスナップショット
├── VISUAL_REGRESSION_GUIDE.md                 # 詳細ガイド
└── README.md
```

## 🧪 テスト種類

### 基本テスト（visual-regression.spec.ts）

✅ **フルページスクリーンショット**
- ページ全体（スクロール可能な範囲を含む）のスクリーンショット
- レイアウトやデザイン変更を検出

✅ **ファーストビュースクリーンショット**
- 見える範囲（ビューポート）のみのスクリーンショット
- ページの上部が正しく表示されているか確認

✅ **レスポンシブデザイン検証**
- タブレットサイズでの表示確認

### 高度なテスト（visual-regression-advanced.spec.ts）

✅ **コンポーネント単位の検証**
- ヘッダー、サイドバー、テーブル等の個別検証
- フォーム入力時の状態変化

✅ **複数ビューポートサイズでの検証**
- モバイル、タブレット、デスクトップ等の複数サイズで自動テスト

✅ **インタラクティブ要素の状態検証**
- ホバー、フォーカス状態
- チェックボックス、ラジオボタンの状態

✅ **エラー・成功状態の検証**
- エラーメッセージ表示確認
- 成功通知の表示確認

✅ **スクロール位置での検証**
- ページのスクロール状態による表示確認

✅ **スクリーンショット & PDF 保存**
- デバッグ用のスクリーンショット保存
- レポート用の PDF 出力

## 💡 使用例

### 基本的な使用方法

```typescript
import { expect, test } from "@playwright/test";

test("ページ全体のスクリーンショット", async ({ page }) => {
  // ページにナビゲート
  await page.goto("/admin");
  
  // ページロード完了を待機
  await page.waitForLoadState("networkidle");
  
  // フルページスクリーンショットで検証
  await expect(page).toHaveScreenshot("admin-dashboard.png", {
    fullPage: true,
    maxDiffPixels: 100, // 許容差異：100ピクセル
  });
});
```

### ユーティリティ関数を使用した方法

```typescript
import {
  captureFullPageScreenshot,
  waitForPageReady,
  VIEWPORT_PRESETS,
  captureAtViewport,
} from "./visual-regression.utils";

// 全体スクリーンショット
await captureFullPageScreenshot(
  page,
  "/admin",
  "admin-dashboard.png"
);

// レスポンシブテスト
await captureAtViewport(
  page,
  "/attendance/list",
  VIEWPORT_PRESETS.iPad,
  "attendance-tablet.png"
);
```

### 設定値を使用した方法

```typescript
import {
  STAFF_TEST_PAGES,
  ADMIN_TEST_PAGES,
  COMPARISON_STRATEGIES,
} from "./visual-regression.config";

// テスト対象ページを取得
for (const page of STAFF_TEST_PAGES) {
  await navigateTo(page.path);
  
  // 厳格な比較戦略を適用
  await expect(page).toHaveScreenshot("page.png", {
    fullPage: true,
    ...COMPARISON_STRATEGIES.strict,
  });
}
```

## 🎯 よくある使用シナリオ

### シナリオ 1: UI デザイン変更後

```bash
# デザイン変更内容を確認してコミット
# その後、ベースラインを更新
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots

# 次のテスト実行時は新しいデザインと比較される
npm run test:e2e -- visual-regression --project=chromium-staff
```

### シナリオ 2: 特定のページのみテスト

```bash
# "勤怠一覧" ページのテストのみ実行
npm run test:e2e -- visual-regression -g "勤怠一覧" --project=chromium-staff

# "ダッシュボード" のテストのみ
npm run test:e2e -- visual-regression -g "ダッシュボード" --project=chromium-admin
```

### シナリオ 3: 新機能のビジュアルテストを追加

```typescript
// visual-regression.config.ts に追加
export const STAFF_TEST_PAGES = [
  // ... 既存ページ ...
  {
    path: "/new-feature",
    name: "新機能ページ",
    category: "新機能",
    description: "新しく追加した機能のテストページ",
  },
];
```

### シナリオ 4: PR 時の自動テスト

GitHubActions（CI/CD）で自動実行：
```bash
npm run test:e2e visual-regression --project=chromium-staff
npm run test:e2e visual-regression --project=chromium-admin
```

## 🔧 トラブルシューティング

### ❌ スクリーンショットが常に異なる

**原因**：ページ内に動的コンテンツがある（タイムスタンプ、ランダムデータ等）

**解決策**：
```typescript
// 動的要素をマスク
await expect(page).toHaveScreenshot("page.png", {
  fullPage: true,
  mask: [page.locator("time"), page.locator("[data-timestamp]")],
});
```

### ❌ テストがタイムアウトする

**原因**：ページロードが遅い

**解決策**：
```typescript
await page.goto(path, { waitUntil: "domcontentloaded" });
await waitForPageReady(page, 10000); // 最大10秒待機
```

### ❌ ホバー/フォーカス状態のスクリーンショットが不安定

**原因**：ブラウザのレンダリング差異

**解決策**：
```typescript
// preparePageForScreenshot で自動的に解決
await preparePageForScreenshot(page);
```

## 📊 ベストプラクティス

✅ **DO**
- 本番環境と同じビューポートサイズでテスト
- ページロード完了まで確実に待機
- 定期的にベースラインを更新
- PR 時に差異をレビュー

❌ **DON'T**
- ベースラインを手動編集
- 外部 API からのデータに依存
- タイムアウトを短くしすぎる
- 不要な要素まで含める

## 📚 参考資料

- [Playwright 公式：Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright 公式：Screenshot API](https://playwright.dev/docs/api/class-page#page-screenshot)
- [ビジュアルリグレッションテスト詳細ガイド](./VISUAL_REGRESSION_GUIDE.md)

## 🤔 よくある質問

**Q: スクリーンショットの許容差異をどう設定する？**

A: ページの重要度に応じて：
- デザイン系ページ：`maxDiffPixels: 30`（厳格）
- データ表示ページ：`maxDiffPixels: 75`（標準）
- リアルタイム更新：`maxDiffPixels: 150`（緩い）

**Q: CI/CD で失敗したときはどうする？**

A: ローカルで同じコマンドを実行して確認：
```bash
npm run test:e2e visual-regression --project=chromium-staff
```

**Q: ベースラインファイルをコミットする？**

A: はい。`__snapshots__` ディレクトリをバージョン管理に含めてください。

## 📞 サポート

問題が発生した場合：
1. このドキュメント内で解決方法を探す
2. `VISUAL_REGRESSION_GUIDE.md` の詳細ガイドを参照
3. Playwright の公式ドキュメントを確認
