# Solana GraphQL Query Fix Summary

## Problem Identified

The Solana GraphQL queries were using incorrect entity names and field names that didn't match the actual Solana
subgraph schemas, resulting in zero results despite actual data existing.

## Schema Discovery Results

### Lockup Endpoint Schema

**Endpoint**: `https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet`

**Available Entities**:

- `Action` - Transaction/action records
- `Asset` - Token/mint information
- `Contract` - Contract details
- `Stream` - Stream records
- `Ownership` - Ownership data
- `Watcher` - Monitoring data

**Key Field Mappings**:

- Actions: `addressA` (not `addressId`) - can be null
- Actions: `timestamp` field type is `BigInt` (string in GraphQL)
- Assets: NO `symbol` or `name` fields, only `mint` and `address`
- Streams: Has `sender`, `recipient`, `timestamp` fields
- NO `users` entity exists

### Airdrops Endpoint Schema

**Endpoint**: `https://graph.sablier.io/airdrops-mainnet/subgraphs/name/sablier-airdrops-solana-mainnet`

**Available Entities**:

- `Action` - Claim/clawback actions
- `Activity` - Aggregated daily claim activity
- `Asset` - Token information
- `Campaign` - Airdrop campaign records
- `Factory` - Factory contract data
- `Watcher` - Monitoring data

**Key Field Mappings**:

- NO `claims` entity exists
- Use `activities` entity for claim tracking
- Activity has `claims` field (count of claims)
- Actions have `from`, `claimRecipient` fields (different from lockup)

## Entity Name Mapping

### Lockup Endpoint

| Assumed Entity | Correct Entity | Notes                                    |
| -------------- | -------------- | ---------------------------------------- |
| `users`        | NO ENTITY      | Derive from streams `sender`/`recipient` |
| `streams`      | `streams` ✅   | Correct                                  |
| `actions`      | `actions` ✅   | Correct                                  |
| `assets`       | `assets` ✅    | Correct                                  |

### Airdrops Endpoint

| Assumed Entity | Correct Entity  | Notes                              |
| -------------- | --------------- | ---------------------------------- |
| `campaigns`    | `campaigns` ✅  | Correct                            |
| `claims`       | `activities` ❌ | Use activities with `claims` field |

## Query Fixes Applied

### Function 1: `fetchSolanaUsers()`

**BEFORE**:

```graphql
query {
  users(first: 1000) {
    id
  }
}
```

**AFTER**:

```graphql
query {
  streams(first: 1000) {
    sender
    recipient
  }
}
```

**Logic**: Extract unique users from stream sender/recipient addresses

### Function 2: `fetchSolanaMAU()`

**BEFORE**:

```graphql
query {
  actions(where: { timestamp_gte: "..." }) {
    addressId
  }
}
```

**AFTER**:

```graphql
query {
  actions(where: { timestamp_gte: "..." }) {
    addressA
  }
}
```

**Fix**: Changed `addressId` → `addressA`, added null filtering

### Function 3: `fetchSolanaStreams()`

**BEFORE**: Already correct ✅

```graphql
query {
  streams(first: 1000) {
    id
  }
}
```

**Status**: No changes needed

### Function 4: `fetchSolanaTransactions()`

**BEFORE**: Already correct ✅

```graphql
query {
  actions(first: 1000) {
    id
  }
}
```

**Status**: No changes needed

### Function 5: `fetchSolanaTopTokens()`

**BEFORE**:

```graphql
query {
  assets {
    symbol
    name
    streams {
      id
    }
  }
}
```

**AFTER**:

```graphql
query {
  assets {
    mint
    address
    streams {
      id
    }
  }
}
```

**Fix**: Changed `symbol`/`name` → `mint`/`address` (actual fields available)

### Function 6: `fetchSolanaStreams24h()`

**BEFORE**: Already correct ✅

```graphql
query {
  streams(where: { timestamp_gte: "..." }) {
    id
    timestamp
  }
}
```

**Status**: No changes needed

### Function 7: `fetchSolanaCampaigns()`

**BEFORE**: Already correct ✅

```graphql
query {
  campaigns(first: 1000) {
    id
  }
}
```

**Status**: No changes needed

### Function 8: `fetchSolanaClaims24h()`

