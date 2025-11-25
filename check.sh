#!/usr/bin/env bash

set -e

echo "Running formatting (fixing issues)..."
pnpm run format

echo "Checking linting..."
pnpm run lint

echo "Checking build (without emitting)..."
pnpm run build

echo "Checking gitleaks (including git)..."
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --source . --verbose
else
  echo "WARNING: gitleaks not found, skipping gitleaks check"
  echo "Install gitleaks: https://github.com/gitleaks/gitleaks#installation"
fi

echo "Running tests..."
pnpm run test

echo "All checks passed!"

