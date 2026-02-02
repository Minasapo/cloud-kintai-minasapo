# クラウド勤怠

社内向けシステムとして誕生した勤怠管理システムです。

## 開発オンボーディング

### 1 初回セットアップ

必要なツール

- Node.js 22 LTS 以上
- npm 10 以上
- `nvm` 利用時はリポジトリ直下で `nvm use` を実行

初回実行コマンド

```bash
nvm use
npm ci
```

`npm ci` 実行時に `prepare` スクリプトで Git hooks を自動有効化します。  
手動で有効化する場合は次を実行してください。

```bash
npm run hooks:install
```

### 2 Amplify 設定の取得

`src/aws-exports.js` は Git 管理対象外のため、初回セットアップ時に `amplify pull` で生成してください。

```bash
# appId / envName は管理者に確認した値を指定
npx @aws-amplify/cli pull --appId <your-app-id> --envName <your-env-name>
```

補足

- 実行時に AWS 認証情報が必要です（`aws configure` 済みのプロファイルなど）
- `appId` / `envName` が不明な場合は、必ずプロジェクト管理者に確認してください

### 3 環境変数

アプリ起動や一部機能で `VITE_` 系の環境変数を参照します。  
ローカル実行時は `.env.example` をもとに `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

開発サーバー起動で最低限必要なキー

```bash
VITE_BASE_PATH=http://localhost:5173
VITE_TOKEN_SECRET=local-secret
```

補足

- `VITE_STANDARD_REGISTER_DISABLE` などの追加キーは `.env.example` を参照してください
- E2E テストを実行する場合は `PLAYWRIGHT_` 系の環境変数も設定してください

### 4 開発サーバー起動

```bash
npm start
```

`npm start` は Vite の開発サーバーを起動します。  

### 5 E2E 最短実行（smoke-test）

Playwright の初回実行時はブラウザをインストールしてください。

```bash
npx playwright install --with-deps
```

`smoke-test` 実行前に、`.env.local` へ次の値を設定します（値は管理者に確認）。

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

最短確認コマンド

```bash
npm run test:e2e --project=setup
npm run test:e2e -- smoke-test --project=chromium-staff
```

### 6 最初の成功体験

次の順に実行すると、ローカル開発の基本導線を一通り確認できます。

```bash
npm run lint
npm run typecheck
npm run test:unit
```

### 7 最初の作業チケットで見るファイル

初回は次の順で読むと、画面 ルーティング 機能分割の流れをつかみやすいです。

- `src/router.tsx` 画面遷移とルート定義の入口
- `src/pages/admin/AdminShiftSettings/AdminShiftSettings.tsx` 管理画面の実装例
- `src/features/README.md` 機能単位の責務 例 `features/admin/configManagement`
- `src/entities/README.md` ドメイン層の責務 例 `entities/attendance`
- `src/shared/README.md` 共通部品の責務 例 `shared/ui/form/RHFTextField.tsx`
- `src/widgets/README.md` ページ構成要素の責務 例 `widgets/layout/header`
- `src/processes/README.md` 複数ページをまたぐ業務フローの責務 例 `processes/office-access`

### 8 初回PRチェックリスト

PR 作成前に次を確認してください。

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- 変更した画面の表示崩れがないこと（PC とモバイルの主要表示）
- 既存機能への影響がないこと（最低1つの関連画面で動作確認）

## よくある詰まりどころ

### `Cannot find module './aws-exports'` が出る

`src/aws-exports.js` が未生成の状態です。  
`amplify pull` を実行して設定を取得してください。

```bash
npx @aws-amplify/cli pull --appId <your-app-id> --envName <your-env-name>
```

### `npm WARN EBADENGINE` が出る

Node.js 23 系以上で `npm ci` / `npm install` を実行すると `jest@30` 由来の `npm WARN EBADENGINE` が出る場合があります。  
推奨は Node.js 22 LTS への切り替えです。やむを得ず 23 系を使う場合は次のいずれかで抑止できます。

```bash
# 一時的にエンジンチェックを外す
npm_config_engine_strict=false npm ci

# もしくはグローバル設定
npm config set engine-strict false
```

### `browserType.launch: Executable doesn't exist` が出る

Playwright ブラウザが未インストールの状態です。  
次を実行してブラウザをインストールしてください。

```bash
npx playwright install --with-deps
```
