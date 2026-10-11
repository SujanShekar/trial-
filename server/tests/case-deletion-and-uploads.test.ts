import fs from 'fs/promises';
import path from 'path';
import request from 'supertest';
import app from '../app';
import { issueAuthToken } from '../auth/token';
import { prismaMock } from './setup';

describe('case deletion and public uploads', () => {
  it('deletes clinical entries and the case in one transaction', async () => {
    prismaMock.$transaction.mockResolvedValue([] as any);

    const response = await request(app)
      .delete('/api/cases/case-1')
      .set('Authorization', `Bearer ${issueAuthToken('admin-1', 'Admin')}`);

    expect(response.status).toBe(204);
    expect(prismaMock.clinicalEntry.deleteMany).toHaveBeenCalledWith({ where: { caseId: 'case-1' } });
    expect(prismaMock.case.delete).toHaveBeenCalledWith({ where: { id: 'case-1' } });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('rejects case deletion by a non-admin', async () => {
    const response = await request(app)
      .delete('/api/cases/case-1')
      .set('Authorization', `Bearer ${issueAuthToken('doctor-1', 'Doctor')}`);

    expect(response.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('deletes a clinical entry for an authorized doctor', async () => {
    prismaMock.clinicalEntry.delete.mockResolvedValue({ id: 'entry-1' } as any);

    const response = await request(app)
      .delete('/api/clinical-entries/entry-1')
      .set('Authorization', `Bearer ${issueAuthToken('doctor-1', 'Doctor')}`);

    expect(response.status).toBe(204);
    expect(prismaMock.clinicalEntry.delete).toHaveBeenCalledWith({ where: { id: 'entry-1' } });
  });

  it('serves API upload URLs without an auth token', async () => {
    const filename = `upload-test-${Date.now()}.txt`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    await fs.writeFile(filePath, 'upload fixture');

    try {
      const response = await request(app).get(`/api/uploads/${filename}`);
      expect(response.status).toBe(200);
      expect(response.text).toBe('upload fixture');
    } finally {
      await fs.unlink(filePath);
    }
  });
});
