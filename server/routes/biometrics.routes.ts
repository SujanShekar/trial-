import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db';
import { requireRole } from '../middleware/requireRole';
import { biometricHealth, identifyDog } from '../services/biometrics';
import { enqueue } from '../services/biometricQueue';

const router = Router();
const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png'].includes(file.mimetype)) });
const enabled = () => process.env.BIOMETRIC_ENABLED === 'true';

router.get('/status', requireRole(['Admin']), async (_req, res) => {
  const groups = await prisma.case.groupBy({ by: ['biometricStatus'], _count: true });
  res.json({ enabled: enabled(), serviceUp: await biometricHealth(), counts: Object.fromEntries(groups.map(group => [group.biometricStatus, group._count])) });
});

router.post('/identify', requireRole(['Admin', 'Doctor', 'Data Entry']), (req, res, next) => imageUpload.single('image')(req, res, error => {
  if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 10MB or smaller' : 'A JPEG or PNG image is required' });
  next();
}), async (req, res) => {
  if (!req.file || !['image/jpeg', 'image/png'].includes(req.file.mimetype)) return res.status(400).json({ error: 'A JPEG or PNG image is required' });
  const result = await identifyDog(req.file.buffer, req.file.mimetype);
  if (!result.ok) return res.status(503).json({ error: 'Identification service is unavailable' });
  const ids = [...new Set([result.data.top_match?.case_id, ...result.data.candidates.map(candidate => candidate.case_id)].filter(Boolean) as string[])];
  const records = await prisma.case.findMany({ where: { id: { in: ids } }, include: { clinicalEntries: true, reporter: true } });
  const lookup = new Map(records.map(record => [record.id, record]));
  const candidates = result.data.candidates.filter(candidate => lookup.has(candidate.case_id)).map(candidate => ({ case: lookup.get(candidate.case_id), score: candidate.similarity_score }));
  const top = result.data.top_match && lookup.get(result.data.top_match.case_id);
  if (!top) return res.json({ status: 'UNKNOWN', candidates });
  res.json({ status: 'MATCH', topMatch: { case: top, score: result.data.top_match!.similarity_score, rule: result.data.top_match!.rule_applied }, candidates });
});

router.post('/retry/:caseId', requireRole(['Admin', 'Doctor']), async (req, res) => {
  const record = await prisma.case.findUnique({ where: { id: req.params.caseId } });
  if (!record || record.biometricStatus !== 'failed') return res.status(404).json({ error: 'Failed biometric record not found' });
  await enqueue(record.id); res.status(202).json({ queued: true });
});

router.post('/re-enroll-all', requireRole(['Admin']), async (_req, res) => {
  if (!enabled()) return res.status(503).json({ error: 'Biometric service is unavailable' });
  const rows = await prisma.case.findMany({ where: { biometricStatus: { in: ['none', 'failed'] }, OR: [{ noseVideoUrl: { not: null } }, { bodyVideoUrl: { not: null } }, { videoUrl: { not: null } }] }, select: { id: true } });
  rows.forEach(row => void enqueue(row.id));
  res.status(202).json({ queued: rows.length });
});

export default router;
