import { backfillCaseNumbers } from '../../prisma/backfill-case-numbers';

describe('case-number backfill', () => {
  it('is idempotent and resolves parsed-number conflicts with generated values', async () => {
    const rows = [
      { id: '1', title: 'Dog Rescue - PFA-2026-001', createdAt: new Date('2026-01-01'), caseNumber: null },
      { id: '2', title: 'Cat Rescue - PFA-2026-001', createdAt: new Date('2026-01-02'), caseNumber: null },
      { id: '3', title: 'Cow Rescue - ', createdAt: new Date('2026-01-03'), caseNumber: null },
    ];
    const client = {
      case: {
        findMany: jest.fn().mockImplementation(async () => rows),
        update: jest.fn().mockImplementation(async ({ where, data }) => {
          const row = rows.find(item => item.id === where.id)!;
          row.caseNumber = data.caseNumber;
        }),
      },
    };

    await expect(backfillCaseNumbers(client)).resolves.toEqual({ parsed: 1, generated: 2, conflictsResolved: 1 });
    expect(rows.map(row => row.caseNumber)).toEqual(['PFA-2026-001', 'PFA-2026-002', 'PFA-2026-003']);
    await expect(backfillCaseNumbers(client)).resolves.toEqual({ parsed: 0, generated: 0, conflictsResolved: 0 });
    expect(client.case.update).toHaveBeenCalledTimes(3);
  });
});
