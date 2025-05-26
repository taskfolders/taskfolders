const config = {
  steps: [
    {
      glob: ['**/*.spec.ts', '**/*.ts'],
      name: 'vitest-unit',
      retarget: '{vitest}',
      command:
        "NODE_ENV=test npx vitest run --reporter '@taskfolders/utils/vendors/vitest/custom-reporter/index' {file}",
    },
  ],
}

export default config
