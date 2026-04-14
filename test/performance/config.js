/**
 * Shared k6 performance test configuration.
 *
 * BASE_URL can be overridden via environment variable:
 *   k6 run -e BASE_URL=http://staging:3000 script.js
 */

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ── Default load stages (ramp-up → sustained → ramp-down) ──────────────────
export const defaultStages = [
  { duration: '10s', target: 10 }, // ramp-up to 10 VUs
  { duration: '30s', target: 10 }, // hold 10 VUs
  { duration: '5s', target: 0 }, // ramp-down
];

// ── Global thresholds — any breach → non-zero exit code → CI fails ─────────
export const defaultThresholds = {
  http_req_duration: ['p(95)<500'], // 95th percentile < 500ms
  http_req_failed: ['rate<0.05'], // error rate < 5%
};
