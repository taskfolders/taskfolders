const assert = require('node:assert')
const test = require('node:test')
const { describe, it } = require('node:test')

describe('A thing', () => {
  it('one')
  test('synchronous passing test', (t) => {
    // This test passes because it does not throw an exception.
    assert.strictEqual(1, 1)
  })
})

