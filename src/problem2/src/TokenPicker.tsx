import { useEffect, useRef, useState } from 'react';
import { TokenIcon } from './TokenIcon';
import { formatUsd, type Token } from './tokens';

interface TokenPickerProps {
  label: string;
  tokens: Token[];
  selected: Token | undefined;
  onSelect: (token: Token) => void;
}

export const TokenPicker = ({ label, tokens, selected, onSelect }: TokenPickerProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      searchRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const matches = tokens.filter((token) =>
    token.currency.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const choose = (token: Token) => {
    onSelect(token);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="token-button"
        aria-label={`${label}: ${selected?.currency ?? 'none'}`}
        onClick={() => {
          setQuery('');
          setOpen(true);
        }}
      >
        {selected ? <TokenIcon currency={selected.currency} /> : null}
        <span>{selected?.currency ?? 'Select'}</span>
        <span className="chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="picker"
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="picker__header">
          <h2>{label}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
        <input
          ref={searchRef}
          className="picker__search"
          type="search"
          placeholder="Search token"
          aria-label="Search token"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ul className="picker__list">
          {matches.map((token) => (
            <li key={token.currency}>
              <button
                type="button"
                className="picker__option"
                aria-current={token.currency === selected?.currency}
                onClick={() => choose(token)}
              >
                <TokenIcon currency={token.currency} />
                <span className="picker__name">{token.currency}</span>
                <span className="picker__price">{formatUsd(token.price)}</span>
              </button>
            </li>
          ))}
          {matches.length === 0 ? <li className="picker__empty">No token matches “{query}”</li> : null}
        </ul>
      </dialog>
    </>
  );
};
