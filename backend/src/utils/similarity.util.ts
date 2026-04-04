export function jaccardSimilarity(tagsA: string[], tagsB: string[]): number {
  const setA = new Set(tagsA.map((tag) => tag.trim()).filter(Boolean));
  const setB = new Set(tagsB.map((tag) => tag.trim()).filter(Boolean));

  if (setA.size === 0 && setB.size === 0) {
    return 0;
  }

  const intersection = [...setA].filter((tag) => setB.has(tag)).length;
  const union = new Set([...setA, ...setB]).size;

  return union === 0 ? 0 : intersection / union;
}

export function sortBySimilarity<T extends { tags: string[] }>(items: T[], targetTags: string[]): T[] {
  return [...items].sort(
    (left, right) => jaccardSimilarity(right.tags, targetTags) - jaccardSimilarity(left.tags, targetTags),
  );
}
