#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Run all k6 performance test scripts.
# Exits with non-zero if ANY script's thresholds fail.
#
# Usage:
#   ./test/performance/run-all.sh                           # auto-detect or start server
#   BASE_URL=http://staging:3000 ./test/performance/run-all.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${SCRIPT_DIR}/scripts"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BASE_URL="${BASE_URL:-http://localhost:3000}"
SERVER_PID=""

# ── Check k6 is installed ────────────────────────────────────────────────────
if ! command -v k6 &> /dev/null; then
  echo "Error: k6 is not installed."
  echo "  macOS:  brew install k6"
  echo "  Linux:  https://k6.io/docs/getting-started/installation"
  exit 1
fi

# ── Wait for server to be ready (used when we start it ourselves) ────────────
wait_for_server() {
  echo "Waiting for server at ${BASE_URL} ..."
  for i in $(seq 1 30); do
    if curl -sf "${BASE_URL}/api/orders?page=1&limit=1" > /dev/null 2>&1; then
      echo "Server is ready"
      return 0
    fi
    sleep 2
  done
  echo "Error: server did not become ready after 60 seconds."
  return 1
}

# ── Ensure the server is reachable before running tests ──────────────────────
if [[ "${BASE_URL}" == "http://localhost:3000" ]]; then
  if curl -sf "${BASE_URL}/api/orders?page=1&limit=1" > /dev/null 2>&1; then
    echo "Server already running at ${BASE_URL}"
  elif [[ "${CI:-}" == "true" ]]; then
    # In CI the workflow is responsible for starting the server.
    # Just wait for it to become ready (it may still be booting).
    echo "CI detected — waiting for server started by the workflow..."
    wait_for_server || { echo "ERROR: Server never became ready in CI. Check the 'Build and start server' step logs."; exit 1; }
  else
    # Local development — build & start a throwaway server
    echo "Server not detected — starting local server..."
    cd "${ROOT_DIR}"
    echo "Building project (tsc + tsc-alias)..."
    npm run build
    node dist/main.js &
    SERVER_PID=$!
    trap 'echo "Stopping server (PID ${SERVER_PID})"; kill ${SERVER_PID} 2>/dev/null' EXIT
    wait_for_server || exit 1
  fi
fi

# ── Run tests ─────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════"
echo " k6 Performance Tests — target: ${BASE_URL}"
echo "═══════════════════════════════════════════════════════════"

failed=0

for test_file in "${SCRIPTS_DIR}"/*.test.js; do
  test_name="$(basename "${test_file}")"
  echo ""
  echo "──────────────────────────────────────────────────────────"
  echo " Running: ${test_name}"
  echo "──────────────────────────────────────────────────────────"

  if k6 run -e "BASE_URL=${BASE_URL}" "${test_file}"; then
    echo "${test_name} — PASSED"
  else
    echo "${test_name} — FAILED"
    failed=1
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
if [[ $failed -eq 1 ]]; then
  echo " Some performance tests FAILED"
  exit 1
else
  echo " All performance tests PASSED"
  exit 0
fi

