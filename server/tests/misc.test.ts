import request from 'supertest';
import app from '../app';
import { authHeader, prismaMock } from './setup';

describe('Misc API (Stats & Search)', () => {
  it('should fetch dashboard stats', async () => {
    // Mock the Promise.all results used in the stats endpoint
    prismaMock.case.count.mockResolvedValueOnce(50); // total
    prismaMock.case.count.mockResolvedValueOnce(5);  // critical
    prismaMock.donation.aggregate.mockResolvedValue({ _sum: { amount: 1000 } } as any);
    prismaMock.case.findMany.mockResolvedValue([] as any); // recent
    prismaMock.medicine.count.mockResolvedValue(2); // low stock

    const res = await request(app).get('/api/stats').set(authHeader());
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalCases', 50);
    expect(res.body).toHaveProperty('totalDonations', 1000);
    expect(res.body).toHaveProperty('lowStockMedsCount', 2);
  });

  it('should perform global search', async () => {
    prismaMock.case.findMany.mockResolvedValue([{ id: 'c1', title: 'Dog' }] as any);
    prismaMock.wildlifeCase.findMany.mockResolvedValue([] as any);
    prismaMock.animal.findMany.mockResolvedValue([] as any);

    const res = await request(app).get('/api/search?q=dog').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.cases).toHaveLength(1);
    expect(res.body.cases[0].title).toBe('Dog');
  });

  it('should return empty results for empty query', async () => {
    const res = await request(app).get('/api/search?q=').set(authHeader());
    expect(res.status).toBe(200);
    expect(res.body.cases).toHaveLength(0);
  });
});
