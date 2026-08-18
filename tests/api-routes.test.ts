import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  currentUser: vi.fn(),
  hash: vi.fn(),
  userFindUnique: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
  userDelete: vi.fn(),
  taskFindMany: vi.fn(),
  paletteFindFirst: vi.fn(),
  paletteFindUnique: vi.fn(),
  userPaletteFindUnique: vi.fn(),
  userTaskUpsert: vi.fn(),
}))

vi.mock('@/lib/current-user', () => ({ currentUser: mocks.currentUser }))
vi.mock('bcryptjs', () => ({ default: { hash: mocks.hash } }))
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      create: mocks.userCreate,
      update: mocks.userUpdate,
      delete: mocks.userDelete,
    },
    task: { findMany: mocks.taskFindMany },
    palette: { findFirst: mocks.paletteFindFirst, findUnique: mocks.paletteFindUnique },
    userPalette: { findUnique: mocks.userPaletteFindUnique },
    userTask: { upsert: mocks.userTaskUpsert },
  },
}))

import { POST as register } from '@/app/api/register/route'
import { PATCH as selectPalette } from '@/app/api/palettes/route'
import { POST as addHabit } from '@/app/api/habits/route'
import { DELETE as deleteAccount } from '@/app/api/account/route'

const request = (url: string, method: string, body: unknown) => new Request(url, {
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

describe('API route integration behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.currentUser.mockResolvedValue({ id: 'user-1', prestigeCount: 0 })
    mocks.hash.mockResolvedValue('hashed-password')
    mocks.userFindUnique.mockResolvedValue(null)
    mocks.taskFindMany.mockResolvedValue([{ id: 'starter-1' }, { id: 'starter-2' }])
    mocks.paletteFindFirst.mockResolvedValue({ id: 'concrete' })
    mocks.userCreate.mockResolvedValue({ id: 'created-user' })
    mocks.paletteFindUnique.mockResolvedValue({ id: 'locked', requiresPrestige: false, isSeasonal: false, seasonStart: null, seasonEnd: null })
    mocks.userPaletteFindUnique.mockResolvedValue(null)
    mocks.userTaskUpsert.mockResolvedValue({})
    mocks.userDelete.mockResolvedValue({})
  })

  it('registers a normalized email with starter habits and the Concrete palette', async () => {
    const response = await register(request('http://localhost/api/register', 'POST', {
      email: 'PLAYER@EXAMPLE.COM',
      password: 'safe-password',
      displayName: 'Player One',
      timezone: 'Asia/Manila',
    }))

    expect(response.status).toBe(201)
    expect(mocks.userFindUnique).toHaveBeenCalledWith({ where: { email: 'player@example.com' } })
    expect(mocks.userCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: 'player@example.com',
        passwordHash: 'hashed-password',
        activePaletteId: 'concrete',
        tasks: { create: [{ taskId: 'starter-1' }, { taskId: 'starter-2' }] },
        palettes: { create: { paletteId: 'concrete' } },
      }),
    }))
  })

  it('rejects duplicate and invalid registrations without creating an account', async () => {
    mocks.userFindUnique.mockResolvedValue({ id: 'existing-user' })
    const duplicate = await register(request('http://localhost/api/register', 'POST', {
      email: 'player@example.com', password: 'safe-password', displayName: 'Player One', timezone: 'UTC',
    }))
    expect(duplicate.status).toBe(409)
    expect(mocks.userCreate).not.toHaveBeenCalled()

    mocks.userFindUnique.mockResolvedValue(null)
    const invalid = await register(request('http://localhost/api/register', 'POST', {
      email: 'not-an-email', password: 'short', displayName: 'P', timezone: '',
    }))
    expect(invalid.status).toBe(400)
    expect(mocks.userCreate).not.toHaveBeenCalled()
  })

  it('refuses selection of a palette the user has not unlocked', async () => {
    const response = await selectPalette(request('http://localhost/api/palettes', 'PATCH', { paletteId: 'locked' }))
    expect(response.status).toBe(403)
    expect(mocks.userUpdate).not.toHaveBeenCalled()
  })

  it('selects an owned palette but still refuses a prestige-only palette before prestige', async () => {
    mocks.userPaletteFindUnique.mockResolvedValue({ userId: 'user-1', paletteId: 'clay' })
    mocks.paletteFindUnique.mockResolvedValue({ id: 'clay', requiresPrestige: false, isSeasonal: false, seasonStart: null, seasonEnd: null })
    const allowed = await selectPalette(request('http://localhost/api/palettes', 'PATCH', { paletteId: 'clay' }))
    expect(allowed.status).toBe(200)
    expect(mocks.userUpdate).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { activePaletteId: 'clay' } })

    mocks.userUpdate.mockClear()
    mocks.paletteFindUnique.mockResolvedValue({ id: 'prestige', requiresPrestige: true, isSeasonal: false, seasonStart: null, seasonEnd: null })
    const prestige = await selectPalette(request('http://localhost/api/palettes', 'PATCH', { paletteId: 'prestige' }))
    expect(prestige.status).toBe(403)
    expect(mocks.userUpdate).not.toHaveBeenCalled()
  })

  it('validates a habit before adding it, then persists valid personal settings', async () => {
    const invalid = await addHabit(request('http://localhost/api/habits', 'POST', { taskId: '', personalTargetOverride: 0 }))
    expect(invalid.status).toBe(400)
    expect(mocks.userTaskUpsert).not.toHaveBeenCalled()

    const valid = await addHabit(request('http://localhost/api/habits', 'POST', {
      taskId: 'pushups', iconOverride: '💪', personalTargetOverride: 24, unitOverride: 'REPS',
    }))
    expect(valid.status).toBe(200)
    expect(mocks.userTaskUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_taskId: { userId: 'user-1', taskId: 'pushups' } },
      create: expect.objectContaining({ userId: 'user-1', taskId: 'pushups', personalTargetOverride: 24, unitOverride: 'REPS' }),
    }))
  })

  it('requires typed DELETE confirmation before invoking cascading account deletion', async () => {
    const rejected = await deleteAccount(request('http://localhost/api/account', 'DELETE', { confirmation: 'delete' }))
    expect(rejected.status).toBe(400)
    expect(mocks.userDelete).not.toHaveBeenCalled()

    const accepted = await deleteAccount(request('http://localhost/api/account', 'DELETE', { confirmation: 'DELETE' }))
    expect(accepted.status).toBe(200)
    expect(mocks.userDelete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
  })
})
