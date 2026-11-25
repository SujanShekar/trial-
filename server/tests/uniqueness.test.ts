import { findDuplicate, normalize } from '../lib/uniqueness';

describe('uniqueness matching', () => {
  it('normalizes case, whitespace, accents, and punctuation', () => {
    expect(normalize('  Phén-yl.  ')).toBe('phenyl');
    expect(findDuplicate(' PHENYL. ', ['Phenyl'])).toEqual({ type: 'exact', match: 'Phenyl' });
  });

  it('finds transposed-character typos', () => {
    expect(findDuplicate('Pheynl', ['Phenyl'])).toEqual({ type: 'similar', match: 'Phenyl' });
  });

  it('does not fuzzy-match names shorter than four characters', () => {
    expect(findDuplicate('do', ['dog'])).toBeNull();
  });

  it('does not treat different numeric strengths or labels as duplicates', () => {
    expect(findDuplicate('Paracetamol 500mg', ['Paracetamol 250mg'])).toBeNull();
    expect(findDuplicate('Cage 2', ['Cage 1'])).toBeNull();
  });
});
