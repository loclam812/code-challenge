import React, { useMemo } from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const UNKNOWN_PRIORITY = -99;

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain as Blockchain] ?? UNKNOWN_PRIORITY;

const AMOUNT_DECIMALS = 2;

const WalletPage: React.FC<BoxProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(
    () =>
      balances
        .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
        .filter(({ balance, priority }) => priority > UNKNOWN_PRIORITY && balance.amount > 0)
        .sort((lhs, rhs) => rhs.priority - lhs.priority)
        .map(({ balance }) => balance),
    [balances],
  );

  const formattedBalances = useMemo<FormattedWalletBalance[]>(
    () =>
      sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(AMOUNT_DECIMALS),
        usdValue: (prices[balance.currency] ?? 0) * balance.amount,
      })),
    [sortedBalances, prices],
  );

  return (
    <div {...rest}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;
