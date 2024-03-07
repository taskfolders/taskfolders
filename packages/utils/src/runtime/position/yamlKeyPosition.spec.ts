import { expect, describe, it } from 'vitest'
import YAML from 'yaml'
import { yamlKeyPosition } from './yamlKeyPosition.js'

it('x', async () => {
  let doc = {
    one: {
      two: { a: 1, b: 2, c: 3 },
      three: { inside: 'delta' },
      more: 1,
    },
  }
  let txt = YAML.stringify(doc)
  expect(yamlKeyPosition(txt, ['three']).line).toBe(6)
  expect(yamlKeyPosition(txt, ['three', 'inside']).line).toBe(7)
})
