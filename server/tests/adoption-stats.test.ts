import request from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import { issueAuthToken } from '../auth/token';

describe('Adoption statistics', () => {
  it('counts adoption applications and groups them by their animal type', async () => {
    prismaMock.adoptionApplication.findMany.mockResolvedValue([
      { animalType: 'Dog', createdAt: new Date('2026-10-01T00:00:00Z') },
      { animalType: 'Cat', createdAt: new Date('2026-10-02T00:00:00Z') },
    ] as any);

    const res = await request(app)
      .get('/api/adoptions/stats')
      .set('Authorization', `Bearer ${issueAuthToken('admin-1', 'Admin')}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 2, byMonth: { '2026-10': 2 }, byAnimalType: { Dog: 1, Cat: 1 } });
  });
});
