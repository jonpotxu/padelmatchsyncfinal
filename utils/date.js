export function daysBetween(d1, d2 = new Date()) {
  try {
    const a = new Date(d1); const b = new Date(d2);
    const ms = Math.abs(b - a);
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function humanDays(n) {
  if (n <= 1) return `${n} día`;
  return `${n} días`;
}
