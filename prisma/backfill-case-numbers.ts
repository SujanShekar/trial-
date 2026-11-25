import { PrismaClient } from '@prisma/client';
import { normalize } from '../server/lib/uniqueness';

type CaseRow = { id: string; title: string; createdAt: Date; caseNumber: string | null };
type CaseNumberClient = {
  case: {
    findMany: (args: unknown) => Promise<CaseRow[]>;
    update: (args: { where: { id: string }; data: { caseNumber: string } }) => Promise<unknown>;
  };
};

export type BackfillSummary = { parsed: number; generated: number; conflictsResolved: number };

const parsedCaseNumber = (title: string) => title.slice(title.lastIndexOf(' - ') + 3).trim();

const nextGeneratedNumber = (createdAt: Date, used: Set<string>, sequences: Map<number, number>) => {
  const year = createdAt.getFullYear();
  let sequence = sequences.get(year) ?? 0;
  let candidate = '';
  do {
    sequence += 1;
    candidate = `PFA-${year}-${String(sequence).padStart(3, '0')}`;
  } while (used.has(normalize(candidate)));
  sequences.set(year, sequence);
  return candidate;
};

/** Assigns stable numbers to legacy records. It intentionally does not edit titles. */
export async function backfillCaseNumbers(client: CaseNumberClient): Promise<BackfillSummary> {
  const cases = await client.case.findMany({ orderBy: { createdAt: 'asc' } });
  const used = new Set(cases.flatMap(item => item.caseNumber?.trim() ? [normalize(item.caseNumber)] : []));
  const sequences = new Map<number, number>();
  const summary: BackfillSummary = { parsed: 0, generated: 0, conflictsResolved: 0 };

  for (const item of cases.filter(caseItem => !caseItem.caseNumber?.trim())) {
    const candidate = parsedCaseNumber(item.title);
    let caseNumber: string;
    if (candidate && !used.has(normalize(candidate))) {
      caseNumber = candidate;
      summary.parsed += 1;
    } else {
      caseNumber = nextGeneratedNumber(item.createdAt, used, sequences);
      summary.generated += 1;
      if (candidate) summary.conflictsResolved += 1;
    }
    await client.case.update({ where: { id: item.id }, data: { caseNumber } });
    used.add(normalize(caseNumber));
  }

  return summary;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const summary = await backfillCaseNumbers(prisma);
    console.log(`Case-number backfill complete: parsed=${summary.parsed}, generated=${summary.generated}, conflicts resolved=${summary.conflictsResolved}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('/backfill-case-numbers.ts')) {
  void main();
}
