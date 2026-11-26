import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';
import { requireRole } from '../middleware/requireRole';
import { findDuplicate } from '../lib/uniqueness';
import { enqueue } from '../services/biometricQueue';
import { deleteDogBiometrics } from '../services/biometrics';

const stripBiometricFields = (data: any) => {
  const { biometricStatus, biometricMetadata, biometricError, biometricAttempts, biometricUpdatedAt, ...safe } = data;
  return safe;
};

const router = Router();
// --- Cases with Pagination & Filtering ---
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const search = String(req.query.search || '').trim();
    const status = String(req.query.status || 'All').trim();
    const year = String(req.query.year || 'All').trim();
    const month = String(req.query.month || 'All').trim();
    const timeRange = String(req.query.timeRange || 'All').trim();

    const where: any = {};

    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== 'All') {
      where.status = status;
    }

    if (year !== 'All' || month !== 'All') {
      const filterYear = year !== 'All' ? parseInt(year) : new Date().getFullYear();
      const filterMonth = month !== 'All' ? parseInt(month) - 1 : 0;
      
      const startDate = new Date(filterYear, month !== 'All' ? filterMonth : 0, 1);
      const endDate = new Date(filterYear, month !== 'All' ? filterMonth + 1 : 12, 0, 23, 59, 59);
      
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    if (timeRange !== 'All') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let start: Date | undefined;
      let end: Date | undefined;

      if (timeRange === 'Today') {
        start = startOfToday;
        end = new Date(startOfToday);
        end.setDate(end.getDate() + 1);
      } else if (timeRange === 'Yesterday') {
        end = startOfToday;
        start = new Date(startOfToday);
        start.setDate(start.getDate() - 1);
      } else if (timeRange === 'This Week') {
        start = new Date(startOfToday);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        end = new Date(start);
        end.setDate(end.getDate() + 7);
      } else if (timeRange === 'Last Week') {
        end = new Date(startOfToday);
        end.setDate(end.getDate() - ((end.getDay() + 6) % 7));
        start = new Date(end);
        start.setDate(start.getDate() - 7);
      }

      if (start && end) where.createdAt = { gte: start, lt: end };
    }

    const [data, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: { reporter: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.case.count({ where }),
    ]);

    res.json({
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, error, 'Failed to fetch cases');
  }
});

router.get('/export', async (req, res) => {

  // if (!isAdmin(req)) {
  //   return res.status(403).json({
  //     error: 'Access denied. Admins only.'
  //   });
  // }


  try {
    const range = String(req.query.range || 'all').toLowerCase();
    const now = new Date();
    let start: Date | undefined;

    if (range === 'week') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    }

    const cases = await prisma.case.findMany({
      where: start ? { createdAt: { gte: start } } : undefined,
      include: { reporter: true, clinicalEntries: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cases);
  } catch (error) {
    sendError(res, error, 'Failed to export cases');
  }
});

// This must remain above /:id, otherwise "next-number" is interpreted as an id.
router.get('/next-number', async (_req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `PFA-${year}-`;
    const cases = await prisma.case.findMany({
      where: { caseNumber: { startsWith: prefix, mode: 'insensitive' } },
      select: { caseNumber: true },
    });
    const used = new Set(cases.map(item => item.caseNumber?.toUpperCase()));
    let sequence = 1;
    while (used.has(`${prefix}${String(sequence).padStart(3, '0')}`)) sequence += 1;
    res.json({ caseNumber: `${prefix}${String(sequence).padStart(3, '0')}` });
  } catch (error) {
    sendError(res, error, 'Failed to suggest a case number');
  }
});

router.get('/:id', async (req, res) => {

  // if (!isAdmin(req)) {
  //   return res.status(403).json({
  //     error: 'Access denied. Admins only.'
  //   });
  // }
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: { clinicalEntries: true, reporter: true }
    });
    if (caseItem) {
      res.json(caseItem);
    } else {
      res.status(404).json({ error: 'Case not found' });
    }
  } catch (error) {
    sendError(res, error, 'Failed to fetch case');
  }
});

