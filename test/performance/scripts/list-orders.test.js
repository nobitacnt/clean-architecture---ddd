import http from 'k6/http';
import { check, sleep } from 'k6';

import { BASE_URL, defaultStages, defaultThresholds } from '../config.js';
import { createTestCustomer, placeOrder } from '../helpers/setup.js';

export const options = {
  stages: defaultStages,
  thresholds: {
    ...defaultThresholds,
    checks: ['rate>0.95'],
  },
};

// ── Setup: seed a few orders so the list endpoint has data ─────────────────
export function setup() {
  const customerId = createTestCustomer();

  for (let i = 0; i < 5; i++) {
    placeOrder(customerId);
  }

  return {};
}

// ── Main VU function ────────────────────────────────────────────────────────
export default function () {
  const res = http.get(`${BASE_URL}/api/orders?page=1&limit=10`);

  check(res, {
    'list orders — status 200': (r) => r.status === 200,
    'list orders — returns array': (r) => {
      const body = r.json();
      const items = body.data || body;
      return Array.isArray(items);
    },
  });

  sleep(0.3);
}
