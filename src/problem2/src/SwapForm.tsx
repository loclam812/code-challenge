import { useEffect, useState, type SubmitEvent } from 'react';
import { TokenPicker } from './TokenPicker';
import {
  AMOUNT_PATTERN,
  convert,
  fetchTokens,
  formatAmount,
  formatUsd,
  validateAmount,
  type Token,
} from './tokens';

const SUBMIT_DELAY_MS = 1500;

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; tokens: Token[] };

export const SwapForm = () => {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [fromCurrency, setFromCurrency] = useState('ETH');
  const [toCurrency, setToCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus({ kind: 'loading' });
    fetchTokens(controller.signal)
      .then((tokens) => setStatus({ kind: 'ready', tokens }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setStatus({ kind: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => controller.abort();
  }, [reloadKey]);

  if (status.kind === 'loading') {
    return <main className="card card--center" aria-busy="true">Loading prices…</main>;
  }
  if (status.kind === 'error') {
    return (
      <main className="card card--center" role="alert">
        <p>Could not load prices: {status.message}</p>
        <button type="button" className="submit" onClick={() => setReloadKey((key) => key + 1)}>
          Try again
        </button>
      </main>
    );
  }

  const { tokens } = status;
  const from = tokens.find((token) => token.currency === fromCurrency) ?? tokens[0];
  const to = tokens.find((token) => token.currency === toCurrency) ?? tokens[1] ?? tokens[0];

  const amountError = validateAmount(amount);
  const sameToken = from.currency === to.currency;
  const error = sameToken ? 'Choose two different tokens' : amountError;
  const showError = Boolean(error) && (touched || sameToken);
  const value = amountError ? 0 : Number(amount);
  const received = sameToken ? 0 : convert(value, from, to);
  const rate = convert(1, from, to);

  const flip = () => {
    setFromCurrency(to.currency);
    setToCurrency(from.currency);
    if (!amountError && !sameToken) setAmount(String(Number(received.toPrecision(12))));
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (error || submitting) return;
    setSubmitting(true);
    setReceipt(null);
    setTimeout(() => {
      setSubmitting(false);
      setTouched(false);
      setAmount('');
      setReceipt(
        `Swapped ${formatAmount(value)} ${from.currency} for ${formatAmount(received)} ${to.currency}`,
      );
    }, SUBMIT_DELAY_MS);
  };

  return (
    <main className="card">
      <form onSubmit={submit} noValidate>
        <h1>Swap</h1>

        <section className="field">
          <label htmlFor="input-amount">Amount to send</label>
          <div className={`field__row${showError && amountError ? ' field__row--invalid' : ''}`}>
            <input
              id="input-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.0"
              value={amount}
              disabled={submitting}
              aria-invalid={showError && Boolean(amountError)}
              aria-describedby="swap-error"
              onChange={(event) => {
                const next = event.target.value.replace(',', '.');
                if (AMOUNT_PATTERN.test(next)) setAmount(next);
              }}
              onBlur={() => setTouched(true)}
            />
            <TokenPicker
              label="Token to send"
              tokens={tokens}
              selected={from}
              onSelect={(token) => setFromCurrency(token.currency)}
            />
          </div>
          <p className="field__hint">≈ {formatUsd(value * from.price)}</p>
        </section>

        <div className="flip">
          <button type="button" className="icon-button flip__button" aria-label="Swap direction" onClick={flip}>
            ⇅
          </button>
        </div>

        <section className="field">
          <label htmlFor="output-amount">Amount to receive</label>
          <div className="field__row">
            <output id="output-amount" htmlFor="input-amount" aria-live="polite">
              {formatAmount(received)}
            </output>
            <TokenPicker
              label="Token to receive"
              tokens={tokens}
              selected={to}
              onSelect={(token) => setToCurrency(token.currency)}
            />
          </div>
          <p className="field__hint">≈ {formatUsd(received * to.price)}</p>
        </section>

        <p className="rate">
          1 {from.currency} = {formatAmount(rate)} {to.currency}
        </p>

        <p id="swap-error" className="error" role="alert">
          {showError ? error : ''}
        </p>

        <button type="submit" className="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? <span className="spinner" aria-hidden="true" /> : null}
          {submitting ? 'Swapping…' : 'Confirm swap'}
        </button>

        {receipt ? (
          <p className="receipt" role="status">
            {receipt}
          </p>
        ) : null}
      </form>
    </main>
  );
};
