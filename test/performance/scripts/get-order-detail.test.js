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

// ── Setup: create customer + 1 order to query ──────────────────────────────
export function setup() {
  const customerId = createTestCustomer();
  const orderRes = placeOrder(customerId);
  const body = orderRes.json();
  const orderId = body.id || (body.data && body.data.id);

  if (!orderId) {
    throw new Error(`Failed to create seed order. Response: ${orderRes.body}`);
  }

  return { orderId };
}

// ── Main VU function ────────────────────────────────────────────────────────
export default function (data) {
  const res = http.get(`${BASE_URL}/api/orders/${data.orderId}`);

  check(res, {
    'get order detail — status 200': (r) => r.status === 200,
    'get order detail — has id': (r) => {
      const body = r.json();
      return !!(body.id || (body.data && body.data.id));
    },
    'get order detail — has status': (r) => {
      const body = r.json();
      const order = body.data || body;
      return !!order.status;
    },
  });

  sleep(0.3);
}
