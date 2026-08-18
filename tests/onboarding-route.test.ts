import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/current-user', () => ({ currentUser: mocks.currentUser }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: { findMany: mocks.findMany, findFirst: mocks.findFirst },
    userTask: { updateMany: mocks.updateMany, upsert: mocks.upsert },
    user: { update: mocks.update },
  },
}));

import { POST } from '@/app/api/onboarding/route';

describe('POST /api/onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.currentUser.mockResolvedValue({ id: 'user-1' });
    mocks.findMany.mockResolvedValue([
      { id: 'health', category: 'HEALTH' },
      { id: 'mental', category: 'MENTAL' },
      { id: 'nutrition', category: 'NUTRITION' },
    ]);
    mocks.findFirst.mockResolvedValue({ id: 'stretch' });
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.upsert.mockResolvedValue({});
    mocks.update.mockResolvedValue({});
  });

  it('rejects unauthenticated setup attempts', async () => {
    mocks.currentUser.mockResolvedValue(null);
    const response = await POST(new Request('http://localhost/api/onboarding', { method: 'POST', body: JSON.stringify({ answers: ['Focus and calm', 'Morning', 'Balanced'] }) }));
    expect(response.status).toBe(401);
  });

  it('pauses other starters, activates chosen categories, adds Stretch, and completes onboarding', async () => {
    const response = await POST(new Request('http://localhost/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: ['Energy and movement', 'Morning', 'A little challenging'] }) }));
    expect(response.status).toBe(200);
    expect(mocks.updateMany).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: { isPaused: true } }));
    expect(mocks.updateMany).toHaveBeenNthCalledWith(2, expect.objectContaining({ where: expect.objectContaining({ taskId: { in: ['health', 'nutrition'] } }), data: { isPaused: false } }));
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_taskId: { userId: 'user-1', taskId: 'stretch' } } }));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ data: { onboardingCompletedAt: expect.any(Date) } }));
  });

  it('validates that all quiz answers are supplied', async () => {
    const response = await POST(new Request('http://localhost/api/onboarding', { method: 'POST', body: JSON.stringify({ answers: ['Focus and calm'] }) }));
    expect(response.status).toBe(400);
    expect(mocks.findMany).not.toHaveBeenCalled();
  });
});
