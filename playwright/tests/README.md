# Playwright tests README

このディレクトリには E2E テスト実装（`*.spec.ts`）を配置します。  
オンボーディング時は、まず smoke-test の実行成功を目標にしてください。

## 初回セットアップ

1. 依存関係をインストール

```bash
npm ci
```

2. Playwright ブラウザをインストール

```bash
npx playwright install --with-deps
```

3. `.env.local` に必要な値を設定（値は管理者に確認）

```bash
VITE_BASE_PATH=http://localhost:5173
PLAYWRIGHT_LOGIN_EMAIL=
PLAYWRIGHT_LOGIN_PASSWORD=
PLAYWRIGHT_ADMIN_EMAIL=
PLAYWRIGHT_ADMIN_PASSWORD=
PLAYWRIGHT_OUT_USER_EMAIL=
PLAYWRIGHT_OUT_USER_PASSWORD=
PLAYWRIGHT_LAZY_USER_EMAIL=
PLAYWRIGHT_LAZY_USER_PASSWORD=
```

## 最短実行手順（smoke-test）

```bash
# 認証状態を作成
npm run test:e2e --project=setup

# スタッフ向け smoke-test
npm run test:e2e -- smoke-test --project=chromium-staff

# 必要なら管理者向け smoke-test
npm run test:e2e -- smoke-test --project=chromium-admin
```

## よくある失敗と確認ポイント

- `browserType.launch: Executable doesn't exist`
  - `npx playwright install --with-deps` を再実行
- `setup` でログイン失敗する
  - `.env.local` の `PLAYWRIGHT_*` の値を確認
- `net::ERR_CONNECTION_REFUSED` や接続失敗
  - `VITE_BASE_PATH` が実環境と一致しているか確認
  - `npm start` でローカルサーバーが起動できるか確認

## 補足

- 設定は `playwright.config.ts` を参照
- smoke-test の実装は `playwright/tests/smoke-test.spec.ts` を参照
