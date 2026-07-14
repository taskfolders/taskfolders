---
type: tf
sid: tf-open
bogus: one
labels: workspace
scripts:
  get-dir:
    dir: package
    run: pwd
---
npx vitest --project utils
