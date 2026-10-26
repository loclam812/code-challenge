# Problem 2: Fancy Form

A currency swap form built with Vite, React and TypeScript.

Live demo: https://fancy-form-rose.vercel.app

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests for price handling and validation
npm run build    # type-check and production build into dist/
```

## Features

- Live prices from `https://interview.switcheo.com/prices.json`, with a loading state and a retry
  button when the request fails.
- Token picker in a modal `<dialog>` with search, token icons and USD price. Escape, the close
  button and a backdrop click all close it.
- The received amount, its USD value and the exchange rate update as you type.
- A button flips the direction and carries the received amount over as the new amount to send.
- Validation: an amount is required and must be a number greater than 0, and the two tokens must
  differ. The input accepts digits and one decimal separator only (a comma becomes a dot).
- Submitting simulates a backend call with a 1.5 s loading state, then shows a confirmation.

## Assumptions

- The price feed lists some currencies more than once (`USDC` four times, `BUSD` twice). The newest
  `date` wins; when two entries share a date, the later one in the file wins.
- Tokens without a positive price are left out, as the task allows.
- Icon file names in `Switcheo/token-icons` are case-sensitive and some do not match the feed
  (`RATOM.svg` does not exist, `rATOM.svg` does). A missing icon falls back to a letter badge.
