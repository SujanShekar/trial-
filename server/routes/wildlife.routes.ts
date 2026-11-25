import { Router } from 'express';
import { prisma } from '../db';
import { sendError } from '../utils';
import { findDuplicate } from '../lib/uniqueness';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const cases = await prisma.wildlifeCase.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cases);
  } catch (error) {
    sendError(res, error, 'Failed to fetch wildlife cases');
  }
});

router.post('/', async (req, res) => {
  try {
    const requiredFields = [
      'caseNumber', 'dateTime', 'animal', 'species', 'schedule', 'location',
      'status', 'complainantName', 'complainantPhone',
    ] as const;
    const missingFields = requiredFields.filter((field) => !String(req.body[field] ?? '').trim());

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const caseNumber = String(req.body.caseNumber).trim();
    const existing = await prisma.wildlifeCase.findMany({ select: { caseNumber: true } });
    const duplicate = findDuplicate(caseNumber, (existing || []).map(item => item.caseNumber));
    if (duplicate) return res.status(409).json({ error: `Case number already exists: '${duplicate.match}'.` });

    const data = {
      caseNumber,
      dateTime: String(req.body.dateTime).trim(),
      animal: String(req.body.animal).trim(),
      species: String(req.body.species).trim(),
      schedule: String(req.body.schedule).trim(),
      location: String(req.body.location).trim(),
      status: String(req.body.status).trim(),
      complainantName: String(req.body.complainantName).trim(),
      complainantPhone: String(req.body.complainantPhone).trim(),
      forestDeptContact: req.body.forestDeptContact || null,
      releasePlan: req.body.releasePlan || null,
      isReadyForRelease: Boolean(req.body.isReadyForRelease),
      sentFor: req.body.sentFor || null,
      destination: req.body.destination || null,
      correspondence: req.body.correspondence || null,
      signature: req.body.signature || null,
      reportedDate: req.body.reportedDate || null,
      resolvedDate: req.body.resolvedDate || null,
      imageUrl: req.body.imageUrl || null,
    };
    const newCase = await prisma.wildlifeCase.create({ data });
    res.status(201).json(newCase);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Case number already exists' });
    }
    sendError(res, error, 'Failed to create wildlife case');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.wildlifeCase.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete wildlife case');
  }
});

export default router;
