import { TokenIcon } from "@web3icons/react";
import { memo, useState } from "react";

interface TokenLogoProps {
  className?: string;
  logoURI?: string;
  size?: number;
  symbol: string;
}

export const TokenLogo = memo(function TokenLogo({
  className = "",
  logoURI,
  size = 24,
  symbol,
}: TokenLogoProps) {
  const [hasError, setHasError] = useState(false);
  const [logoURIError, setLogoURIError] = useState(false);

  // If we have a logoURI and it hasn't failed, try it first
  if (logoURI && !logoURIError && !hasError) {
    return (
      <img
        src={logoURI}
        alt={symbol}
        width={size}
        height={size}
        className={`rounded-full ${className}`}
        onError={() => {
          setLogoURIError(true);
          // After logoURI fails, will try @web3icons
        }}
      />
    );
  }

  if (hasError) {
    // Fallback: Show first letter of symbol
    return (
      <div
        className={`bg-bg-tertiary dark:bg-surface-hover rounded-full flex items-center justify-center text-xs font-medium text-text-primary ${className}`}
        style={{ height: size, width: size }}
      >
        {symbol?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }

  try {
    return (
      <TokenIcon
        symbol={symbol?.toLowerCase()}
        variant="branded"
        size={size}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  } catch {
    // If TokenIcon fails to render, show fallback
    return (
      <div
        className={`bg-bg-tertiary dark:bg-surface-hover rounded-full flex items-center justify-center text-xs font-medium text-text-primary ${className}`}
        style={{ height: size, width: size }}
      >
        {symbol?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  }
});
