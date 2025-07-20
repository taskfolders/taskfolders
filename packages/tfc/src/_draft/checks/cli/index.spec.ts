import { expect, describe, it } from 'vitest'

import Path from 'path'
import fs from 'fs'
import { MarkdownDocument } from '@taskfolders/utils/markdown'
import { StandardMetadata } from '../../next/StandardMetadata.js'

function pathSegments(fullPath): string[] {
  const parts = fullPath.split(Path.sep) //.filter(Boolean)
  //const roots = fullPath.startsWith(path.sep) ? [path.sep] : []
  const roots = [Path.sep]
  return parts.map((_, i) => Path.join(...roots, ...parts.slice(0, i + 1)))
}

it('x', async () => {
  let dirStart = __dirname
  let all = pathSegments(dirStart)
  let a2 = await Promise.all(
    all.map(async path => {
      let acu = []
      const tryName = async basename => {
        let fullPath = Path.join(path, basename)
        if (fs.existsSync(fullPath)) {
          let data
          let body = fs.readFileSync(fullPath, 'utf-8')
          if (basename.endsWith('.json')) {
            data = new StandardMetadata(JSON.parse(body))
          } else if (basename.endsWith('.md')) {
            let md = await MarkdownDocument.fromBody(body, {
              implicitFrontmatter: true,
            })
            if (md.data) {
              data = new StandardMetadata(md.data)
            }
          } else if (['.yaml', '.yml'].some(x => basename.endsWith(x))) {
            // YAML.parse(body)
          }

          acu.push({ dir: path, basename, data })
        }
      }

      let names = [
        'index.json',
        '.index.json',
        '.index.personal.json',
        'index.personal.json',

        '.index.yml',
        '.index.yaml',
        'index.yml',
        'index.yaml',

        '.index.md',
        '.index.personal.md',
        'index.md',
        'index.personal.md',

        'README.md',
      ]
      for (let name of names) {
        await tryName(name)
      }

      if (acu.length) return acu
    }),
  ).then(x =>
    x
      .filter(Boolean)
      .flat()
      .filter(x => x.data),
  )

  let combo = a2.map(x => x.data._raw)
  // console.log(combo)
  console.log(a2)
})
