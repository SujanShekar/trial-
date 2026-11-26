import { jest } from '@jest/globals';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { issueAuthToken } from '../auth/token';

process.env.AUTH_TOKEN_SECRET = 'test-auth-token-secret';

jest.mock('../db', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
export const authHeader = (role: 'Admin' | 'Doctor' | 'Data Entry' = 'Admin', userId = `${role.toLowerCase().replace(' ', '-')}-1`) => ({
  Authorization: `Bearer ${issueAuthToken(userId, role)}`,
});

beforeEach(() => {
  mockReset(prismaMock);
});
