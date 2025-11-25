#!/usr/bin/env bash

set -e

echo "Checking for outdated dependencies..."
if pnpm outdated | grep -q .; then
  echo "ERROR: Outdated dependencies found"
  pnpm outdated
  exit 1
fi

echo "Checking for vulnerabilities..."
AUDIT_OUTPUT=$(pnpm audit --audit-level=moderate 2>&1 || true)
if echo "$AUDIT_OUTPUT" | grep -qE "[0-9]+ vulnerabilities found"; then
  echo "ERROR: Vulnerabilities found"
  echo "$AUDIT_OUTPUT"
  exit 1
fi

echo "All dependencies are up-to-date and secure!"

