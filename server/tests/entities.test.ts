import request from 'supertest';
import app from '../app';
import { prismaMock } from './setup';
import { issueAuthToken } from '../auth/token';

describe('Transactional & Other Entity APIs', () => {
  it('should create a wildlife case', async () => {
    prismaMock.wildlifeCase.create.mockResolvedValue({ id: 'w-1' } as any);
    const res = await request(app).post('/api/wildlife').send({ caseNumber: 'W001', animal: 'Eagle' });
    expect(res.status).toBe(201);
  });

  it('should create a staff member', async () => {
    prismaMock.staffMember.create.mockResolvedValue({ id: 's-1' } as any);
    const res = await request(app).post('/api/staff').send({ name: 'John', role: 'Vet' });
    expect(res.status).toBe(201);
  });

  it('should allow doctors to fetch the staff directory', async () => {
    prismaMock.staffMember.findMany.mockResolvedValue([{ id: 'doctor-1', name: 'Dr. Mira', type: 'Doctor', role: 'Veterinarian' }] as any);

    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${issueAuthToken('doctor-1', 'Doctor')}`);

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Dr. Mira');
  });

  it('should create a donation', async () => {
    prismaMock.donation.create.mockResolvedValue({ id: 'd-1' } as any);
    const res = await request(app).post('/api/donations').send({ donorName: 'Alice', amount: 50.5 });
    expect(res.status).toBe(201);
  });

  it('should create an adoption record', async () => {
    prismaMock.adoption.create.mockResolvedValue({ id: 'a-1' } as any);
    const res = await request(app).post('/api/adoptions').send({ animalId: '1', userId: '1', status: 'pending' });
    expect(res.status).toBe(201);
  });

  it('should fetch abc records', async () => {
    prismaMock.aBCRecord.findMany.mockResolvedValue([{ id: 'abc-1', sterilized: true }] as any);
    const res = await request(app).get('/api/abc-records');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'abc-1', sterilized: true }]);
  });

  it('should create an abc record', async () => {
    prismaMock.aBCRecord.create.mockResolvedValue({ id: 'abc-1', sterilized: true } as any);
    const res = await request(app).post('/api/abc-records').send({ sterilized: true, vaccinationDone: true, surgeryDate: '2025-01-01' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 'abc-1');
  });

  it('should sanitize and parse abc record input data correctly', async () => {
    prismaMock.aBCRecord.create.mockResolvedValue({ id: 'abc-1', animalId: null, maleCount: 5, femaleCount: null } as any);
    const res = await request(app).post('/api/abc-records').send({
      animalId: '',
      maleCount: '5',
      femaleCount: '',
      sterilized: 'true',
      vaccinationDone: true,
      surgeryDate: '2025-01-01'
    });
    expect(res.status).toBe(201);
    expect(prismaMock.aBCRecord.create).toHaveBeenCalledWith({
      data: {
        animalId: null,
        maleCount: 5,
        femaleCount: null,
        sterilized: true,
        vaccinationDone: true,
        surgeryDate: '2025-01-01'
      }
    });
  });

  it('should store an ABC record animal type without an animal reference', async () => {
    prismaMock.aBCRecord.create.mockResolvedValue({ id: 'abc-2', animalId: null, animalType: 'Cat' } as any);

    const res = await request(app)
      .post('/api/abc-records')
      .set('Authorization', `Bearer ${issueAuthToken('user-1', 'Data Entry')}`)
      .send({
        animalType: ' Cat ',
        sterilized: true,
        vaccinationDone: true,
        surgeryDate: '2025-01-01'
      });

    expect(res.status).toBe(201);
    expect(prismaMock.aBCRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ animalType: 'Cat' })
    });
  });

  it('should update an abc record', async () => {
    prismaMock.aBCRecord.update.mockResolvedValue({ id: 'abc-1', sterilized: false } as any);
    const res = await request(app).patch('/api/abc-records/abc-1').send({ sterilized: false });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sterilized', false);
  });

  it('should delete an abc record', async () => {
    prismaMock.aBCRecord.delete.mockResolvedValue({ id: 'abc-1' } as any);
    const res = await request(app).delete('/api/abc-records/abc-1');
    expect(res.status).toBe(204);
  });
});
