import fs from 'fs';
import path from 'path';

const enabled = () => process.env.BIOMETRIC_ENABLED === 'true';
const serviceUrl = () => (process.env.BIOMETRIC_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface BiometricMetadata { case_id: string; created_at: string; updated_at: string; nose_frames_enrolled: number; body_frames_enrolled: number; has_nose_stream: boolean; has_body_stream: boolean }
export interface IdentifyCandidate { case_id: string; similarity_score: number; status: string; rule_applied?: string; metadata?: Record<string, unknown> }
export interface IdentifyResponse { status: 'MATCH' | 'UNKNOWN'; top_match: IdentifyCandidate | null; candidates: IdentifyCandidate[]; message?: string }
export type BiometricResult<T> = { ok: true; data: T } | { ok: false; error: string; retryable: boolean };

const timeoutFetch = async (url: string, init: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...init, signal: controller.signal }); } finally { clearTimeout(timer); }
};
const errorResult = (error: unknown): BiometricResult<never> => ({ ok: false, error: error instanceof Error && error.name === 'AbortError' ? 'Service request timed out' : 'Biometric service unavailable', retryable: true });

export const biometricHealth = async (): Promise<boolean> => {
  if (!enabled()) return false;
  try { return (await timeoutFetch(`${serviceUrl()}/health`, {}, 5000)).ok; } catch { return false; }
};

export const resolveUploadPath = (url?: string): string | null => {
  if (!url || !(/^\/(api\/)?uploads\//.test(url))) return null;
  const filename = url.replace(/^\/(api\/)?uploads\//, '');
  if (!filename || filename.includes('..') || path.isAbsolute(filename) || filename.includes('/') || filename.includes('\\')) return null;
  const target = path.resolve(process.cwd(), 'public', 'uploads', filename);
  const root = path.resolve(process.cwd(), 'public', 'uploads') + path.sep;
  return target.startsWith(root) ? target : null;
};

export const registerDog = async (caseId: string, streams: { noseVideoPath?: string; bodyVideoPath?: string }): Promise<BiometricResult<BiometricMetadata>> => {
  if (!enabled()) return { ok: false, error: 'Biometric service is disabled', retryable: false };
  if (!uuid.test(caseId)) return { ok: false, error: 'Invalid case id', retryable: false };
  if (!streams.noseVideoPath && !streams.bodyVideoPath) return { ok: false, error: 'No biometric video available', retryable: false };
  try {
    const form = new FormData(); form.append('case_id', caseId);
    if (streams.noseVideoPath) form.append('nose_video', await fs.openAsBlob(streams.noseVideoPath), path.basename(streams.noseVideoPath));
    if (streams.bodyVideoPath) form.append('body_video', await fs.openAsBlob(streams.bodyVideoPath), path.basename(streams.bodyVideoPath));
    const response = await timeoutFetch(`${serviceUrl()}/api/v1/register`, { method: 'POST', body: form }, Number(process.env.BIOMETRIC_REGISTER_TIMEOUT_MS || 600000));
    if (!response.ok) return { ok: false, error: response.status === 400 ? 'Model rejected the supplied video' : 'Biometric registration failed', retryable: response.status >= 500 };
    const payload = await response.json() as { metadata: BiometricMetadata };
    console.info(`[biometrics] registered case ${caseId}`);
    return { ok: true, data: payload.metadata };
  } catch (error) { return errorResult(error); }
};

export const identifyDog = async (imageBuffer: Buffer, mime: string): Promise<BiometricResult<IdentifyResponse>> => {
  if (!enabled()) return { ok: false, error: 'Biometric service is disabled', retryable: false };
  try {
    const form = new FormData(); form.append('image', new Blob([imageBuffer], { type: mime }), 'query-image');
    const response = await timeoutFetch(`${serviceUrl()}/api/v1/identify`, { method: 'POST', body: form }, Number(process.env.BIOMETRIC_IDENTIFY_TIMEOUT_MS || 60000));
    if (!response.ok) return { ok: false, error: 'Identification service unavailable', retryable: response.status >= 500 };
    return { ok: true, data: await response.json() as IdentifyResponse };
  } catch (error) { return errorResult(error); }
};

/** The Vidog contract currently has no delete endpoint. Keep gallery cleanup manual until one exists. */
export const deleteDogBiometrics = async (caseId: string) => console.info(`[biometrics] model has no delete endpoint for case ${caseId}`);
