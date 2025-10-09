import { TokenIcon } from "@web3icons/react";
import { useState } from "react";

interface TokenLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenLogo({ symbol, size = 24, className = "" }: TokenLogoProps) {
  const [hasError, setHasError] = useState(false);

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
}
