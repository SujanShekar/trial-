import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
let latest: { caseId: string; nose: boolean; body: boolean; createdAt: string } | null = null;
const mode = () => process.env.MOCK_MODE;
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
app.get('/health', async (_req, res) => { if (mode() === 'down') return res.status(503).json({ status: 'down' }); if (mode() === 'slow') await pause(6000); res.json({ status: 'ok' }); });
app.post('/api/v1/register', upload.fields([{ name: 'nose_video' }, { name: 'body_video' }]), async (req, res) => {
  if (mode() === 'error') return res.status(500).json({ detail: 'mock error' });
  if (mode() === 'slow') await pause(650_000); else await pause(3000);
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const nose = Boolean(files?.nose_video?.[0]); const body = Boolean(files?.body_video?.[0]); const caseId = String(req.body.case_id || '');
  if (!caseId || (!nose && !body)) return res.status(400).json({ detail: 'case_id and a video are required' });
  latest = { caseId, nose, body, createdAt: new Date().toISOString() };
  res.json({ status: 'ok', message: 'mock enrolled', case_id: caseId, metadata: { case_id: caseId, created_at: latest.createdAt, updated_at: new Date().toISOString(), nose_frames_enrolled: nose ? 10 : 0, body_frames_enrolled: body ? 10 : 0, has_nose_stream: nose, has_body_stream: body } });
});
app.post('/api/v1/identify', upload.single('image'), (_req, res) => {
  if (mode() === 'error') return res.status(500).json({ detail: 'mock error' });
  if (!latest) return res.json({ status: 'UNKNOWN', top_match: null, candidates: [], message: 'No enrolled cases' });
  const candidate = { case_id: latest.caseId, similarity_score: .89, status: 'MATCH', metadata: {} };
  res.json({ status: 'MATCH', top_match: { ...candidate, rule_applied: 'mock-most-recent' }, candidates: [candidate] });
});
app.listen(8000, '127.0.0.1', () => console.log('Mock biometric service listening on 127.0.0.1:8000'));
