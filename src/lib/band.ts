// Raw score (out of 40) → band conversion, Academic Reading style.
const TABLE: Array<[number, number]> = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [33, 7.5],
  [30, 7],
  [27, 6.5],
  [23, 6],
  [19, 5.5],
  [15, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
  [4, 2.5],
  [2, 2],
  [1, 1],
];

export function bandFromRaw(correct: number, total: number): number {
  if (total <= 0) return 0;
  // scale to a /40 raw score when the test has a different length
  const raw = total === 40 ? correct : Math.round((correct / total) * 40);
  for (const [min, band] of TABLE) {
    if (raw >= min) return band;
  }
  return 0;
}

export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.।,'"”“’‘]/g, "");
}
