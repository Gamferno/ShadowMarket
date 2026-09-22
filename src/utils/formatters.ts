export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function truncateAddress(address: string, lead = 10, tail = 8): string {
  if (!address || address.length <= lead + tail) return address || '';
  return `${address.slice(0, lead)}...${address.slice(-tail)}`;
}

export function formatDust(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  // If amount is small (< 1000) treat as tDUST units directly, else if large micro-units divide by 1M
  if (num > 100_000) {
    return (num / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  return num.toLocaleString();
}
