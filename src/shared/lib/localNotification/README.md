# LocalNotification 使用ガイド

このドキュメントは、Notification API を使用したローカル通知機能の実装方法を説明します。

## 概要

LocalNotification 機能は、ブラウザの Notification API を使用してアプリケーション内でローカル通知を表示する機能を提供します。

## インストール

すでにプロジェクトに統合されているため、特別なインストール手順は不要です。

## 基本的な使用方法

### 1. useLocalNotification フックを使用

```typescript
import { useLocalNotification } from '@hooks/useLocalNotification';

function MyComponent() {
  const { notify, requestPermission, permission, canNotify } = useLocalNotification();

  // 権限をリクエスト
  const handleRequestPermission = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  // 通知を表示
  const handleNotify = async () => {
    try {
      await notify('タイトル', {
        body: '本文',
        tag: 'unique-tag', // 重複排除用タグ
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
  };

  return (
    <div>
      {permission !== 'granted' && (
        <button onClick={handleRequestPermission}>権限を許可</button>
      )}
      {canNotify && <button onClick={handleNotify}>通知を表示</button>}
    </div>
  );
}
```

### 2. LocalNotificationManager を直接使用

```typescript
import { LocalNotificationManager } from '@shared/lib/localNotification';

const manager = LocalNotificationManager.getInstance();

// API サポート確認
if (manager.isSupported()) {
  // 権限確認
  if (manager.canShowNotifications()) {
    // 通知表示
    await manager.showNotification('タイトル', { body: '本文' });
  }
}
```

## 勤怠関連の通知

勤怠システム用の定義済みの通知タイプが用意されています。

```typescript
import { LocalNotificationManager, AttendanceNotificationType } from '@shared/lib/localNotification';

const manager = LocalNotificationManager.getInstance();

// 出勤打刻成功
await manager.showAttendanceNotification(
  AttendanceNotificationType.CLOCK_IN_SUCCESS,
  { time: '10:30' }
);

// 出勤打刻失敗
await manager.showAttendanceNotification(
  AttendanceNotificationType.CLOCK_IN_ERROR,
  { error: 'ネットワークエラー' }
);

// 日報提出完了
await manager.showAttendanceNotification(
  AttendanceNotificationType.DAILY_REPORT_SUBMITTED,
  { date: '2026-01-21' }
);
```

### 利用可能な通知タイプ

- `CLOCK_IN_SUCCESS` - 出勤打刻成功
- `CLOCK_OUT_SUCCESS` - 退勤打刻成功
- `BREAK_START_SUCCESS` - 休憩開始
- `BREAK_END_SUCCESS` - 休憩終了
- `CLOCK_IN_ERROR` - 出勤打刻失敗
- `CLOCK_OUT_ERROR` - 退勤打刻失敗
- `DAILY_REPORT_SUBMITTED` - 日報提出完了
- `DAILY_REPORT_REMINDER` - 日報提出リマインダー

## 通知モード

LocalNotification では、通知の目的に応じて2つのモードをサポートしています。

### モード1: auto-close（自動クローズ）

自分への操作確認通知に使用します。ユーザーが対応する必要はなく、5秒後に自動的にクローズします。

**用途**:
- 出勤打刻完了
- 退勤打刻完了
- 休憩開始/終了
- 日報提出完了

```typescript
await manager.showNotification('出勤打刻完了', {
  body: '10:30 に出勤打刻しました',
  mode: 'auto-close',  // デフォルト値
  priority: 'normal',
});
```

### モード2: await-interaction（相手待ち）

相手への通知で、相手の確認や操作を待つ必要がある場合に使用します。`requireInteraction: true` が自動設定され、ユーザーが通知をクリックするまでクローズしません。

**用途**:
- 出勤打刻エラー
- 退勤打刻エラー
- 日報提出リマインダー

```typescript
await manager.showNotification('打刻失敗', {
  body: 'ネットワークエラーが発生しました',
  mode: 'await-interaction',
  priority: 'high',
  onClick: (notification) => {
    // 詳細ページへ遷移など
    notification.close();
  },
});
```

## 優先度

通知の重要度を 3 段階で設定できます。

- `high` - エラーなど重要度の高い通知
- `normal` - 通常の通知（デフォルト）
- `low` - 情報通知など

## オプション詳細

### LocalNotificationOptions

```typescript
interface LocalNotificationOptions extends NotificationOptions {
  // 標準プロパティ
  title?: string;           // 通知タイトル
  body?: string;            // 通知本文
  icon?: string;            // アイコンURL
  badge?: string;           // バッジURL
  tag?: string;             // 重複排除タグ
  requireInteraction?: boolean; // ユーザー操作待機
  
  // LocalNotification 拡張プロパティ
  mode?: 'auto-close' | 'await-interaction'; // 通知モード（デフォルト: auto-close）
  priority?: 'high' | 'normal' | 'low';     // 優先度（デフォルト: normal）

  // コールバック
  onShow?: (notification: Notification) => void;    // 表示時
  onClick?: (notification: Notification, event: Event) => void; // クリック時
  onClose?: (notification: Notification) => void;   // 閉じる時
  onError?: (error: Error) => void;                 // エラー時
}
```

