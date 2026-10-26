import { describe, expect, it } from 'vitest';
import { convert, toTokens, validateAmount } from './tokens';

describe('toTokens', () => {
  it('keeps the newest price for a duplicated currency', () => {
    const tokens = toTokens([
      { currency: 'USDC', date: '2023-08-29T07:10:30.000Z', price: 1 },
      { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 0.99 },
      { currency: 'USDC', date: '2023-08-29T07:10:30.000Z', price: 1 },
    ]);
    expect(tokens).toEqual([{ currency: 'USDC', price: 0.99 }]);
  });

  it('lets the later entry win when dates tie', () => {
    const tokens = toTokens([
      { currency: 'BUSD', date: '2023-08-29T07:10:40.000Z', price: 0.999 },
      { currency: 'BUSD', date: '2023-08-29T07:10:40.000Z', price: 0.9998 },
    ]);
    expect(tokens).toEqual([{ currency: 'BUSD', price: 0.9998 }]);
  });

  it('drops tokens without a usable price and sorts by currency', () => {
    const tokens = toTokens([
      { currency: 'ZIL', date: '2023-08-29T07:10:40.000Z', price: 0.016 },
      { currency: 'BAD', date: '2023-08-29T07:10:40.000Z', price: 0 },
      { currency: 'ETH', date: '2023-08-29T07:10:40.000Z', price: 1645.9 },
    ]);
    expect(tokens.map((t) => t.currency)).toEqual(['ETH', 'ZIL']);
  });
});

describe('convert', () => {
  it('converts through the USD price of both tokens', () => {
    expect(convert(2, { currency: 'ETH', price: 1500 }, { currency: 'USDC', price: 1 })).toBe(3000);
  });
});

describe('validateAmount', () => {
  it.each([
    ['', 'Enter an amount'],
    ['.', 'Enter a valid number'],
    ['0', 'Amount must be greater than 0'],
    ['1.5', null],
  ])('%j -> %j', (raw, expected) => {
    expect(validateAmount(raw)).toBe(expected);
  });
});