router.post('/', async (req, res) => {
  try {
    const { videoUrl, noseVideoUrl, bodyVideoUrl, caseNumber, ...caseData } = stripBiometricFields(sanitizeData(req.body));
    if (typeof caseNumber !== 'string' || !caseNumber.trim()) {
      return res.status(400).json({ error: 'Case number is required' });
    }
    const trimmedCaseNumber = caseNumber.trim();
    const existing = await prisma.case.findMany({ where: { OR: [{ caseNumber: { equals: trimmedCaseNumber, mode: 'insensitive' } }, { caseNumber: { startsWith: trimmedCaseNumber.slice(0, 4), mode: 'insensitive' } }] }, select: { id: true, caseNumber: true } });
    const duplicate = findDuplicate(trimmedCaseNumber, (existing ?? []).flatMap(item => item.caseNumber ? [item.caseNumber] : []));
    if (duplicate) return res.status(409).json({ error: 'Case number already exists' });

    const newCase = await prisma.case.create({
      data: {
        ...caseData,
        caseNumber: trimmedCaseNumber,
        ...(typeof videoUrl === 'string' && videoUrl ? { videoUrl } : {})
        ,...(typeof noseVideoUrl === 'string' && noseVideoUrl ? { noseVideoUrl } : {})
        ,...(typeof bodyVideoUrl === 'string' && bodyVideoUrl ? { bodyVideoUrl } : {})
      }
    });
    if (noseVideoUrl || bodyVideoUrl) { void enqueue(newCase.id).catch(() => console.error(`[biometrics] enqueue failed for ${newCase.id}`)); }
    res.status(201).json(newCase);

  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Case number already exists' });
    console.error(error);
    sendError(res, error, 'Failed to create case');
  }
});

router.patch('/:id', async (req, res) => {

  // if (!isAdmin(req)) {
  //   return res.status(403).json({
  //     error: 'Access denied. Admins only.'
  //   });
  // }

  try {
    const data = stripBiometricFields(sanitizeData(req.body));
    const biometricVideoChanged = data.noseVideoUrl !== undefined || data.bodyVideoUrl !== undefined;
    if (data.caseNumber !== undefined) {
      if (typeof data.caseNumber !== 'string' || !data.caseNumber.trim()) {
        return res.status(400).json({ error: 'Case number is required' });
      }
      data.caseNumber = data.caseNumber.trim();
      const existing = await prisma.case.findMany({ where: { OR: [{ caseNumber: { equals: data.caseNumber, mode: 'insensitive' } }, { caseNumber: { startsWith: data.caseNumber.slice(0, 4), mode: 'insensitive' } }] }, select: { id: true, caseNumber: true } });
      const duplicate = findDuplicate(data.caseNumber, (existing ?? []).filter(item => item.id !== req.params.id).flatMap(item => item.caseNumber ? [item.caseNumber] : []));
      if (duplicate) return res.status(409).json({ error: 'Case number already exists' });
    }
    const updatedCase = await prisma.case.update({
      where: { id: req.params.id },
      data
    });
    if (biometricVideoChanged) void enqueue(updatedCase.id).catch(() => console.error(`[biometrics] enqueue failed for ${updatedCase.id}`));
    res.json(updatedCase);
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Case number already exists' });
    sendError(res, error, 'Failed to update case');
  }
});

router.delete('/:id', requireRole(['Admin']), async (req, res) => {
  try {
    await prisma.$transaction([
      prisma.clinicalEntry.deleteMany({ where: { caseId: req.params.id } }),
      prisma.case.delete({ where: { id: req.params.id } }),
    ]);
    void deleteDogBiometrics(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Unable to delete this case and its clinical history');
  }
});

export default router;