### モードの自動選択

`mode` を指定しない場合のデフォルト動作：
- `mode: 'auto-close'` とみなされ、5 秒後に自動クローズします
- `mode: 'await-interaction'` の場合、`requireInteraction: true` が自動設定されます



## コールバック例

```typescript
// 自動クローズ型（自分への確認通知）
await manager.showNotification('出勤打刻完了', {
  body: '10:30 に出勤打刻しました',
  mode: 'auto-close',
  onShow: () => {
    console.log('通知が表示されました');
  },
});

// 相手待ち型（エラー通知）
await manager.showNotification('打刻失敗', {
  body: 'ネットワークエラーが発生しました',
  mode: 'await-interaction',
  priority: 'high',
  onClick: (notification, event) => {
    console.log('通知がクリックされました');
    // 詳細ページへ遷移
    window.location.href = '/attendance/edit';
    notification.close();
  },
  onClose: () => {
    console.log('通知が閉じられました');
  },
  onError: (error) => {
    console.error('通知エラー:', error);
  },
});
```

## エラーハンドリング

```typescript
import {
  LocalNotificationError,
  NotificationPermissionError,
  NotificationNotSupportedError,
} from '@shared/lib/localNotification';

try {
  await manager.showNotification('タイトル', { body: '本文' });
} catch (error) {
  if (error instanceof NotificationNotSupportedError) {
    // ブラウザが Notification API をサポートしていない
    console.log('フォールバック: Snackbar 通知を使用');
  } else if (error instanceof NotificationPermissionError) {
    // 権限がない
    console.log('権限をリクエストしてください');
  } else if (error instanceof LocalNotificationError) {
    // その他のエラー
    console.error('通知エラー:', error.code);
  }
}
```

## ブラウザ互換性

| ブラウザ | 対応 | 最小バージョン |
| -------- | ---- | -------------- |
| Chrome   | ✓    | 32+            |
| Firefox  | ✓    | 26+            |
| Safari   | ✓    | 6.1+           |
| Edge     | ✓    | 79+            |

### モバイルブラウザ

- iOS Safari: PWA のみ対応
- Android Chrome: フル対応
- Android Firefox: フル対応

## トラブルシューティング

### 通知が表示されない

1. ブラウザの設定で通知を有効にしてください
2. サイトに対する通知権限を確認してください
3. devtools で `Notification.permission` を確認

```javascript
console.log(Notification.permission); // 'granted', 'denied', 'default'
```

### Service Worker がない場合

Service Worker がない場合でも、Notification API は動作しますが、いくつかの制限があります：

- バックグラウンド通知が機能しない
- 通知クリック時のアクション処理がない

## パフォーマンス

- 通知作成: < 100ms
- キューサイズ上限: 10 個（古い順に削除）
- 自動クローズ: 5 秒（requireInteraction = false の場合）

## テスト

### ユニットテスト

```bash
npm run test:unit
```

テストケース：
- LocalNotificationManager の単体テスト（20個）
- useLocalNotification フックのテスト（10個）

### E2E テスト

```bash
npm run test:e2e -- smoke-test --project=chromium-staff
npm run test:e2e -- smoke-test --project=chromium-admin
```

## ベストプラクティス

### 1. 権限の確認と管理

```typescript
// 初期化時に権限を確認
useEffect(() => {
  if (useLocalNotification().permission !== 'granted') {
    // ユーザーに権限をリクエストするプロンプトを表示
  }
}, []);
```

### 2. エラーハンドリング

常にエラーハンドリング機能を含める：

```typescript
try {
  await notify('タイトル');
} catch (error) {
  // フォールバック通知（Snackbar など）を表示
  showSnackbar('通知に失敗しました');
}
```

### 3. ユーザーの設定尊重

ユーザーが通知を無効にした場合は、再度権限をリクエストしない。設定画面で有効にするオプションを提供。

### 4. 機密情報の非表示

通知に機密情報を含めない：

```typescript
// ❌ 悪い例
await notify('給与確認', { body: '月給: 300,000円' });

// ✓ 良い例
await notify('給与確認', { body: '給与が確認できます' });
```

### 5. タグの活用

重複する通知を避けるため、タグを使用：

```typescript
// 同じタグの通知は置き換わる
await notify('日報リマインダー', {
  tag: 'daily-report-reminder',
  body: '本日の日報を提出してください',
});
```

## 関連リソース

- [MDN - Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [W3C Notifications Specification](https://www.w3.org/TR/notifications/)
- [Can I Use - Notifications](https://caniuse.com/notifications)
