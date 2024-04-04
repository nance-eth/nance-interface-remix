import { formatUnits } from "viem";

export function formatNumber(
  n: string | number | bigint,
  compact: boolean = false,
) {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    notation: compact ? "compact" : "standard",
  }).format(n);
}

export function formatBigUnits(
  number: bigint,
  decimals: number,
  compact: boolean = false,
) {
  return formatNumber(formatUnits(number, decimals), compact);
}
