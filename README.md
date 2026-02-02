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

### 2 環境変数

アプリ起動や一部機能で `VITE_` 系の環境変数を参照します。  
ローカル実行時は `.env.local` を作成してください。

最小構成の例

```bash
VITE_BASE_PATH=http://localhost:5173
VITE_TOKEN_SECRET=local-secret
VITE_STANDARD_REGISTER_DISABLE=false
```

補足

- E2E テストを実行する場合は `PLAYWRIGHT_` 系の環境変数も必要です（`.env.example` を参照）

### 3 開発サーバー起動

```bash
npm start
```

`npm start` は Vite の開発サーバーを起動します。  
`make start` でも同じコマンドが呼ばれます。

### 4 最初の成功体験

次の順に実行すると、ローカル開発の基本導線を一通り確認できます。

```bash
npm run lint
npm run typecheck
npm run test:unit
```

### 5 最初の作業チケットで見るファイル

初回は次の順で読むと、画面 ルーティング 機能分割の流れをつかみやすいです。

- `src/router.tsx` 画面遷移とルート定義の入口
- `src/pages/admin/AdminShiftSettings/AdminShiftSettings.tsx` 管理画面の実装例
- `src/features/README.md` 機能単位の責務 例 `features/admin/configManagement`
- `src/entities/README.md` ドメイン層の責務 例 `entities/attendance`
- `src/shared/README.md` 共通部品の責務 例 `shared/ui/form/RHFTextField.tsx`
- `src/widgets/README.md` ページ構成要素の責務 例 `widgets/layout/header`
- `src/processes/README.md` 複数ページをまたぐ業務フローの責務 例 `processes/office-access`

## よくある詰まりどころ

### `npm WARN EBADENGINE` が出る

Node.js 23 系以上で `npm ci` / `npm install` を実行すると `jest@30` 由来の `npm WARN EBADENGINE` が出る場合があります。  
推奨は Node.js 22 LTS への切り替えです。やむを得ず 23 系を使う場合は次のいずれかで抑止できます。

```bash
# 一時的にエンジンチェックを外す
npm_config_engine_strict=false npm ci

# もしくはグローバル設定
npm config set engine-strict false
```
