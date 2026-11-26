import request from 'supertest';
import app from '../app';
import { authHeader, prismaMock } from './setup';

describe('Deep API Logic & Edge Cases', () => {
  
  describe('Case Pagination & Filtering', () => {
    it('should apply filters and pagination correctly', async () => {
      // Mock result for findMany and count
      prismaMock.case.findMany.mockResolvedValue([{ id: '1', title: 'Filtered Case' }] as any);
      prismaMock.case.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/cases')
        .set(authHeader('Data Entry'))
        .query({ 
          page: 2, 
          limit: 10, 
          status: 'critical', 
          search: 'help' 
        });

      expect(res.status).toBe(200);
      expect(res.body.metadata.page).toBe(2);
      expect(res.body.metadata.totalPages).toBe(1);
      
      // Verify prisma was called with correct offset (skip)
      expect(prismaMock.case.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: expect.objectContaining({
            status: 'critical',
            OR: expect.any(Array)
          })
        })
      );
    });
  });

  describe('Error States', () => {
    it('should return 404 for non-existent case', async () => {
      prismaMock.case.findUnique.mockResolvedValue(null);
      
      const res = await request(app).get('/api/cases/non-existent-id').set(authHeader('Data Entry'));
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Case not found');
    });

    it('should return 400 for duplicate email during registration', async () => {
      const error: any = new Error('Unique constraint failed');
      error.code = 'P2002'; // Prisma unique constraint code
      
      prismaMock.user.create.mockRejectedValue(error);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'duplicate@example.com', password: '123' });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('Full CRUD verification', () => {
    it('should correctly handle animal deletion', async () => {
      prismaMock.animal.delete.mockResolvedValue({ id: 'animal-1' } as any);

      const res = await request(app).delete('/api/animals/animal-1').set(authHeader());
      
      expect(res.status).toBe(204);
      expect(prismaMock.animal.delete).toHaveBeenCalledWith({
        where: { id: 'animal-1' }
      });
    });

    it('should record housekeeping stock update', async () => {
      prismaMock.housekeepingSupply.update.mockResolvedValue({ id: 'h1', quantity: 20 } as any);

      const res = await request(app)
        .patch('/api/inventory/housekeeping/h1')
        .set(authHeader('Data Entry'))
        .send({ quantity: 20 });

      expect(res.status).toBe(200);
      expect(res.body.quantity).toBe(20);
    });
  });
});
