# 対象ページ整理 - router.tsx をベースにした更新

## 📋 概要

router.tsx と adminChildRoutes.tsx をベースに、ビジュアルリグレッションテストの対象ページを整理しました。

## 🔄 更新内容

### visual-regression.config.ts

#### スタッフユーザー向けページ（10ページ）

| パス                  | 名前             | カテゴリ     | 説明                                   |
| --------------------- | ---------------- | ------------ | -------------------------------------- |
| `/attendance/list`    | 勤怠一覧         | 勤怠管理     | 従業員の勤怠情報一覧                   |
| `/attendance/stats`   | 勤怠統計         | 勤怠管理     | 勤怠統計情報                           |
| `/attendance/report`  | 日報             | 勤怠管理     | 日報提出                               |
| `/register`           | 勤怠打刻         | 勤怠管理     | 打刻入力（時刻マスク・Date固定対応済） |
| `/workflow`           | ワークフロー一覧 | ワークフロー | 申請・承認ワークフロー                 |
| `/shift`              | シフト申請       | シフト管理   | シフト申請                             |
| `/office`             | オフィスホーム   | オフィス     | オフィス機能ホーム                     |
| `/office/qr`          | オフィスQR       | オフィス     | QRコード操作                           |
| `/office/qr/register` | オフィスQR登録   | オフィス     | QRコード登録                           |
| `/profile`            | プロフィール     | アカウント   | ユーザープロフィール編集               |

#### 管理者ユーザー向けページ（13ページ）

| パス                               | 名前                   | カテゴリ       | 説明                       |
| ---------------------------------- | ---------------------- | -------------- | -------------------------- |
| `/admin`                           | 管理画面ダッシュボード | ダッシュボード | メインダッシュボード       |
| `/admin/staff`                     | スタッフ管理           | ユーザー管理   | スタッフユーザー管理       |
| `/admin/attendances`               | 勤怠管理               | 勤怠管理       | 全スタッフの勤怠管理       |
| `/admin/shift`                     | シフト管理             | シフト管理     | シフト情報管理             |
| `/admin/shift-plan`                | シフトプラン管理       | シフト管理     | シフトプラン作成・管理     |
| `/admin/master/job_term`           | 職位管理               | マスタ管理     | 職位マスタ管理             |
| `/admin/master/holiday_calendar`   | 祝日カレンダー         | マスタ管理     | 祝日カレンダー設定         |
| `/admin/master/theme`              | テーマ管理             | マスタ管理     | アプリケーションテーマ設定 |
| `/admin/master/shift`              | シフト設定             | マスタ管理     | シフト関連設定             |
| `/admin/master/feature_management` | 機能管理               | マスタ管理     | 機能管理・設定             |
| `/admin/workflow`                  | ワークフロー管理       | ワークフロー   | ワークフロー定義・管理     |
| `/admin/logs`                      | 操作ログ               | ログ管理       | システム操作ログ           |
| `/admin/daily-report`              | 日報管理               | 報告管理       | 日報の管理・確認           |

### visual-regression.spec.ts

- `STAFF_PAGES` → `STAFF_TEST_PAGES`（設定ファイルから import）
- `ADMIN_PAGES` → `ADMIN_TEST_PAGES`（設定ファイルから import）

## ✅ テスト範囲

### スタッフユーザー向けテスト
- **フルページスクリーンショット**: 10ページ × 1 = 10テスト
- **ファーストビュースクリーンショット**: 10ページ × 1 = 10テスト
- **合計**: 20テスト
- ⚠️ 管理者ページは chromium-staff プロジェクトで自動スキップ

### 管理者ユーザー向けテスト
- **フルページスクリーンショット**: 13ページ × 1 = 13テスト
- **ファーストビュースクリーンショット**: 13ページ × 1 = 13テスト
- **合計**: 26テスト

### 全体
- **基本テスト（visual-regression.spec.ts）**: 46テスト（staff: 20, admin: 26）
- **高度なテスト（visual-regression-advanced.spec.ts）**: 10+テスト
- **レスポンシブテスト**: モバイル(390x844) & デスクトップ(1440x900)

### Git管理

⚠️ **機微情報保護のため、スナップショット画像はすべてGit管理対象外です**

- ❌ ベースライン画像（`*-snapshots/`）は .gitignore 済み（個人情報等を含む可能性）
- ❌ デバッグ用スクリーンショット（`screenshots/`）は .gitignore 済み
- ❌ テスト実行結果（`test-results/`）は .gitignore 済み

#### ローカル開発での実行

各開発者が初回にベースラインを作成：
```bash
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots
npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots
```

## 🚀 実行方法

### ベースラインスクリーンショット作成

```bash
# スタッフユーザー
npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots

# 管理者ユーザー
npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots
```

### テスト実行

```bash
# スタッフユーザー
npm run test:e2e -- visual-regression --project=chromium-staff

# 管理者ユーザー
npm run test:e2e -- visual-regression --project=chromium-admin

# 両方
npm run test:e2e visual-regression
```

### 特定ページのテストのみ実行

```bash
# "勤怠一覧" のみ
npm run test:e2e -- visual-regression -g "勤怠一覧" --project=chromium-staff

# "スタッフ管理" のみ
npm run test:e2e -- visual-regression -g "スタッフ管理" --project=chromium-admin
```

## 📝 補足

- すべてのページは実際のルート定義（router.tsx、adminChildRoutes.tsx）に基づいています
- ページ構造の変更時にはこれらの設定を相応に更新してください
- 各ページは本番環境で実際にアクセス可能な状態になっていることを前提としています
