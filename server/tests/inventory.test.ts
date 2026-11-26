import request from 'supertest';
import app from '../app';
import { authHeader, prismaMock } from './setup';
import { issueAuthToken } from '../auth/token';

describe('Inventory & Medical API', () => {
  it('should list medicines', async () => {
    prismaMock.medicine.findMany.mockResolvedValue([
      { id: '1', name: 'Paracetamol', quantity: 100 }
    ] as any);

    const res = await request(app).get('/api/inventory/medicines').set(authHeader('Data Entry'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Paracetamol');
  });

  it('should record medicine usage and decrement stock (Transaction)', async () => {
    // Mock the transaction result
    prismaMock.$transaction.mockResolvedValue([
      { id: 'usage-1', medicineId: 'med-1', quantity: '5' },
      { id: 'med-1', quantity: 95 }
    ]);

    const res = await request(app)
      .post('/api/medicine-usages')
      .set(authHeader('Doctor'))
      .send({
        medicineId: 'med-1',
        quantity: 5,
        medicineName: 'Paracetamol',
        takenBy: 'Dr. Smith',
        purpose: 'Fever'
      });

    expect(res.status).toBe(201);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('should create housekeeping supply', async () => {
    prismaMock.housekeepingSupply.findMany.mockResolvedValue([] as any);
    prismaMock.housekeepingSupply.create.mockResolvedValue({ id: 'h-1', name: 'Soap' } as any);

    const res = await request(app)
      .post('/api/inventory/housekeeping')
      .set(authHeader('Data Entry'))
      .send({ name: 'Soap', quantity: 10, minStockLevel: 2, unit: 'pcs' });

    expect(res.status).toBe(201);
    expect(prismaMock.housekeepingSupply.create).toHaveBeenCalled();
  });

  it('should reject a housekeeping supply with a duplicate name regardless of case', async () => {
    prismaMock.housekeepingSupply.findMany.mockResolvedValue([{ id: 'h-1', name: 'Soap' }] as any);

    const res = await request(app)
      .post('/api/inventory/housekeeping')
      .set('Authorization', `Bearer ${issueAuthToken('user-1', 'Data Entry')}`)
      .send({ name: '  soap  ', quantity: 10, minStockLevel: 2, unit: 'pcs' });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("A similar item already exists: 'Soap'");
    expect(prismaMock.housekeepingSupply.create).not.toHaveBeenCalled();
  });
});
