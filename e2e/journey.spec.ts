import { test, expect } from '@playwright/test'

test('mobile landing starts a new journey',async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'Tiny actions. A stronger you.'})).toBeVisible();await expect(page.getByRole('link',{name:'Start your journey'})).toBeVisible();await page.getByRole('link',{name:'Start your journey'}).click();await expect(page.getByRole('heading',{name:'Begin your run'})).toBeVisible()})

test.describe('full persisted journey',()=>{
 test.skip(!process.env.DATABASE_URL,'Requires an isolated Neon test database configured through DATABASE_URL.')
 test('registers, completes onboarding, and reaches dashboard',async({page})=>{const email=`levelup-${Date.now()}@example.test`;await page.goto('/register');await page.getByLabel('Display name').fill('Journey Player');await page.getByLabel('Email').fill(email);await page.getByLabel('Password').fill('SecurePass123!');await page.getByRole('button',{name:/Create account/}).click();await expect(page.getByText('What feels most worth improving?')).toBeVisible();await page.getByRole('button',{name:'My energy'}).click();await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'A balanced mix'}).click();await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'More consistent'}).click();await page.getByRole('button',{name:'Meet my habits'}).click();await expect(page.getByText('Today’s habits')).toBeVisible()})
})
