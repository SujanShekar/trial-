import request from 'supertest';
import app from '../app';
import { issueAuthToken } from '../auth/token';
import { prismaMock } from './setup';

const adminToken = `Bearer ${issueAuthToken('admin-1', 'Admin')}`;

describe('duplicate route protection', () => {
  it('rejects a similar medicine name', async () => {
    prismaMock.medicine.findMany.mockResolvedValue([{ id: 'medicine-1', name: 'Phenyl' }] as any);
    const response = await request(app).post('/api/inventory/medicines').set('Authorization', adminToken).send({ name: 'Pheynl' });
    expect(response.status).toBe(409);
    expect(response.body.error).toContain("'Phenyl'");
  });

  it('rejects normalized duplicate rescue case numbers', async () => {
    prismaMock.case.findMany.mockResolvedValue([{ id: 'case-1', caseNumber: ' CASE-001 ' }] as any);
    const response = await request(app).post('/api/cases').set('Authorization', adminToken).send({ caseNumber: 'case-001.', title: 'Dog', description: 'Test', location: 'Mysuru' });
    expect(response.status).toBe(409);
  });

  it('rejects a duplicate staff phone number', async () => {
    prismaMock.staffMember.findMany.mockResolvedValue([{ id: 'staff-1', name: 'Asha', phone: '9876543210' }] as any);
    const response = await request(app).post('/api/staff').set('Authorization', adminToken).send({ name: 'Another Asha', phone: '9876543210', type: 'Staff', role: 'Volunteer' });
    expect(response.status).toBe(409);
  });
});
