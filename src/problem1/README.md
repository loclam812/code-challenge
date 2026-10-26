# Problem 1: Three ways to sum to n

The three implementations are in [`sum_to_n.js`](./sum_to_n.js).

```bash
node --test sum_to_n.test.js
```

| Function | Approach | Time | Space |
|---|---|---|---|
| `sum_to_n_a` | Gauss formula `n * (n + 1) / 2` | O(1) | O(1) |
| `sum_to_n_b` | Loop from 1 to n | O(n) | O(1) |
| `sum_to_n_c` | Recursive divide and conquer over `[1, n]` | O(n) | O(log n) stack |

## Assumptions

- For `n <= 0` the sum `1 + 2 + ... + n` has no terms, so every implementation returns `0`.
- The task guarantees the result is below `Number.MAX_SAFE_INTEGER`, so the largest valid `n` is
  134,217,727.

## Notes

- `sum_to_n_a` stays exact for every valid `n`. The intermediate `n * (n + 1)` can pass
  `Number.MAX_SAFE_INTEGER`, but it is always even and below 2^54, and doubles represent every
  even integer in that range. The tests check the largest valid `n` against `BigInt`.
- `sum_to_n_c` splits the range in half instead of recursing as `n + f(n - 1)`. The naive version
  needs one stack frame per number and overflows the call stack near n = 9,000 on Node's default stack; the split keeps
  the depth near log2(n), about 27 frames at the largest valid `n`.
- `sum_to_n_b` and `sum_to_n_c` still do n additions, so they are slow for very large `n`;
  `sum_to_n_a` is the one to use in practice.
