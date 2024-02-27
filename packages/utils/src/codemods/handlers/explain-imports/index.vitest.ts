// TODO #drop before:release
import { describe, it } from 'vitest'
// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
// export const __dirname = dirname(fileURLToPath(import.meta.url))
import * as ts from 'typescript'
import * as fs from 'fs'
import { join } from 'node:path'
import { ExplainImports } from './ExplainImports'

let { log } = console
function run() {
  const fileName = join(__dirname, 'auth/AccountController.ts')
  const sourceFile = ts.createSourceFile(
    fileName,
    fs.readFileSync(fileName).toString(),
    ts.ScriptTarget.Latest,
  )

  const program = ts.createProgram({
    rootNames: [fileName],
    options: {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
    },
  })
  const typeChecker = program.getTypeChecker()
  const sourceFiles = program.getSourceFiles()

  const checker = typeChecker
  log(sourceFiles)
  // const ast = checker.getEmitOutput(program.getSourceFile(fileName))
  //   .outputFiles[0].text
  // log(ast)
}

describe('x', () => {
  // TODO some text
  it('x #scaffold #live', async () => {
    let sut = new ExplainImports()
    sut.cwd = join(__dirname, '../../auth')
    sut.cwd = join(
      process.env.TASKFOLDERS_ROOT,
      'packages/core/src/dependencies/_browser',
    )
    await sut.execute()
  })

  it('grab comments', async () => {
    let fileName = join(__dirname, './_test/AccountController.ts')
    let imports: string[] = []
    console.log(fileName)

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
