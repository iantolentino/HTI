import { expect, Page, test } from '@playwright/test'

const canRunPersistedJourney = process.env.E2E_RUN === '1' && Boolean(process.env.E2E_DATABASE_URL)
const password = 'SecurePass123!'

async function completeOnboarding(page: Page) {
  await expect(page.getByText('What do you want to improve most?')).toBeVisible()
  await page.getByRole('button', { name: 'Energy and movement' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Whenever I can' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Balanced' }).click()
  await page.getByRole('button', { name: 'Meet my habits' }).click()
  await expect(page.getByRole('heading', { name: 'Today’s habits' })).toBeVisible()
}

async function dragTask(page: Page, direction: 'complete' | 'remove') {
  const action = page.locator('button[aria-label^="Complete "]:not([disabled])').first()
  await expect(action).toBeVisible()
  const card = action.locator('xpath=ancestor::article')
  const box = await card.boundingBox()
  if (!box) throw new Error('Task card did not have a measurable mobile layout')
  const y = box.y + box.height / 2
  const from = box.x + box.width / 2
  const to = direction === 'complete' ? box.x + box.width * 0.95 : box.x + box.width * 0.05
  await page.mouse.move(from, y)
  await page.mouse.down()
  await page.mouse.move(to, y, { steps: 6 })
  await page.mouse.up()
}

test('mobile landing opens registration', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tiny actions. A stronger you.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start your journey' })).toBeVisible()
  await page.getByRole('link', { name: 'Start your journey' }).click()
  await expect(page.getByRole('heading', { name: 'Begin your run' })).toBeVisible()
})

test.describe('isolated Neon mobile journey', () => {
  test.skip(!canRunPersistedJourney, 'Set E2E_RUN=1 and E2E_DATABASE_URL to an isolated, seeded Neon database.')

  test('registers, personalizes habits, completes wins, persists settings, and exports activity', async ({ page }) => {
    const email = `levelup-e2e-${Date.now()}@example.test`

    await page.goto('/register')
    const emailInput = page.getByLabel('Email')
    await emailInput.fill('not-an-email')
    expect(await emailInput.evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false)
    await page.getByLabel('Password').fill('short')
    expect(await page.getByLabel('Password').evaluate((input: HTMLInputElement) => input.validity.valid)).toBe(false)

    await page.getByLabel('Display name').fill('Journey Player')
    await emailInput.fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: /Create account/ }).click()
    await completeOnboarding(page)

    await expect(page.getByText('Push-ups')).toBeVisible()
    await expect(page.getByText('Walk / light cardio')).toBeVisible()
    await expect(page.getByText('Meditate')).toHaveCount(0)

    const expBefore = await page.getByLabel(/Experience /).getAttribute('aria-label')
    await page.locator('button[aria-label^="Complete "]:not([disabled])').first().click()
    await expect(page.getByRole('status')).toContainText('EXP')
    await expect(page.locator('button[aria-label^="Complete "][disabled]')).toHaveCount(1)
    await expect.poll(async () => page.getByLabel(/Experience /).getAttribute('aria-label')).not.toBe(expBefore)

    await page.locator('button[aria-label^="Complete "]:not([disabled])').first().click()
    await expect(page.getByRole('status')).toContainText('Slow down')
    await page.waitForTimeout(3_100)
    await dragTask(page, 'complete')
    await expect(page.getByRole('status')).toContainText('EXP')

    await page.getByLabel('Add a habit').click()
    await expect(page.getByRole('heading', { name: 'Habit library' })).toBeVisible()
    await page.getByRole('button', { name: 'Nutrition', exact: true }).click()
    await expect(page.getByText('Cook a nourishing meal')).toBeVisible()
    await page.getByRole('button', { name: 'Easy', exact: true }).click()
    await expect(page.getByText('Prepare vegetables')).toBeVisible()
    await page.getByLabel('Search habits').fill('no matching habit')
    await expect(page.getByText('No habits match that search')).toBeVisible()

    await page.getByLabel('Search habits').fill('Stretch')
    const stretch = page.getByText('Stretch', { exact: true }).last()
    await expect(stretch).toBeVisible()
    const stretchCard = stretch.locator('xpath=ancestor::*[self::div or self::section][.//button[contains(., "Customize")]]').first()
    await stretchCard.getByRole('button', { name: /Customize/ }).click()
    await page.getByRole('radio', { name: 'Use ⚡ for Stretch' }).click()
    await page.getByLabel('Personal target for Stretch').fill('17')
    await page.getByLabel('Unit for Stretch').selectOption('MINUTES')
    await stretchCard.getByRole('button', { name: /Add habit/ }).click()
    await expect(page.getByRole('status')).toContainText('Habit saved')

    await page.goto('/dashboard')
    await expect(page.getByText('Stretch')).toBeVisible()
    await expect(page.getByText('17 minutes')).toBeVisible()
    await expect(page.getByText('⚡')).toBeVisible()

    await dragTask(page, 'remove')
    await expect(page.getByRole('status')).toContainText('removed')
    await expect(page.getByText('Stretch', { exact: true })).toHaveCount(0)

    await page.goto('/analytics')
    await expect(page.getByRole('heading', { name: 'Progress that adds up' })).toBeVisible()
    await expect(page.getByText('Contribution year')).toBeVisible()
    await expect(page.locator('[aria-label^="Contribution graph"]')).toBeVisible()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('link', { name: 'Export JSON' }).click()
    expect((await downloadPromise).suggestedFilename()).toBe('levelup-daily-data.json')

    await page.goto('/settings')
    const darkMode = page.getByLabel('Dark mode')
    await expect(darkMode).toBeChecked()
    await darkMode.uncheck()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await page.reload()
    await expect(page.getByLabel('Dark mode')).not.toBeChecked()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await page.getByLabel('Dark mode').check()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.getByLabel('Display name').fill('Mobile Journey')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Saved.')).toBeVisible()
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Hi, Mobile Journey' })).toBeVisible()

    await page.goto('/settings')
    await page.getByLabel('Anonymous leaderboard').check()
    await page.getByLabel('Leaderboard nickname').fill('Mobile Tester')
    await page.getByLabel('Leaderboard nickname').blur()
    await page.goto('/leaderboard')
    await expect(page.getByText('Mobile Tester')).toBeVisible()

    await page.goto('/settings')
    await page.getByLabel('Public profile').check()
    const shareText = await page.getByText(/Your share link:/).textContent()
    const shareSlug = shareText?.match(/\/u\/([\w-]+)/)?.[1]
    expect(shareSlug).toBeTruthy()
    await page.context().clearCookies()
    await page.goto(`/u/${shareSlug}`)
    await expect(page.getByRole('heading', { name: 'Mobile Journey' })).toBeVisible()
    await expect(page.getByText('Their habits and notes stay private.')).toBeVisible()
    await expect(page.content()).not.toContain(email)

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page.getByRole('heading', { name: 'Hi, Mobile Journey' })).toBeVisible()

    await page.context().clearCookies()
    await page.goto('/register')
    await page.getByLabel('Display name').fill('Duplicate Player')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: /Create account/ }).click()
    await expect(page.getByText('An account with that email already exists.')).toBeVisible()
  })
})
