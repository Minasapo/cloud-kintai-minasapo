---
applyTo: "src/entities/**/api/**,src/features/**/hooks/**,src/shared/api/graphql/*.ts"
---

# GraphQL キャッシング戦略ガイド

Real-time updates と cache coherence のバランスを取り、効率的で予測可能なデータ管理を実現するためのガイドラインです。

## 概要

本プロジェクトは AWS Amplify AppSync（GraphQL API）を採用し、Redux Toolkit Query（以下 RTK Query）によるクライアント側のキャッシュ管理を行っています。

- **Real-time updates**: GraphQL Subscription により、複数ユーザーの変更をリアルタイムで受け取ります。
- **Cache coherence**: RTK Query の tag-based invalidation により、キャッシュの一貫性を保ちます。

**目標**: キャッシュヒット率を高めつつ、クライアント間のデータ不一致を最小化する。

---

## キャッシング戦略の分類

### 1. **Query-Based Caching**（デフォルト）

ほとんどの読み取り操作に適用します。RTK Query のデフォルト動作です。

**特徴**:
- キャッシュは query 引数をキーに保存される
- 同じ引数で再度 query を呼び出すと、キャッシュから即座に返される
- キャッシュは 60 秒（デフォルト）保持される

**使用例**:
```typescript
// entities/shift/api/shiftApi.ts
export const shiftApi = createApi({
  reducerPath: 'shiftApi',
  baseQuery: graphqlBaseQuery,
  tagTypes: ['ShiftRequest', 'ShiftPlan'],
  endpoints: (builder) => ({
    getShiftRequestsQuery: builder.query<ShiftRequestLite[], GetShiftRequestsParams>({
      query: (variables) => ({
        document: getShiftRequests,
        variables,
      }),
      providesTags: (result) => {
        if (!result) return [{ type: 'ShiftRequest', id: 'LIST' }];
        return [
          ...result.map(({ id }) => ({ type: 'ShiftRequest' as const, id })),
          { type: 'ShiftRequest', id: 'LIST' },
        ];
      },
    }),
  }),
});
```

**キャッシュ有効期限**:
- 短期: 10 秒（頻繁に変更されるデータ）
- 中期: 60 秒（標準）
- 長期: 300 秒以上（ほぼ変わらないデータ）

### 2. **Real-time Updates（Subscription ベース）**

複数ユーザーの同時編集や即座な反映が必要なケースに適用します。

**適用シーン**:
- シフト共同編集（複数ユーザーが同時に同じシフトを編集）
- 勤怠の承認フロー（管理者が勤怠申請を承認する際、申請者に即座に反映）
- リアルタイムのステータス更新

**実装パターン**:

```typescript
// features/shift/collaborative/hooks/useShiftDataSubscriptions.ts
export const useShiftDataSubscriptions = ({
  staffIds,
  targetMonth,
  currentUserId,
  onRemoteUpdate,
}: UseShiftDataSubscriptionsProps) => {
  useEffect(() => {
    const subscriptions = staffIds.map((staffId) =>
      graphqlClient.graphql({
        query: onUpdateShiftRequest,
        variables: { staffId, targetMonth },
      }).subscribe({
        next: (data) => {
          const event = data.data?.onUpdateShiftRequest;
          if (!event) return;

          // ⚠️ 重要: 自発的なイベントはスキップ（二重適用を防ぐ）
          if (event.updatedBy === currentUserId) return;

          onRemoteUpdate?.(staffId, event);
        },
        error: (error) => console.error('Subscription error:', error),
      })
    );

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [staffIds, targetMonth, currentUserId, onRemoteUpdate]);
};
```

**キャッシュ同期戦略**:

| イベント種別 | キャッシュ処理 | 説明 |
|---|---|---|
| 自身の mutation 完了 | query tag を invalidate | optimistic update を確定 |
| 他ユーザーの subscription 受信 | 対象 query tag を invalidate | リモート変更を反映 |
| Subscription エラー | 全 query を refetch | 接続復旧時にデータを同期 |

---

## Cache Coherence（キャッシュ一貫性）の保証

### 2.1 Tag-Based Invalidation

RTK Query の tag-based invalidation により、関連するキャッシュを一括無効化します。

**使用例**:

```typescript
// Entity: shift request
const shiftApi = createApi({
  // ...
  endpoints: (builder) => ({
    updateShiftRequest: builder.mutation<
      UpdateShiftRequestMutation,
      UpdateShiftRequestInput
    >({
      query: (input) => ({
        document: updateShiftRequest,
        variables: { input },
      }),
      // mutation 成功後、関連する query キャッシュを無効化
      invalidatesTags: (result, error, input) => [
        { type: 'ShiftRequest', id: input.id },
        { type: 'ShiftRequest', id: 'LIST' },
      ],
    }),
  }),
});
```

**タグ設計原則**:

