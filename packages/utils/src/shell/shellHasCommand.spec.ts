import { expect, describe, it } from 'vitest'
import { shellHasCommand } from './shellHasCommand.js'

it('x', async () => {
  expect(await shellHasCommand('gpg')).toBe(true)
  expect(await shellHasCommand('gpg-bogus')).toBe(false)
})
