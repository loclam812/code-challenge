export const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

export interface PriceEntry {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  currency: string;
  price: number;
}

export const toTokens = (entries: PriceEntry[]): Token[] => {
  const latest = new Map<string, PriceEntry>();
  for (const entry of entries) {
    if (!(entry.price > 0)) continue;
    const current = latest.get(entry.currency);
    if (!current || Date.parse(entry.date) >= Date.parse(current.date)) {
      latest.set(entry.currency, entry);
    }
  }
  return [...latest.values()]
    .map(({ currency, price }) => ({ currency, price }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
};

export const fetchTokens = async (signal?: AbortSignal): Promise<Token[]> => {
  const response = await fetch(PRICES_URL, { signal });
  if (!response.ok) throw new Error(`Price feed returned ${response.status}`);
  const tokens = toTokens(await response.json());
  if (tokens.length < 2) throw new Error('Price feed has fewer than two priced tokens');
  return tokens;
};

export const convert = (amount: number, from: Token, to: Token): number =>
  (amount * from.price) / to.price;

export const iconUrl = (currency: string): string => `${ICON_BASE_URL}/${currency}.svg`;

export const AMOUNT_PATTERN = /^\d*\.?\d*$/;

export const validateAmount = (raw: string): string | null => {
  if (raw.trim() === '') return 'Enter an amount';
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return 'Enter a valid number';
  if (amount <= 0) return 'Amount must be greater than 0';
  return null;
};

const amountFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
const usdFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatAmount = (value: number): string => amountFormat.format(value);
export const formatUsd = (value: number): string => usdFormat.format(value);
