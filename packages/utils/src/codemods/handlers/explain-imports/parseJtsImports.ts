import * as ts from 'typescript'
import { importPathToFile } from './ExplainImports'

export function parseJtsImports(node: {
  path: string
  tsSource: ts.SourceFile
}) {
  let final = {
    ...node,
    imports: [] as {
      pathImport: string
      pathFile?: string
      importKeys: string[]
    }[],
  }
  let sourceFile = final.tsSource
  // final.imports = []
  let sourceFilePath = final.path
  ts.forEachChild(sourceFile, node => {
    // const declaration = node as ts.Declaration
    if (ts.isImportDeclaration(node)) {
      let sp = node.moduleSpecifier

      let start = sp.getStart(sourceFile)
      let t1 = sourceFile.getLineAndCharacterOfPosition(start)
      let lineNumber = t1.line + 1

      let importKeys = []

      // null check for plain imports like `import 'style.css'`
      let names = node.importClause?.namedBindings
      if (names && ts.isNamedImports(names)) {
        importKeys = names.elements.map(x => x.name.escapedText)
      }
      // $dev(node.importClause.namedBindings.elements)
      if (ts.isStringLiteral(sp)) {
        let pathImport = sp.text

        let pathFile = importPathToFile({
          importPath: pathImport,
          sourcePath: sourceFilePath,
        })
        // If relative path import, make full path

        final.imports.push({
          pathImport,
          // pathFile,
          importKeys,
        })

        // fullImport = fullImport.replace(/\/index$/, '')

        // let found = getsert(importItems, fullImport, () => {
        //   let item: ImportItem = {
        //     path: fullImport,
        //     pathFull: ensureImportToFile(fullImport),
        //     users: [],
        //     count: 0,
        //     importKeys,
        //   }
        //   return item
        // })
        // found.users.push({ path: sourceFilePath, lineNumber })
        // found.count++
        // fileNode.imports.push(found)
      } else {
        throw Error(`Unexpected kind ${node.kind}`)
      }
    }
  })
  return final
}
