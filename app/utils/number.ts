const formatter = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  compactDisplay: "short",
});

export function formatNumber(n: number) {
  return formatter.format(n);
}
