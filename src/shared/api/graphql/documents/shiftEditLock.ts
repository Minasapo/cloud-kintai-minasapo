export const getShiftEditLock = /* GraphQL */ `
  query CustomGetShiftEditLock($id: ID!) {
    getShiftEditLock(id: $id) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const listShiftEditLocks = /* GraphQL */ `
  query CustomListShiftEditLocks(
    $filter: ModelShiftEditLockFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShiftEditLocks(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        targetMonth
        staffId
        date
        holderUserId
        holderUserName
        acquiredAt
        expiresAt
        version
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const createShiftEditLock = /* GraphQL */ `
  mutation CustomCreateShiftEditLock(
    $input: CreateShiftEditLockInput!
    $condition: ModelShiftEditLockConditionInput
  ) {
    createShiftEditLock(input: $input, condition: $condition) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const updateShiftEditLock = /* GraphQL */ `
  mutation CustomUpdateShiftEditLock(
    $input: UpdateShiftEditLockInput!
    $condition: ModelShiftEditLockConditionInput
  ) {
    updateShiftEditLock(input: $input, condition: $condition) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const deleteShiftEditLock = /* GraphQL */ `
  mutation CustomDeleteShiftEditLock(
    $input: DeleteShiftEditLockInput!
    $condition: ModelShiftEditLockConditionInput
  ) {
    deleteShiftEditLock(input: $input, condition: $condition) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const onCreateShiftEditLock = /* GraphQL */ `
  subscription CustomOnCreateShiftEditLock(
    $filter: ModelSubscriptionShiftEditLockFilterInput
  ) {
    onCreateShiftEditLock(filter: $filter) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const onUpdateShiftEditLock = /* GraphQL */ `
  subscription CustomOnUpdateShiftEditLock(
    $filter: ModelSubscriptionShiftEditLockFilterInput
  ) {
    onUpdateShiftEditLock(filter: $filter) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;

export const onDeleteShiftEditLock = /* GraphQL */ `
  subscription CustomOnDeleteShiftEditLock(
    $filter: ModelSubscriptionShiftEditLockFilterInput
  ) {
    onDeleteShiftEditLock(filter: $filter) {
      id
      targetMonth
      staffId
      date
      holderUserId
      holderUserName
      acquiredAt
      expiresAt
      version
      createdAt
      updatedAt
      __typename
    }
  }
`;
