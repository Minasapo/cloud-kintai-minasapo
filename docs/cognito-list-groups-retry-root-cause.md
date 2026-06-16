# fetchCognitoUsers listGroupsForUser リトライの根本原因

## 対象
- src/entities/staff/model/cognito/fetchCognitoUsers.ts

## 事象
- スタッフ同期時に listGroupsForUser が断続的に失敗し、E05008 で同期全体が失敗することがある。

## 根本原因
- fetchCognitoUsers は listUsers の結果件数分だけ listGroupsForUser を呼ぶ N+1 構造になっている。
- ユーザー件数が多いタイミングでは、短時間に Cognito Admin API への呼び出しが集中する。
- この集中で Cognito 側のスロットリングまたは一時的な 5xx が発生し、偶発エラーとして観測される。

## 対応方針
- 同時実行数を 4 件に制限し、呼び出しスパイクを抑制する。
- 再試行は「一時障害のみ」を対象にする。
  - HTTP 429
  - HTTP 5xx
  - TooManyRequestsException / ThrottlingException / ServiceUnavailableException などの一時障害系エラー名
  - ネットワーク断の代表メッセージ
- 入力不備や恒久障害とみなせる 4xx は再試行しない。

## リトライの必要性と正当化
- 外形上は同一入力でも、バックエンド負荷やネットワーク揺らぎで失敗/成功が変動するため、単発失敗で全体を落とすと運用上の失敗率が高くなる。
- 一方で全エラーを無条件再試行すると、無駄な再実行で遅延と負荷を増やす。
- そのため「一時障害のみを限定再試行」する現在の戦略が最も副作用が小さい。

## 今後の改善余地
- バックエンド側でユーザーとグループ情報を一括取得できる API を提供し、N+1 を解消する。
- 監視基盤に listGroupsForUser の 429/5xx 発生率を出し、しきい値超過でアラートする。
