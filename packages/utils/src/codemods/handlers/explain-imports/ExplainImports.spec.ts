// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
// export const __dirname = dirname(fileURLToPath(import.meta.url))
import * as ts from 'typescript'
import * as fs from 'fs'
import { join } from 'node:path'
import { ExplainImports, importPathToFile } from './ExplainImports.js'

let { log } = console
import * as Path from 'node:path'
import { getsert } from '../../../native/object/getsert.js'
import {
  findSourceCodeFiles,
  scanSourceImports,
} from '../find-import-users/FindImportUsers.js'

describe('x', () => {
  it('x imports', async function () {
    // this.timeout(10_000)
    let dir_1 = Path.join(
      process.env.TASKFOLDERS_ROOT,
      'packages/core/src/dependencies',
    )
    let dir_2 = Path.join(process.env.TASKFOLDERS_ROOT, 'packages/devops/src')

    let allPaths_1 = await findSourceCodeFiles(dir_1)
    let allPaths_2 = await findSourceCodeFiles(dir_2)
    let allPaths = [
      //
      // ...allPaths_1,
      ...allPaths_2,
    ]
    // return

    // THIS
    // all = all.slice(0, 1)

    let allSources = allPaths.map(sourceFilePath => {
      return scanSourceImports(sourceFilePath)
    })
    $dev(allSources[0])

    allSources.map(source => {
      source.imports.map(imp => {
        let importFile = importPathToFile({
          importPath: imp.pathImport,
          sourcePath: source.path,
        })
        imp.pathFile = importFile
      })
    })
    // ...
    let imports = {} as any

    allSources.map(source => {
      source.imports.map(imp => {
        let importFile = importPathToFile({
          importPath: imp.pathImport,
          sourcePath: source.path,
        })
        let importId = importFile ?? imp.pathImport
        let found = getsert(imports, importId, () => {
          return {
            count: 0,
            users: [],
          }
        })
        found.users.push(source.path)
        found.count++
      })
    })

    // THIS find users of this

    // $dev(imports)
    // $dev(allSources)
    let users = []
    allSources.map(source => {
      // $dev(x.imports)
      let found = source.imports.find(x =>
        x.pathImport.includes('@taskfolders/core/logging'),
      )
      if (found) {
        users.push(source.path)
      }
    })
    $dev(users)
  })

  it('x #scaffold #live', async () => {
    let sut = new ExplainImports()
    sut.screen.debug = true
    sut.cwd = join(
      process.env.TASKFOLDERS_ROOT,
      'packages/core/src/dependencies',
      // 'packages/core/src/console',
      // 'packages/utils/src',
    )

    let res = await sut.execute()
    // $dev(res)
  })

  it.skip('grab comments', async () => {
    let fileName = join(__dirname, '../../auth/AccountController.ts')
    let imports: string[] = []
    const sourceFile = ts.createSourceFile(
      fileName,
      fs.readFileSync(fileName).toString(),
      ts.ScriptTarget.Latest,
    )
    let acu = []
    sourceFile.forEachChild(node => {
      acu.push(node)

      // TODO crunch source
      // https://stackoverflow.com/a/47475176
      const commentRanges = ts.getLeadingCommentRanges(
        sourceFile.getFullText(),
        node.getFullStart(),
      )
      if (commentRanges?.length) {
        const strings: string[] = commentRanges.map(r =>
          sourceFile.getFullText().slice(r.pos, r.end),
        )
        log('now?')
        // log({ strings, node, st: node.jsDoc })
      }
    })
  })
})
