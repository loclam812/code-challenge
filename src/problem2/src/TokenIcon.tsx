import { useState } from 'react';
import { iconUrl } from './tokens';

export const TokenIcon = ({ currency }: { currency: string }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="token-icon token-icon--fallback" aria-hidden="true">
        {currency.charAt(0)}
      </span>
    );
  }
  return (
    <img
      className="token-icon"
      src={iconUrl(currency)}
      alt=""
      width={28}
      height={28}
      onError={() => setFailed(true)}
    />
  );
};