**BEFORE**:

```graphql
query {
  claims(where: { timestamp_gte: "..." }) {
    id
    timestamp
  }
}
```

**AFTER**:

```graphql
query {
  activities(where: { timestamp_gte: "..." }) {
    id
    timestamp
    claims
  }
}
```

**Fix**: Changed `claims` → `activities`, sum `claims` field for total

## Validation Results

### Actual Data Counts (Tested 2025-09-30)

| Query        | Expected | Actual | Status  |
| ------------ | -------- | ------ | ------- |
| Streams      | 2+       | 4      | ✅ PASS |
| Actions      | 4+       | 6      | ✅ PASS |
| Unique Users | >0       | 6      | ✅ PASS |
| Campaigns    | 1        | 1      | ✅ PASS |
| Activities   | >0       | 1      | ✅ PASS |

**Note**: Data has grown since initial discovery. Queries are dynamic and will reflect current state.

### Sample Data Verification

**Streams** (3 found):

- `4EauRKrNErKfsR4XetEZJNmvACGHbHnHV4R5dvJuqupC-SOL-3M5s1Xvw9Ai8szbK3ZAM6M8ViKkU99HPcXNTx9s5VEuG`
- `4EauRKrNErKfsR4XetEZJNmvACGHbHnHV4R5dvJuqupC-SOL-Cbx7H62hjWEGHmHBQ73wQ2qe8f2Uj2RphvaT5RSQ8cS5`
- `4EauRKrNErKfsR4XetEZJNmvACGHbHnHV4R5dvJuqupC-SOL-H7NbPkmebgWaGywSYzZDuNciVLyJ4X9MtsiXDGh5n9h9`

**Actions** (5 found):

- 3 Create actions
- 2 Withdraw actions

**Campaigns** (1 found):

- `9Yrr2EMj2f4oAXPgiDk6gnQv8izjc5qKABCPRcpmm1nR-SOL` - "The Pengu Experiment"

**Assets** (3 found):

- `2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv` - 1 stream
- `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` - 1 stream (USDC)
- `So11111111111111111111111111111111111111112` - 1 stream (Native SOL)

## Files Modified

1. `/Users/mdesalle/analytics-dashboard/src/lib/services/solana-lockup-graphql.ts`
   - Fixed `fetchSolanaUsers()` - derive from streams sender/recipient
   - Fixed `fetchSolanaMAU()` - use `addressA` field with null filtering
   - Fixed `fetchSolanaTopTokens()` - use `mint`/`address` instead of `symbol`/`name`

2. `/Users/mdesalle/analytics-dashboard/src/lib/services/solana-airdrops-graphql.ts`
   - Fixed `fetchSolanaClaims24h()` - use `activities` entity, sum `claims` field

3. `/Users/mdesalle/analytics-dashboard/src/lib/solana-cache-update.ts`
   - Updated `SolanaAnalyticsData` interface to use `mint`/`address`

4. `/Users/mdesalle/analytics-dashboard/src/hooks/useSolanaAnalytics.ts`
   - Updated interface to match new token structure

5. `/Users/mdesalle/analytics-dashboard/src/components/SolanaTopSPLTokens.tsx`
   - Updated to display mint addresses instead of symbols
   - Added address truncation for better UX
   - Updated tooltip to show full address

## TypeScript Interface Updates

### Lockup Service

- Added `StreamsResponse` interface for user extraction
- Updated `ActionResponse` to use `addressA: string | null`
- Updated `TopSPLToken` to use `mint` and `address` instead of `symbol`/`name`
- Updated `AssetResponse` to match actual schema fields
- Renamed `StreamResponse` → `StreamTimestampResponse` for clarity

### Airdrops Service

- Renamed `ClaimResponse` → `ActivityResponse`
- Updated to query `activities` with `claims` field
- Added logic to sum claims from activities

## Error Handling

All functions maintain robust error handling:

- HTTP error checking
- GraphQL error detection
- Null filtering where needed (e.g., `addressA` can be null)
- Type-safe TypeScript interfaces

## Next Steps

1. Test queries in production environment
2. Monitor query performance
3. Consider caching strategies if needed
4. Verify timestamp filtering works correctly across timezones
