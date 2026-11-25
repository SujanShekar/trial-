import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { sendError } from '../utils';

const router = Router();
const profileSelect = { id: true, fullName: true, email: true, phone: true, role: true, isRootAdmin: true, isActive: true, createdAt: true };

router.get('/profiles', async (_req, res) => {
  try {
    res.json(await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: profileSelect }));
  } catch (error) { sendError(res, error, 'Failed to fetch profiles'); }
});

router.get('/profiles/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: profileSelect });
    if (!user) return res.status(404).json({ error: 'Profile not found' });
    res.json(user);
  } catch (error) { sendError(res, error, 'Failed to fetch profile'); }
});

router.post('/profiles', async (req, res) => {
  try {
    const { fullName, password, phone, role } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!fullName || !email || !password || !role) return res.status(400).json({ error: 'Full name, email, password and role are required' });
    if (await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })) return res.status(409).json({ error: 'Email already exists' });

    const user = await prisma.user.create({
      data: { fullName, email, phone: phone || null, role, password: await bcrypt.hash(password, 12) },
      select: profileSelect,
    });
    res.status(201).json(user);
  } catch (error: any) { if (error?.code === 'P2002') return res.status(409).json({ error: 'Email already exists' }); sendError(res, error, 'Failed to create profile'); }
});

router.put('/profiles/:id', async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'Profile not found' });
    const { fullName, phone, role } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    if (await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' }, NOT: { id: req.params.id } } })) return res.status(409).json({ error: 'Email already exists' });
    const user = await prisma.user.update({
      where: { id: req.params.id }, data: { fullName, email, phone: phone || null, role }, select: profileSelect,
    });
    res.json(user);
  } catch (error: any) { if (error?.code === 'P2002') return res.status(409).json({ error: 'Email already exists' }); sendError(res, error, 'Failed to update profile'); }
});

router.patch('/profiles/:id/reactivate', async (req, res) => {
  try {
    if (!await prisma.user.findUnique({ where: { id: req.params.id } })) return res.status(404).json({ error: 'Profile not found' });
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true }, select: profileSelect });
    res.json(user);
  } catch (error) { sendError(res, error, 'Failed to reactivate profile'); }
});

router.delete('/profiles/:id', async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'Profile not found' });
    if (target.isRootAdmin) return res.status(403).json({ error: 'Cannot delete the root admin account' });
    if (req.params.id === req.user!.id) return res.status(403).json({ error: 'You cannot delete your own account' });

    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: profileSelect });
    res.json(user);
  } catch (error) { sendError(res, error, 'Failed to deactivate profile'); }
});

export default router;
