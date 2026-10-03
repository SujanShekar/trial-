import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.use('/medicines', requireRole(['Admin', 'Doctor', 'Data Entry']));
router.use('/housekeeping', requireRole(['Admin', 'Data Entry']));
router.use('/items', requireRole(['Admin', 'Doctor', 'Data Entry']));

// --- Medicines ---
router.get('/medicines', async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(medicines);
  } catch (error) {
    sendError(res, error, 'Failed to fetch medicines');
  }
});

router.post('/medicines', async (req, res) => {
  try {
    const med = await prisma.medicine.create({ data: sanitizeData(req.body) });
    res.status(201).json(med);
  } catch (error) {
    sendError(res, error, 'Failed to create medicine');
  }
});

router.patch('/medicines/:id', async (req, res) => {
  try {
    const med = await prisma.medicine.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body)
    });
    res.json(med);
  } catch (error) {
    sendError(res, error, 'Failed to update medicine');
  }
});

router.delete('/medicines/:id', async (req, res) => {
  try {
    await prisma.medicine.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete medicine');
  }
});

// --- Housekeeping ---
router.get('/housekeeping', async (req, res) => {
  try {
    const items = await prisma.housekeepingSupply.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    sendError(res, error, 'Failed to fetch housekeeping');
  }
});

router.post('/housekeeping', async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const existingItem = await prisma.housekeepingSupply.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (existingItem) {
      return res.status(409).json({ error: 'An item with this name already exists' });
    }

    const item = await prisma.housekeepingSupply.create({ data: { ...data, name } });
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error, 'Failed to create housekeeping item');
  }
});

router.patch('/housekeeping/:id', async (req, res) => {
  try {
    const item = await prisma.housekeepingSupply.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body)
    });
    res.json(item);
  } catch (error) {
    sendError(res, error, 'Failed to update housekeeping item');
  }
});

router.delete('/housekeeping/:id', async (req, res) => {
  try {
    await prisma.housekeepingSupply.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete housekeeping item');
  }
});

// --- General Items ---
router.get('/items', async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    res.json(items);
  } catch (error) {
    sendError(res, error, 'Failed to fetch inventory items');
  }
});

router.post('/items', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.create({ data: sanitizeData(req.body) });
    res.status(201).json(item);
  } catch (error) {
    sendError(res, error, 'Failed to create inventory item');
  }
});

router.patch('/items/:id', async (req, res) => {
  try {
    const item = await prisma.inventoryItem.update({
      where: { id: req.params.id },
      data: sanitizeData(req.body)
    });
    res.json(item);
  } catch (error) {
    sendError(res, error, 'Failed to update inventory item');
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.inventoryItem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete inventory item');
  }
});

export default router;
