import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('Home renders hero, CTA, and feature grid', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NeverGiveUp/i);
    await expect(page.getByRole('heading', { name: /Train hard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Training Free/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Workout Tracking/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Goal Setting/i })).toBeVisible();
  });

  test('Header / Footer brand reads "NeverGiveUp", NG logo', async ({ page }) => {
    // Home is a full-bleed marketing page; PublicLayout (header + footer)
    // is rendered on About / Privacy / Terms / Contact.
    await page.goto('/about');
    await expect(page.locator('header').getByText('NeverGiveUp').first()).toBeVisible();
    await expect(page.locator('header').getByText('NG').first()).toBeVisible();
    await expect(page.locator('footer').getByText(/All rights reserved/i)).toBeVisible();
  });

  test('Footer links navigate to legal/info pages', async ({ page }) => {
    await page.goto('/about');
    await page.locator('footer').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole('heading', { name: /Privacy/i }).first()).toBeVisible();

    await page.locator('footer').getByRole('link', { name: 'Terms' }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page.getByRole('heading', { name: /Terms of/i }).first()).toBeVisible();

    await page.locator('footer').getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { name: /talk training/i })).toBeVisible();

    await page.locator('footer').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: /Built by athletes/i }).first()).toBeVisible();
  });

  test('Privacy and Terms expose numbered sections with anchor TOC', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Information we collect/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Your rights/i })).toBeVisible();

    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Acceptance of terms/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Health disclaimer/i })).toBeVisible();
  });

  test('Contact form validates required fields and shows success state', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /Send message/i }).click();
    await expect(page.getByText(/please fill in your name, email, and message/i)).toBeVisible();

    await page.getByPlaceholder('Alex Johnson').fill('Playwright Bot');
    await page.getByPlaceholder('you@example.com').fill('bot@nevergiveup.test');
    await page.getByPlaceholder("What's on your mind?").fill('Hi! This is a test message from the PW suite.');
    await page.getByRole('button', { name: /Partnerships/i }).click();
    await page.getByRole('button', { name: /Send message/i }).click();

    await expect(page.getByText('Thanks!')).toBeVisible();
    await expect(page.getByText(/your message is on its way/i)).toBeVisible();
  });

  test('Unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-path-does-not-exist');
    await expect(page).toHaveURL(/\/$/);
  });
});
