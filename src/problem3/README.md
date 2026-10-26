# Problem 3: Messy React

The refactored component is in [`WalletPage.tsx`](./WalletPage.tsx).

`BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow` and `classes` come from the host
application, as they do in the original snippet, so they are used but not defined here. The
refactor type-checks under `tsc --strict` against stubs of those five names.

## Issues found

### Bugs (the component does not work as intended)

1. **`lhsPriority` is undefined.** The filter computes `balancePriority` and then reads
   `lhsPriority`, which does not exist. The code fails to compile, or throws a `ReferenceError`
   at runtime. Fix: use the variable that was computed.
2. **The filter keeps the wrong balances.** It returns `true` when `balance.amount <= 0`, so the
   page shows only empty or negative balances and hides every real one. Fix: keep
   `amount > 0`.
3. **`blockchain` is not in `WalletBalance`.** `balance.blockchain` is a type error, and
   `getPriority(blockchain: any)` hides it. Fix: add `blockchain` to the interface as a union
   of known chains.
4. **The sort comparator returns `undefined` for equal priorities.** A comparator must return a
   number. `undefined` is treated as `0` by the spec, but the function is incomplete and lint
   rules reject it. Fix: `rhs.priority - lhs.priority`.
5. **`formatted` is always `undefined`.** `formattedBalances` is computed and never used.
   `rows` maps over `sortedBalances` and annotates each item as `FormattedWalletBalance`, which
   it is not, so `balance.formatted` is `undefined` and the type annotation lies. Fix: build
   rows from the formatted list.
6. **Nothing is imported.** `useMemo`, `BoxProps`, `useWalletBalances`, `usePrices`,
   `WalletRow` and `classes` are all used without an import. The refactor imports `useMemo` and
   assumes the rest come from the host app.
7. **`prices[balance.currency]` can be `undefined`**, which makes `usdValue` `NaN` for a token
   without a price. Fix: fall back to `0` (or hide the USD value, depending on product needs).

### Computational inefficiencies

8. **`getPriority` runs O(n log n) times inside `sort`**, twice per comparison. Fix: compute
   each balance's priority once, then sort on the stored value.
9. **`prices` is in the `useMemo` dependencies but is not used in it.** Every price update
   re-filters and re-sorts all balances for nothing. Fix: depend on `balances` only, and memoise
   the price-dependent step separately on `[sortedBalances, prices]`.
10. **`formattedBalances` and `rows` are recomputed on every render** and are not memoised, and
    `formattedBalances` is wasted work since nothing reads it. Fix: one memoised format step,
    rendered directly.
11. **`getPriority` is recreated on every render** although it is pure and depends on nothing in
    the component. It is also used inside `useMemo` without being a dependency, which
    `react-hooks/exhaustive-deps` flags. Fix: move it out of the component.

### Anti-patterns and readability

12. **`key={index}`** on a list that is filtered and sorted. When the order changes, React
    reuses the wrong row's state and DOM. Fix: a stable key such as
    `` `${blockchain}:${currency}` ``.
13. **`switch` with a magic `-99` default.** A `Record<Blockchain, number>` lookup is shorter,
    is checked by the compiler when a chain is added, and names the fallback.
14. **`toFixed()` with no argument rounds to 0 decimals**, so `0.5` shows as `"1"`. Fix: pass
    the number of decimals.
15. **`interface Props extends BoxProps {}`** adds nothing; use `BoxProps`. `React.FC<Props>`
    plus `(props: Props)` annotates the same thing twice.
16. **`children` is destructured and then dropped.** The refactor renders it after the rows; if
    the component should not accept children, remove it from the props type instead.
17. **Mixed tabs and spaces**, and an unused `FormattedWalletBalance` shape that is a copy of
    `WalletBalance`. The refactor extends `WalletBalance` instead of repeating its fields.

## Refactor summary

- Pure helpers and the priority table live outside the component.
- One `useMemo` filters and sorts on `[balances]`, computing each priority once.
- A second `useMemo` formats and prices on `[sortedBalances, prices]`, so a price tick does not
  re-sort.
- Rows render from the formatted list with a stable key.