- **エンティティタイプ** (e.g., `'ShiftRequest'`, `'Attendance'`): エンティティ全体を表す
- **LIST タグ** (e.g., `{ type: 'ShiftRequest', id: 'LIST' }`): 一覧クエリ全体を表す
- **個別 ID タグ** (e.g., `{ type: 'ShiftRequest', id: 'req-123' }`): 特定レコードのクエリを表す

```typescript
// Example: shift API tag structure
tagTypes: ['ShiftRequest', 'ShiftPlan', 'ShiftLock'],

// Query の providesTags
providesTags: (result) => [
  { type: 'ShiftRequest', id: 'LIST' },
  ...result?.map(({ id }) => ({ type: 'ShiftRequest', id })),
];

// Mutation の invalidatesTags
invalidatesTags: (result) => [
  { type: 'ShiftRequest', id: 'LIST' },
  { type: 'ShiftRequest', id: result?.id },
];
```

### 2.2 Subscription Event Filtering（重要）

**問題**: ユーザー A が mutation を実行すると、その mutation は Subscription イベントとしても発行され、キャッシュが二重に更新される可能性があります。

**解決策**: Subscription コールバック内で、自身が発した change をフィルタリングします。

```typescript
// ⚠️ CRITICAL: 自発的なイベントをスキップ
if (event.updatedBy === currentUserId) {
  // 自身が mutation を実行した場合、既にキャッシュが更新されているため、
  // subscription イベントは無視する
  return;
}

// 他ユーザーの変更のみ処理
onRemoteUpdate?.(staffId, event);
```

**実装チェックリスト**:
- [ ] Subscription のコールバックで `updatedBy` を確認している
- [ ] 自身のイベントは処理していない
- [ ] タイムスタンプ検証で古いイベントを棄却している（optional）

### 2.3 Network-First vs Cache-First 戦略

| 戦略 | fetchPolicy | 用途 | メリット | デメリット |
|---|---|---|---|---|
| **Network-First** | `cache-and-network` | リアルタイムデータが必要 | 常に最新データ | ネットワーク負荷が高い |
| **Cache-First** | `cache-only` (要注意) | オフライン対応 | ネットワーク負荷が低い | 古いデータで詐取の可能性 |
| **Stale-While-Revalidate** | デフォルト | 標準的な read | 高速 UI + 最新化 | Subscription との同期必須 |

**推奨設定**:

```typescript
// リアルタイムが必要: cache-and-network
const result = useGetShiftRequestsQuery(variables, {
  pollingInterval: 0, // subscription で sync するため、polling 不要
  skipPollingIfUnfocused: true,
});

// オフラインが必要: cache-only（ただしdata freshness を検証）
const cachedResult = await client.cache.readQuery({
  query: GET_SHIFT_REQUESTS,
  variables,
});
if (cachedResult && isDataFresh(cachedResult.timestamp)) {
  use(cachedResult);
}
```

---

## 実装ガイドライン

### 3.1 新しい API クライアントを追加する場合

**Step 1**: `entities/<domain>/api/<domain>Api.ts` に API 定義を作成

```typescript
import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlBaseQuery } from '@shared/api/graphql/graphqlBaseQuery';

export const exampleApi = createApi({
  reducerPath: 'exampleApi',
  baseQuery: graphqlBaseQuery,
  tagTypes: ['Example'], // 管理するエンティティタイプ
  endpoints: (builder) => ({
    // Query
    getExamples: builder.query<Example[], GetExamplesInput>({
      query: (variables) => ({
        document: listExamples,
        variables,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: 'Example', id: 'LIST' },
              ...result.map(({ id }) => ({ type: 'Example', id })),
            ]
          : [{ type: 'Example', id: 'LIST' }],
    }),

    // Mutation
    createExample: builder.mutation<CreateExampleMutation, CreateExampleInput>({
      query: (input) => ({
        document: createExampleDocument,
        variables: { input },
      }),
      invalidatesTags: [{ type: 'Example', id: 'LIST' }],
    }),
  }),
});

export const { useGetExamplesQuery, useCreateExampleMutation } = exampleApi;
```

**Step 2**: Store に登録（`src/app/store.ts`）

```typescript
export const store = configureStore({
  reducer: {
    // ...
    exampleApi: exampleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(exampleApi.middleware),
});
```

**Step 3**: Real-time Subscription が必要な場合、hooks を作成

```typescript
// features/<domain>/hooks/use<Domain>Subscriptions.ts
export const useExampleSubscriptions = ({
  currentUserId,
  onRemoteUpdate,
}: UseExampleSubscriptionsProps) => {
  useEffect(() => {
    const subscription = graphqlClient.graphql({
      query: onExampleUpdated,
    }).subscribe({
      next: (data) => {
        const event = data.data?.onExampleUpdated;
        if (!event || event.updatedBy === currentUserId) return;
        onRemoteUpdate?.(event);
      },
    });

    return () => subscription.unsubscribe();
  }, [currentUserId, onRemoteUpdate]);
};
```

**Step 4**: Subscription の invalidate logic を追加

