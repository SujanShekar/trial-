import { Router } from 'express';
import { prisma } from '../db';
import { sendError, sanitizeData } from '../utils';
import { normalize } from '../lib/uniqueness';

const router = Router();

const findStaffDuplicate = async (data: any, excludeId?: string) => {
  if (!data.phone) return null;
  const staff = await prisma.staffMember.findMany({ select: { id: true, name: true, phone: true } });
  return (staff || []).find(member => member.id !== excludeId && normalize(member.phone) === normalize(data.phone)) || null;
};

router.get('/', async (req, res) => {
  try {
    const staff = await prisma.staffMember.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(staff);
  } catch (error) {
    sendError(res, error, 'Failed to fetch staff');
  }
});

router.post('/', async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const duplicate = await findStaffDuplicate(data);
    if (duplicate) return res.status(409).json({ error: `A staff member with phone number '${duplicate.phone}' already exists.` });

    if (data.salary && data.salary !== '') {
      data.salary = parseFloat(data.salary);
    } else {
      data.salary = null;
    }

    const staff = await prisma.staffMember.create({ data });

    res.status(201).json(staff);
  } catch (error) {
    sendError(res, error, 'Failed to create staff member');
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const data = sanitizeData(req.body);
    const duplicate = await findStaffDuplicate(data, req.params.id);
    if (duplicate) return res.status(409).json({ error: `A staff member with phone number '${duplicate.phone}' already exists.` });

    if (data.salary && data.salary !== '') {
      data.salary = parseFloat(data.salary);
    } else {
      data.salary = null;
    }

    const staff = await prisma.staffMember.update({
      where: { id: req.params.id },
      data
    });

    res.json(staff);
  } catch (error) {
    sendError(res, error, 'Failed to update staff member');
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.staffMember.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    sendError(res, error, 'Failed to delete staff member');
  }
});

export default router;
