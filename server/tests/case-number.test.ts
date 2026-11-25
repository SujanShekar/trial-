import request from 'supertest';
import app from '../app';
import { issueAuthToken } from '../auth/token';
import { prismaMock } from './setup';

const auth = `Bearer ${issueAuthToken('entry-1', 'Data Entry')}`;
const payload = { caseNumber: 'PFA-2026-001', title: 'Dog Rescue - PFA-2026-001', description: 'Test', location: 'Mysuru' };

describe('case numbers', () => {
  it('creates a case with its supplied number', async () => {
    prismaMock.case.findMany.mockResolvedValue([] as any);
    prismaMock.case.create.mockResolvedValue({ id: 'case-1', ...payload } as any);

    const response = await request(app).post('/api/cases').set('Authorization', auth).send(payload);

    expect(response.status).toBe(201);
    expect(prismaMock.case.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ caseNumber: 'PFA-2026-001' }) }));
  });

  it('requires a case number', async () => {
    const response = await request(app).post('/api/cases').set('Authorization', auth).send({ ...payload, caseNumber: '  ' });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Case number is required');
  });

  it('rejects normalized duplicate case numbers', async () => {
    prismaMock.case.findMany.mockResolvedValue([{ id: 'case-1', caseNumber: 'PFA-2026-001' }] as any);
    const response = await request(app).post('/api/cases').set('Authorization', auth).send({ ...payload, caseNumber: ' pfa-2026-001 ' });
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Case number already exists' });
  });

  it('rejects another case number but permits retaining its own', async () => {
    prismaMock.case.findMany.mockResolvedValue([{ id: 'case-1', caseNumber: 'PFA-2026-001' }, { id: 'case-2', caseNumber: 'PFA-2026-002' }] as any);
    const conflict = await request(app).patch('/api/cases/case-1').set('Authorization', auth).send({ caseNumber: 'PFA-2026-002' });
    expect(conflict.status).toBe(409);

    prismaMock.case.update.mockResolvedValue({ id: 'case-1', caseNumber: 'PFA-2026-001' } as any);
    const own = await request(app).patch('/api/cases/case-1').set('Authorization', auth).send({ caseNumber: ' pfa-2026-001 ' });
    expect(own.status).toBe(200);
  });

  it('searches cases by number in both endpoints', async () => {
    prismaMock.case.findMany.mockResolvedValue([{ id: 'case-1', ...payload }] as any);
    prismaMock.case.count.mockResolvedValue(1);
    const cases = await request(app).get('/api/cases?search=PFA-2026-001').set('Authorization', auth);
    expect(cases.status).toBe(200);
    expect(cases.body.data[0].caseNumber).toBe('PFA-2026-001');

    prismaMock.wildlifeCase.findMany.mockResolvedValue([] as any);
    prismaMock.animal.findMany.mockResolvedValue([] as any);
    const search = await request(app).get('/api/search?q=PFA-2026-001').set('Authorization', auth);
    expect(search.status).toBe(200);
    expect(search.body.cases[0].caseNumber).toBe('PFA-2026-001');
  });

  it('returns the first free suggested number before the id route', async () => {
    const year = new Date().getFullYear();
    prismaMock.case.findMany.mockResolvedValue([{ caseNumber: `PFA-${year}-001` }, { caseNumber: `PFA-${year}-003` }] as any);
    const response = await request(app).get('/api/cases/next-number').set('Authorization', auth);
    expect(response.status).toBe(200);
    expect(response.body.caseNumber).toBe(`PFA-${year}-002`);
  });
});
