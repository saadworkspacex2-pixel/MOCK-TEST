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
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/[&]/g, " and ")
    .replace(/[\p{P}\p{S}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Compares one learner response against pipe-separated accepted variants.
// `re:` prefixes allow admin-authored regular expressions; invalid patterns
// and oversized inputs fail closed instead of crashing submission.
export function matchesAcceptedAnswer(given: string, acceptedAnswers: string): boolean {
  const raw = given.normalize("NFKC").trim().slice(0, 500);
  const normalized = normalizeAnswer(raw);
  if (!normalized) return false;

  return acceptedAnswers
    .split("|")
    .map((answer) => answer.trim())
    .filter(Boolean)
    .some((accepted) => {
      if (accepted.startsWith("re:")) {
        try {
          return new RegExp(accepted.slice(3), "iu").test(raw);
        } catch {
          return false;
        }
      }
      return normalizeAnswer(accepted) === normalized;
    });
}
