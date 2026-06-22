import { test, expect } from '@playwright/test';

test('ping endpoint returns server running', async ({ request }) => {
  const res = await request.get('/api/ping');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toHaveProperty('message');
});
