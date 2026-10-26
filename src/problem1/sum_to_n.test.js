const test = require('node:test');
const assert = require('node:assert/strict');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./sum_to_n');

const implementations = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
const cases = [
  [5, 15],
  [1, 1],
  [0, 0],
  [-5, 0],
  [100, 5050],
  [100000, 5000050000],
];

for (const [name, fn] of Object.entries(implementations)) {
  test(name, () => {
    for (const [n, expected] of cases) assert.equal(fn(n), expected, `n = ${n}`);
  });
}

test('sum_to_n_a stays exact at the largest n the constraint allows', () => {
  const n = 134217727;
  assert.ok(!Number.isSafeInteger(n * (n + 1)));
  assert.equal(BigInt(sum_to_n_a(n)), (BigInt(n) * BigInt(n + 1)) / 2n);
});

test('sum_to_n_c does not overflow the call stack for large n', () => {
  assert.equal(sum_to_n_c(1000000), sum_to_n_a(1000000));
});
