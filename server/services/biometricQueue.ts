import { prisma } from '../db';
import { registerDog, resolveUploadPath } from './biometrics';

const queued = new Set<string>();
let working = false;
const delay = [30_000, 120_000, 600_000];
const isEnabled = () => process.env.BIOMETRIC_ENABLED === 'true';

async function work(caseId: string) {
  const record = await prisma.case.findUnique({ where: { id: caseId } });
  if (!record) return;
  const noseVideoPath = resolveUploadPath(record.noseVideoUrl);
  const bodyVideoPath = resolveUploadPath(record.bodyVideoUrl || record.videoUrl);
  await prisma.case.update({ where: { id: caseId }, data: { biometricStatus: 'processing', biometricError: null } });
  const result = await registerDog(caseId, { noseVideoPath: noseVideoPath || undefined, bodyVideoPath: bodyVideoPath || undefined });
  if (result.ok) {
    await prisma.case.update({ where: { id: caseId }, data: { biometricStatus: 'enrolled', biometricMetadata: result.data as any, biometricError: null, biometricUpdatedAt: new Date() } });
    return;
  }
  const failed = result as { ok: false; error: string; retryable: boolean };
  const attempts = record.biometricAttempts + 1;
  const retry = failed.retryable && attempts < Number(process.env.BIOMETRIC_MAX_ATTEMPTS || 3);
  await prisma.case.update({ where: { id: caseId }, data: { biometricStatus: retry ? 'pending' : 'failed', biometricAttempts: attempts, biometricError: failed.error.slice(0, 240), biometricUpdatedAt: new Date() } });
  if (retry) setTimeout(() => { void enqueue(caseId).catch(() => console.error(`[biometrics] retry enqueue failed for ${caseId}`)); }, delay[Math.min(attempts - 1, delay.length - 1)]);
}

async function consume() {
  if (working) return;
  working = true;
  while (queued.size) {
    const caseId = queued.values().next().value as string;
    queued.delete(caseId);
    try { await work(caseId); } catch {
      try { await prisma.case.update({ where: { id: caseId }, data: { biometricStatus: 'failed', biometricError: 'Biometric processing failed', biometricUpdatedAt: new Date() } }); }
      catch { console.error(`[biometrics] worker failure for ${caseId}`); }
    }
  }
  working = false;
}

export const enqueue = async (caseId: string) => {
  if (!isEnabled()) return false;
  try { await prisma.case.update({ where: { id: caseId }, data: { biometricStatus: 'pending', biometricError: null } }); }
  catch (error: any) { if (error?.code === 'P2025') return false; throw error; }
  queued.add(caseId); void consume();
  return true;
};

export const recoverBiometricQueue = async () => {
  if (!isEnabled()) return 0;
  const rows = await prisma.case.findMany({ where: { biometricStatus: { in: ['pending', 'processing'] } }, select: { id: true } });
  rows.forEach(row => { queued.add(row.id); }); void consume();
  return rows.length;
};
