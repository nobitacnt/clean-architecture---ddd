import { check, sleep } from 'k6';

import { defaultStages, defaultThresholds } from '../config.js';
import { createTestCustomer, placeOrder } from '../helpers/setup.js';

export const options = {
  stages: defaultStages,
  thresholds: {
    ...defaultThresholds,
    checks: ['rate>0.95'], // at least 95% of checks must pass
  },
};

// ── Setup: create a shared customer ─────────────────────────────────────────
export function setup() {
  const customerId = createTestCustomer();
  return { customerId };
}

// ── Main VU function ────────────────────────────────────────────────────────
export default function (data) {
  const res = placeOrder(data.customerId);

  check(res, {
    'create order — status 201': (r) => r.status === 201,
    'create order — has id': (r) => {
      const body = r.json();
      return !!(body.id || (body.data && body.data.id));
    },
  });

  sleep(0.5);
}
