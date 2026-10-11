import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use('/clinical-entries', requireRole(['Admin', 'Doctor']));
router.use('/medicine-usages', requireRole(['Admin', 'Doctor', 'Data Entry']));

// --- Clinical Entries ---
router.get('/clinical-entries', async (req, res) => {
  try {
    const entries = await prisma.clinicalEntry.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(entries);
  } catch (error) {
    sendError(res, error, 'Failed to fetch clinical entries');
  }
});

router.post('/clinical-entries', async (req, res) => {
  try {
    const entry = await prisma.clinicalEntry.create({ data: sanitizeData(req.body) });
    res.status(201).json(entry);
  } catch (error) {
    sendError(res, error, 'Failed to create clinical entry');
  }
});

router.delete('/clinical-entries/:id', requireRole(['Admin', 'Doctor']), async (req, res) => {
  try {
    await prisma.clinicalEntry.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete clinical entry');
  }
});

router.patch('/clinical-entries/:id', async (req, res) => {
  try {
    const entry = await prisma.clinicalEntry.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body)
    });
    res.json(entry);
  } catch (error) {
    sendError(res, error, 'Failed to update clinical entry');
  }
});

// --- Medicine Usage ---
router.get('/medicine-usages', async (req, res) => {
  try {
    const usages = await prisma.medicineUsage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(usages);
  } catch (error) {
    sendError(res, error, 'Failed to fetch medicine usages');
  }
});

router.post('/medicine-usages', async (req, res) => {
  try {
    const { medicineId, quantity, ...rest } = req.body;
    const deduction = parseFloat(quantity) || 0;

    const [usage] = await prisma.$transaction([
      prisma.medicineUsage.create({ 
        data: { 
          medicineId, 
          quantity: String(quantity), 
          ...sanitizeData(rest),
          dateTime: new Date().toISOString()
        } 
      }),
      prisma.medicine.update({
        where: { id: medicineId },
        data: {
          quantity: {
            decrement: deduction
          }
        }
      })
    ]);

    res.status(201).json(usage);
  } catch (error) {
    sendError(res, error, 'Failed to record usage or update stock');
  }
});

router.delete('/medicine-usages/:id', async (req, res) => {
  try {
    await prisma.medicineUsage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete medicine usage');
  }
});

export default router;
