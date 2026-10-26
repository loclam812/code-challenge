const sum_to_n_a = (n) => (n <= 0 ? 0 : (n * (n + 1)) / 2);

const sum_to_n_b = (n) => {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};

const sumRange = (lo, hi) => {
  if (lo > hi) return 0;
  if (lo === hi) return lo;
  const mid = Math.floor((lo + hi) / 2);
  return sumRange(lo, mid) + sumRange(mid + 1, hi);
};

const sum_to_n_c = (n) => sumRange(1, n);

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
