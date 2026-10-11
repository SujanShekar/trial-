import { Router } from 'express';
import { prisma } from '../db';
import { sendError } from '../utils';

export default function createMiscRouter(upload: any) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/api/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  router.get('/stats', async (req, res) => {
    try {
      const [
        totalCases,
        criticalCases,
        totalDonations,
        recentCases,
        lowStockMeds
      ] = await Promise.all([
        prisma.case.count(),
        prisma.case.count({ where: { status: 'critical' } }),
        prisma.donation.aggregate({ _sum: { amount: true } }),
        prisma.case.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.medicine.count({
          where: {
            quantity: { lte: prisma.medicine.fields.minStockLevel }
          }
        })
      ]);

      res.json({
        totalCases,
        criticalCount: criticalCases,
        totalDonations: totalDonations._sum.amount || 0,
        recentActivities: recentCases,
        lowStockMedsCount: lowStockMeds
      });
    } catch (error) {
      sendError(res, error, 'Failed to fetch stats');
    }
  });

  router.get('/search', async (req, res) => {
    try {
      const query = String(req.query.q || '').trim();
      if (!query) {
        return res.json({ cases: [], wildlife: [], animals: [] });
      }

      const [cases, wildlife, animals] = await Promise.all([
        prisma.case.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }),
        prisma.wildlifeCase.findMany({
          where: {
            OR: [
              { caseNumber: { contains: query, mode: 'insensitive' } },
              { animal: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
              { complainantName: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }),
        prisma.animal.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { species: { contains: query, mode: 'insensitive' } },
              { breed: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 10,
        }),
      ]);

      res.json({ cases, wildlife, animals });
    } catch (error) {
      sendError(res, error, 'Search failed');
    }
  });

  return router;
}
