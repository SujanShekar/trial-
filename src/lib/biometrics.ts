import { apiFetch } from './api';
export const identifyDog = async (file: File) => { const form = new FormData(); form.append('image', file); return apiFetch('/api/biometrics/identify', { method: 'POST', body: form }); };
export const biometricStatus = () => apiFetch('/api/biometrics/status');
export const retryBiometrics = (caseId: string) => apiFetch(`/api/biometrics/retry/${caseId}`, { method: 'POST' });
