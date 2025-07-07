---
type: tf
sid: tf-open
labels: workspace
scripts:
  get-dir:
    dir: package
    run: pwd
---
npx vitest --project utils