```typescript
// features/<domain>/hooks/use<Domain>Data.ts
const handleRemoteUpdate = useCallback((event: ExampleData) => {
  // キャッシュを無効化して refetch を促す
  dispatch(exampleApi.util.invalidateTags([
    { type: 'Example', id: event.id },
    { type: 'Example', id: 'LIST' },
  ]));
}, [dispatch]);
```

---

### 3.2 キャッシュライフサイクル管理

**キャッシュ設定場所**: `src/app/store.ts`

```typescript
const store = configureStore({
  reducer: { /* ... */ },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActionTypes: [
          // subscription 関連の action で Date や Date-like objects を許可
          'exampleApi/executeQuery/pending',
          'exampleApi/executeMutation/pending',
        ],
      },
    }),
});
```

**キャッシュ有効期限のカスタマイズ**:

```typescript
// デフォルトは 60 秒。必要に応じてオーバーライド
const exampleApi = createApi({
  // ...
  keepUnusedDataFor: 30, // 30 秒後に削除（既定値: 60秒）
});
```

---

### 3.3 デバッグとモニタリング

**RTK Query DevTools**:

```typescript
// Chrome DevTools で "Redux" タブを開き、"Redux DevTools Extension" を確認
// Action log で各 query/mutation の状態遷移を追跡可能
```

**ログ出力**:

```typescript
// entities/<domain>/api/<domain>Api.ts
const logger = createLogger('<DomainApi>');

endpoints: (builder) => ({
  getExample: builder.query({
    query: (variables) => {
      logger.info('Fetching examples', { variables });
      return { /* ... */ };
    },
    onCacheEntryAdded: async (
      arg,
      { cacheDataLoaded, cacheEntryRemoved, updateCacheIfOwnArg }
    ) => {
      // キャッシュが追加されたときのログ
      await cacheDataLoaded;
      logger.info('Cache entry added for examples');

      await cacheEntryRemoved;
      logger.info('Cache entry removed for examples');
    },
  }),
});
```

---

## トラブルシューティング

### Q1: キャッシュが更新されない

**原因**:
- Tag の定義が不正確（typo など）
- Subscription イベントの受信に遅延がある

**対策**:
```typescript
// 1. Tag の確認
console.log(exampleApi.util.selectCacheByKey('getExample'));

// 2. 強制 refetch
dispatch(exampleApi.util.invalidateTags(['Example']));

// 3. Network タブで subscription イベントを確認
```

### Q2: Subscription イベントが二重に処理される

**原因**:
- `updatedBy` のフィルタリングが機能していない
- Subscription と Mutation の invalidate が重複している

**対策**:
```typescript
// Subscription 受信時に updatedBy を必ず確認
if (event.updatedBy === currentUserId) {
  console.log('Skipping own event');
  return;
}

// invalidate は片方だけ（Mutation の invalidatesTags で十分）
// Subscription では再度 invalidate せず、UI の変更リスニングに留める
```

### Q3: 古いデータがキャッシュに残る

**原因**:
- Subscription の接続が失われた
- キャッシュ有効期限が長すぎる

**対策**:
```typescript
// keepUnusedDataFor を短縮
const exampleApi = createApi({
  keepUnusedDataFor: 10, // 10秒に短縮
});

// Subscription 接続復旧時に全キャッシュを invalidate
const handleSubscriptionReconnect = () => {
  dispatch(exampleApi.util.invalidateTags(['Example']));
};
```

---

## ベストプラクティス

1. **Subscription は Mutation と組み合わせない**  
   Mutation の `invalidatesTags` で十分。Subscription は UI の変更リスニングのみ。

2. **キャッシュヒット率を測定する**  
   Redux DevTools で "Cache" タブを確認し、キャッシュヒット率を定期的に評価。

3. **大規模データセットはページングする**  
   全件取得ではなく `limit` と `nextToken` を活用。

4. **Optimistic Updates を活用**  
   UI の応答性を高めるため、mutation 実行直後に即座に UI を更新。

   ```typescript
   updateShiftRequest: builder.mutation({
     query: (input) => ({ /* ... */ }),
     async onQueryStarted(arg, { dispatch, queryFulfilled }) {
       // Optimistic update
       dispatch(exampleApi.util.updateQueryData('getExample', arg, (draft) => {
         Object.assign(draft, arg);
       }));

       try {
         await queryFulfilled;
       } catch {
         // Rollback on error
         dispatch(exampleApi.util.invalidateTags(['Example']));
       }
     },
   }),
   ```

5. **Error Handling と Retry 戦略**  
   ```typescript
   baseQuery: graphqlBaseQuery({
     retryCondition: (error) => error.code === 'NETWORK_ERROR',
     maxRetries: 3,
     backoffMs: (attemptNumber) => Math.pow(2, attemptNumber) * 100,
   }),
   ```

---

## 参考資料

- [Redux Toolkit Query 公式ドキュメント](https://redux-toolkit.js.org/rtk-query/overview)
- [AWS Amplify AppSync キャッシング戦略](https://docs.amplify.aws/javascript/tools/libraries/appsync/)
- [GraphQL キャッシング設計](https://www.apollographql.com/docs/apollo-client/caching/overview/)
