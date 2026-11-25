export const normalize = (value: string): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const damerauLevenshtein = (left: string, right: string): number => {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => row === 0 ? column : column === 0 ? row : 0),
  );

  for (let row = 1; row < rows; row++) {
    for (let column = 1; column < columns; column++) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
      if (row > 1 && column > 1 && left[row - 1] === right[column - 2] && left[row - 2] === right[column - 1]) {
        matrix[row][column] = Math.min(matrix[row][column], matrix[row - 2][column - 2] + cost);
      }
    }
  }
  return matrix[left.length][right.length];
};

const differsOnlyByNumericValue = (left: string, right: string) => {
  const leftDigits = left.match(/\d+/g)?.join('') || '';
  const rightDigits = right.match(/\d+/g)?.join('') || '';
  return Boolean(leftDigits && rightDigits && leftDigits !== rightDigits && left.replace(/\d+/g, '') === right.replace(/\d+/g, ''));
};

export const findDuplicate = (candidate: string, existingNames: string[]) => {
  const normalizedCandidate = normalize(candidate);
  for (const match of existingNames) {
    const normalizedMatch = normalize(match);
    if (normalizedCandidate === normalizedMatch) return { type: 'exact' as const, match };
    if (normalizedCandidate.length < 4 || normalizedMatch.length < 4 || differsOnlyByNumericValue(normalizedCandidate, normalizedMatch)) continue;
    const limit = Math.max(normalizedCandidate.length, normalizedMatch.length) >= 8 ? 2 : 1;
    if (damerauLevenshtein(normalizedCandidate, normalizedMatch) <= limit) return { type: 'similar' as const, match };
  }
  return null;
};
