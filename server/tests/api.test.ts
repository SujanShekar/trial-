import request from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import { issueAuthToken } from '../auth/token';

describe('General API Endpoints', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should sanitize data in case creation', async () => {
    // Problematic payload with relational and immutable fields
    const payload = {
      title: 'Injury Case',
      description: 'Limping dog',
      location: 'South Delhi',
      clinicalEntries: [], // Should be stripped
      reporter: { name: 'Fake' }, // Should be stripped
      id: 'intentional-collision', // Should be stripped
      createdAt: '2021-01-01T00:00:00.000Z' // Should be stripped
    };

    // Mock Prisma response
    prismaMock.case.create.mockResolvedValue({
      id: 'uuid-123',
      title: 'Injury Case',
      description: 'Limping dog',
      location: 'South Delhi',
      status: 'open',
      reportedById: null,
      imageUrl: null,
      createdAt: new Date()
    } as any);

    const res = await request(app)
      .post('/api/cases')
      .send(payload);

    expect(res.status).toBe(201);
    
    // Check that prisma.case.create was called with SANITIZED data
    expect(prismaMock.case.create).toHaveBeenCalledWith({
      data: {
        title: 'Injury Case',
        description: 'Limping dog',
        location: 'South Delhi'
      }
    });
  });

  it('should allow Data Entry staff to create a case', async () => {
    prismaMock.case.create.mockResolvedValue({ id: 'uuid-456', title: 'Injury Case' } as any);

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${issueAuthToken('user-1', 'Data Entry')}`)
      .send({ title: 'Injury Case', description: 'Limping dog', location: 'South Delhi' });

    expect(res.status).toBe(201);
  });

  it('should store an optional scene video URL when creating a case', async () => {
    prismaMock.case.create.mockResolvedValue({ id: 'uuid-video', videoUrl: '/uploads/scene.mp4' } as any);

    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${issueAuthToken('user-1', 'Data Entry')}`)
      .send({ title: 'Injury Case', description: 'Limping dog', location: 'South Delhi', videoUrl: '/uploads/scene.mp4' });

    expect(res.status).toBe(201);
    expect(prismaMock.case.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ videoUrl: '/uploads/scene.mp4' })
    });
  });

  it('should filter exported cases by the requested range', async () => {
    prismaMock.case.findMany.mockResolvedValue([] as any);

    const res = await request(app)
      .get('/api/cases/export?range=month')
      .set('Authorization', `Bearer ${issueAuthToken('user-1', 'Admin')}`);

    expect(res.status).toBe(200);
    expect(prismaMock.case.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ createdAt: expect.objectContaining({ gte: expect.any(Date) }) })
    }));
  });

  it('should sanitize data in animal update', async () => {
    const payload = {
      name: 'Buddy Updated',
      abcRecord: { id: 'abc' }, // Should be stripped
      adoptions: [], // Should be stripped
    };

    prismaMock.animal.update.mockResolvedValue({
      id: 'animal-1',
      name: 'Buddy Updated',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 2,
      gender: 'Male',
      healthStatus: 'Healthy',
      location: 'Shelter',
      imageUrl: null,
      status: 'available',
      createdAt: new Date()
    } as any);

    const res = await request(app)
      .patch('/api/animals/animal-1')
      .send(payload);

    expect(res.status).toBe(200);
    
    // Check that prisma.animal.update was called with SANITIZED data
    expect(prismaMock.animal.update).toHaveBeenCalledWith({
      where: { id: 'animal-1' },
      data: {
        name: 'Buddy Updated'
      }
    });
  });
});
