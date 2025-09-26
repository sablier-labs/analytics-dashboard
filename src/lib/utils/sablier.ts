// Sablier utility functions for URL generation and contract mapping

// Known Sablier contract addresses to aliases mapping
const SABLIER_CONTRACT_ALIASES: Record<string, string> = {
  "0x4b45090152a5731b5bc71b5baf71d4549532cd99": "LL2", // Base
  "0x6b9a46c8377f21517e65fa3899b3a9fab19d17f5": "LL2", // Optimism
  "0x6f68516c21e248cddfaf4898e66b2b0adee0e0d6": "LD2", // Optimism

  // Lockup Dynamic V2.1 contracts
  "0x39efdc3dbb57b2388ccc4bb40ac4cb1226bc9e44": "LD2", // Ethereum
  "0x197d655f3be03903fd25e7828c3534504bfe525e": "LL2", // Arbitrum
  "0x67422c3e36a908d5c3237e9cffeb40bde7060f6e": "LL2", // Polygon
  // Lockup Linear V2.1 contracts
  "0xafb979d9afad1ad27c5eff4e27226e3ab9e5dcc9": "LL2", // Ethereum
  "0xce49854a647a1723e8fb7cc3d190cab29a44ab87": "LD2", // Polygon
  "0xde6a30327c14b8a67b2a573a6ebc2d42a3b57b8e": "LD2", // Base
  "0xf390ce6f54e4dc7c5a5f7f8689062b7591f7111d": "LD2", // Arbitrum

  // Add more contract mappings as needed
};

// Fallback aliases based on common patterns
const getDefaultContractAlias = (contract: string): string => {
  // If we don't have a specific mapping, use a generic approach
  // This is a fallback - in practice we'd want to maintain the contract mapping above
  return contract.toLowerCase();
};

/**
 * Generates a Sablier app URL for a specific stream
 * Format: https://app.sablier.com/stream/[CONTRACT_ALIAS]-[CHAIN_ID]-[STREAM_ID]
 *
 * @param chainId - The blockchain network ID
 * @param tokenId - The stream token ID
 * @param contract - The contract address
 * @returns The full URL to view the stream on app.sablier.com
 */
export function getSablierStreamUrl(
  chainId: string,
  tokenId: string,
  contract: string,
): string | null {
  // Check for required parameters
  if (!chainId || !tokenId || !contract) {
    return null;
  }

  // Get contract alias or fallback to contract address
  const contractAlias = SABLIER_CONTRACT_ALIASES[contract.toLowerCase()] || contract;

  // Construct the URL
  const streamUrl = `https://app.sablier.com/stream/${contractAlias}-${chainId}-${tokenId}`;

  return streamUrl;
}

/**
 * Checks if a contract address has a known alias
 */
export function hasKnownContractAlias(contract: string): boolean {
  return contract.toLowerCase() in SABLIER_CONTRACT_ALIASES;
}

/**
 * Gets the contract alias for a given address
 */
export function getContractAlias(contract: string): string {
  return SABLIER_CONTRACT_ALIASES[contract.toLowerCase()] || contract;
}

/**
 * Calculates and formats the duration between start and end time
 */
export function formatDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) {
    return "N/A";
  }

  const start = parseInt(startTime) * 1000;
  const end = parseInt(endTime) * 1000;
  const durationMs = end - start;

  if (durationMs <= 0) {
    return "N/A";
  }

  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days >= 365) {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    return `${years}y ${Math.floor(remainingDays / 30)}m`;
  }

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    return `${months}m ${remainingDays}d`;
  }

  if (days > 0) {
    if (hours === 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    }
    return `${days}d ${hours}h`;
  }

  return `${hours} hour${hours > 1 ? "s" : ""}`;
}

/**
 * Determines if a stream is still active or has ended
 */
export function getStreamStatus(endTime: string): "active" | "completed" {
  if (!endTime) {
    return "active";
  }

  const end = parseInt(endTime) * 1000;
  const now = Date.now();

  return now < end ? "active" : "completed";
}

/**
 * Normalizes amounts to 18 decimals for proper sorting comparison
 * This fixes the string sorting issue where different decimal places cause incorrect ordering
 */
export function normalizeAmount(amount: string, decimals: string): bigint {
  if (!amount || !decimals) {
    return BigInt(0);
  }

  const dec = parseInt(decimals);
  const targetDecimals = 18;
  const value = BigInt(amount);

  if (dec < targetDecimals) {
    // Scale up to 18 decimals
    return value * BigInt(10 ** (targetDecimals - dec));
  } else if (dec > targetDecimals) {
    // Scale down to 18 decimals
    return value / BigInt(10 ** (dec - targetDecimals));
  }

  return value;
}
