---
type: tf
labels: workspace
scripts:
  get-dir:
    dir: package
    run: pwd
---
npx vitest --project utils
