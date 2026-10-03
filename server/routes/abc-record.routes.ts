import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';

const router = Router();

const parseABCRecord = (body: any) => {
  const data = sanitizeData(body);
  
  if (data.animalId === '' || data.animalId === undefined || data.animalId === null) {
    data.animalId = null;
  }

  if (data.animalType === '') {
    data.animalType = null;
  } else if (typeof data.animalType === 'string') {
    data.animalType = data.animalType.trim();
  }
  
  if (data.maleCount === '' || data.maleCount === undefined || data.maleCount === null) {
    data.maleCount = null;
  } else {
    data.maleCount = parseInt(String(data.maleCount), 10);
  }
  
  if (data.femaleCount === '' || data.femaleCount === undefined || data.femaleCount === null) {
    data.femaleCount = null;
  } else {
    data.femaleCount = parseInt(String(data.femaleCount), 10);
  }
  
  if (data.sterilized !== undefined) {
    data.sterilized = data.sterilized === true || data.sterilized === 'true';
  }
  
  if (data.vaccinationDone !== undefined) {
    data.vaccinationDone = data.vaccinationDone === true || data.vaccinationDone === 'true';
  }
  
  return data;
};

router.get('/', async (req, res) => {
  try {
    const records = await prisma.aBCRecord.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    sendError(res, error, 'Failed to fetch ABC records');
  }
});

router.post('/', async (req, res) => {
  try {
    const data = parseABCRecord(req.body);
    const record = await prisma.aBCRecord.create({ data });
    res.status(201).json(record);
  } catch (error) {
    sendError(res, error, 'Failed to create ABC record');
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const data = parseABCRecord(req.body);
    const record = await prisma.aBCRecord.update({
      where: { id: req.params.id },
      data
    });
    res.json(record);
  } catch (error) {
    sendError(res, error, 'Failed to update ABC record');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.aBCRecord.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete ABC record');
  }
});

export default router;
