export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatScore(score: number) {
  return `${score.toFixed(1)}×`;
}
