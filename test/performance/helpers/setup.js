import http from 'k6/http';
import { check } from 'k6';

import { BASE_URL } from '../config.js';

/**
 * Create a customer and return its ID.
 * Called once in `setup()` so all VUs share the same customer.
 */
export function createTestCustomer() {
  const payload = JSON.stringify({
    email: `perf-test-${Date.now()}@test.com`,
    name: 'Performance Test Customer',
    creditLimit: 999999,
  });

  const res = http.post(`${BASE_URL}/api/customers`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'customer created (2xx)': (r) => r.status >= 200 && r.status < 300,
  });

  const body = res.json();
  // API may return { id } or { data: { id } } — adapt as needed
  const customerId = body.id || (body.data && body.data.id);

  if (!customerId) {
    throw new Error(`Failed to create test customer. Response: ${res.body}`);
  }

  return customerId;
}

/**
 * Place a single order and return the full response body.
 */
export function placeOrder(customerId) {
  const payload = JSON.stringify({
    customerId,
    items: [
      {
        productId: 'perf-prod-1',
        productName: 'Perf Product 1',
        quantity: 1,
        price: 100,
      },
    ],
  });

  const res = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return res;
}
