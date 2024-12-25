export NODE_ENV=test
set -ex
find src/vendors/vitest/custom-reporter -type f | entr -cc -- npx vitest run --reporter ./src/vendors/vitest/custom-reporter src/vendors/vitest/custom-reporter/index.spec.ts
