# Playwright ビジュアルリグレッションテスト ガイド

## 概要

このプロジェクトでは Playwright の組み込みビジュアル比較機能を使用して、画面全体のスクリーンショット検証を実現しています。

## セットアップ

### 1. 初回実行（ベースラインキャプチャ）

ビジュアルリグレッションテストを初めて実行する場合は、`--update-snapshots` フラグを使用してベースラインスクリーンショットを作成します。

```bash
# スタッフユーザー向けのベースラインを作成
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots

# 管理者ユーザー向けのベースラインを作成
npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots
```

ベースラインファイルは以下の場所に保存されます：
- `playwright/tests/__snapshots__/visual-regression.spec.ts-snapshots/`

### 2. テスト実行

ベースラインが作成された後は、通常のテストとして実行できます。

```bash
# スタッフユーザー用
npm run test:e2e -- visual-regression --project=chromium-staff

# 管理者ユーザー用
npm run test:e2e -- visual-regression --project=chromium-admin

# 両方実行
npm run test:e2e visual-regression
```

## スクリーンショット比較オプション

### fullPage vs. viewport

- **fullPage: true** - ページ全体（スクロール可能な範囲を含む）のスクリーンショット
- **fullPage: false** - 現在のビューポート（見える範囲）のみ

### maxDiffPixels

許容できる差異ピクセル数。デフォルトは 0（完全一致）。
- 小さい値ほど厳格な検証
- 大きい値ほど許容範囲が大きい

### threshold

- 0 から 1 の値（デフォルト: 0.2）
- ピクセルの色差異の許容レベル
- 値が小さいほど厳格

## ファイル構成

```
playwright/
├── tests/
│   ├── visual-regression.spec.ts    # ビジュアル検証テスト定義
│   ├── screenshots/                 # 手動保存したスクリーンショット
│   └── __snapshots__/               # ベースラインスクリーンショット（自動生成）
│       └── visual-regression.spec.ts-snapshots/
├── .auth/                           # 認証情報
└── README.md
```

## テスト対象ページ

### スタッフユーザー向け

- `/attendance/list` - 勤怠一覧
- `/attendance/stats` - 勤怠統計
- `/attendance/report` - 日報
- `/register` - 勤怠打刻（時刻マスク・Date固定済み）
- `/workflow` - ワークフロー一覧
- `/shift` - シフト申請
- `/office` - オフィスホーム
- `/office/qr` - オフィスQR
- `/office/qr/register` - オフィスQR登録
- `/profile` - プロフィール

### 管理者ユーザー向け

- `/admin` - 管理画面ダッシュボード
- `/admin/staff` - スタッフ管理
- `/admin/attendances` - 勤怠管理
- `/admin/shift` - シフト管理
- `/admin/master/holiday_calendar` - 祝日カレンダー
- `/admin/workflow` - ワークフロー管理
- `/admin/logs` - 操作ログ
- `/admin/daily-report` - 日報管理

## トラブルシューティング

### スクリーンショットが微妙に異なる場合

1. **ネットワーク遅延による表示ズレ** → `waitForPageReady()` で十分に待機
2. **フォントレンダリング差異** → プラットフォーム間での微小差異は `threshold` を調整
3. **ホバー/フォーカス状態** → `preparePageForScreenshot()` で自動クリア

### ベースラインの更新

意図的にUIを変更した場合、ベースラインを更新します：

```bash
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots
npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots
```

### 動的コンテンツの除外（マスク）

時刻や動的データは `mask` オプションで比較から除外できます：

```typescript
const clock = page.locator("[data-testid='clock']").first();
await expect(page).toHaveScreenshot("page.png", {
  mask: [clock], // この領域は比較対象外
});
```

`/register` ページでは時刻表示を自動的にマスクし、さらに `Date` オブジェクトを固定化しています。

### プロジェクト別のテスト実行

- **chromium-staff**: スタッフ向けページのみテスト（管理者ページは自動スキップ）
- **chromium-admin**: 管理者向けページもテスト

### 個別ページのテスト

特定のページのみテストする場合：

```bash
npm run test:e2e -- visual-regression -g "勤怠一覧" --project=chromium-staff
```

## ベストプラクティス

1. **ページロード待機** - `waitForPageReady()` を使用して完全なロードを確認
2. **一貫性** - テスト環境の時刻やデータは固定化（seed や fixture を使用）
3. **定期的な更新** - UIデザイン変更時は計画的にベースラインを更新
4. **CI/CD統合** - PR時にビジュアルテストを自動実行し、差異をレビュー
5. **画像管理** - ベースラインファイルをバージョン管理に含める

## デバッグモード

スクリーンショットをファイルとして保存して検査したい場合：

```typescript
// playwright/tests/visual-regression.spec.ts の最後のテストを参照
test("スクリーンショット + ファイル保存（デバッグ）", async ({ page }) => {
  await page.goto("/admin");
  await page.screenshot({
    path: "playwright/tests/screenshots/debug-screenshot.png",
    fullPage: true,
  });
});
```

保存されたファイルは以下で確認可能：
```
playwright/tests/screenshots/
```

## レスポンシブデザイン検証

異なるビューポートサイズでのテストも含まれています：

```typescript
// iPhone 12 Pro のモバイルビュー
await page.setViewportSize({ width: 390, height: 844 });
// デスクトップビュー
await page.setViewportSize({ width: 1440, height: 900 });
```

現在のビューポートプリセット：
- **モバイル**: `390x844` (iPhone 12 Pro) - User Agent設定済み
- **デスクトップ**: `1440x900`

## パフォーマンス最適化

- 並列実行：デフォルトで複数テストが同時実行
- スキップオプション：不要なテストをスキップ可能

```bash
npm run test:e2e -- visual-regression --project=chromium-staff -g "ファーストビュー"
```

## 参考資料

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright Screenshot Documentation](https://playwright.dev/docs/api/class-page#page-screenshot)
