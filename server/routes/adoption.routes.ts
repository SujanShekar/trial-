import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';

const router = Router();

// --- Applications ---
router.get('/applications', async (req, res) => {
  try {
    const apps = await prisma.adoptionApplication.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(apps);
  } catch (error) {
    sendError(res, error, 'Failed to fetch applications');
  }
});

router.post('/applications', async (req, res) => {
  try {
    const appRecord = await prisma.adoptionApplication.create({ data: sanitizeData(req.body) });
    res.status(201).json(appRecord);
  } catch (error) {
    sendError(res, error, 'Failed to create adoption application');
  }
});

router.patch('/applications/:id', async (req, res) => {
  try {
    const appRecord = await prisma.adoptionApplication.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body),
    });
    res.json(appRecord);
  } catch (error) {
    sendError(res, error, 'Failed to update adoption application');
  }
});

// --- Adoptions ---
router.get('/', async (req, res) => {
  try {
    const adoptions = await prisma.adoption.findMany({
      include: { animal: true, user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(adoptions);
  } catch (error) {
    sendError(res, error, 'Failed to fetch adoptions');
  }
});

// Keep the aggregate small and server-side so reports do not need to download
// every adoption record just to show headline totals.
router.get('/stats', async (_req, res) => {
  try {
    const applications = await prisma.adoptionApplication.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const byMonth: Record<string, number> = {};
    const byAnimalType: Record<string, number> = {};
    for (const application of applications) {
      const month = application.createdAt.toISOString().slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
      const animalType = application.animalType || 'Unknown';
      byAnimalType[animalType] = (byAnimalType[animalType] || 0) + 1;
    }

    res.json({ total: applications.length, byMonth, byAnimalType });
  } catch (error) {
    sendError(res, error, 'Failed to fetch adoption statistics');
  }
});

router.post('/', async (req, res) => {
  try {
    const adoption = await prisma.adoption.create({ data: sanitizeData(req.body) });
    res.status(201).json(adoption);
  } catch (error) {
    sendError(res, error, 'Failed to create adoption');
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const adoption = await prisma.adoption.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body),
    });
    res.json(adoption);
  } catch (error) {
    sendError(res, error, 'Failed to update adoption');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.adoption.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete adoption');
  }
});

export default router;
