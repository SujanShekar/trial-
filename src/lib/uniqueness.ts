export const normalize = (value: string) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();

const distance = (left: string, right: string) => {
  const table = Array.from({ length: left.length + 1 }, (_, row) => Array.from({ length: right.length + 1 }, (_, column) => row ? (column ? 0 : row) : column));
  for (let row = 1; row <= left.length; row++) for (let column = 1; column <= right.length; column++) {
    const cost = left[row - 1] === right[column - 1] ? 0 : 1;
    table[row][column] = Math.min(table[row - 1][column] + 1, table[row][column - 1] + 1, table[row - 1][column - 1] + cost);
    if (row > 1 && column > 1 && left[row - 1] === right[column - 2] && left[row - 2] === right[column - 1]) table[row][column] = Math.min(table[row][column], table[row - 2][column - 2] + cost);
  }
  return table[left.length][right.length];
};

export const findDuplicate = (candidate: string, names: string[]) => {
  const normalized = normalize(candidate);
  return names.find(name => {
    const comparison = normalize(name);
    if (normalized === comparison) return true;
    const digitsDifferOnly = Boolean(normalized.match(/\d+/g)?.join('') && comparison.match(/\d+/g)?.join('') && normalized.replace(/\d+/g, '') === comparison.replace(/\d+/g, '') && normalized.match(/\d+/g)?.join('') !== comparison.match(/\d+/g)?.join(''));
    if (normalized.length < 4 || comparison.length < 4 || digitsDifferOnly) return false;
    return distance(normalized, comparison) <= (Math.max(normalized.length, comparison.length) >= 8 ? 2 : 1);
  }) || null;
};
