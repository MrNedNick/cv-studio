// Collects every interface string that needs a translation: the English
// argument of t()/translate() calls and { ru, en } text objects.
import ts from 'typescript'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(import.meta.url), '../../src')
const callees = new Set(['t', 'tc', 'translate', 'current'])

export function collectKeys() {
  const keys = new Set(),
    dynamic = []
  for (const name of readdirSync(root)) {
    if (!/\.tsx?$/.test(name) || name.includes('.test.')) continue
    const file = join(root, name),
      source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        name.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      )
    const text = (node) =>
      node &&
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
        ? node.text
        : undefined
    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const callee = ts.isIdentifier(node.expression)
          ? node.expression.text
          : ts.isPropertyAccessExpression(node.expression)
            ? node.expression.name.text
            : ''
        if (callee === 'add') {
          // getTips(): add(id, section, ru, en, vars)
          const ru = text(node.arguments[2]),
            en = text(node.arguments[3])
          if (ru !== undefined && en !== undefined) keys.add(en)
        }
        if (callees.has(callee)) {
          const offset = callee === 'translate' ? 1 : 0,
            ru = node.arguments[offset],
            en = node.arguments[offset + 1]
          if (text(ru) !== undefined && text(en) !== undefined)
            keys.add(text(en))
          else if (ru && en && callee !== 'current')
            dynamic.push(
              `${name}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
            )
        }
      }
      if (ts.isObjectLiteralExpression(node)) {
        const props = Object.fromEntries(
          node.properties
            .filter(
              (p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name),
            )
            .map((p) => [p.name.text, text(p.initializer)]),
        )
        if (props.ru !== undefined && props.en !== undefined) keys.add(props.en)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return { keys: [...keys].sort(), dynamic }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { keys, dynamic } = collectKeys()
  if (process.argv.includes('--json'))
    console.log(JSON.stringify(keys, null, 1))
  else
    console.log(
      `${keys.length} keys; dynamic calls: ${dynamic.join(', ') || 'none'}`,
    )
}
